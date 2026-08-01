import { notFound } from "next/navigation";
import {
  allMedia,
  albumsByBucket,
  findYearBucketAlbum,
  publicAlbums,
  years,
} from "@/lib/content";
import { BUCKETS, type BucketKey } from "@/lib/site";
import { AdminClient } from "@/components/AdminClient";
import { AlbumCard } from "@/components/AlbumCard";
import { AlbumView } from "@/components/AlbumView";
import { Gallery } from "@/components/Gallery";
import { MemoryHero } from "@/components/MemoryHero";
import { PrivateNotice } from "@/components/PrivateNotice";
import { Reveal } from "@/components/Reveal";
import { SearchClient } from "@/components/SearchClient";
import { YearGrid } from "@/components/YearGrid";

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
  return (
    <main className="page">
      <MemoryHero
        eyebrow={meta.eyebrow}
        title={meta.title}
        lede={meta.blurb}
        primaryHref="/timeline/"
        primaryLabel="View timeline"
        secondaryHref="/search/"
        secondaryLabel="Search"
        backgroundImage={media.find((m) => m.type === "image")?.file}
      />
      <PrivateNotice />
      <Reveal className="section">
        <YearGrid years={[...new Set(albums.map((a) => a.year))].sort((a, b) => b.localeCompare(a))} />
      </Reveal>
      <Reveal className="section">
        <div className="grid-cards">
          {albums.map((album, index) => (
            <AlbumCard key={`${album.year}-${album.slug}`} album={album} index={index} />
          ))}
        </div>
      </Reveal>
      <Reveal className="section">
        <Gallery items={media} />
      </Reveal>
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
      (a) =>
        a.bucket === "rvp-birthdays" &&
        a.year === slug[1] &&
        a.slug === slug[2],
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
          eyebrow="About"
          title="RVP Youth"
          lede="A premium digital memory experience — elegant, intimate, and free to host forever."
          primaryHref="/sankranthi/"
          primaryLabel="Begin with Sankranthi"
        />
        <Reveal className="section">
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h2>What this archive holds</h2>
            <p className="muted">
              Sankranthi, Vinayaka Chavithi, RVP Birthdays, and Fun Trips. Nothing else.
              Designed as a polished memory book rather than a standard gallery.
            </p>
            <PrivateNotice />
          </div>
        </Reveal>
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
          <h1>RVP Youth studio</h1>
          <p className="lede">
            Only Govardhan Reddy can import from the Fest folder and publish updates.
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
