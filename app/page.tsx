import Link from "next/link";
import {
  birthdayAlbums,
  festivalAlbums,
  publicAlbums,
  years,
} from "@/lib/content";
import { FESTIVALS } from "@/lib/site";
import { MemoryHero } from "@/components/MemoryHero";
import { AlbumCard } from "@/components/AlbumCard";
import { YearGrid } from "@/components/YearGrid";
import { Counter } from "@/components/Counter";
import { Reveal } from "@/components/Reveal";
import { PrivateNotice } from "@/components/PrivateNotice";
export default function HomePage() {
  const albums = publicAlbums();
  const festivals = festivalAlbums();
  const birthdays = birthdayAlbums();
  const recent = albums.slice(0, 4);
  const featured = albums.filter((a) => a.media.some((m) => m.favorite)).slice(0, 3);
  const yearList = years();

  return (
    <main className="page">
      <MemoryHero
        eyebrow="Govardhan Reddy’s memory book"
        title="Moments kept with grace."
        lede="A premium archive of Sankranthi, Vinayaka Chavithi, and birthdays — elegant, intimate, and made to last."
        primaryHref="/festivals/"
        primaryLabel="Explore festivals"
        secondaryHref="/birthdays/"
        secondaryLabel="View birthdays"
      />

      <PrivateNotice />

      <Reveal className="section">
        <div className="grid-cards">
          <Counter value={yearList.length} label="Years remembered" />
          <Counter value={festivals.length} label="Festival chapters" />
          <Counter value={birthdays.length} label="Birthday albums" />
          <Counter
            value={albums.reduce((sum, album) => sum + album.media.length, 0)}
            label="Captured memories"
          />
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Years</p>
            <h2>Choose a chapter</h2>
          </div>
          <Link className="btn ghost" href="/timeline/">
            Open timeline
          </Link>
        </div>
        <YearGrid years={yearList} />
      </Reveal>

      <Reveal className="section" delay={0.05}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Festival highlights</p>
            <h2>Sankranthi & Vinayaka Chavithi</h2>
          </div>
          <Link className="btn ghost" href="/festivals/">
            All festivals
          </Link>
        </div>
        <div className="grid-cards">
          {FESTIVALS.map((festival) => (
            <Link
              key={festival.key}
              className="glass-card"
              href={`/festivals/${festival.slug}/`}
              style={{ display: "block", padding: "1.35rem" }}
            >
              <p className="eyebrow">{festival.eyebrow}</p>
              <h3>{festival.title}</h3>
              <p className="muted">{festival.blurb}</p>
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal className="section" delay={0.08}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Featured memories</p>
            <h2>Kept close</h2>
          </div>
        </div>
        <div className="grid-cards">
          {(featured.length ? featured : recent).map((album, index) => (
            <AlbumCard key={`${album.year}-${album.slug}`} album={album} index={index} />
          ))}
        </div>
      </Reveal>

      <Reveal className="section" delay={0.1}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Birthday highlights</p>
            <h2>Celebrations of people we love</h2>
          </div>
          <Link className="btn ghost" href="/birthdays/">
            All birthdays
          </Link>
        </div>
        <div className="grid-cards">
          {birthdays.slice(0, 3).map((album, index) => (
            <AlbumCard
              key={`${album.year}-${album.slug}`}
              album={album}
              index={index}
              meta={`${album.personName || album.title} · ${album.year}`}
            />
          ))}
        </div>
      </Reveal>

      <Reveal className="section" delay={0.12}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Recent</p>
            <h2>Newly gathered</h2>
          </div>
        </div>
        <div className="grid-cards">
          {recent.map((album, index) => (
            <AlbumCard key={`${album.year}-${album.slug}-recent`} album={album} index={index} />
          ))}
        </div>
      </Reveal>
    </main>
  );
}
