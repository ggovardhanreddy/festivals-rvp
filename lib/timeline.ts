import { albumHref, BUCKETS } from "./site";
import { liveAlbums, years } from "./content";
import type { Media } from "./types";

export type TimelineEntry = {
  year: string;
  title: string;
  description: string;
  image?: string;
  href: string;
};

function preferredCover(year: string): { image?: string; title: string; description: string; href: string } {
  const albums = liveAlbums()
    .filter((a) => a.year === year)
    .sort((a, b) => (b.media?.length ?? 0) - (a.media?.length ?? 0));

  const featured =
    albums.find((a) => a.media.some((m) => m.favorite)) || albums[0];

  if (!featured) {
    return {
      title: `Year ${year}`,
      description: "Memories from Kondreddigaripalli.",
      href: `/years/${year}/`,
    };
  }

  const bucket = BUCKETS.find((b) => b.key === featured.bucket);
  const cover =
    featured.cover ||
    featured.media.find((m: Media) => m.type === "image" && m.favorite)?.file ||
    featured.media.find((m: Media) => m.type === "image")?.file;

  const albumCount = albums.length;
  const photoCount = albums.reduce((n, a) => n + (a.media?.length ?? 0), 0);

  return {
    image: cover,
    title: bucket?.title || featured.title || `Memories of ${year}`,
    description:
      bucket?.blurb ||
      `${photoCount} memories across ${albumCount} chapter${albumCount === 1 ? "" : "s"} — preserved for the village.`,
    href: albumHref(featured),
  };
}

/** Vertical history timeline — one entry per year with media, newest first. */
export function buildHistoryTimeline(limit = 12): TimelineEntry[] {
  return years()
    .slice(0, limit)
    .map((year) => {
      const meta = preferredCover(year);
      return {
        year,
        title: meta.title,
        description: meta.description,
        image: meta.image,
        href: meta.href || `/years/${year}/`,
      };
    });
}
