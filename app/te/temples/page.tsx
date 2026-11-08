import type { Metadata } from "next";
import { MemoryHero } from "@/components/MemoryHero";
import { TemplesFestivalsPage } from "@/components/temples/TemplesFestivalsPage";
import { buildMetadata } from "@/lib/seo/metadata";
import { festivalEvents } from "@/lib/events";
import { publicAlbums } from "@/lib/content";

export const metadata: Metadata = buildMetadata({
  path: "/temples/",
  locale: "te",
  title: "దేవాలయాలు & పండుగలు",
  description:
    "రెడ్డివారిపల్లి దేవాలయాలు, జాతరలు, పండుగల వివరాలు మరియు గత వేడుకల ఫోటోలు.",
});

export default function TeluguTemplesPage() {
  const festivals = festivalEvents();
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
        atmosphere
        eyebrow="గ్రామ విశ్వాసం"
        title="దేవాలయాలు & పండుగలు"
        lede="రెడ్డివారిపల్లి దేవాలయాలు, జాతరలు మరియు పండుగలు — కలిసి జరుపుకునే సంప్రదాయం."
        primaryHref="/gallery/"
        primaryLabel="గ్యాలరీ"
        secondaryHref="/about/"
        secondaryLabel="మన గ్రామం"
      />
      <TemplesFestivalsPage
        locale="te"
        upcoming={festivals}
        liveSlugs={liveSlugs}
        festivals={festivals}
      />
    </main>
  );
}
