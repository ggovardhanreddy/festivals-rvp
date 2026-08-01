import Link from "next/link";
import { notFound } from "next/navigation";
import {
  allMedia,
  birthdayAlbums,
  festivalAlbums,
  findAlbum,
  publicAlbums,
  years,
} from "@/lib/content";
import { FESTIVALS, festivalBySlug } from "@/lib/site";
import { AdminClient } from "@/components/AdminClient";
import { AlbumCard } from "@/components/AlbumCard";
import { AlbumView } from "@/components/AlbumView";
import { Gallery } from "@/components/Gallery";
import { MemoryHero } from "@/components/MemoryHero";
import { PrivateNotice } from "@/components/PrivateNotice";
import { Reveal } from "@/components/Reveal";
import { SearchClient } from "@/components/SearchClient";
import { YearGrid } from "@/components/YearGrid";
export function generateStaticParams() {
  const paths: { slug: string[] }[] = [
    { slug: ["timeline"] },
    { slug: ["festivals"] },
    { slug: ["birthdays"] },
    { slug: ["search"] },
    { slug: ["about"] },
    { slug: ["years"] },
    { slug: ["admin"] },
    { slug: ["offline"] },
  ];

  for (const festival of FESTIVALS) {
    paths.push({ slug: ["festivals", festival.slug] });
  }
  for (const year of years()) {
    paths.push({ slug: ["years", year] });
  }
  for (const album of publicAlbums()) {
    paths.push({
      slug: [album.category.toLowerCase(), album.year, album.slug],
    });
  }
  return paths;
}

export const dynamicParams = false;

export default async function ArchiveRoute({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = slug.join("/");
  const albums = publicAlbums();
  const media = allMedia();

  if (path === "timeline") {
    const ordered = [...media].sort((a, b) => b.date.localeCompare(a.date));
    return (
      <main className="page">
        <MemoryHero
          eyebrow="Timeline"
          title="A living ribbon of memory."
          lede="Move through Sankranthi, Vinayaka Chavithi, and birthdays in the order they were lived."
          primaryHref="/festivals/"
          primaryLabel="Festivals"
          secondaryHref="/birthdays/"
          secondaryLabel="Birthdays"
        />
        <Reveal className="section">
          <div className="timeline">
            {ordered.map((item) => (
              <div className="timeline-item glass-card" key={item.id}>
                <p className="eyebrow">
                  {item.date} · {item.album.category}
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

  if (path === "festivals") {
    return (
      <main className="page">
        <MemoryHero
          eyebrow="Festivals"
          title="Two celebrations, endlessly cherished."
          lede="This archive holds only Sankranthi and Vinayaka Chavithi — kept with care, year after year."
          primaryHref="/festivals/sankranthi/"
          primaryLabel="Sankranthi"
          secondaryHref="/festivals/vinayaka-chavithi/"
          secondaryLabel="Vinayaka Chavithi"
        />
        <div className="grid-cards section">
          {FESTIVALS.map((festival) => (
            <Reveal key={festival.key}>
              <Link
                className="glass-card"
                href={`/festivals/${festival.slug}/`}
                style={{ display: "block", padding: "1.5rem" }}
              >
                <p className="eyebrow">{festival.eyebrow}</p>
                <h2>{festival.title}</h2>
                <p className="muted">{festival.blurb}</p>
              </Link>
            </Reveal>
          ))}
        </div>
        <Reveal className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Recent festival albums</p>
              <h2>Across the years</h2>
            </div>
          </div>
          <div className="grid-cards">
            {festivalAlbums().map((album, index) => (
              <AlbumCard key={`${album.year}-${album.slug}`} album={album} index={index} />
            ))}
          </div>
        </Reveal>
      </main>
    );
  }

  if (slug[0] === "festivals" && slug.length === 2) {
    const festival = festivalBySlug(slug[1]!);
    if (!festival) notFound();
    const matches = festivalAlbums(festival.key);
    return (
      <main className="page">
        <MemoryHero
          eyebrow={festival.eyebrow}
          title={festival.title}
          lede={festival.blurb}
          primaryHref="/timeline/"
          primaryLabel="View timeline"
          secondaryHref="/search/"
          secondaryLabel="Search memories"
        />
        <PrivateNotice />
        <Reveal className="section">
          <div className="grid-cards">
            {matches.map((album, index) => (
              <AlbumCard key={`${album.year}-${album.slug}`} album={album} index={index} />
            ))}
          </div>
        </Reveal>
        <Reveal className="section">
          <Gallery items={matches.flatMap((album) => album.media)} />
        </Reveal>
      </main>
    );
  }

  if (path === "birthdays") {
    const birthdays = birthdayAlbums();
    return (
      <main className="page">
        <MemoryHero
          eyebrow="Birthdays"
          title="Celebrations of the people we love."
          lede="Each album holds a name, a date, and the warmth of a day made special."
          primaryHref="/timeline/"
          primaryLabel="Open timeline"
        />
        <div className="grid-cards section">
          {birthdays.map((album, index) => (
            <AlbumCard
              key={`${album.year}-${album.slug}`}
              album={album}
              index={index}
              meta={`${album.personName || album.title} · ${album.birthdayDate || album.year}`}
            />
          ))}
        </div>
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
            Search across festivals, birthdays, years, and notes in this private archive.
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
          eyebrow="About"
          title="A premium digital memory book."
          lede="Festivals RVP is Govardhan Reddy’s private archive for Sankranthi, Vinayaka Chavithi, and birthdays — published as a free static site."
          primaryHref="/festivals/"
          primaryLabel="Begin with festivals"
        />
        <Reveal className="section">
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h2>What this archive holds</h2>
            <p className="muted">
              Only two festivals and a dedicated birthday collection. No trips, documents,
              or extra categories — just the celebrations that matter most, presented with
              care.
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
    const matches = albums.filter((album) => album.year === year);
    if (!matches.length) notFound();
    return (
      <main className="page">
        <MemoryHero
          eyebrow={`The ${year} chapter`}
          title={year}
          lede="Festivals and birthdays gathered from this year."
          primaryHref="/timeline/"
          primaryLabel="Timeline"
        />
        <div className="grid-cards section">
          {matches.map((album, index) => (
            <AlbumCard key={`${album.year}-${album.slug}`} album={album} index={index} />
          ))}
        </div>
        <Reveal className="section">
          <Gallery items={matches.flatMap((album) => album.media)} />
        </Reveal>
      </main>
    );
  }

  if (
    (slug[0] === "festivals" || slug[0] === "birthdays") &&
    slug.length === 3
  ) {
    const album = findAlbum(slug[1]!, slug[0]!, slug[2]!);
    if (!album || !album.published) notFound();
    return <AlbumView album={album} />;
  }

  if (path === "admin") {
    return (
      <main className="page">
        <div className="section">
          <p className="eyebrow">Administrator</p>
          <h1>Archive studio</h1>
          <p className="lede">
            Only Govardhan Reddy can import local folders and publish updates.
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
