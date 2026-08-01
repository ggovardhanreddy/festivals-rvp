import Link from "next/link";
import { allMedia, publicAlbums, years } from "@/lib/content";
import { InteractiveVillageMap } from "@/components/experience/InteractiveVillageMap";
import { CinematicHero } from "@/components/experience/CinematicHero";
import { VillageStory } from "@/components/VillageStory";
import { YouthPortrait } from "@/components/YouthPortrait";
import { TimelineStrip } from "@/components/TimelineStrip";
import { YearGrid } from "@/components/YearGrid";
import { Reveal } from "@/components/Reveal";
import { AppleHomeStage } from "@/components/home/AppleHomeStage";
import { MemoryWall } from "@/components/MemoryWall";

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

      <div className="experience-page experience-page--apple">
        <AppleHomeStage
          featuredAlbums={featuredAlbums}
          media={media}
          galleryTeaser={galleryTeaser}
        />

        <div className="page apple-rest">
          <Reveal className="section" id="map">
            <div className="section-head">
              <div>
                <p className="eyebrow">Kondreddigaripalli · Ramalayam</p>
                <h2>Fly through the village</h2>
                <p className="lede">
                  Aerial of home, lifted into depth — hover to glow, visit
                  Ramalayam, open the memories each place still holds.
                </p>
              </div>
            </div>
            <InteractiveVillageMap slides={galleryTeaser} />
          </Reveal>

          <Reveal>
            <YouthPortrait />
          </Reveal>

          <TimelineStrip years={yearList.slice(0, 8)} />

          <Reveal className="section" id="years">
            <div className="section-head">
              <div>
                <p className="eyebrow">Years</p>
                <h2>Choose a year</h2>
              </div>
              <Link className="btn ghost" href="/timeline/">
                Full timeline
              </Link>
            </div>
            <YearGrid years={yearList} />
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
      </div>
    </main>
  );
}
