/**
 * Slim media payloads for the client.
 *
 * `allMedia()` returns `{ ...media, album }` where `album` is the FULL album,
 * including `album.media` — the entire array of that album's media. So every
 * item carries a copy of its whole album.
 *
 * Measured on the homepage before this existed:
 *
 *   507 media items rendered as 24
 *   38,389 nested media objects serialised into the RSC payload
 *   69x amplification
 *   869 KB of HTML
 *
 * Nothing reads `item.album.media` off a MediaWithAlbum — verified across
 * components/ and app/. Album-level consumers (AlbumView, AlbumCard,
 * GalleryHub) receive an Album directly and are untouched by this.
 *
 * `album.media` is kept as an empty array so the value still satisfies the
 * `Album` type and every existing consumer keeps working unchanged, and
 * `mediaCount` preserves the one thing the array was ever read for.
 */
import type { Album, Media, MediaWithAlbum } from "./types";

/** Fields the client actually renders. Hashes and originals stay server-side. */
const MEDIA_FIELDS = [
  "id", "file", "thumb", "poster", "type", "title", "date",
  "width", "height", "blurDataURL", "fileAvif",
] as const;

export type MediaCard = MediaWithAlbum & { album: Album & { mediaCount: number } };

function slimAlbum(album: Album): Album & { mediaCount: number } {
  return {
    year: album.year,
    category: album.category,
    slug: album.slug,
    title: album.title,
    description: "",
    published: album.published,
    order: album.order,
    bucket: album.bucket,
    festival: album.festival,
    cover: album.cover,
    personName: album.personName,
    birthdayDate: album.birthdayDate,
    mediaCount: album.media?.length ?? 0,
    media: [],
  };
}

function slimMedia(m: Media): Media {
  const out = {} as Record<string, unknown>;
  for (const key of MEDIA_FIELDS) {
    const value = m[key];
    if (value !== undefined) out[key] = value;
  }
  // `tags` is required by the type and read by search/filters; keep it, but
  // never let it be undefined.
  out.tags = m.tags ?? [];
  return out as unknown as Media;
}

/**
 * Convert to client-safe cards, reusing ONE slim album object per source album
 * so repeated references stay repeated references rather than becoming copies.
 */
export function toMediaCards(items: MediaWithAlbum[]): MediaCard[] {
  const albums = new Map<string, Album & { mediaCount: number }>();
  return items.map((item) => {
    const key = `${item.album.year}/${item.album.bucket ?? item.album.slug}/${item.album.slug}`;
    let album = albums.get(key);
    if (!album) {
      album = slimAlbum(item.album);
      albums.set(key, album);
    }
    return { ...slimMedia(item), album } as MediaCard;
  });
}

/** Same slimming for a bare media list already scoped to one album. */
export function toMediaCardsOfAlbum(album: Album, items: Media[]): MediaCard[] {
  const slim = slimAlbum(album);
  return items.map((m) => ({ ...slimMedia(m), album: slim }) as MediaCard);
}

/**
 * Slim a plain media list with NO album attached.
 *
 * Use with care, and only where the array is NOT already being serialised
 * elsewhere on the same page.
 *
 * Measured lesson from Phase 1A: React Flight deduplicates repeated object
 * REFERENCES. On a festival chapter page the same `album.media` array is
 * handed to both AppleBucketStage and Gallery, so Flight writes it once.
 * Mapping it through a slimming function produces new objects, breaks that
 * sharing, and serialises the media twice — /vinayaka-chavithi/ went from
 * 428 KB to 675 KB before this was reverted.
 *
 * Slimming only pays where the array is genuinely new, as it is on the
 * homepage where allMedia() constructs fresh wrapper objects anyway.
 */
export function toMediaList(items: Media[]): Media[] {
  return items.map(slimMedia);
}
