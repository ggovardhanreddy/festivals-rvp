/**
 * Build gallery albums from R2 object keys.
 * Pure helpers — safe for Pages Functions and Node sync scripts.
 *
 * Expected layout (same as migrate-media-to-r2):
 *   gallery/{year}/{bucket}/[person/]file.webp
 *   gallery/thumbs/{year}/{bucket}/[person/]file.webp
 *   videos/{year}/{bucket}/[person/]file.mp4
 *   audio/{year}/{bucket}/…
 *
 * Festival chapter heroes live under festivals/<folder>/hero.webp and are
 * NEVER ingested into album media (GalleryHub uses FESTIVAL_HEROES).
 */

import { albumMetaDefaults, isCmsAlbum, isYearDir } from "./cms";
import {
  AUDIO_EXTS,
  IMAGE_EXTS,
  VIDEO_EXTS,
  mimeForExt,
} from "./media-formats";
import { r2KeyToSitePath } from "./media-url";
import { titleCase } from "./slug";
import type { Album, BucketKey, Media, MediaType } from "./types";

/** Public catalog object written by POST /api/media/reindex */
export const R2_ALBUMS_CATALOG_KEY = "catalog/albums.json";

export type R2ObjectRef = {
  key: string;
  uploaded?: string | Date;
  size?: number;
};

function extOf(key: string) {
  const base = key.split("/").pop() || key;
  const i = base.lastIndexOf(".");
  return i >= 0 ? base.slice(i).toLowerCase() : "";
}

function baseName(key: string) {
  const base = key.split("/").pop() || key;
  return base.replace(/\.[^.]+$/, "");
}

/** Official festival/brand heroes — never treat as gallery album frames. */
export function isProtectedHeroKey(key: string): boolean {
  const lower = key.toLowerCase();
  if (lower.endsWith("/hero.webp") || lower.endsWith("/hero.jpg")) return true;
  if (lower.includes("/festivals/") && lower.includes("hero")) return true;
  if (lower.startsWith("hero/") && /hero\.(webp|jpg|jpeg|png)$/i.test(lower)) {
    return true;
  }
  return false;
}

function kindForKey(key: string): MediaType | null {
  if (key.startsWith("gallery/thumbs/")) return null; // index as thumb only
  if (isProtectedHeroKey(key)) return null;
  const ext = extOf(key);
  if (key.startsWith("videos/") || VIDEO_EXTS.has(ext)) {
    if (VIDEO_EXTS.has(ext)) return "video";
  }
  if (key.startsWith("audio/") || AUDIO_EXTS.has(ext)) {
    if (AUDIO_EXTS.has(ext)) return "audio";
  }
  if (key.startsWith("gallery/") && IMAGE_EXTS.has(ext) && ext !== ".avif") {
    return "image";
  }
  return null;
}

/**
 * Parse year/bucket[/person] from a gallery or videos key.
 * Returns null when the key is not album-shaped (e.g. flat admin upload
 * gallery/1739-file.webp without year/bucket).
 */
export function parseAlbumKey(
  key: string,
): { year: string; bucket: BucketKey; person?: string; relFile: string } | null {
  let rest = key;
  if (rest.startsWith("gallery/thumbs/")) rest = rest.slice("gallery/thumbs/".length);
  else if (rest.startsWith("gallery/")) rest = rest.slice("gallery/".length);
  else if (rest.startsWith("videos/")) rest = rest.slice("videos/".length);
  else if (rest.startsWith("audio/")) rest = rest.slice("audio/".length);
  else if (rest.startsWith("funfest/images/")) {
    rest = rest.slice("funfest/images/".length);
  } else if (rest.startsWith("funfest/thumbs/")) {
    rest = rest.slice("funfest/thumbs/".length);
  } else if (rest.startsWith("funfest/")) {
    rest = rest.slice("funfest/".length);
  } else {
    return null;
  }

  const parts = rest.split("/").filter(Boolean);
  if (parts.length < 3) return null;
  const year = parts[0]!;
  const bucket = parts[1]!;
  if (!isYearDir(year) || !isCmsAlbum(bucket)) return null;

  if (bucket === "rvp-birthdays" && parts.length >= 4) {
    const person = parts[2]!;
    const relFile = parts.slice(3).join("/");
    if (!relFile) return null;
    return { year, bucket, person, relFile };
  }

  const relFile = parts.slice(2).join("/");
  if (!relFile) return null;
  return { year, bucket, relFile };
}

async function shortHash(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

function siteUrl(key: string, publicBase?: string): string {
  const sitePath = r2KeyToSitePath(key);
  if (publicBase && !key.startsWith("funfest/")) {
    return `${publicBase.replace(/\/$/, "")}/${key}`;
  }
  return sitePath;
}

function thumbKeyFor(imageOrVideoKey: string, type: MediaType): string | null {
  if (type === "image" && imageOrVideoKey.startsWith("gallery/")) {
    const rest = imageOrVideoKey.slice("gallery/".length);
    const withoutExt = rest.replace(/\.[^.]+$/, "");
    return `gallery/thumbs/${withoutExt}.webp`;
  }
  if (type === "video") {
    // videos/2026/bucket/file.mp4 → gallery/thumbs/2026/bucket/file.webp
    let rest = imageOrVideoKey;
    if (rest.startsWith("videos/")) rest = rest.slice("videos/".length);
    else if (rest.startsWith("funfest/")) rest = rest.slice("funfest/".length);
    const withoutExt = rest.replace(/\.[^.]+$/, "");
    return `gallery/thumbs/${withoutExt}.webp`;
  }
  return null;
}

type AlbumBucket = {
  year: string;
  bucket: BucketKey;
  person?: string;
  mediaById: Map<string, Media>;
  thumbKeys: Set<string>;
};

function albumSlug(bucket: BucketKey, person?: string) {
  if (bucket === "rvp-birthdays" && person) {
    return person.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  }
  return bucket;
}

function albumKey(year: string, bucket: BucketKey, person?: string) {
  return `${year}::${bucket}::${person || ""}`;
}

/**
 * Build Album[] from a flat list of R2 object keys.
 * `thumbKeys` present in the list are used for cover/thumb resolution.
 */
export async function buildAlbumsFromR2Keys(
  objects: R2ObjectRef[],
  options: { publicBase?: string } = {},
): Promise<Album[]> {
  const publicBase = options.publicBase?.replace(/\/$/, "") || "";
  const allKeys = new Set(objects.map((o) => o.key));
  const uploadedByKey = new Map(
    objects.map((o) => [
      o.key,
      o.uploaded
        ? typeof o.uploaded === "string"
          ? o.uploaded.slice(0, 10)
          : o.uploaded.toISOString().slice(0, 10)
        : "",
    ]),
  );

  const groups = new Map<string, AlbumBucket>();

  for (const obj of objects) {
    const { key } = obj;
    if (key.startsWith("gallery/thumbs/")) {
      const parsed = parseAlbumKey(key);
      if (!parsed) continue;
      const gk = albumKey(parsed.year, parsed.bucket, parsed.person);
      let g = groups.get(gk);
      if (!g) {
        g = {
          year: parsed.year,
          bucket: parsed.bucket,
          person: parsed.person,
          mediaById: new Map(),
          thumbKeys: new Set(),
        };
        groups.set(gk, g);
      }
      g.thumbKeys.add(key);
      continue;
    }

    const type = kindForKey(key);
    if (!type) continue;
    const parsed = parseAlbumKey(key);
    if (!parsed) continue;

    const gk = albumKey(parsed.year, parsed.bucket, parsed.person);
    let g = groups.get(gk);
    if (!g) {
      g = {
        year: parsed.year,
        bucket: parsed.bucket,
        person: parsed.person,
        mediaById: new Map(),
        thumbKeys: new Set(),
      };
      groups.set(gk, g);
    }

    const id = await shortHash(`${type}:${key}`);
    const tKey = thumbKeyFor(key, type);
    const thumbExists = tKey ? allKeys.has(tKey) : false;
    const fileUrl = siteUrl(key, publicBase);
    const thumbUrl =
      thumbExists && tKey
        ? siteUrl(tKey, publicBase)
        : type === "image"
          ? fileUrl
          : "";
    const date =
      uploadedByKey.get(key) ||
      `${parsed.year}-01-01`;
    const title = titleCase(baseName(key));

    g.mediaById.set(id, {
      id,
      file: fileUrl,
      thumb: thumbUrl,
      poster: type === "video" && thumbUrl ? thumbUrl : undefined,
      type,
      title,
      date,
      tags: [parsed.bucket, parsed.year, albumSlug(parsed.bucket, parsed.person), type],
      mime: mimeForExt(extOf(key)),
    });
  }

  const albums: Album[] = [];
  for (const g of groups.values()) {
    const media = [...g.mediaById.values()];
    if (!media.length) continue;
    media.sort(
      (a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title),
    );
    const slug = albumSlug(g.bucket, g.person);
    const defaults = albumMetaDefaults(g.year, g.bucket, slug);
    const cover =
      media.find((m) => m.type === "image" && m.thumb)?.thumb ||
      media.find((m) => m.thumb)?.thumb ||
      media[0]?.file;
    albums.push({
      ...defaults,
      year: g.year,
      bucket: g.bucket,
      slug,
      personName: g.person ? titleCase(g.person) : defaults.personName,
      media,
      cover,
      published: true,
    });
  }

  albums.sort((a, b) => b.year.localeCompare(a.year) || a.order - b.order);
  return albums;
}

export function mediaCountOf(albums: Album[]) {
  return albums.reduce((n, album) => n + (album.media?.length ?? 0), 0);
}

/**
 * Merge discovered albums over a previous catalog.
 * - Prefer discovered media when an album key matches
 * - Keep previous albums that discovery did not see (sparse / private)
 * - Never invent festival hero covers from discovery when previous had a
 *   festivals/…/hero.webp cover
 */
export function mergeAlbumCatalogs(
  discovered: Album[],
  previous: Album[] | null,
): Album[] {
  if (!previous?.length) return discovered;
  const keyOf = (a: Album) =>
    `${a.year}::${a.bucket || a.slug}::${a.personName || a.slug}`;
  const map = new Map(previous.map((a) => [keyOf(a), a]));

  for (const album of discovered) {
    const k = keyOf(album);
    const prev = map.get(k);
    if (
      prev?.cover &&
      /\/festivals\/.+\/hero\.(webp|jpg)/i.test(prev.cover)
    ) {
      map.set(k, { ...album, cover: prev.cover });
    } else {
      map.set(k, album);
    }
  }

  return [...map.values()].sort(
    (a, b) => b.year.localeCompare(a.year) || a.order - b.order,
  );
}
