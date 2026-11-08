import { Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { MobileListScreen, styles } from "@/src/MobileListScreen";
import { useVillageContent } from "@/src/content";
import { festivalStatus } from "@/src/dates";
import { useLang } from "@/src/lang";

export default function FestivalsPage() {
  const { lang } = useLang();
  const router = useRouter();
  const { data, loading, error } = useVillageContent();
  const events = (data?.events || [])
    .filter((e) => e.date)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 30);
  return (
    <MobileListScreen
      title={lang === "te" ? "పండుగల క్యాలెండర్" : "Festival Calendar"}
      loading={loading}
      error={error}
      empty={lang === "te" ? "పండుగల వివరాలు లేవు." : "No festival data available."}
    >
      {events.map((event) => {
        const status = festivalStatus(event.date);
        const title = lang === "te" ? event.titleTe || event.title : event.title;
        return (
          <Pressable key={event.id} onPress={() => router.push(`/festivals/${event.id}`)}>
            <Text style={styles.row}>
              • <Text style={styles.rowTitle}>{title}</Text> — {event.date} · {status.label}
            </Text>
          </Pressable>
        );
      })}
    </MobileListScreen>
  );
}
