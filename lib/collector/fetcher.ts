/**
 * The polite fetcher.
 *
 * §3 and §13 both say the same thing in different words: do not overload these
 * websites. Several sources in the registry are modestly resourced state
 * servers that were already timing out during vetting, so the fetcher is built
 * to be gentle by construction rather than by good intentions:
 *
 *   - one request at a time per host, with a minimum gap between them
 *   - robots.txt consulted before every request, cached per run
 *   - conditional requests (If-None-Match / If-Modified-Since) so a re-check
 *     costs a 304 and no body
 *   - a real identifying User-Agent with a contact URL, so an administrator
 *     who sees us in their logs knows who we are and can ask us to stop
 *   - bounded retries with backoff, and no retry at all on 4xx
 *   - a hard byte cap, enforced while streaming, so a huge file cannot
 *     exhaust the runner
 *
 * Node-only.
 */
import { fetchRobots, isAllowed, type RobotsRules } from "./robots";

export const USER_AGENT =
  "ReddivaripalliLearningBot/1.0 (+https://www.reddivaripalli.com/learn/; village community education resource collector; contact reddivaripalli.rvp@gmail.com)";

/** Politeness floor. A source may ask for more, never less. */
export const MIN_HOST_GAP_MS = 2000;

/** Hard cap on any single download. 60 MB covers every textbook seen. */
export const MAX_BYTES = 60 * 1024 * 1024;

const lastRequestAt = new Map<string, number>();

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForHost(host: string, gapMs: number): Promise<void> {
  const last = lastRequestAt.get(host) ?? 0;
  const wait = last + gapMs - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequestAt.set(host, Date.now());
}

export type FetchOptions = {
  /** Seconds to leave between requests to this host. */
  crawlDelaySeconds?: number;
  etag?: string;
  lastModified?: string;
  accept?: string;
  timeoutMs?: number;
  maxBytes?: number;
  /** Attempts INCLUDING the first. 1 means no retry. */
  attempts?: number;
  /** Skip the robots check. Only for /robots.txt itself. */
  skipRobots?: boolean;
};

export type FetchResult =
  | { kind: "ok"; status: number; body: Buffer; contentType: string; etag?: string; lastModified?: string; finalUrl: string }
  | { kind: "not-modified"; status: 304 }
  | { kind: "gone"; status: number }
  | { kind: "robots-disallowed" }
  | { kind: "too-large"; bytes: number }
  | { kind: "error"; status?: number; message: string };

/**
 * Fetch one URL politely.
 *
 * Returns a discriminated result rather than throwing, because every one of
 * these outcomes is a normal thing for the collector to record about a source
 * rather than an exception to unwind — "gone" in particular is how §6's
 * "Video unavailable" and §10's "Source Unavailable" get set.
 */
export async function politeFetch(url: string, opts: FetchOptions = {}): Promise<FetchResult> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { kind: "error", message: `Not a URL: ${url}` };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { kind: "error", message: `Refusing non-http scheme: ${parsed.protocol}` };
  }

  let rules: RobotsRules | null = null;
  if (!opts.skipRobots) {
    rules = await fetchRobots(parsed.origin, USER_AGENT);
    if (!isAllowed(rules, url)) return { kind: "robots-disallowed" };
  }

  // The host's own Crawl-delay wins if it is longer than ours.
  const configured = (opts.crawlDelaySeconds ?? 0) * 1000;
  const fromRobots = (rules?.crawlDelay ?? 0) * 1000;
  const gap = Math.max(MIN_HOST_GAP_MS, configured, fromRobots);

  const attempts = Math.max(1, opts.attempts ?? 3);
  const maxBytes = opts.maxBytes ?? MAX_BYTES;
  let lastMessage = "unknown error";

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    await waitForHost(parsed.host, gap);

    const headers: Record<string, string> = {
      "user-agent": USER_AGENT,
      accept: opts.accept ?? "*/*",
      "accept-language": "en-IN,en;q=0.9,te;q=0.8",
    };
    if (opts.etag) headers["if-none-match"] = opts.etag;
    if (opts.lastModified) headers["if-modified-since"] = opts.lastModified;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 45000);
    try {
      const res = await fetch(url, { headers, signal: controller.signal, redirect: "follow" });

      if (res.status === 304) {
        clearTimeout(timer);
        return { kind: "not-modified", status: 304 };
      }
      if (res.status === 404 || res.status === 410) {
        clearTimeout(timer);
        return { kind: "gone", status: res.status };
      }
      if (res.status >= 400 && res.status < 500) {
        clearTimeout(timer);
        // Client errors are the host's settled answer. Retrying is rude.
        return { kind: "error", status: res.status, message: `HTTP ${res.status}` };
      }
      if (!res.ok) {
        clearTimeout(timer);
        lastMessage = `HTTP ${res.status}`;
        if (attempt < attempts) await sleep(attempt * 4000);
        continue;
      }

      // Refuse on the declared length before reading a byte, when offered.
      const declared = Number(res.headers.get("content-length") ?? "0");
      if (declared > maxBytes) {
        clearTimeout(timer);
        return { kind: "too-large", bytes: declared };
      }

      // Stream so an undeclared oversized body is cut off rather than buffered.
      const chunks: Buffer[] = [];
      let total = 0;
      const reader = res.body?.getReader();
      if (reader) {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          total += value.byteLength;
          if (total > maxBytes) {
            await reader.cancel().catch(() => {});
            clearTimeout(timer);
            return { kind: "too-large", bytes: total };
          }
          chunks.push(Buffer.from(value));
        }
      }
      clearTimeout(timer);

      return {
        kind: "ok",
        status: res.status,
        body: Buffer.concat(chunks),
        contentType: (res.headers.get("content-type") ?? "").toLowerCase(),
        etag: res.headers.get("etag") ?? undefined,
        lastModified: res.headers.get("last-modified") ?? undefined,
        finalUrl: res.url || url,
      };
    } catch (err) {
      clearTimeout(timer);
      lastMessage = err instanceof Error ? err.message : String(err);
      if (attempt < attempts) await sleep(attempt * 4000);
    }
  }

  return { kind: "error", message: lastMessage };
}

/**
 * HEAD a URL to learn whether it changed, without downloading it.
 *
 * §5's cheapest change signal. Not every one of these hosts answers HEAD
 * honestly, so a caller must treat an error here as "don't know" and fall
 * back to hashing the body rather than as "unchanged".
 */
export async function politeHead(
  url: string,
  opts: FetchOptions = {},
): Promise<{ ok: boolean; etag?: string; lastModified?: string; size?: number; status?: number }> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false };
  }
  if (!opts.skipRobots) {
    const rules = await fetchRobots(parsed.origin, USER_AGENT);
    if (!isAllowed(rules, url)) return { ok: false };
  }
  const gap = Math.max(MIN_HOST_GAP_MS, (opts.crawlDelaySeconds ?? 0) * 1000);
  await waitForHost(parsed.host, gap);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 20000);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "user-agent": USER_AGENT },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timer);
    const size = Number(res.headers.get("content-length") ?? "");
    return {
      ok: res.ok,
      status: res.status,
      etag: res.headers.get("etag") ?? undefined,
      lastModified: res.headers.get("last-modified") ?? undefined,
      size: Number.isFinite(size) && size > 0 ? size : undefined,
    };
  } catch {
    clearTimeout(timer);
    return { ok: false };
  }
}

export function resetHostThrottle(): void {
  lastRequestAt.clear();
}
