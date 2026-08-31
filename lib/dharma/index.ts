/**
 * The curated knowledge library, assembled and looked up by slug.
 *
 * Client-safe. There is no filesystem here and no collector: this is written
 * content compiled into the bundle, which is why the pages render identically
 * whether or not the collector has ever run.
 */
export * from "./types";
export * from "./sources";
export { SANATANA_DHARMA, DHARMA_CONCEPTS, VEDAS, UPANISHADS } from "./dharma";
export { GITA, RAMAYANAM, MAHABHARATAM, PURANAS, SCRIPTURES } from "./scriptures";
export { SLOKAS, DEVOTIONAL_MUSIC, AUTHORS, SRI_SRI } from "./culture";

import type { KnowledgeEntry } from "./types";
import { SANATANA_DHARMA, UPANISHADS, VEDAS } from "./dharma";
import { GITA, MAHABHARATAM, PURANAS, RAMAYANAM } from "./scriptures";
import { DEVOTIONAL_MUSIC, SLOKAS, SRI_SRI } from "./culture";

/** Every page under /dharma/, keyed by its URL segment. */
export const DHARMA_PAGES: Record<string, KnowledgeEntry> = {
  vedas: VEDAS,
  upanishads: UPANISHADS,
  gita: GITA,
  ramayanam: RAMAYANAM,
  mahabharatam: MAHABHARATAM,
  puranas: PURANAS,
  slokas: SLOKAS,
  music: DEVOTIONAL_MUSIC,
};

export const DHARMA_PAGE_SLUGS = Object.keys(DHARMA_PAGES);

export function dharmaPage(slug: string): KnowledgeEntry | undefined {
  return DHARMA_PAGES[slug];
}

export { SRI_SRI as SRI_SRI_PAGE, SANATANA_DHARMA as DHARMA_ABOUT };

/** A Gita chapter by its number as a string. */
export function gitaChapter(n: string) {
  return GITA.divisions?.find((d) => d.slug === n);
}

export const GITA_CHAPTER_SLUGS = GITA.divisions?.map((d) => d.slug) ?? [];
