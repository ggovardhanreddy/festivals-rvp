/**
 * The verified external sources, in one place.
 *
 * Each constant records a position established by reading that site's own
 * copyright or licence page on 31 August 2026 — see content/dharma/sources.md
 * for the quoted sentences. Pages reference these rather than hard-coding a
 * URL, so if a licence position changes it changes once.
 *
 * `access: "open"` appears exactly once, on Telugu Wikisource, because it is
 * the only source in the study that both grants a free licence and holds real
 * Telugu-language scripture.
 */
import type { TextSource } from "./types";

/** Telugu Wikisource. The only source we may host a copy from. */
export function wikisourceTe(page: string, label: string, note?: string): TextSource {
  return {
    label,
    url: `https://te.wikisource.org/wiki/${encodeURIComponent(page)}`,
    access: "open",
    language: "te",
    licence: "CC BY-SA 4.0 / public domain — attribution and share-alike required",
    note,
  };
}

export const TTD_EBOOKS: TextSource = {
  label: "TTD e-publications (Tirumala)",
  url: "https://ebooks.tirumala.org/",
  access: "link",
  language: "te",
  licence: "© Tirumala Tirupati Devasthanams, All Rights Reserved — free to read, not to republish",
  note: "About 4,000 titles, mostly Telugu. The richest catalogue for a Telugu reader.",
};

export const ANDHRA_BHARATI: TextSource = {
  label: "Andhra Bharati",
  url: "https://andhrabharati.com/itihAsamulu/index.html",
  access: "link",
  language: "te",
  licence: "No licence stated — read there, do not copy",
  note: "Kavitraya Mahabharatam, Potana's Bhagavatam and Molla's Ramayanam in full Telugu verse.",
};

export const SANSKRIT_DOCUMENTS: TextSource = {
  label: "sanskritdocuments.org",
  url: "https://sanskritdocuments.org/",
  access: "link",
  language: "sa",
  licence: "Copying permitted for personal study only, not to republish",
  note: "Sanskrit in Telugu script, which is not the same as a Telugu translation.",
};

export const GITA_SUPERSITE: TextSource = {
  label: "Gita Supersite (IIT Kanpur)",
  url: "https://www.gitasupersite.in/",
  access: "link",
  language: "mixed",
  licence: "No licence stated",
  note: "Eleven scripts including Telugu, but the translations are Hindi and English only.",
};

export const ARCHIVE_ORG: TextSource = {
  label: "Internet Archive",
  url: "https://archive.org/details/booksbylanguage_telugu",
  access: "link",
  language: "te",
  licence: "Per item — the Archive makes no copyright guarantee",
  note: "Check each item's own rights field. Most Telugu scans there are of in-copyright editions.",
};

export const SVBC_YOUTUBE: TextSource = {
  label: "SVBC TTD (Sri Venkateswara Bhakthi Channel)",
  url: "https://www.youtube.com/user/svbcttd",
  access: "embed",
  language: "te",
  licence: "Embed via YouTube's own player; never downloaded",
  note: "TTD's devotional channel. Embedding is the arrangement YouTube provides for this.",
};

export const ANNAMAYYA_ORG: TextSource = {
  label: "Annamacharya Bhavana Vahini",
  url: "https://www.annamayya.org/",
  access: "link",
  language: "te",
  licence: "© Annamacharya Bhavana Vahini, All Rights Reserved",
  note: "Dr. Shobha Raju's institution. Worth writing to for permission.",
};

/**
 * A standing caution rendered wherever we point at Wikisource.
 *
 * Wikisource hosting something is not evidence that it is public domain: it
 * carries Sri Sri's Maha Prasthanam in full, which is protected in India until
 * 2044. This sentence exists so nobody maintaining the site later mistakes
 * presence there for permission.
 */
export const WIKISOURCE_CAUTION =
  "Wikisource hosts only freely-licensed text in principle, but it is community-run and not every page complies. Check the author's dates before reusing anything from it.";
