/**
 * The collection pipeline — §22's flow, in order.
 *
 *   approved sources → detect new/updated → CHECK PERMISSION →
 *   download OR store official link → dedupe → extract metadata →
 *   categorise → quality checks → publish or review → archive old versions
 *
 * The step in capitals is the one that decides everything after it. A source
 * whose licenseStatus is anything other than "yes" produces a link-only
 * resource: title, description, official URL, dates. Nothing is downloaded,
 * nothing is re-hosted, and the reader is sent to the source. That is not a
 * degraded mode — for 17 of the 20 sources in the registry it is the only
 * lawful mode, and it is the default the code falls into if a field is
 * missing or misread.
 *
 * Node-only.
 */
import crypto from "node:crypto";
import { istDateKey } from "@/lib/dates";
import { categorize, CONFIDENCE_FLOOR, detectClassLevel, detectExam, detectResourceType, detectSubject } from "@/lib/resources/categorize";
import { canonicalizeUrl, findDuplicate } from "@/lib/resources/dedupe";
import { extractExpiryDate, isExpired } from "@/lib/resources/expiry";
import { detectLanguage } from "@/lib/resources/language";
import type {
  CollectorNotification,
  Resource,
  ResourceFlag,
  ResourceStatus,
  Source,
  SourceRunResult,
} from "@/lib/resources/types";
import {
  htmlIndexCandidates,
  parseRss,
  parseSitemap,
  sitemapCandidates,
  stripTags,
  toIsoDate,
  youtubeOEmbedUrl,
  youtubeVideoId,
  type Candidate,
} from "./adapters";
import { politeFetch, politeHead } from "./fetcher";
import { safeFileKey, screenPdfContent, validateDownload } from "./security";
import { bestTitle, readPdf } from "./pdf";
import { localFileExists, writeLocalFile } from "./store";

/** How many candidates from one source one run will process. Keeps a first
 *  run against a 595-URL sitemap from turning into a thousand requests. */
const MAX_PER_SOURCE = 40;

/**
 * Largest file we will host, 24 MiB.
 *
 * Not an arbitrary cap: Cloudflare Pages refuses assets over 25 MiB, and
 * scripts/strip-local-media.ts drops anything above 24 MiB from the export.
 * Downloading a 40 MB textbook would therefore produce a resource whose
 * localFileUrl 404s in production. Anything bigger is flagged too-large and
 * becomes a link to the official copy, which is the honest outcome.
 */
export const HOSTABLE_MAX_BYTES = 24 * 1024 * 1024;

/** §14: more than this from one source in one run is worth telling someone. */
const BULK_DISCOVERY_THRESHOLD = 25;

export type PipelineDeps = {
  now: Date;
  dryRun: boolean;
  /** Notifications raised during the run. Appended to, never replaced. */
  notify: (n: Omit<CollectorNotification, "id" | "at">) => void;
  log: (msg: string) => void;
};

function newId(sourceId: string, url: string): string {
  const digest = crypto.createHash("sha1").update(canonicalizeUrl(url)).digest("hex").slice(0, 12);
  return `${sourceId}-${digest}`;
}

/**
 * Is this source due?
 *
 * §13's tiers. A source is due when its frequency window has elapsed since
 * the last SUCCESSFUL check — not the last attempt, so a failing host is
 * retried on the next run rather than being written off for a week.
 */
export function isDue(source: Source, now: Date, hours: number): boolean {
  if (!source.health.lastSuccess) return true;
  const elapsed = now.getTime() - new Date(source.health.lastSuccess).getTime();
  return elapsed >= hours * 3600_000;
}

/** Fetch a source's index/feed and turn it into candidates. */
async function discover(source: Source): Promise<
  { ok: true; candidates: Candidate[]; etag?: string; lastModified?: string; notModified?: boolean }
  | { ok: false; error: string; robotsDisallowed?: boolean }
> {
  const target = source.feedUrl ?? source.url;
  const res = await politeFetch(target, {
    crawlDelaySeconds: source.crawlDelaySeconds,
    etag: source.health.etags[target],
    lastModified: source.health.lastModified[target],
    accept:
      source.method === "rss" || source.method === "sitemap"
        ? "application/xml, text/xml, application/rss+xml;q=0.9, */*;q=0.5"
        : "text/html,application/xhtml+xml,*/*;q=0.5",
    maxBytes: 12 * 1024 * 1024,
  });

  if (res.kind === "robots-disallowed") return { ok: false, error: "robots.txt disallows this path", robotsDisallowed: true };
  if (res.kind === "not-modified") return { ok: true, candidates: [], notModified: true };
  if (res.kind === "gone") {
    return { ok: false, error: `Index returned HTTP ${res.status} — the source URL may have moved` };
  }
  if (res.kind === "too-large") return { ok: false, error: `Index is ${res.bytes} bytes, over the cap` };
  if (res.kind === "error") return { ok: false, error: res.message };

  const text = res.body.toString("utf8");
  let candidates: Candidate[] = [];

  if (source.method === "rss") {
    candidates = parseRss(text, target);
  } else if (source.method === "sitemap") {
    const { entries, children } = parseSitemap(text);
    candidates = sitemapCandidates(entries);
    // One level of child sitemaps only. Deeper recursion on an unfamiliar
    // host is how a polite collector turns into a crawl nobody sanctioned.
    for (const child of children.slice(0, 5)) {
      const sub = await politeFetch(child, {
        crawlDelaySeconds: source.crawlDelaySeconds,
        accept: "application/xml, text/xml",
        maxBytes: 12 * 1024 * 1024,
      });
      if (sub.kind === "ok") {
        candidates.push(...sitemapCandidates(parseSitemap(sub.body.toString("utf8")).entries));
      }
    }
  } else if (source.method === "html-index") {
    candidates = htmlIndexCandidates(text, res.finalUrl, {
      allowedHost: new URL(source.url).hostname,
      limit: MAX_PER_SOURCE * 3,
    });
  }

  return { ok: true, candidates, etag: res.etag, lastModified: res.lastModified };
}

/** Everything the categoriser and quality checks need about one candidate. */
type Enriched = {
  candidate: Candidate;
  title: string;
  description: string;
  text: string;
  hash?: string;
  size?: number;
  fileKey?: string;
  publishedDate?: string;
  lastUpdatedDate?: string;
  flags: ResourceFlag[];
  body?: Buffer;
};

/**
 * Build a resource from a candidate.
 *
 * `mayHost` is passed in rather than read here so there is exactly one place
 * in the codebase that decides it — see collectSource below.
 */
async function enrich(
  source: Source,
  candidate: Candidate,
  mayHost: boolean,
  deps: PipelineDeps,
): Promise<Enriched | null> {
  const flags: ResourceFlag[] = [];

  // ---- videos: metadata and an availability check, never a download ------
  if (candidate.looksLike === "video") {
    const videoId = youtubeVideoId(candidate.url);
    if (!videoId) return null;
    const res = await politeFetch(youtubeOEmbedUrl(videoId), {
      accept: "application/json",
      attempts: 2,
      maxBytes: 256 * 1024,
      skipRobots: true, // oEmbed is a documented API endpoint, not a crawl
    });
    let title = candidate.linkText ?? "";
    let description = candidate.description ?? "";
    if (res.kind === "ok") {
      try {
        const meta = JSON.parse(res.body.toString("utf8")) as { title?: string; author_name?: string };
        if (meta.title) title = meta.title;
        if (meta.author_name) description = description || `Channel: ${meta.author_name}`;
      } catch {
        flags.push("missing-metadata");
      }
    } else if (res.kind === "gone" || (res.kind === "error" && res.status === 401)) {
      // §6: the source removed it. Recorded so the player is never rendered.
      flags.push("source-removed");
    } else {
      flags.push("missing-metadata");
    }
    return {
      candidate,
      title: title || "Untitled video",
      description,
      text: "",
      publishedDate: candidate.date,
      flags,
    };
  }

  // ---- link-only: no download at all ------------------------------------
  if (!mayHost || candidate.looksLike !== "pdf") {
    const title = candidate.linkText?.trim() || bestTitle({ url: candidate.url });
    const description = candidate.description ? stripTags(candidate.description).slice(0, 800) : "";
    if (!candidate.linkText && !candidate.description) flags.push("missing-metadata");
    return {
      candidate,
      title,
      description,
      text: "",
      publishedDate: candidate.date,
      flags,
    };
  }

  // ---- permitted PDF: the full §4 sequence ------------------------------
  const res = await politeFetch(candidate.url, {
    crawlDelaySeconds: source.crawlDelaySeconds,
    accept: "application/pdf,*/*;q=0.5",
    maxBytes: HOSTABLE_MAX_BYTES,
  });
  if (res.kind === "robots-disallowed") return null;
  if (res.kind === "gone") {
    return { candidate, title: candidate.linkText ?? candidate.url, description: "", text: "", flags: ["source-removed"] };
  }
  if (res.kind !== "ok") {
    const reason: ResourceFlag = res.kind === "too-large" ? "too-large" : "download-failed";
    return {
      candidate,
      title: candidate.linkText?.trim() || bestTitle({ url: candidate.url }),
      description: candidate.description ?? "",
      text: "",
      flags: [reason],
    };
  }

  const verdict = validateDownload(res.body, "pdf", HOSTABLE_MAX_BYTES);
  if (!verdict.ok) {
    deps.log(`  flag ${verdict.reason}: ${candidate.url} (${verdict.detail})`);
    return {
      candidate,
      title: candidate.linkText?.trim() || bestTitle({ url: candidate.url }),
      description: candidate.description ?? "",
      text: "",
      flags: [verdict.reason],
    };
  }

  const screen = screenPdfContent(res.body);
  if (screen.suspicious) {
    // Not discarded — held for review, with the reason recorded. A board PDF
    // with an /OpenAction is more likely to be a sloppy export than an
    // attack, and an admin should be the one to decide.
    flags.push("suspicious-content");
    deps.log(`  suspicious PDF ${candidate.url}: ${screen.findings.join(", ")}`);
  }

  const pdf = await readPdf(res.body);
  if (pdf.imageOnly) flags.push("missing-metadata");

  const title = bestTitle({
    linkText: candidate.linkText,
    metaTitle: pdf.metaTitle,
    text: pdf.text,
    url: candidate.url,
  });
  const description =
    (candidate.description ? stripTags(candidate.description).slice(0, 800) : "") ||
    pdf.subject ||
    pdf.text.slice(0, 400);

  return {
    candidate,
    title,
    description,
    text: pdf.text,
    hash: verdict.hash,
    size: verdict.size,
    fileKey: safeFileKey(source.id, verdict.hash, "pdf"),
    publishedDate: candidate.date ?? pdf.createdDate,
    lastUpdatedDate: toIsoDate(res.lastModified) ?? pdf.modifiedDate,
    flags,
    body: res.body,
  };
}

/**
 * Decide a resource's status. §10's lifecycle, and §23's safe start.
 *
 * The order is a priority order, and it is deliberate: a quality problem
 * outranks an admin's autoPublish setting, because "publish everything from
 * this source" was never meant to mean "publish the broken ones too".
 */
export function decideStatus(
  source: Source,
  flags: ResourceFlag[],
  confidence: number,
  expiryDate: string | undefined,
  todayKey: string,
): ResourceStatus {
  if (flags.includes("source-removed")) return "source-unavailable";
  if (
    flags.includes("empty-file") ||
    flags.includes("password-protected") ||
    flags.includes("wrong-file-type") ||
    flags.includes("too-large") ||
    flags.includes("download-failed") ||
    flags.includes("suspicious-content")
  ) {
    return "needs-review";
  }
  if (isExpired(expiryDate, todayKey)) return "expired";
  // An unclear licence never publishes. §17, and the reason "unknown" exists.
  if (source.licenseStatus === "unknown") return "needs-review";
  if (confidence < CONFIDENCE_FLOOR) return "needs-review";
  if (flags.includes("missing-metadata")) return "needs-review";
  return source.autoPublish ? "published" : "new";
}

export type CollectOptions = {
  /** Only sources whose frequency implies this many hours have passed. */
  dueHours?: number;
  /** Ignore the schedule and check everything. */
  force?: boolean;
  maxPerSource?: number;
};

/**
 * Collect from one source.
 *
 * Returns the run result plus the resources to merge. Never mutates the
 * catalog it is given — the caller merges, so a failure part-way through a
 * source cannot leave the catalog half-updated.
 */
export async function collectSource(
  source: Source,
  existing: Resource[],
  deps: PipelineDeps,
  opts: CollectOptions = {},
): Promise<{ result: SourceRunResult; resources: Resource[]; source: Source }> {
  const started = Date.now();
  const todayKey = istDateKey(deps.now);
  const nowIso = deps.now.toISOString();
  const base: SourceRunResult = {
    sourceId: source.id,
    sourceName: source.name,
    ok: true,
    checked: 0,
    added: 0,
    updated: 0,
    duplicates: 0,
    flagged: 0,
    durationMs: 0,
  };
  const merged: Resource[] = [];
  let updatedSource: Source = source;

  if (!source.active) {
    return { result: { ...base, skipped: "inactive", durationMs: Date.now() - started }, resources: [], source };
  }
  if (source.method === "manual") {
    // Not a failure and not a gap: these are the sources whose terms forbid
    // scraping or whose pages hold nothing readable. They exist so the
    // Learning Center can link to them.
    return { result: { ...base, skipped: "manual-only", durationMs: Date.now() - started }, resources: [], source };
  }
  if (source.method === "api") {
    // The one API source needs a key. Without it, skip rather than crawl the
    // website, which its robots.txt refuses.
    if (!process.env.DATA_GOV_IN_API_KEY) {
      return { result: { ...base, skipped: "manual-only", durationMs: Date.now() - started }, resources: [], source };
    }
  }

  const hours = opts.force ? 0 : (opts.dueHours ?? 0);
  if (hours > 0 && !isDue(source, deps.now, hours)) {
    return { result: { ...base, skipped: "not-due", durationMs: Date.now() - started }, resources: [], source };
  }

  deps.log(`\n${source.name} (${source.method}, licence: ${source.licenseStatus})`);

  const found = await discover(source);
  const target = source.feedUrl ?? source.url;

  if (!found.ok) {
    const failures = source.health.consecutiveFailures + 1;
    updatedSource = {
      ...source,
      health: { ...source.health, lastChecked: nowIso, consecutiveFailures: failures, lastError: found.error },
    };
    // §14: tell someone once it is a pattern, not on the first blip.
    if (failures === 3) {
      deps.notify({
        level: "warning",
        kind: found.robotsDisallowed ? "source-failing" : "source-failing",
        message: `${source.name} has failed ${failures} checks in a row: ${found.error}`,
        sourceId: source.id,
      });
    }
    if (found.error.includes("may have moved")) {
      deps.notify({
        level: "action",
        kind: "source-url-changed",
        message: `${source.name} returned "gone" for ${target}. Its URL may have changed — check and update the source.`,
        sourceId: source.id,
      });
    }
    deps.log(`  failed: ${found.error}`);
    return {
      result: { ...base, ok: false, error: found.error, skipped: found.robotsDisallowed ? "robots-disallowed" : undefined, durationMs: Date.now() - started },
      resources: [],
      source: updatedSource,
    };
  }

  // The single place that decides whether a byte may be copied.
  const mayHost = source.licenseStatus === "yes";
  if (!mayHost) deps.log(`  link-only (licence is "${source.licenseStatus}") — nothing will be downloaded`);

  const limit = opts.maxPerSource ?? MAX_PER_SOURCE;
  const candidates = found.candidates.slice(0, limit);
  const pool = [...existing, ...merged];

  for (const candidate of candidates) {
    base.checked += 1;

    const canonical = canonicalizeUrl(candidate.url);
    const prior = pool.find((r) => (r.canonicalUrl ?? canonicalizeUrl(r.originalUrl)) === canonical);

    // ---- §5: has an existing resource changed? -------------------------
    if (prior) {
      let changed = false;
      let detectedBy = "";
      if (candidate.date && prior.lastUpdatedDate && candidate.date > prior.lastUpdatedDate) {
        changed = true;
        detectedBy = "index-date";
      } else if (mayHost && prior.fileHash) {
        const head = await politeHead(candidate.url, { crawlDelaySeconds: source.crawlDelaySeconds });
        if (head.ok && head.size && prior.fileSize && head.size !== prior.fileSize) {
          changed = true;
          detectedBy = "content-length";
        }
      }
      if (!changed) continue;

      const enriched = await enrich(source, candidate, mayHost, deps);
      if (!enriched) continue;
      // A byte-identical file is not an update however the headers looked.
      if (enriched.hash && enriched.hash === prior.fileHash) continue;

      const versions = [...(prior.versions ?? [])];
      if (prior.fileHash) {
        versions.unshift({
          hash: prior.fileHash,
          collectedDate: prior.collectedDate,
          fileSize: prior.fileSize ?? 0,
          fileKey: prior.localFileUrl?.replace(/^\//, ""),
          detectedBy,
        });
      }
      let localFileUrl = prior.localFileUrl;
      if (mayHost && enriched.body && enriched.fileKey) {
        if (!deps.dryRun && !localFileExists(enriched.fileKey)) {
          localFileUrl = writeLocalFile(enriched.fileKey, enriched.body);
        } else {
          localFileUrl = `/${enriched.fileKey}`;
        }
      }
      merged.push({
        ...prior,
        title: enriched.title || prior.title,
        description: enriched.description || prior.description,
        fileHash: enriched.hash ?? prior.fileHash,
        fileSize: enriched.size ?? prior.fileSize,
        localFileUrl,
        lastUpdatedDate: enriched.lastUpdatedDate ?? candidate.date ?? todayKey,
        textExcerpt: enriched.text ? enriched.text.slice(0, 2000) : prior.textExcerpt,
        versions: versions.slice(0, 10),
        flags: enriched.flags,
        // A changed document has not been reviewed in its new form.
        status: prior.status === "published" && source.autoPublish ? "published" : "needs-review",
        reviewedBy: null,
        reviewedAt: null,
        updatedAt: nowIso,
      });
      base.updated += 1;
      deps.notify({
        level: "info",
        kind: "resource-updated",
        message: `"${prior.title}" was updated at ${source.name} (detected by ${detectedBy}).`,
        sourceId: source.id,
        resourceId: prior.id,
      });
      deps.log(`  updated: ${enriched.title}`);
      continue;
    }

    // ---- new candidate --------------------------------------------------
    const enriched = await enrich(source, candidate, mayHost, deps);
    if (!enriched) continue;

    // ---- §9: dedupe against everything already known -------------------
    const dup = findDuplicate(
      {
        title: enriched.title,
        originalUrl: candidate.url,
        fileHash: enriched.hash,
        textExcerpt: enriched.text.slice(0, 2000),
      },
      [...existing, ...merged],
    );
    if (dup) {
      base.duplicates += 1;
      deps.log(`  duplicate (${dup.reason}) of ${dup.existing.id}: ${enriched.title}`);
      continue;
    }

    // ---- §7 + §8: categorise, subject, class, language -----------------
    const guess = categorize(enriched.title, enriched.description, enriched.text, source.categories);
    const language = detectLanguage(enriched.title, enriched.description, enriched.text.slice(0, 4000));
    const resourceType =
      candidate.looksLike === "video"
        ? "video"
        : detectResourceType(enriched.title, enriched.description, mayHost && enriched.hash ? "pdf" : "link");
    const expiryDate =
      extractExpiryDate(enriched.title, enriched.description, enriched.text.slice(0, 6000)) ?? undefined;

    const flags = [...enriched.flags];
    if (source.licenseStatus === "unknown" && !flags.includes("license-unclear")) flags.push("license-unclear");
    if (expiryDate && isExpired(expiryDate, todayKey) && !flags.includes("expired")) flags.push("expired");

    let localFileUrl: string | undefined;
    if (mayHost && enriched.body && enriched.fileKey) {
      localFileUrl = deps.dryRun ? `/${enriched.fileKey}` : writeLocalFile(enriched.fileKey, enriched.body);
    }

    const status = decideStatus(source, flags, guess.confidence, expiryDate, todayKey);
    if (status === "needs-review") base.flagged += 1;

    const videoId = candidate.looksLike === "video" ? youtubeVideoId(candidate.url) : null;

    merged.push({
      id: newId(source.id, candidate.url),
      title: enriched.title,
      description: enriched.description,
      category: guess.category,
      subcategory: guess.subcategory,
      subject: detectSubject(enriched.title, enriched.description, enriched.text),
      classLevel: detectClassLevel(enriched.title, enriched.description),
      exam: detectExam(enriched.title, enriched.description),
      language,
      resourceType,
      sourceId: source.id,
      sourceUrl: target,
      originalUrl: candidate.url,
      localFileUrl,
      fileHash: enriched.hash,
      fileSize: enriched.size,
      canonicalUrl: canonical,
      publishedDate: enriched.publishedDate,
      lastUpdatedDate: enriched.lastUpdatedDate,
      collectedDate: todayKey,
      expiryDate,
      licenseStatus: source.licenseStatus,
      attribution: source.attribution,
      status,
      flags,
      tags: guess.matched.slice(0, 6),
      video: videoId
        ? {
            provider: "youtube",
            videoId,
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            unavailable: flags.includes("source-removed") || undefined,
            unavailableCheckedAt: nowIso,
          }
        : undefined,
      textExcerpt: enriched.text ? enriched.text.slice(0, 2000) : undefined,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    base.added += 1;
    deps.log(`  + ${status}: ${enriched.title}`);
  }

  // ---- §14: notifications worth an admin's attention --------------------
  if (base.added >= BULK_DISCOVERY_THRESHOLD) {
    deps.notify({
      level: "info",
      kind: "bulk-discovery",
      message: `${source.name} produced ${base.added} new resources in one run. Worth a look before publishing.`,
      sourceId: source.id,
    });
  }
  if (base.flagged > 0) {
    deps.notify({
      level: "action",
      kind: "needs-verification",
      message: `${base.flagged} resource(s) from ${source.name} need manual verification.`,
      sourceId: source.id,
    });
  }
  if (source.licenseStatus === "unknown" && base.added > 0) {
    deps.notify({
      level: "action",
      kind: "license-unclear",
      message: `${source.name} has no readable licence statement, so its ${base.added} new resource(s) are held for review and will never be re-hosted. Reading its terms would settle this.`,
      sourceId: source.id,
    });
  }

  updatedSource = {
    ...source,
    health: {
      ...source.health,
      lastChecked: nowIso,
      lastSuccess: nowIso,
      consecutiveFailures: 0,
      lastError: null,
      resourceCount: source.health.resourceCount + base.added,
      etags: found.etag ? { ...source.health.etags, [target]: found.etag } : source.health.etags,
      lastModified: found.lastModified
        ? { ...source.health.lastModified, [target]: found.lastModified }
        : source.health.lastModified,
    },
  };

  return { result: { ...base, durationMs: Date.now() - started }, resources: merged, source: updatedSource };
}

/**
 * §11: sweep the catalog for resources whose expiry has passed.
 *
 * Archived, never deleted — the brief is explicit, and an expired exam
 * notification is still the historical record of that exam.
 */
export function archiveExpired(resources: Resource[], todayKey: string, nowIso: string): { resources: Resource[]; expired: number } {
  let expired = 0;
  const out = resources.map((r) => {
    if (r.status === "expired" || r.status === "removed") return r;
    if (!isExpired(r.expiryDate, todayKey)) return r;
    expired += 1;
    return {
      ...r,
      status: "expired" as ResourceStatus,
      flags: r.flags.includes("expired") ? r.flags : [...r.flags, "expired" as ResourceFlag],
      updatedAt: nowIso,
    };
  });
  return { resources: out, expired };
}

/** Merge collected resources into the catalog, newest wins by id. */
export function mergeResources(existing: Resource[], incoming: Resource[]): Resource[] {
  const byId = new Map(existing.map((r) => [r.id, r]));
  for (const r of incoming) byId.set(r.id, r);
  return [...byId.values()];
}
