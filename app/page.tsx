import Link from "next/link";
import {
  allMedia,
  birthdayAlbums,
  festivalAlbums,
  publicAlbums,
  tripAlbums,
  years,
} from "@/lib/content";
import { BUCKETS } from "@/lib/site";
import { MemoryHero } from "@/components/MemoryHero";
import { AlbumCard } from "@/components/AlbumCard";
import { YearGrid } from "@/components/YearGrid";
import { Counter } from "@/components/Counter";
import { Reveal } from "@/components/Reveal";
import { PrivateNotice } from "@/components/PrivateNotice";

export default function HomePage() {
  const albums = publicAlbums();
  const media = allMedia();
  const featuredImage =
    media.find((m) => m.type === "image" && m.favorite)?.file ||
    media.find((m) => m.type === "image")?.file;
  const recent = albums.slice(0, 4);
  const featured = albums
    .filter((a) => a.media.some((m) => m.favorite))
    .slice(0, 3);
  const yearList = years();

  return (
    <main className="page">
      <MemoryHero
        showLogo
        backgroundImage={featuredImage}
        eyebrow="RVP Youth"
        title="Memories, elevated."
        lede="A premium interactive archive for Sankranthi, Vinayaka Chavithi, RVP Birthdays, and Fun Trips — crafted to feel alive."
        primaryHref="/sankranthi/"
        primaryLabel="Explore Sankranthi"
        secondaryHref="/timeline/"
        secondaryLabel="Open timeline"
      />

      <PrivateNotice />

      <Reveal className="section">
        <div className="grid-cards">
          <Counter value={yearList.length} label="Years remembered" />
          <Counter value={festivalAlbums().length} label="Festival chapters" />
          <Counter value={birthdayAlbums().length} label="Birthday albums" />
          <Counter value={tripAlbums().length} label="Fun trip sets" />
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Collections</p>
            <h2>Only what matters</h2>
          </div>
        </div>
        <div className="grid-cards">
          {BUCKETS.map((bucket) => (
            <Link
              key={bucket.key}
              className="glass-card"
              href={bucket.href}
              style={{ display: "block", padding: "1.4rem" }}
            >
              <p className="eyebrow">{bucket.eyebrow}</p>
              <h3>{bucket.title}</h3>
              <p className="muted">{bucket.blurb}</p>
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal className="section" delay={0.05}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Years</p>
            <h2>Choose a chapter</h2>
          </div>
          <Link className="btn ghost" href="/timeline/">
            Timeline
          </Link>
        </div>
        <YearGrid years={yearList} />
      </Reveal>

      <Reveal className="section" delay={0.08}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Featured</p>
            <h2>Kept close</h2>
          </div>
        </div>
        <div className="grid-cards">
          {(featured.length ? featured : recent).map((album, index) => (
            <AlbumCard
              key={`${album.year}-${album.slug}`}
              album={album}
              index={index}
            />
          ))}
        </div>
      </Reveal>

      <Reveal className="section" delay={0.1}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Recent highlights</p>
            <h2>Newly gathered</h2>
          </div>
        </div>
        <div className="grid-cards">
          {recent.map((album, index) => (
            <AlbumCard
              key={`${album.year}-${album.slug}-recent`}
              album={album}
              index={index}
            />
          ))}
        </div>
      </Reveal>
    </main>
  );
}
