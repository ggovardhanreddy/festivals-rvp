import { allMedia, bucketsWithContent, years } from "@/lib/content";
import { countByGroup, loadMembers } from "@/lib/members";
import { loadEvents, upcomingEvents } from "@/lib/events";
import { toMediaCards } from "@/lib/media-card";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeBelowFold } from "@/components/home/HomeBelowFold";
import { PlatformHero } from "@/components/platform/PlatformHero";
import { AudienceDoors } from "@/components/platform/AudienceDoors";
import { ExploreGrid } from "@/components/platform/ExploreGrid";
import { PromiseBar } from "@/components/platform/PromiseBar";

/**
 * Shared homepage body, rendered by both `/` and `/te/`.
 *
 * Language is not a prop: the shell reads it from the URL through
 * LanguageProvider, so one implementation serves both locales and there is no
 * second copy to keep in sync.
 */
export function HomePage() {
  const media = allMedia();
  // HomeGallery renders at most 24 items for any filter combination, so
  // sending an album's entire run is wasted payload. Cap per album: every
  // single-bucket / single-year view stays complete, and the tail that could
  // never be rendered never crosses to the client.
  const HOME_PER_ALBUM = 24;
  const perAlbum = new Map<string, number>();
  const homeImages = media.filter((m) => {
    if (m.type !== "image" || m.album.bucket === "fun-trips") return false;
    const key = `${m.album.year}/${m.album.slug}`;
    const seen = perAlbum.get(key) ?? 0;
    if (seen >= HOME_PER_ALBUM) return false;
    perAlbum.set(key, seen + 1);
    return true;
  });
  const galleryItems = toMediaCards(homeImages);
  const yearList = years();
  const members = loadMembers();
  const nextEvents = upcomingEvents(5);
  const festivals = loadEvents().filter((e) => e.category === "festival");
  const liveSlugs = bucketsWithContent();

  const groupCounts = countByGroup();
  const stats = [
    { value: groupCounts.legacy, label: "Legacy Circle", icon: "legacy" as const },
    { value: groupCounts.core, label: "Core Members", icon: "core" as const },
    { value: groupCounts.nextgen, label: "NextGen", icon: "nextgen" as const },
    { value: members.length, label: "Total Members", icon: "total" as const },
  ];

  return (
    <main>
      {/* Platform entry: short hero, universal search, then the six doors and
          the explore grid. The existing village sections follow underneath so
          nothing that worked before is lost. */}
      <PlatformHero />
      <AudienceDoors />
      <ExploreGrid />
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
      <PromiseBar />
    </main>
  );
}
