import { allMedia, bucketsWithContent, years } from "@/lib/content";
import { countByGroup, loadMembers } from "@/lib/members";
import { loadEvents, upcomingEvents } from "@/lib/events";
import { FESTIVAL_HEROES } from "@/lib/site";
import { HeroSlideshow } from "@/components/home/HeroSlideshow";
import { HomeBelowFold } from "@/components/home/HomeBelowFold";

export default function HomePage() {
  const media = allMedia();
  const galleryItems = media.filter((m) => m.type === "image");
  const yearList = years();
  const members = loadMembers();
  const nextEvents = upcomingEvents(5);
  const festivals = loadEvents().filter((e) => e.category === "festival");
  const liveSlugs = bucketsWithContent();

  const heroSlides = [
    "/brand/village-aerial.webp",
    FESTIVAL_HEROES["vinayaka-chavithi"],
    FESTIVAL_HEROES.sankranthi,
    FESTIVAL_HEROES["mathamma-jathara"],
    FESTIVAL_HEROES["sri-rama-navami"],
    FESTIVAL_HEROES["fun-trips"],
    ...galleryItems.slice(0, 4).map((m) => m.file),
  ].filter((src, i, arr): src is string => Boolean(src) && arr.indexOf(src) === i);

  const groupCounts = countByGroup();
  const stats = [
    {
      value: groupCounts.legacy,
      label: "Legacy Circle Members",
      icon: "legacy" as const,
    },
    {
      value: groupCounts.core,
      label: "Core Members",
      icon: "core" as const,
    },
    {
      value: groupCounts.nextgen,
      label: "NextGen Members",
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
      <HeroSlideshow slides={heroSlides} />
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
