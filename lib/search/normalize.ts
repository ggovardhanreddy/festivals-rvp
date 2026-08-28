/**
 * Text normalisation for bilingual search.
 *
 * Telugu is an abugida with no whitespace-friendly stemmer, so substring
 * matching alone misses most real queries. Character bigrams handle it well
 * enough at this index size and cost nothing at runtime.
 */

const TELUGU_RANGE = /[ఀ-౿]/;

export function hasTelugu(text: string): boolean {
  return TELUGU_RANGE.test(text);
}

/**
 * Lowercase, strip punctuation, collapse whitespace.
 *
 * Two details that matter for Telugu, both found by tests/unit/search.test.ts:
 *
 *  - NFC, not NFKD. NFKD decomposes Telugu syllables into base letters plus
 *    combining vowel signs, which then get separated and reordered.
 *  - The keep-set includes \p{M} (combining marks). Telugu vowel signs such as
 *    the "ా" in రామాలయం are category Mn, not Letter, so a \p{L}-only filter
 *    silently deletes them and turns "రామాలయం" into "ర మ లయ".
 */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}\p{M}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokens(text: string): string[] {
  const norm = normalize(text);
  if (!norm) return [];
  const out = norm.split(" ").filter(Boolean);
  // Add character bigrams for Telugu runs so partial words still match.
  for (const word of out.slice()) {
    if (hasTelugu(word) && word.length > 2) {
      for (let i = 0; i < word.length - 1; i += 1) out.push(word.slice(i, i + 2));
    }
  }
  return out;
}

/**
 * Transliteration pairs for names people actually type.
 *
 * Applied as a RANKING BOOST, never as a filter — a wrong pair then costs
 * ordering rather than hiding a correct result. Deliberately small and
 * hand-checked; this is not a general transliteration engine.
 */
export const TRANSLITERATIONS: Array<[string, string]> = [
  ["ramalayam", "రామాలయం"],
  ["sankranthi", "సంక్రాంతి"],
  ["sankranti", "సంక్రాంతి"],
  ["ugadi", "ఉగాది"],
  ["deepavali", "దీపావళి"],
  ["dasara", "దసరా"],
  ["vinayaka", "వినాయక"],
  ["jathara", "జాతర"],
  ["mathamma", "మాతమ్మ"],
  ["devapatlamma", "దేవపట్లమ్మ"],
  ["panchangam", "పంచాంగం"],
  ["reddivaripalli", "రెడ్డివారిపల్లి"],
  ["gram panchayat", "గ్రామ పంచాయతీ"],
  ["temple", "దేవాలయం"],
  ["village", "గ్రామం"],
  ["farmer", "రైతు"],
  ["agriculture", "వ్యవసాయం"],
  ["weather", "వాతావరణం"],
];

/** Both spellings of a query, so either script finds either script's content. */
export function expandQuery(query: string): string[] {
  const base = normalize(query);
  if (!base) return [];
  const out = new Set<string>([base]);
  for (const [latin, telugu] of TRANSLITERATIONS) {
    if (base.includes(latin)) out.add(base.replace(latin, telugu));
    if (base.includes(telugu)) out.add(base.replace(telugu, latin));
  }
  return [...out];
}
