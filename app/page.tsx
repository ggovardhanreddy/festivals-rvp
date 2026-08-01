import Link from "next/link";
import { allMedia, publicAlbums, years } from "@/lib/content";
import { MemoryHero } from "@/components/MemoryHero";
import { AlbumCard } from "@/components/AlbumCard";
import { Gallery } from "@/components/Gallery";
import { MemoryWall } from "@/components/MemoryWall";
import { VillageMap } from "@/components/VillageMap";
import { VillageStory } from "@/components/VillageStory";
import { TimelineStrip } from "@/components/TimelineStrip";
import { Reveal } from "@/components/Reveal";
import { PrivateNotice } from "@/components/PrivateNotice";

export default function HomePage() {
  const albums = publicAlbums();
  const media = allMedia();
  const featuredImage =
    media.find((m) => m.type === "image" && m.favorite)?.file ||
    media.find((m) => m.type === "image")?.file;
  const recent = albums.slice(0, 4);
  const featured = albums.filter((a) => a.media.some((m) => m.favorite)).slice(0, 3);
  const featuredAlbums = featured.length ? featured : recent;
  const galleryTeaser = media.filter((m) => m.type === "image").slice(0, 12);
  const yearList = years();

  return (
    <main>
      <MemoryHero
        showLogo
        fullBleed
        atmosphere
        backgroundImage={featuredImage}
        eyebrow="RVP Youth"
        title="A digital village of memory."
        lede="Celebrate culture, festivals, and the people who make home eternal — through an interactive heritage experience."
        primaryHref="/sankranthi/"
        primaryLabel="Enter the village"
        secondaryHref="/timeline/"
        secondaryLabel="Open timeline"
      />

      <div className="page">
        <PrivateNotice />

        <Reveal className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Featured Memories</p>
              <h2>Kept close</h2>
            </div>
          </div>
          <div className="grid-cards">
            {featuredAlbums.map((album, index) => (
              <AlbumCard
                key={`${album.year}-${album.slug}`}
                album={album}
                index={index}
              />
            ))}
          </div>
        </Reveal>

        <Reveal className="section" id="map">
          <div className="section-head">
            <div>
              <p className="eyebrow">Interactive Map</p>
              <h2>Walk the village</h2>
              <p className="lede">Touch a place to open the memories it still holds.</p>
            </div>
          </div>
          <VillageMap />
        </Reveal>

        <Reveal className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Recent Memories</p>
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

        <TimelineStrip years={yearList.slice(0, 8)} />

        <Reveal className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Gallery</p>
              <h2>Frames from home</h2>
            </div>
            <Link className="btn ghost" href="/search/">
              Browse all
            </Link>
          </div>
          <Gallery items={galleryTeaser} />
        </Reveal>

        <MemoryWall items={media} />

        <VillageStory compact />

        <Reveal className="section">
          <div className="glass-card about-cta" style={{ padding: "1.6rem" }}>
            <p className="eyebrow">About</p>
            <h2>RVP Youth</h2>
            <p className="muted">
              A free-to-host digital heritage museum for Sankranthi, Vinayaka Chavithi,
              birthdays, and journeys — curated by Govardhan Reddy.
            </p>
            <Link className="btn" href="/about/" style={{ marginTop: "1rem" }}>
              Read our story
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
