/**
 * Duplicate detection, §9.
 *
 * Four signals, cheapest first, because the same document genuinely does
 * appear on several of these portals — an AP SSC model paper is published by
 * BSE AP and mirrored by the school-education department, and a PDF linked
 * from two index pages is one resource, not two.
 *
 *   1. file hash        — identical bytes. Certain.
 *   2. canonical URL    — same file, different query string. Near-certain.
 *   3. title similarity — same document renamed. Needs a second signal.
 *   4. text similarity  — same content, re-exported. Needs a second signal.
 *
 * Signals 3 and 4 never decide alone; they must agree with each other, since
 * "AP EAPCET 2026 Notification" and "AP EAPCET 2026 Notification (Revised)"
 * are similar titles for genuinely different documents.
 *
 * Client-safe.
 */
import type { Resource } from "./types";

/**
 * Strip the parts of a URL that identify a request rather than a document.
 *
 * Tracking parameters, session ids and cache-busters differ between two links
 * to the same PDF; the path does not. Fragments never identify a file.
 */
const NOISE_PARAMS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "fbclid", "gclid", "ref", "referrer", "sessionid", "sid", "phpsessid",
  "jsessionid", "_", "cb", "cachebust", "t", "v", "ts",
]);

export function canonicalizeUrl(raw: string): string {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return raw.trim().toLowerCase();
  }
  u.hash = "";
  u.protocol = "https:";
  u.hostname = u.hostname.toLowerCase().replace(/^www\./, "");
  for (const key of [...u.searchParams.keys()]) {
    if (NOISE_PARAMS.has(key.toLowerCase())) u.searchParams.delete(key);
  }
  // Sorted so ?a=1&b=2 and ?b=2&a=1 collapse to one key.
  u.searchParams.sort();
  // A trailing slash on a file path is meaningless; on a directory it is not,
  // so only strip it when the last segment looks like a filename.
  if (/\.[a-z0-9]{2,5}\/$/i.test(u.pathname)) u.pathname = u.pathname.replace(/\/$/, "");
  return u.toString();
}

/** Words that carry no identity in this corpus, so they can't create a match. */
const STOPWORDS = new Set([
  "the", "of", "and", "for", "a", "an", "in", "on", "to", "by", "with", "from",
  "pdf", "download", "click", "here", "new", "latest", "government", "govt",
  "andhra", "pradesh", "ap", "india", "official", "department", "notice",
]);

export function titleTokens(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w)),
  );
}

/** Jaccard overlap of two token sets. 1 is identical, 0 is disjoint. */
export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const t of a) if (b.has(t)) shared += 1;
  return shared / (a.size + b.size - shared);
}

export function titleSimilarity(a: string, b: string): number {
  return jaccard(titleTokens(a), titleTokens(b));
}

/** Text similarity over the extracted excerpt, same measure, more tokens. */
export function textSimilarity(a = "", b = ""): number {
  if (!a || !b) return 0;
  const norm = (s: string) =>
    new Set(
      s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w.length > 3),
    );
  return jaccard(norm(a.slice(0, 4000)), norm(b.slice(0, 4000)));
}

export const TITLE_MATCH_THRESHOLD = 0.75;
export const TEXT_MATCH_THRESHOLD = 0.8;

export type DuplicateMatch = {
  existing: Resource;
  reason: "hash" | "canonical-url" | "title-and-text";
  score: number;
};

/**
 * Find an existing resource that is the same document as `candidate`.
 *
 * `sourceRank` decides which copy is preferred when the same document is
 * found on several approved sources: lower is more official. §9 asks for the
 * preferred official source to be kept, and the caller uses the returned
 * match to decide whether to replace or discard.
 */
export function findDuplicate(
  candidate: Pick<Resource, "title" | "originalUrl" | "fileHash" | "textExcerpt">,
  existing: Resource[],
): DuplicateMatch | null {
  if (candidate.fileHash) {
    const byHash = existing.find((r) => r.fileHash && r.fileHash === candidate.fileHash);
    if (byHash) return { existing: byHash, reason: "hash", score: 1 };
  }

  const canonical = canonicalizeUrl(candidate.originalUrl);
  const byUrl = existing.find(
    (r) => (r.canonicalUrl ?? canonicalizeUrl(r.originalUrl)) === canonical,
  );
  if (byUrl) return { existing: byUrl, reason: "canonical-url", score: 1 };

  for (const r of existing) {
    const t = titleSimilarity(candidate.title, r.title);
    if (t < TITLE_MATCH_THRESHOLD) continue;
    const x = textSimilarity(candidate.textExcerpt, r.textExcerpt);
    // Both must agree. A similar title alone is how "Notification" and
    // "Notification (Revised)" would wrongly collapse into one resource.
    if (x >= TEXT_MATCH_THRESHOLD) {
      return { existing: r, reason: "title-and-text", score: (t + x) / 2 };
    }
  }

  return null;
}

/**
 * Preference order when the same document exists on two sources.
 * The originating authority outranks a mirror.
 */
export function preferredSource(a: { rank: number }, b: { rank: number }): number {
  return a.rank - b.rank;
}
