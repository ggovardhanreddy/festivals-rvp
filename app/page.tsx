import type { Metadata } from "next";
import { allMedia, bucketsWithContent, years } from "@/lib/content";
import { countByGroup, loadMembers } from "@/lib/members";
import { loadEvents, upcomingEvents } from "@/lib/events";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeBelowFold } from "@/components/home/HomeBelowFold";
import {
  OFFICIAL_TITLE,
  SITE_TAGLINE,
  VILLAGE_ADDRESS_LINE,
  VILLAGE_ALSO_KNOWN_AS,
} from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: `${VILLAGE_ALSO_KNOWN_AS} · ${OFFICIAL_TITLE} | ${SITE_TAGLINE}`,
  },
  description: `${SITE_TAGLINE} Official digital home of ${VILLAGE_ALSO_KNOWN_AS} Grama Panchayat — festivals, members, heritage, and community updates. ${VILLAGE_ADDRESS_LINE}.`,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const media = allMedia();
  const galleryItems = media.filter(
    (m) => m.type === "image" && m.album.bucket !== "fun-trips",
  );
  const yearList = years();
  const members = loadMembers();
  const nextEvents = upcomingEvents(5);
  const festivals = loadEvents().filter((e) => e.category === "festival");
  const liveSlugs = bucketsWithContent();

  const groupCounts = countByGroup();
  const stats = [
    {
      value: groupCounts.legacy,
      label: "Legacy Circle",
      icon: "legacy" as const,
    },
    {
      value: groupCounts.core,
      label: "Core Members",
      icon: "core" as const,
    },
    {
      value: groupCounts.nextgen,
      label: "NextGen",
      icon: "nextgen" as const,
    },
    {
      value: members.length,
      label: "Total Members",
      icon: "total" as const,
    },
  ];

  return (
    <main>
      <HomeHero />
      <HomeBelowFold
        galleryItems={galleryItems}
        yearList={yearList}
        members={members}
        upcomingEvents={nextEvents}
        festivals={festivals}
        timeline={[]}
        liveSlugs={liveSlugs}
        stats={stats}
      />
    </main>
  );
}
