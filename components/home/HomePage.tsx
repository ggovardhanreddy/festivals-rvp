import { bucketsWithContent, latestMemories } from "@/lib/content";
import { activeMembers } from "@/lib/members";
import { loadAnnouncements, upcomingEvents } from "@/lib/events";
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
 * The front door of Reddivaripalli: hero, village introduction, festivals,
 * temples, people, development, gallery, memories, and location.
 */
export function HomePage() {
  const memories = toMediaCards(latestMemories(6));
  const members = activeMembers();
  const nextEvents = upcomingEvents(3);
  const announcements = loadAnnouncements();
  const developments = loadDevelopments();
  const liveSlugs = bucketsWithContent();

  return (
    <main>
      <VillageHero />
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
