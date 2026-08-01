"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { Album, MediaWithAlbum } from "@/lib/types";
import { Reveal } from "@/components/Reveal";
import { TimelineStrip } from "@/components/TimelineStrip";
import { YearGrid } from "@/components/YearGrid";

const AppleHomeStage = dynamic(
  () => import("./AppleHomeStage").then((m) => m.AppleHomeStage),
  {
    ssr: false,
    loading: () => <div className="apple-stage-skeleton" aria-hidden />,
  },
);

const InteractiveVillageMap = dynamic(
  () =>
    import("@/components/experience/InteractiveVillageMap").then(
      (m) => m.InteractiveVillageMap,
    ),
  {
    ssr: false,
    loading: () => <div className="map-canvas" aria-hidden />,
  },
);

const YouthPortrait = dynamic(
  () => import("@/components/YouthPortrait").then((m) => m.YouthPortrait),
  { ssr: false },
);

const MemoryWall = dynamic(
  () => import("@/components/MemoryWall").then((m) => m.MemoryWall),
  { ssr: false },
);

const VillageStory = dynamic(
  () => import("@/components/VillageStory").then((m) => m.VillageStory),
  { ssr: false },
);

export function HomeBelowFold({
  featuredAlbums,
  media,
  galleryTeaser,
  yearList,
}: {
  featuredAlbums: Album[];
  media: MediaWithAlbum[];
  galleryTeaser: MediaWithAlbum[];
  yearList: string[];
}) {
  return (
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

        <MemoryWall items={media.slice(0, 24)} />

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
  );
}
