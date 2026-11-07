import type { Metadata } from "next";
import { MemoryHero } from "@/components/MemoryHero";
import { EventsBirthdaysHub } from "@/components/events/EventsBirthdaysHub";
import { FestivalCalendar } from "@/components/home/FestivalCalendar";
import { VillageUpdatesList } from "@/components/events/VillageUpdatesList";
import { buildMetadata } from "@/lib/seo/metadata";
import { publicAlbums } from "@/lib/content";
import {
  festivalBuckets,
  festivalEvents,
  loadAnnouncements,
  pastEvents,
  upcomingEvents,
} from "@/lib/events";
import { loadMembers } from "@/lib/members";

export const metadata: Metadata = buildMetadata({
  path: "/events/",
  locale: "te",
  title: "కార్యక్రమాలు & పుట్టినరోజులు",
  description:
    "రెడ్డివారిపల్లి పండుగలు, జాతరలు, పంచాంగంతో కూడిన క్యాలెండర్, మరియు పుట్టినరోజుల వేడుకలు.",
});

export default function TeluguEventsPage() {
  const festivals = festivalEvents();
  const { upcoming: upcomingFestivals } = festivalBuckets();
  const liveSlugs = [
    ...new Set(
      publicAlbums()
        .filter((a) => (a.media?.length ?? 0) > 0)
        .map((a) => a.bucket)
        .filter(Boolean),
    ),
  ] as string[];

  return (
    <main className="page">
      <MemoryHero
        eyebrow="గ్రామ క్యాలెండర్"
        title="కార్యక్రమాలు & పుట్టినరోజులు"
        lede="పండుగలు, జాతరలు, గ్రామ కార్యక్రమాలు, మరియు పంచాంగ వివరాలతో పుట్టినరోజుల క్యాలెండర్."
        primaryHref="/gallery/"
        primaryLabel="గ్యాలరీ"
        secondaryHref="/rvp-birthdays/"
        secondaryLabel="పుట్టినరోజుల గ్యాలరీ"
        vantaEffect="halo"
      />
      <EventsBirthdaysHub
        upcoming={upcomingEvents(5)}
        archive={pastEvents()}
        liveSlugs={liveSlugs}
        members={loadMembers()}
        labels={{
          eventsCalendarEyebrow: "తెలుగు క్యాలెండర్",
          eventsCalendarLede:
            "తిథి, నక్షత్రం, రాహుకాలం, యమగండం, పండుగలు, పుట్టినరోజులు చూడటానికి తేదీని ఎంచుకోండి.",
          birthdaysCalendarEyebrow: "పుట్టినరోజులు · తెలుగు క్యాలెండర్",
          birthdaysCalendarTitle: "వేడుకల తేదీలు",
          birthdaysCalendarLede:
            "సభ్యుల పుట్టినరోజులు, తిథి, నక్షత్రం, రాహుకాలం, యమగండం వివరాలు ఒకే చోట.",
          birthdayWishesLede:
            "పుట్టినరోజుల గ్యాలరీలో ఆనంద క్షణాలను చూడండి — నవ్వులు, దీపాలు, కుటుంబ సంతోషం.",
        }}
      />
      <FestivalCalendar
        festivals={upcomingFestivals.length ? upcomingFestivals : festivals}
        liveSlugs={liveSlugs}
      />
      <VillageUpdatesList announcements={loadAnnouncements()} />
    </main>
  );
}
