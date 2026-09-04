/**
 * Universal search document.
 *
 * One shape that every section emits into, so adding Learn or Agriculture in a
 * later phase means producing SearchDocs — not rewriting search. The existing
 * index (media, members, directory, events, developments, documents, heritage)
 * is migrated onto this shape by scripts/build-search-index.ts.
 */
import type { Locale } from "@/lib/i18n/config";
import type { SectionId } from "@/lib/routes/registry";

export type SearchDoc = {
  id: string;
  title: string;
  description: string;
  url: string;
  section: SectionId;
  language: Locale;
  keywords: string[];
  /** Body text used for matching. Not rendered. */
  content: string;

  image?: string;
  category?: string;
  /**
   * Present only on gallery documents, so a media hit can render as a real
   * thumbnail in the results grid instead of a text row. Kept deliberately
   * minimal — the same field list as lib/media-card.ts.
   */
  media?: {
    file: string;
    thumb: string;
    poster?: string;
    type: string;
    width?: number;
    height?: number;
    blurDataURL?: string;
    album: string;
    albumSlug: string;
    bucket?: string;
    year: string;
  };
  level?: string;
  date?: string;
  source?: string;
  lastVerified?: string;
  /** Relevance multiplier: a member should outrank a photo of them. */
  weight?: number;
};

/** Shards let the index grow without the client downloading all of it. */
export type SearchShard = {
  section: SectionId | "all";
  builtAt: string;
  count: number;
  docs: SearchDoc[];
};

/**
 * Never indexed. Private routes, admin surfaces and anything behind a session
 * must not appear in a public, client-downloadable index.
 */
export const EXCLUDED_SECTIONS: SectionId[] = ["gated", "admin"];

export function isIndexable(doc: { section: SectionId; url: string }): boolean {
  if (EXCLUDED_SECTIONS.includes(doc.section)) return false;
  if (/\/(dharma|telugu-culture)(\/|$)/.test(doc.url)) return false;
  return !/^\/(admin|login|chat|fun-trips)\//.test(doc.url);
}
