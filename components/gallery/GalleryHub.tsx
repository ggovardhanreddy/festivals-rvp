"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { FunFestLoginDialog } from "@/components/auth/FunFestLoginDialog";
import { useMemberAuth } from "@/components/auth/MemberAuthProvider";
import { Gallery } from "@/components/Gallery";
import { MediaImage } from "@/components/media/MediaImage";
import { withBase } from "@/lib/base";
import { CULTURE_FESTIVALS, festivalThumbPath } from "@/lib/festivals";
import { albumHref, BUCKETS, FESTIVAL_HEROES } from "@/lib/site";
import type { Album, Development, MediaWithAlbum } from "@/lib/types";
import { useMediaProtection } from "@/lib/use-media-protection";
import { filterPublicMedia } from "@/lib/media-protection";
import { useUiLang } from "@/components/i18n/LanguageProvider";

type FestivalDef = {
  key: string;
  title: string;
  buckets: string[];
  /** Official festival cover/thumb — never replaced by regenerated gallery frames. */
  coverHint?: string;
  /** Members-only — opens Fun Fest login instead of public drill-down. */
  locked?: boolean;
};

const CULTURE_BY_KEY = Object.fromEntries(
  CULTURE_FESTIVALS.map((f) => [f.key, f]),
);

/** Gallery → Festival → Year → Media (festival-first, not year-first). */
const GALLERY_FESTIVALS: FestivalDef[] = [
  {
    key: "vinayaka-chavithi",
    title: "Vinayaka Chavithi",
    buckets: ["vinayaka-chavithi"],
    coverHint: festivalThumbPath(CULTURE_BY_KEY["vinayaka-chavithi"]!.folder),
  },
  {
    key: "sankranthi",
    title: "Sankranti",
    buckets: ["sankranthi"],
    coverHint: festivalThumbPath(CULTURE_BY_KEY.sankranthi!.folder),
  },
  {
    key: "ugadi",
    title: "Ugadi",
    buckets: ["ugadi"],
    coverHint: festivalThumbPath(CULTURE_BY_KEY.ugadi!.folder),
  },
  {
    key: "sri-rama-navami",
    title: "Sri Rama Navami",
    buckets: ["sri-rama-navami"],
    coverHint: festivalThumbPath(CULTURE_BY_KEY["sri-rama-navami"]!.folder),
  },
  {
    key: "varalakshmi-vratam",
    title: "Varalakshmi Vratam",
    buckets: ["varalakshmi-vratam"],
    coverHint: festivalThumbPath(CULTURE_BY_KEY["varalakshmi-vratam"]!.folder),
  },
  {
    key: "mathamma-jathara",
    title: "Mathamma Jathara",
    buckets: ["mathamma-jathara"],
    coverHint: festivalThumbPath(CULTURE_BY_KEY["mathamma-jathara"]!.folder),
  },
  {
    key: "devapatlamma-jathara",
    title: "Devapatlamma Jathara",
    buckets: ["devapatlamma-jathara"],
    coverHint: festivalThumbPath(CULTURE_BY_KEY["devapatlamma-jathara"]!.folder),
  },
  {
    key: "other-celebrations",
    title: "Other Celebrations",
    buckets: [
      "other-celebrations",
      "miscellaneous",
      "other",
      "deepavali",
      "dasara",
      "rvp-birthdays",
    ],
    coverHint: festivalThumbPath(CULTURE_BY_KEY.deepavali!.folder),
  },
];

const KNOWN_BUCKETS = new Set(
  GALLERY_FESTIVALS.flatMap((f) => f.buckets),
);

type GalleryCategory =
  | "all"
  | "people"
  | "families"
  | "temples"
  | "festivals"
  | "village"
  | "development"
  | "historical"
  | "memories";

const GALLERY_CATEGORIES: { id: GalleryCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "people", label: "People" },
  { id: "families", label: "Families" },
  { id: "temples", label: "Temples" },
  { id: "festivals", label: "Festivals" },
  { id: "village", label: "Village" },
  { id: "development", label: "Development" },
  { id: "historical", label: "Historical" },
  { id: "memories", label: "Memories" },
];

const TEMPLE_BUCKETS = new Set([
  "sri-rama-navami",
  "mathamma-jathara",
  "devapatlamma-jathara",
]);
const FESTIVAL_BUCKETS = new Set(CULTURE_FESTIVALS.map((f) => f.key));

function albumMatchesCategory(album: Album, cat: GalleryCategory): boolean {
  const bucket = album.bucket || "";
  const year = Number(album.year) || 0;
  const title = `${album.title} ${bucket}`.toLowerCase();
  switch (cat) {
    case "all":
    case "village":
      return true;
    case "temples":
      return TEMPLE_BUCKETS.has(bucket);
    case "festivals":
      return FESTIVAL_BUCKETS.has(bucket);
    case "people":
      return bucket === "rvp-birthdays";
    case "families":
      return /family|families|adapaduchu/.test(title);
    case "historical":
      return year > 0 && year <= 2016;
    case "memories":
      return /memor|heritage|old|story/.test(title) || (year > 0 && year <= 2016);
    case "development":
      return false;
    default:
      return true;
  }
}

const FALLBACK = "/brand/village-aerial.webp";

function isMobileShell() {
  return (
    typeof document !== "undefined" &&
    (document.documentElement.classList.contains("rvp-mobile") ||
      window.matchMedia("(max-width:820px)").matches)
  );
}

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
  if (fest.locked) return [];
  if (fest.key === "other-celebrations") {
    return albums.filter(
      (a) =>
        a.bucket !== "fun-trips" &&
        (a.media?.length ?? 0) > 0 &&
        (fest.buckets.includes(a.bucket || "") ||
          !a.bucket ||
          !KNOWN_BUCKETS.has(a.bucket)),
    );
  }
  return albums.filter(
    (a) =>
      a.bucket !== "fun-trips" &&
      (a.media?.length ?? 0) > 0 &&
      fest.buckets.includes(a.bucket || ""),
  );
}

function mediaFromAlbums(albums: Album[]): MediaWithAlbum[] {
  return albums.flatMap((album) => {
    const slimAlbum: Album = { ...album, media: [] };
    return (album.media || []).map((item) => ({ ...item, album: slimAlbum }));
  });
}

export function GalleryHub({
  albums,
  developments = [],
}: {
  albums: Album[];
  developments?: Development[];
  /** @deprecated unused — media is derived from albums */
  media?: MediaWithAlbum[];
  years?: string[];
}) {
  const { t } = useUiLang();
  const router = useRouter();
  const { session, ready } = useMemberAuth();
  const [festivalKey, setFestivalKey] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video">(
    "all",
  );
  const [category, setCategory] = useState<GalleryCategory>("all");
  const [funFestLoginOpen, setFunFestLoginOpen] = useState(false);

  const { rules } = useMediaProtection();
  const publicAlbums = useMemo(
    () =>
      albums
        .filter((a) => a.bucket !== "fun-trips" && (a.media?.length ?? 0) > 0)
        .map((album) => ({
          ...album,
          media: filterPublicMedia(album.media || [], rules),
        }))
        .filter((album) => (album.media?.length ?? 0) > 0),
    [albums, rules],
  );

  const publicMedia = useMemo(
    () => mediaFromAlbums(publicAlbums),
    [publicAlbums],
  );

  const categoryMedia = useMemo(() => {
    if (category === "development") return [];
    return publicMedia.filter((item) =>
      albumMatchesCategory(item.album, category),
    );
  }, [publicMedia, category]);

  const developmentPhotos = useMemo(
    () =>
      developments.flatMap((project) =>
        (project.images || []).map((src, index) => ({
          id: `${project.id}-${index}`,
          src,
          title: project.title,
        })),
      ),
    [developments],
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
      // Prefer official festival cover; only fall back to gallery frames when none assigned.
      const cover =
        fest.coverHint ||
        festAlbums.find((a) => a.cover)?.cover ||
        festMedia.find((m) => m.type === "image")?.thumb ||
        festMedia.find((m) => m.type === "image")?.file ||
        FALLBACK;
      const bucketMeta = BUCKETS.find((b) => b.key === fest.key);
      return {
        fest,
        years,
        photos,
        videos,
        cover,
        blurb: bucketMeta?.blurb,
        hasContent: fest.locked || festAlbums.length > 0,
      };
    });
  }, [publicAlbums, publicMedia]);

  const openFunFest = () => {
    if (!ready) return;
    if (!session) {
      setFunFestLoginOpen(true);
      return;
    }
    if (isMobileShell()) {
      window.setTimeout(() => {
        window.location.assign(withBase("/fun-trips/"));
      }, 0);
      return;
    }
    router.push("/fun-trips/");
  };

  const activeFest = festivalKey
    ? GALLERY_FESTIVALS.find((f) => f.key === festivalKey && !f.locked) || null
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
          activeFest.coverHint ||
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
              {t("gallery.allYears")}
            </button>
          </div>

          <div className="gallery-filters" role="tablist" aria-label={t("gallery.mediaType")}>
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
            <p className="muted">{t("gallery.noMedia")}</p>
          )}

          {yearCards.find((y) => y.year === year)?.albums.length ? (
            <div className="gallery-album-links">
              <p className="eyebrow">{t("gallery.openAlbums")}</p>
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
                  {t("gallery.title")}
                </button>
                {" · Festival"}
              </p>
              <h2>{activeFest.title}</h2>
              <p className="lede">
                {t("gallery.chooseYear")}
              </p>
            </div>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setFestivalKey(null)}
            >
              {t("gallery.allFestivals")}
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
                      fallback={activeFest.coverHint || FALLBACK}
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
              No photographs from {activeFest.title} have been added to the
              archive yet.
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
            <p className="eyebrow">{t("gallery.photographs")}</p>
            <h2>{t("gallery.title")}</h2>
            <p className="lede">
              Filter by people, families, temples, festivals, village,
              development, historical photographs, or memories.
            </p>
          </div>
        </div>

        <div className="gallery-filters" role="tablist" aria-label={t("gallery.category")}>
          {GALLERY_CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={category === item.id}
              className="filter-chip"
              data-active={category === item.id || undefined}
              onClick={() => {
                setCategory(item.id);
                setFestivalKey(null);
                setYear(null);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {category === "development" ? (
          developmentPhotos.length ? (
            <ul className="gallery-dev-grid">
              {developmentPhotos.map((photo) => (
                <li key={photo.id}>
                  <Link href="/developments/" className="gallery-dev-card">
                    <img src={withBase(photo.src)} alt="" loading="lazy" />
                    <span>{photo.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">{t("gallery.devPhotos")}</p>
          )
        ) : category !== "all" && category !== "festivals" ? (
          categoryMedia.length ? (
            <Gallery items={categoryMedia} />
          ) : (
            <p className="muted">{t("gallery.noPhotos")}</p>
          )
        ) : (
        <div className="gallery-album-grid gallery-festival-grid">
          {festivalCards.map((card) => {
            const locked = Boolean(card.fest.locked);
            return (
              <button
                key={card.fest.key}
                type="button"
                className={
                  locked
                    ? "gallery-album-card gallery-album-card--button gallery-album-card--locked"
                    : "gallery-album-card gallery-album-card--button"
                }
                aria-label={
                  locked
                    ? `${card.fest.title}, members only — sign in to open`
                    : undefined
                }
                onClick={() => {
                  if (locked) {
                    openFunFest();
                    return;
                  }
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
                  {locked ? (
                    <span className="gallery-lock-badge" aria-hidden="true">
                      <Lock size={14} strokeWidth={2.25} />
                    </span>
                  ) : null}
                </div>
                <div className="gallery-album-meta">
                  <h4>
                    {card.fest.title}
                    {locked ? (
                      <span className="gallery-lock-label"> {t("gallery.locked")}</span>
                    ) : null}
                  </h4>
                  <p className="muted">
                    {locked
                      ? "Members only · Sign in to open"
                      : `${card.years.length} ${
                          card.years.length === 1 ? "year" : "years"
                        } · ${card.photos} photos · ${card.videos} videos`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        )}
      </section>
      <FunFestLoginDialog
        open={funFestLoginOpen}
        onClose={() => setFunFestLoginOpen(false)}
        next="/fun-trips/"
      />
    </div>
  );
}
