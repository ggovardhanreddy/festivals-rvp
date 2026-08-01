import { notFound } from "next/navigation";
import {
  allMedia,
  albumsByBucket,
  findYearBucketAlbum,
  publicAlbums,
  years,
} from "@/lib/content";
import {
  BUCKETS,
  FESTIVAL_HEROES,
  LANDING_BRAND_TAGLINES,
  SITE_TAGLINE,
  VILLAGE_ADDRESS_LINE,
  VILLAGE_MAPS_URL,
  VILLAGE_NAME,
  type BucketKey,
} from "@/lib/site";
import { YouthPortrait } from "@/components/YouthPortrait";
import { VillageDepthMap } from "@/components/VillageDepthMap";
import { FestivalIdolBanner } from "@/components/FestivalIdolBanner";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminClient } from "@/components/AdminClient";
import { AlbumCard } from "@/components/AlbumCard";
import { AlbumView } from "@/components/AlbumView";
import { Gallery } from "@/components/Gallery";
import { InteractiveVillageMap } from "@/components/experience/InteractiveVillageMap";
import { MemoryHero } from "@/components/MemoryHero";
import { MemoryWall } from "@/components/MemoryWall";
import { PrivateNotice } from "@/components/PrivateNotice";
import { Reveal } from "@/components/Reveal";
import { SearchClient } from "@/components/SearchClient";
import { VillageStory } from "@/components/VillageStory";
import { YearGrid } from "@/components/YearGrid";
import { AppleBucketStage } from "@/components/home/AppleBucketStage";

const BUCKET_ACCENT: Record<
  BucketKey,
  "default" | "sankranthi" | "vinayaka" | "birthday" | "trips"
> = {
  sankranthi: "sankranthi",
  "vinayaka-chavithi": "vinayaka",
  "rvp-birthdays": "birthday",
  "fun-trips": "trips",
};

const BUCKET_ROUTES: BucketKey[] = [
  "sankranthi",
  "vinayaka-chavithi",
  "rvp-birthdays",
  "fun-trips",
];

export function generateStaticParams() {
  const paths: { slug: string[] }[] = [
    { slug: ["timeline"] },
    { slug: ["search"] },
    { slug: ["about"] },
    { slug: ["years"] },
    { slug: ["admin"] },
    { slug: ["offline"] },
  ];

  for (const bucket of BUCKET_ROUTES) {
    paths.push({ slug: [bucket] });
    for (const year of years()) {
      paths.push({ slug: [bucket, year] });
    }
  }

  for (const year of years()) {
    paths.push({ slug: ["years", year] });
  }

  for (const album of publicAlbums()) {
    if (album.bucket === "rvp-birthdays") {
      paths.push({ slug: ["rvp-birthdays", album.year, album.slug] });
    }
  }

  return paths;
}

export const dynamicParams = false;

function BucketPage({ bucket }: { bucket: BucketKey }) {
  const meta = BUCKETS.find((b) => b.key === bucket)!;
  const albums = albumsByBucket(bucket);
  const media = albums.flatMap((a) => a.media);
  const images = media.filter((m) => m.type === "image");
  const heroImage =
    FESTIVAL_HEROES[bucket] ||
    albums.find((a) => a.cover)?.cover ||
    images[0]?.file;

  return (
    <main className="experience-page experience-page--apple">
      <AppleBucketStage
        bucket={bucket}
        title={meta.title}
        eyebrow={meta.eyebrow}
        blurb={meta.blurb}
        story={meta.story}
        albums={albums}
        heroImage={heroImage}
      />

      {bucket === "vinayaka-chavithi" && (
        <div className="page apple-rest">
          <FestivalIdolBanner lede={meta.story} />
        </div>
      )}

      <div className="page apple-rest">
        <Reveal className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Village Scene</p>
              <h2>Step into this chapter</h2>
            </div>
          </div>
          <InteractiveVillageMap
            accent={BUCKET_ACCENT[bucket]}
            slides={images.slice(0, 18)}
          />
        </Reveal>

        {!albums.length && (
          <Reveal className="section">
            <EmptyState
              title="No albums yet"
              description={`Add photos under content/<YEAR>/${bucket}/ and push to main.`}
              actionHref="/admin/"
              actionLabel="CMS guide"
            />
          </Reveal>
        )}

        {media.length > 10 && (
          <Reveal className="section" id="full-gallery">
            <div className="section-head">
              <div>
                <p className="eyebrow">Full gallery</p>
                <h2>Every frame</h2>
              </div>
            </div>
            <Gallery items={media} />
          </Reveal>
        )}
      </div>
    </main>
  );
}

export default async function ArchiveRoute({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = slug.join("/");
  const media = allMedia();

  if (BUCKET_ROUTES.includes(slug[0] as BucketKey) && slug.length === 1) {
    return <BucketPage bucket={slug[0] as BucketKey} />;
  }

  if (BUCKET_ROUTES.includes(slug[0] as BucketKey) && slug.length === 2) {
    const bucket = slug[0] as BucketKey;
    const year = slug[1]!;
    const album = findYearBucketAlbum(bucket, year);
    if (!album) {
      const matches = albumsByBucket(bucket).filter((a) => a.year === year);
      if (!matches.length) notFound();
      return (
        <main className="page">
          <MemoryHero
            eyebrow={`${bucket} · ${year}`}
            title={year}
            lede="Memories from this year."
            primaryHref={`/${bucket}/`}
            primaryLabel="Back"
          />
          <div className="grid-cards section">
            {matches.map((item, index) => (
              <AlbumCard key={`${item.year}-${item.slug}`} album={item} index={index} />
            ))}
          </div>
          <Gallery items={matches.flatMap((a) => a.media)} />
        </main>
      );
    }
    return <AlbumView album={album} />;
  }

  if (slug[0] === "rvp-birthdays" && slug.length === 3) {
    const album = publicAlbums().find(
      (a) => a.bucket === "rvp-birthdays" && a.year === slug[1] && a.slug === slug[2],
    );
    if (!album) notFound();
    return <AlbumView album={album} />;
  }

  if (path === "timeline") {
    const ordered = [...media].sort((a, b) => b.date.localeCompare(a.date));
    return (
      <main className="page">
        <MemoryHero
          eyebrow="Timeline"
          title="A living ribbon of memory."
          lede="Move through RVP Youth celebrations in the order they were lived."
          primaryHref="/sankranthi/"
          primaryLabel="Sankranthi"
          secondaryHref="/fun-trips/"
          secondaryLabel="Fun Trips"
        />
        <Reveal className="section">
          <div className="timeline">
            {ordered.map((item) => (
              <div className="timeline-item glass-card" key={item.id}>
                <p className="eyebrow">
                  {item.date} · {item.album.bucket || item.album.category}
                </p>
                <h3>{item.title}</h3>
                <p className="muted">{item.album.title}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </main>
    );
  }

  if (path === "search") {
    return (
      <main className="page">
        <div className="section">
          <p className="eyebrow">Search</p>
          <h1>Find a memory</h1>
          <p className="lede">
            Search across Sankranthi, Vinayaka Chavithi, RVP Birthdays, and Fun Trips.
          </p>
        </div>
        <SearchClient items={media} />
      </main>
    );
  }

  if (path === "about") {
    return (
      <main className="page">
        <MemoryHero
          showLogo
          atmosphere
          eyebrow="About"
          title="RVP Youth"
          lede={SITE_TAGLINE}
          primaryHref="/sankranthi/"
          primaryLabel="Begin with Sankranthi"
          secondaryHref="/#map"
          secondaryLabel="Village map"
        />
        <VillageStory />
        <Reveal className="section">
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h2>What this archive holds</h2>
            {LANDING_BRAND_TAGLINES.map((line) => (
              <p key={line} className="muted" style={{ marginTop: "0.5rem" }}>
                {line}
              </p>
            ))}
            <p className="muted" style={{ marginTop: "0.75rem" }}>
              Sankranthi, Vinayaka Chavithi, RVP Birthdays, and Fun Trips — curated as a
              living memory book for {VILLAGE_NAME}, not a generic gallery.
            </p>
            <p className="muted" style={{ marginTop: "0.75rem" }}>
              {VILLAGE_ADDRESS_LINE}
            </p>
            <p style={{ marginTop: "1rem" }}>
              <a className="btn" href={VILLAGE_MAPS_URL} target="_blank" rel="noreferrer">
                Open Ramalayam on Google Maps
              </a>
            </p>
            <PrivateNotice />
          </div>
        </Reveal>
        <Reveal className="section">
          <VillageDepthMap />
        </Reveal>
        <YouthPortrait />
        <MemoryWall items={media} />
      </main>
    );
  }

  if (path === "years") {
    return (
      <main className="page">
        <div className="section">
          <p className="eyebrow">Years</p>
          <h1>Browse by year</h1>
        </div>
        <YearGrid years={years()} />
      </main>
    );
  }

  if (slug[0] === "years" && slug.length === 2) {
    const year = slug[1]!;
    const matches = publicAlbums().filter((album) => album.year === year);
    if (!matches.length) notFound();
    return (
      <main className="page">
        <MemoryHero
          eyebrow={`The ${year} chapter`}
          title={year}
          lede="Everything gathered from this year."
          primaryHref="/timeline/"
          primaryLabel="Timeline"
        />
        <div className="grid-cards section">
          {matches.map((album, index) => (
            <AlbumCard key={`${album.year}-${album.slug}`} album={album} index={index} />
          ))}
        </div>
        <Gallery items={matches.flatMap((album) => album.media)} />
      </main>
    );
  }

  if (path === "admin") {
    return (
      <main className="page">
        <div className="section">
          <p className="eyebrow">Administrator</p>
          <h1>GitHub CMS</h1>
          <p className="lede">
            Manage photos in the GitHub repository. The website rebuilds and deploys
            automatically — no uploads on this site.
          </p>
        </div>
        <AdminClient />
      </main>
    );
  }

  if (path === "offline") {
    return (
      <main className="page">
        <h1>You’re offline</h1>
        <p className="lede">Reconnect to browse memories that are not cached yet.</p>
      </main>
    );
  }

  notFound();
}
