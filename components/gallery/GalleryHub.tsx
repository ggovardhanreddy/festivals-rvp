"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Gallery } from "@/components/Gallery";
import { MediaImage } from "@/components/media/MediaImage";
import { CULTURE_FESTIVALS, festivalThumbPath } from "@/lib/festivals";
import { albumHref, BUCKETS } from "@/lib/site";
import type { Album, MediaWithAlbum } from "@/lib/types";

type FestivalDef = {
  key: string;
  title: string;
  buckets: string[];
  coverHint?: string;
};

const GALLERY_FESTIVALS: FestivalDef[] = [
  ...CULTURE_FESTIVALS.map((f) => ({
    key: f.key,
    title: f.title,
    buckets: [f.key],
    coverHint: festivalThumbPath(f.folder),
  })),
  {
    key: "rvp-birthdays",
    title: "RVP Birthdays",
    buckets: ["rvp-birthdays"],
  },
  {
    key: "village-events",
    title: "Village Events",
    buckets: ["village-events", "events"],
  },
  {
    key: "sports",
    title: "Sports",
    buckets: ["sports"],
  },
  {
    key: "cultural-programs",
    title: "Cultural Programs",
    buckets: ["cultural-programs", "cultural"],
  },
  {
    key: "miscellaneous",
    title: "Miscellaneous",
    buckets: ["miscellaneous", "other"],
  },
];

const KNOWN_BUCKETS = new Set(
  GALLERY_FESTIVALS.flatMap((f) => f.buckets),
);

const FALLBACK = "/brand/village-aerial.webp";

function countTypes(media: MediaWithAlbum[]) {
  let photos = 0;
  let videos = 0;
  for (const item of media) {
    if (item.type === "image") photos += 1;
    else if (item.type === "video") videos += 1;
  }
  return { photos, videos };
}

function albumsForFestival(albums: Album[], fest: FestivalDef) {
  if (fest.key === "miscellaneous") {
    return albums.filter(
      (a) =>
        a.bucket !== "fun-trips" &&
        (a.media?.length ?? 0) > 0 &&
        (!a.bucket || !KNOWN_BUCKETS.has(a.bucket)),
    );
  }
  return albums.filter(
    (a) =>
      a.bucket !== "fun-trips" &&
      (a.media?.length ?? 0) > 0 &&
      fest.buckets.includes(a.bucket || ""),
  );
}

export function GalleryHub({
  albums,
  media,
}: {
  albums: Album[];
  media: MediaWithAlbum[];
  years?: string[];
}) {
  const [festivalKey, setFestivalKey] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video">(
    "all",
  );

  const publicAlbums = useMemo(
    () =>
      albums.filter(
        (a) => a.bucket !== "fun-trips" && (a.media?.length ?? 0) > 0,
      ),
    [albums],
  );

  const publicMedia = useMemo(
    () => media.filter((m) => m.album.bucket !== "fun-trips"),
    [media],
  );

  const festivalCards = useMemo(() => {
    return GALLERY_FESTIVALS.map((fest) => {
      const festAlbums = albumsForFestival(publicAlbums, fest);
      const years = [
        ...new Set(festAlbums.map((a) => a.year)),
      ].sort((a, b) => b.localeCompare(a));
      const festMedia = publicMedia.filter((m) =>
        festAlbums.some(
          (a) =>
            a.year === m.album.year &&
            a.bucket === m.album.bucket &&
            a.slug === m.album.slug,
        ),
      );
      const { photos, videos } = countTypes(festMedia);
      const cover =
        festAlbums.find((a) => a.cover)?.cover ||
        festMedia.find((m) => m.type === "image")?.thumb ||
        festMedia.find((m) => m.type === "image")?.file ||
        fest.coverHint ||
        FALLBACK;
      const bucketMeta = BUCKETS.find((b) => b.key === fest.key);
      return {
        fest,
        years,
        photos,
        videos,
        cover,
        blurb: bucketMeta?.blurb,
        hasContent: festAlbums.length > 0,
      };
    });
  }, [publicAlbums, publicMedia]);

  const activeFest = festivalKey
    ? GALLERY_FESTIVALS.find((f) => f.key === festivalKey) || null
    : null;

  const yearCards = useMemo(() => {
    if (!activeFest) return [];
    const festAlbums = albumsForFestival(publicAlbums, activeFest);
    const byYear = new Map<string, Album[]>();
    for (const album of festAlbums) {
      const list = byYear.get(album.year) || [];
      list.push(album);
      byYear.set(album.year, list);
    }
    return [...byYear.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([yr, yearAlbums]) => {
        const yearMedia = publicMedia.filter((m) =>
          yearAlbums.some(
            (a) =>
              a.year === m.album.year &&
              a.bucket === m.album.bucket &&
              a.slug === m.album.slug,
          ),
        );
        const { photos, videos } = countTypes(yearMedia);
        const cover =
          yearAlbums.find((a) => a.cover)?.cover ||
          yearMedia.find((m) => m.type === "image")?.thumb ||
          yearMedia.find((m) => m.type === "image")?.file ||
          FALLBACK;
        return { year: yr, albums: yearAlbums, photos, videos, cover };
      });
  }, [activeFest, publicAlbums, publicMedia]);

  const yearMedia = useMemo(() => {
    if (!activeFest || !year) return [];
    const festAlbums = albumsForFestival(publicAlbums, activeFest).filter(
      (a) => a.year === year,
    );
    return publicMedia.filter((m) =>
      festAlbums.some(
        (a) =>
          a.year === m.album.year &&
          a.bucket === m.album.bucket &&
          a.slug === m.album.slug,
      ),
    );
  }, [activeFest, year, publicAlbums, publicMedia]);

  const filteredYearMedia = useMemo(() => {
    if (typeFilter === "all") {
      return yearMedia.filter(
        (m) => m.type === "image" || m.type === "video" || m.type === "audio",
      );
    }
    return yearMedia.filter((m) => m.type === typeFilter);
  }, [yearMedia, typeFilter]);

  if (!publicAlbums.length && !publicMedia.length) {
    return (
      <section className="section">
        <p className="muted">
          No gallery photos yet. Add images under{" "}
          <code>content/&lt;YEAR&gt;/&lt;album&gt;/</code>, then sync.
        </p>
      </section>
    );
  }

  /* Level 3 — year media */
  if (activeFest && year) {
    const { photos, videos } = countTypes(yearMedia);
    return (
      <div className="gallery-hub">
        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">
                <button
                  type="button"
                  className="linkish"
                  onClick={() => {
                    setYear(null);
                  }}
                >
                  {activeFest.title}
                </button>
                {" · "}
                {year}
              </p>
              <h2>
                {activeFest.title} {year}
              </h2>
              <p className="muted">
                {photos} photos · {videos} videos
              </p>
            </div>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setYear(null)}
            >
              All years
            </button>
          </div>

          <div className="gallery-filters" role="tablist" aria-label="Media type">
            {(
              [
                ["all", "All"],
                ["image", "Photos"],
                ["video", "Videos"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={typeFilter === key}
                className="filter-chip"
                data-active={typeFilter === key || undefined}
                onClick={() => setTypeFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {filteredYearMedia.length ? (
            <Gallery items={filteredYearMedia} />
          ) : (
            <p className="muted">No media in this view yet.</p>
          )}

          {yearCards.find((y) => y.year === year)?.albums.length ? (
            <div className="gallery-album-links">
              <p className="eyebrow">Open album pages</p>
              <div className="btn-row">
                {yearCards
                  .find((y) => y.year === year)!
                  .albums.map((album) => (
                    <Link
                      key={`${album.year}-${album.slug}`}
                      className="btn ghost"
                      href={albumHref(album)}
                    >
                      {album.title}
                    </Link>
                  ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    );
  }

  /* Level 2 — years for a festival */
  if (activeFest) {
    return (
      <div className="gallery-hub">
        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">
                <button
                  type="button"
                  className="linkish"
                  onClick={() => setFestivalKey(null)}
                >
                  Gallery
                </button>
                {" · Festival"}
              </p>
              <h2>{activeFest.title}</h2>
              <p className="lede">
                Choose a year to browse photos and videos.
              </p>
            </div>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setFestivalKey(null)}
            >
              All festivals
            </button>
          </div>

          {yearCards.length ? (
            <div className="gallery-album-grid">
              {yearCards.map((card) => (
                <button
                  key={card.year}
                  type="button"
                  className="gallery-album-card gallery-album-card--button"
                  onClick={() => {
                    setYear(card.year);
                    setTypeFilter("all");
                  }}
                >
                  <div className="gallery-album-cover">
                    <MediaImage
                      src={card.cover}
                      fallback={FALLBACK}
                      alt=""
                      loading="lazy"
                    />
                  </div>
                  <div className="gallery-album-meta">
                    <h4>{card.year}</h4>
                    <p className="muted">
                      {card.photos} photos · {card.videos} videos
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="muted">
              Photos for {activeFest.title} are coming soon. Add media under{" "}
              <code>content/&lt;YEAR&gt;/{activeFest.buckets[0]}/</code>.
            </p>
          )}
        </section>
      </div>
    );
  }

  /* Level 1 — festivals */
  return (
    <div className="gallery-hub">
      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Albums</p>
            <h2>Browse by festival</h2>
            <p className="lede">
              Open a festival, pick a year, then explore photos and videos.
            </p>
          </div>
        </div>

        <div className="gallery-album-grid gallery-festival-grid">
          {festivalCards.map((card) => (
            <button
              key={card.fest.key}
              type="button"
              className="gallery-album-card gallery-album-card--button"
              onClick={() => {
                setFestivalKey(card.fest.key);
                setYear(null);
                setTypeFilter("all");
              }}
            >
              <div className="gallery-album-cover">
                <MediaImage
                  src={card.cover}
                  fallback={FALLBACK}
                  alt=""
                  loading="lazy"
                />
              </div>
              <div className="gallery-album-meta">
                <h4>{card.fest.title}</h4>
                <p className="muted">
                  {card.years.length}{" "}
                  {card.years.length === 1 ? "year" : "years"} · {card.photos}{" "}
                  photos · {card.videos} videos
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
