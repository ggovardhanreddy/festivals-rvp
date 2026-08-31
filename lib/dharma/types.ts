/**
 * The Sanatana Dharma & Telugu Culture knowledge model.
 *
 * Everything here is CURATED, not collected: written by hand, reviewed, and
 * committed. It is deliberately separate from lib/resources (the collector's
 * model) because the two have opposite trust properties — a chapter of the
 * Gita is a fixed fact about a text that has not changed in centuries, while a
 * collected resource is something a robot found this morning and nobody has
 * read yet.
 *
 * The field that matters most is `sources`. Every entry names where its text
 * can actually be read, and each source carries its own `access` verdict, so a
 * page can never offer a download of something we are not permitted to host.
 *
 * Client-safe: no node imports.
 */

/** What we may do with a particular external source. */
export type SourceAccess =
  /** Explicit free licence (CC / public domain). We may host a copy. */
  | "open"
  /** Readable at the source, but its terms do not permit us to copy it. */
  | "link"
  /** Embeddable in the platform's own player (YouTube). Never downloaded. */
  | "embed";

export type TextSource = {
  label: string;
  url: string;
  access: SourceAccess;
  /** Language of the material at that URL. */
  language: "sa" | "te" | "en" | "mixed";
  /** The licence or terms position, in one line, for display. */
  licence: string;
  /** Why a reader might choose this source over the others. */
  note?: string;
};

/** A chapter, kanda, parva, or other division of a text. */
export type TextDivision = {
  slug: string;
  /** Sanskrit or Telugu name, in its own script. */
  name: string;
  /** Roman transliteration, for readers who do not read the script. */
  nameRoman: string;
  /** Plain English name. */
  nameEnglish: string;
  /** Verse or section count, where it is standard and worth stating. */
  verses?: number;
  /** One or two sentences of original writing. Never a translation. */
  intro: string;
  /** What this division is chiefly about. Original writing. */
  teachings?: string[];
};

export type KnowledgeEntry = {
  slug: string;
  title: string;
  titleTe?: string;
  /** A single sentence for cards and listings. */
  summary: string;
  summaryTe?: string;
  /** Original writing: several paragraphs. Never a translation of a text. */
  body: string[];
  divisions?: TextDivision[];
  sources: TextSource[];
  /** Where the reader should go next on this site. */
  related?: { href: string; label: string }[];
};

/** A public-domain author, with the fact that makes them safe to publish. */
export type Author = {
  slug: string;
  name: string;
  nameTe: string;
  /** Years, as commonly given. Approximate for the medieval poets. */
  lived: string;
  /** Year of death, when known precisely. Drives the public-domain test. */
  died?: number;
  /** True only when the works are public domain in India today. */
  publicDomain: boolean;
  /** If not public domain, the date it becomes so. */
  publicDomainFrom?: string;
  known: string;
  works: string[];
  sources: TextSource[];
};

export const ACCESS_LABEL: Record<SourceAccess, string> = {
  open: "Freely licensed",
  link: "Read at the source",
  embed: "Plays here",
};

/**
 * India's copyright term for a published literary work is the author's
 * lifetime plus 60 years from the end of the year of death (Copyright Act
 * 1957, s.22). There is no renewal system, so the year of death is the whole
 * test. An author who died in 1965 or earlier is public domain in 2026.
 */
export function isPublicDomainInIndia(died: number | undefined, year: number): boolean {
  if (died === undefined) return false;
  return year > died + 60;
}

export function publicDomainFrom(died: number): string {
  return `1 January ${died + 61}`;
}
