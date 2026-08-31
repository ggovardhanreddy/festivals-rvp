/**
 * Automatic categorisation from title, description and extracted text.
 *
 * Scored keyword matching, not a classifier. The taxonomy is small and the
 * vocabulary of Indian education portals is formulaic ("SSC Public
 * Examinations", "AP EAPCET 2026 Notification", "Package of Practices"), so
 * patterns beat anything statistical here and, unlike a model, an admin can
 * read WHY something landed where it did.
 *
 * Weighting matters: a word in the title is worth far more than the same word
 * on page 40 of a PDF. Without that, every AP document would categorise as
 * "government" on the strength of its letterhead.
 *
 * Client-safe.
 */
import {
  CATEGORY_TREE,
  CLASS_LEVELS,
  SUBJECT_MATCH,
  type CategoryKey,
  type ClassLevel,
  type Subject,
} from "./taxonomy";
import type { ResourceType } from "./types";

const TITLE_WEIGHT = 10;
const DESC_WEIGHT = 4;
const TEXT_WEIGHT = 1;

export type CategoryGuess = {
  category: CategoryKey;
  subcategory?: string;
  confidence: number;
  /** Which patterns fired, so an admin can see the reasoning. */
  matched: string[];
};

function scoreField(haystack: string, needles: string[]): { score: number; hits: string[] } {
  let score = 0;
  const hits: string[] = [];
  for (const n of needles) {
    if (haystack.includes(n)) {
      score += 1;
      hits.push(n);
    }
  }
  return { score, hits };
}

export function categorize(
  title: string,
  description = "",
  text = "",
  sourceCategories: CategoryKey[] = [],
): CategoryGuess {
  const t = title.toLowerCase();
  const d = description.toLowerCase();
  // Only the head of the document: a textbook's later chapters drag every
  // subject keyword in and turn every long PDF into a tie.
  const x = text.slice(0, 4000).toLowerCase();

  let best: CategoryGuess = { category: "government", confidence: 0, matched: [] };

  for (const cat of CATEGORY_TREE) {
    const inTitle = scoreField(t, cat.match);
    const inDesc = scoreField(d, cat.match);
    const inText = scoreField(x, cat.match);
    let score =
      inTitle.score * TITLE_WEIGHT + inDesc.score * DESC_WEIGHT + inText.score * TEXT_WEIGHT;

    // The source's own declared categories are a strong prior: a scholarship
    // portal publishing a PDF is publishing a scholarship document far more
    // often than not.
    if (sourceCategories.includes(cat.key)) score += 6;

    let subcategory: string | undefined;
    let subHits: string[] = [];
    let bestSub = 0;
    for (const sub of cat.subcategories) {
      const st = scoreField(t, sub.match);
      const sd = scoreField(d, sub.match);
      const sx = scoreField(x, sub.match);
      const s = st.score * TITLE_WEIGHT + sd.score * DESC_WEIGHT + sx.score * TEXT_WEIGHT;
      if (s > bestSub) {
        bestSub = s;
        subcategory = sub.key;
        subHits = [...st.hits, ...sd.hits, ...sx.hits];
      }
    }
    score += Math.min(bestSub, 20);

    if (score > best.confidence) {
      best = {
        category: cat.key,
        subcategory: bestSub > 0 ? subcategory : undefined,
        confidence: score,
        matched: [...inTitle.hits, ...inDesc.hits, ...subHits].slice(0, 8),
      };
    }
  }

  return best;
}

/**
 * Below this, categorisation is a guess rather than a reading, and the
 * resource is flagged for review instead of being filed silently.
 */
export const CONFIDENCE_FLOOR = 8;

export function detectSubject(title: string, description = "", text = ""): Subject | undefined {
  const hay = `${title} ${description} ${text.slice(0, 2000)}`.toLowerCase();
  for (const [subject, needles] of SUBJECT_MATCH) {
    for (const n of needles) {
      if (hay.includes(n)) return subject;
    }
  }
  return undefined;
}

const CLASS_PATTERNS: Array<[ClassLevel, RegExp[]]> = [
  ["class-10", [/\b(?:class|std\.?|standard)\s*(?:10|x)\b/i, /\b10th\s*class\b/i, /\bssc\b/i, /10వ\s*తరగతి/]],
  ["class-9", [/\b(?:class|std\.?|standard)\s*(?:9|ix)\b/i, /\b9th\s*class\b/i, /9వ\s*తరగతి/]],
  ["class-8", [/\b(?:class|std\.?|standard)\s*(?:8|viii)\b/i, /\b8th\s*class\b/i, /8వ\s*తరగతి/]],
  ["class-7", [/\b(?:class|std\.?|standard)\s*(?:7|vii)\b/i, /\b7th\s*class\b/i, /7వ\s*తరగతి/]],
  ["class-6", [/\b(?:class|std\.?|standard)\s*(?:6|vi)\b/i, /\b6th\s*class\b/i, /6వ\s*తరగతి/]],
  ["inter-2", [/\bsecond\s*year\b/i, /\b2nd\s*year\b/i, /\bsenior\s*inter/i]],
  ["inter-1", [/\bfirst\s*year\b/i, /\b1st\s*year\b/i, /\bjunior\s*inter/i]],
  ["primary", [/\b(?:class|std\.?|standard)\s*(?:[1-5]|i{1,3}|iv|v)\b/i, /\bprimary\s*(?:school|class)/i, /ప్రాథమిక/]],
  ["degree", [/\bdegree\b/i, /\bb\.?tech\b/i, /\bgraduation\b/i, /\bundergraduate\b/i]],
];

export function detectClassLevel(title: string, description = ""): ClassLevel | undefined {
  const hay = `${title} ${description}`;
  for (const [level, patterns] of CLASS_PATTERNS) {
    for (const p of patterns) if (p.test(hay)) return level;
  }
  return undefined;
}

const TYPE_PATTERNS: Array<[ResourceType, RegExp[]]> = [
  ["question-paper", [/\bquestion\s*paper/i, /\bmodel\s*paper/i, /\bprevious\s*(?:year\s*)?paper/i, /\bsample\s*paper/i, /\bpast\s*paper/i]],
  ["syllabus", [/\bsyllabus\b/i, /\bcurriculum\b/i, /\bcourse\s*structure/i]],
  ["textbook", [/\btext\s*book/i, /\bతెలుగు\s*వాచకం/i, /\bebook\b/i, /\bworkbook\b/i]],
  ["notification", [/\bnotification\b/i, /\brecruitment\b/i, /\badvertisement\s*no/i, /\bvacanc/i, /\bapply\s*online/i, /\blast\s*date/i, /\badmit\s*card/i, /\banswer\s*key/i]],
  ["study-material", [/\bstudy\s*material/i, /\bhandbook\b/i, /\bguide\b/i, /\bnotes\b/i, /\bpackage\s*of\s*practices/i]],
  ["dataset", [/\bdataset\b/i, /\bstatistics\b/i, /\bcensus\b/i]],
  ["course", [/\bcourse\b/i, /\bmooc\b/i, /\btraining\s*programme/i]],
];

export function detectResourceType(
  title: string,
  description = "",
  fallback: ResourceType = "document",
): ResourceType {
  const hay = `${title} ${description}`;
  for (const [type, patterns] of TYPE_PATTERNS) {
    for (const p of patterns) if (p.test(hay)) return type;
  }
  return fallback;
}

/** Exam name extraction, for the `exam` filter. Longest match wins. */
const EXAMS = [
  "AP EAPCET", "AP EAMCET", "AP POLYCET", "AP ECET", "AP ICET", "AP EdCET",
  "AP LAWCET", "AP PGCET", "AP PECET", "JEE Main", "JEE Advanced", "NEET UG",
  "NEET PG", "CUET", "APPSC", "SSC CGL", "SSC CHSL", "SSC GD", "SSC MTS",
  "IBPS", "RRB NTPC", "NDA", "CDS", "APTET", "TET", "AP DEECET", "SSC",
];

export function detectExam(title: string, description = ""): string | undefined {
  const hay = `${title} ${description}`.toLowerCase();
  let found: string | undefined;
  for (const exam of EXAMS) {
    if (hay.includes(exam.toLowerCase())) {
      if (!found || exam.length > found.length) found = exam;
    }
  }
  return found;
}

export { CLASS_LEVELS };
