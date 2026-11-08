import { bucketsWithContent, latestMemories } from "@/lib/content";
import { activeMembers } from "@/lib/members";
import { festivalEvents, loadAnnouncements } from "@/lib/events";
import { loadDevelopments } from "@/lib/developments";
import { toMediaCards } from "@/lib/media-card";
import { VillageHero } from "@/components/home/VillageHero";
import { VillageIntro } from "@/components/home/VillageIntro";
import { HomeHistory } from "@/components/home/HomeHistory";
import { VillageProgress } from "@/components/home/VillageProgress";
import { HomeBelowFold } from "@/components/home/HomeBelowFold";
import { HomeTemples } from "@/components/home/HomeTemples";
import { HomePeople } from "@/components/home/HomePeople";
import { HomeStories } from "@/components/home/HomeStories";
import { HomeContact } from "@/components/home/HomeContact";

/**
 * Shared homepage body, rendered by both `/` and `/te/`.
 *
 * The first published photograph in the public village archive becomes the
 * homepage hero image. This keeps the landing page documentary: no generated
 * concept art is presented as a photograph of Reddivaripalli.
 */
export function HomePage() {
  const memories = toMediaCards(latestMemories(6));
  const heroMemory = memories[0];
  const members = activeMembers();
  const nextEvents = festivalEvents();
  const announcements = loadAnnouncements();
  const developments = loadDevelopments();
  const liveSlugs = bucketsWithContent();

  const heroPhotoAlt = heroMemory
    ? `${heroMemory.album.title} ${heroMemory.album.year} — photograph from the Reddivaripalli village archive`
    : "Reddivaripalli village archive";

  return (
    <main className="home-main heritage-home">
      <VillageHero photo={heroMemory?.file ?? null} photoAlt={heroPhotoAlt} />
      <HomeBelowFold
        villageIntro={
          <>
            <VillageIntro />
            <HomeHistory />
          </>
        }
        temples={<HomeTemples />}
        people={<HomePeople members={members} />}
        progress={<VillageProgress developments={developments} limit={4} />}
        stories={<HomeStories />}
        contact={<HomeContact />}
        announcements={announcements}
        upcomingEvents={nextEvents}
        memories={memories}
        liveSlugs={liveSlugs}
      />
    </main>
  );
}
