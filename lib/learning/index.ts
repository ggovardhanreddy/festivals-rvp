/**
 * Types and helpers for the children's library.
 *
 * The zod schemas in lib/content/schema.ts are the build-time contract; these
 * are the plain types and helpers the pages use, so no validator reaches the
 * browser. Deliberately free of `node:fs`: client components import from
 * here, and the loaders live in ./server so a filesystem call can never be
 * dragged into a browser bundle. Everything here is deliberately defensive: `loadTyped` reads JSON
 * off disk without re-validating, so a page must never assume a field it
 * would be embarrassing to get wrong — above all, permission to publish a
 * recording.
 */
import type { Locale } from "@/lib/i18n/config";

export type PublicationStatus =
  | "published"
  | "draft"
  | "awaiting-permission"
  | "awaiting-teacher-review"
  | "coming-soon"
  | "planned";

export type LocalizedText = { en: string; te?: string };

export type Permission = { grantedBy: string; grantedOn: string; notes?: string };

export type MediaAsset = {
  type: "audio" | "video";
  provider?: "r2" | "youtube";
  src?: string;
  externalId?: string;
  durationSeconds?: number;
  captions?: string;
  permission?: Permission;
};

export type Provenance = {
  source: string;
  sourceUrl: string;
  reviewer: string | null;
  lastVerified: string;
  notes?: string;
};

type Base = {
  id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  image?: string;
  keywords?: string[];
  status?: PublicationStatus;
  language?: Locale[];
  provenance?: Provenance;
};

export type Story = Base & {
  kind: "story";
  body?: LocalizedText;
  ageGroup?: string[];
  readingMinutes?: number;
  audio?: MediaAsset;
};

export type Rhyme = Base & {
  kind: "rhyme";
  lyrics?: LocalizedText;
  ageGroup?: string[];
  category?: string;
  audio?: MediaAsset;
  video?: MediaAsset;
};

export type ScienceTopic = Base & {
  kind: "science-topic";
  topic: string;
  ageGroup?: string[];
  explanation?: LocalizedText;
  activity?: {
    title: LocalizedText;
    materials?: LocalizedText[];
    steps: LocalizedText[];
    supervision?: boolean;
  };
  video?: MediaAsset;
  reviewedBy?: string | null;
};

export type VideoItem = Base & {
  kind: "video";
  category: string;
  ageGroup?: string[];
  media: MediaAsset;
  transcript?: LocalizedText;
  relatedIds?: string[];
};

export type LearningItem = Story | Rhyme | ScienceTopic | VideoItem;

/** Pick the reader's language, falling back to English rather than to a key. */
export function text(value: LocalizedText | undefined, locale: Locale): string {
  if (!value) return "";
  return (locale === "te" && value.te) || value.en || "";
}

/** Only `published` renders as content. Everything else renders as a notice. */
export function isPublished(item: { status?: PublicationStatus }): boolean {
  return item.status === "published";
}

/**
 * Whether a recording may actually be played.
 *
 * A media asset without a named person who granted permission is not
 * playable, whatever its status says. This is the last line before a
 * village recording goes on the internet, so it is checked at render time
 * and not only in CI.
 */
export function isPlayable(media: MediaAsset | undefined): media is MediaAsset {
  if (!media) return false;
  if (!media.permission?.grantedBy || !media.permission?.grantedOn) return false;
  if (media.provider === "youtube") return Boolean(media.externalId);
  return Boolean(media.src);
}

/** Message key explaining what a non-published item is waiting on. */
export function statusKey(status: PublicationStatus | undefined): string {
  switch (status) {
    case "awaiting-permission":
      // Covers both "we have not been given the material" and "the item is
      // published but its recording is not ours to play yet".
      return "kids.pending.sourced";
    case "awaiting-teacher-review":
      return "kids.pending.reviewed";
    case "planned":
      return "learn.status.planned";
    case "draft":
      return "learn.status.draft";
    case "coming-soon":
    default:
      return "common.comingSoon";
  }
}

/** Absolute URL for an R2-hosted recording. */
export function mediaUrl(media: MediaAsset): string {
  if (!media.src) return "";
  if (/^https?:\/\//.test(media.src)) return media.src;
  const base = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "").replace(/\/$/, "");
  const key = media.src.replace(/^\//, "");
  return base ? `${base}/${key}` : `/${key}`;
}

/** Published items first, then everything else, each alphabetical. */
export function ordered<T extends Base>(items: T[]): T[] {
  return items
    .slice()
    .sort(
      (a, b) =>
        Number(isPublished(b)) - Number(isPublished(a)) ||
        a.title.en.localeCompare(b.title.en),
    );
}
