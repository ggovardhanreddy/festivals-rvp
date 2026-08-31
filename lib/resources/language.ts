/**
 * Script-first language detection.
 *
 * Unicode block counting beats a word list for the three languages that
 * matter here, because Telugu, Devanagari and Arabic script share no
 * codepoints with Latin. A document is called Telugu when Telugu letters
 * dominate the letters present — not when a single Telugu word appears in an
 * otherwise English notice, which is common on AP government PDFs.
 *
 * Client-safe.
 */
import type { ResourceLanguage } from "./types";

const TELUGU = /[ఀ-౿]/g;
const DEVANAGARI = /[ऀ-ॿ]/g;
const ARABIC = /[؀-ۿݐ-ݿ]/g;
const LATIN = /[A-Za-z]/g;

function count(text: string, re: RegExp): number {
  const m = text.match(re);
  return m ? m.length : 0;
}

/**
 * A share of total letters, above which a script wins.
 *
 * 0.15 rather than 0.5: an AP textbook PDF's extracted text is routinely
 * half English (headers, page numbers, "Government of Andhra Pradesh") even
 * when the body is entirely Telugu, so requiring a majority would misfile
 * most of the Telugu library as English. The reverse mistake is cheaper —
 * a Telugu-tagged English document is visible under a language filter the
 * reader can clear.
 */
const SCRIPT_SHARE = 0.15;

export function detectLanguage(...parts: Array<string | undefined>): ResourceLanguage {
  const text = parts.filter(Boolean).join(" ");
  if (!text.trim()) return "en";

  const te = count(text, TELUGU);
  const hi = count(text, DEVANAGARI);
  const ur = count(text, ARABIC);
  const en = count(text, LATIN);
  const total = te + hi + ur + en;
  if (total === 0) return "other";

  // Non-Latin scripts are checked first and against a low bar, for the
  // reason in SCRIPT_SHARE above. Most-represented non-Latin script wins.
  const nonLatin: Array<[ResourceLanguage, number]> = [
    ["te", te],
    ["hi", hi],
    ["ur", ur],
  ];
  nonLatin.sort((a, b) => b[1] - a[1]);
  const [topLang, topCount] = nonLatin[0]!;
  if (topCount / total >= SCRIPT_SHARE) return topLang;

  if (en / total >= 0.5) return "en";
  return "other";
}

/** True when the text contains any Telugu at all — used to offer a
 *  "తెలుగు" badge on a document that is mostly English but has Telugu in it. */
export function hasTelugu(text: string): boolean {
  return count(text, TELUGU) > 0;
}
