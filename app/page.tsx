import Link from "next/link";
import { allMedia, publicAlbums, years } from "@/lib/content";
import { AlbumCard } from "@/components/AlbumCard";
import { Gallery } from "@/components/Gallery";
import { MemoryWall } from "@/components/MemoryWall";
import { InteractiveVillageMap } from "@/components/experience/InteractiveVillageMap";
import { CinematicHero } from "@/components/experience/CinematicHero";
import { VillageStory } from "@/components/VillageStory";
import { YouthPortrait } from "@/components/YouthPortrait";
import { TimelineStrip } from "@/components/TimelineStrip";
import { Reveal } from "@/components/Reveal";
import { PrivateNotice } from "@/components/PrivateNotice";

export default function HomePage() {
  const albums = publicAlbums();
  const media = allMedia();
  const recent = albums.slice(0, 4);
  const featured = albums.filter((a) => a.media.some((m) => m.favorite)).slice(0, 3);
  const featuredAlbums = featured.length ? featured : recent;
  const galleryTeaser = media.filter((m) => m.type === "image").slice(0, 12);
  const yearList = years();

  return (
    <main>
      <CinematicHero />

      <div className="page experience-page">
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
              <p className="eyebrow">Kondreddigaripalli · Ramalayam</p>
              <h2>Fly through the real village</h2>
              <p className="lede">
                Your aerial of home, lifted into depth — hover to glow, click
                Ramalayam, open memories each place still holds.
              </p>
            </div>
          </div>
          <InteractiveVillageMap />
        </Reveal>

        <Reveal>
          <YouthPortrait />
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
              An immersive digital village museum for Sankranthi, Vinayaka Chavithi,
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
