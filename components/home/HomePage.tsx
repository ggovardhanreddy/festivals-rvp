import { bucketsWithContent, latestMemories } from "@/lib/content";
import { activeMembers } from "@/lib/members";
import { loadAnnouncements, upcomingEvents } from "@/lib/events";
import { loadDevelopments } from "@/lib/developments";
import { toMediaCards } from "@/lib/media-card";
import { VillageHero } from "@/components/home/VillageHero";
import { VillageIntro } from "@/components/home/VillageIntro";
import { VillageProgress } from "@/components/home/VillageProgress";
import { HomeBelowFold } from "@/components/home/HomeBelowFold";

/**
 * Shared homepage body, rendered by both `/` and `/te/`.
 *
 * The front door, not the whole building:
 *
 *   hero → village update → our village + our community →
 *   upcoming events + birthdays → latest memories → village progress
 *
 * Services, the audience doors, the explore grid, the full festival calendar,
 * the culture chapters, gallery filtering, quick actions and the member and
 * directory listings all still exist — they moved to /services/, /events/,
 * /about/, /gallery/, /members/ and /directory/, which is where someone
 * looking for them would go.
 *
 * Language is not a prop: the shell reads it from the URL through
 * LanguageProvider, so one implementation serves both locales.
 */
export function HomePage() {
  // Only what the homepage renders crosses to the client. The archive is 500+
  // images; six of them appear here, so six of them are sent.
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
        villageIntro={<VillageIntro />}
        progress={<VillageProgress developments={developments} limit={4} />}
        announcements={announcements}
        members={members}
        upcomingEvents={nextEvents}
        memories={memories}
        liveSlugs={liveSlugs}
      />
    </main>
  );
}
