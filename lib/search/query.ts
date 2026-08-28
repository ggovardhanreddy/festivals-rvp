/**
 * Scored matching over the search index.
 *
 * Deliberately no search library. The index is ~700 documents and gzips to
 * 25 KB; a weighted scan runs in well under a millisecond. Pagefind or
 * similar becomes worth its weight somewhere past a few thousand documents,
 * and because everything goes through SearchDoc that swap is a matcher
 * change, not a content migration.
 */
import type { SearchDoc } from "./schema";
import { MIN_TOKEN_OVERLAP, expandQuery, normalize, tokens } from "./normalize";

export type SearchHit = { doc: SearchDoc; score: number };

const W = {
  titleExact: 100,
  titlePrefix: 60,
  titleContains: 40,
  keyword: 25,
  descriptionContains: 12,
  contentContains: 6,
  tokenOverlap: 3,
} as const;

/**
 * Score one document.
 *
 * `needles` are whole-query forms (the query plus its transliterations).
 * `words` are the individual words of a multi-word query, scored at a
 * fraction of the weight: "kisan loan" should still find PM-KISAN and the
 * agricultural credit page even though no single document contains the
 * phrase, but a document matching the whole phrase must always outrank one
 * that matched a single word of it.
 */
const WORD_FACTOR = 0.35;

function matchScore(doc: SearchDoc, needles: string[]): number {
  const title = normalize(doc.title);
  const description = normalize(doc.description);
  const content = normalize(doc.content);
  const keywords = doc.keywords.map(normalize);

  let score = 0;
  for (const q of needles) {
    if (!q) continue;
    if (title === q) score += W.titleExact;
    else if (title.startsWith(q)) score += W.titlePrefix;
    else if (title.includes(q)) score += W.titleContains;

    if (keywords.some((k) => k === q || k.includes(q))) score += W.keyword;
    if (description.includes(q)) score += W.descriptionContains;
    if (content.includes(q)) score += W.contentContains;
  }

  return score;
}

function scoreDoc(doc: SearchDoc, needles: string[], words: string[]): number {
  let score = matchScore(doc, needles);

  if (words.length) {
    score += matchScore(doc, words) * WORD_FACTOR;
  }

  if (score === 0) {
    // Token overlap catches Telugu partial words, where there is no space to
    // split on and substring matching alone misses most real queries.
    const qt = new Set(needles.flatMap(tokens));
    const dt = new Set([...tokens(doc.title), ...tokens(doc.description)]);
    let overlap = 0;
    for (const t of qt) if (dt.has(t)) overlap += 1;
    // One or two shared bigrams are coincidence at this index size.
    if (overlap >= MIN_TOKEN_OVERLAP) score += overlap * W.tokenOverlap;
  }

  return score * (doc.weight ?? 1);
}

export type SearchOptions = {
  section?: string;
  language?: string;
  limit?: number;
};

export function search(
  docs: SearchDoc[],
  query: string,
  options: SearchOptions = {},
): SearchHit[] {
  const needles = expandQuery(query);
  // Individual words, only when the query has more than one of them.
  const plain = normalize(query).split(" ").filter((w) => w.length > 1);
  const words = plain.length > 1 ? plain.flatMap((w) => expandQuery(w)) : [];
  const pool = docs.filter((d) => {
    if (options.section && options.section !== "all" && d.section !== options.section) return false;
    if (options.language && options.language !== "all" && d.language !== options.language) return false;
    return true;
  });

  // No query: return the pool in weight order so a bare filter still shows work.
  if (!needles.length) {
    return pool
      .slice()
      .sort((a, b) => (b.weight ?? 1) - (a.weight ?? 1))
      .slice(0, options.limit ?? 50)
      .map((doc) => ({ doc, score: 0 }));
  }

  const hits: SearchHit[] = [];
  for (const doc of pool) {
    const score = scoreDoc(doc, needles, words);
    if (score > 0) hits.push({ doc, score });
  }
  hits.sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title));
  return hits.slice(0, options.limit ?? 50);
}

/** Counts per section for the facet UI, computed from the full result set. */
export function facetCounts(hits: SearchHit[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const h of hits) out[h.doc.section] = (out[h.doc.section] ?? 0) + 1;
  return out;
}
