import { Text } from "react-native";
import { MobileListScreen, styles } from "@/src/MobileListScreen";
import { useVillageContent } from "@/src/content";
import { useLang } from "@/src/lang";

export default function DevelopmentsPage() {
  const { lang } = useLang();
  const { data, loading, error } = useVillageContent();
  const list = (data?.developments || []).slice(0, 20);
  return (
    <MobileListScreen
      title={lang === "te" ? "అభివృద్ధి పనులు" : "Development Projects"}
      loading={loading}
      error={error}
      empty={lang === "te" ? "అభివృద్ధి పనుల డేటా లేదు." : "No development projects available."}
    >
      {list.map((item) => (
        <Text key={item.id} style={styles.row}>
          • <Text style={styles.rowTitle}>{item.title}</Text>
          {item.summary ? `\n  ${item.summary}` : ""}
        </Text>
      ))}
    </MobileListScreen>
  );
}
