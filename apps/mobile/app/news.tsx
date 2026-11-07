import { Text } from "react-native";
import { MobileListScreen, styles } from "@/src/MobileListScreen";
import { useVillageContent } from "@/src/content";
import { useLang } from "@/src/lang";

export default function NewsPage() {
  const { lang } = useLang();
  const { data, loading, error } = useVillageContent();
  const items = (data?.announcements || []).slice(0, 20);
  return (
    <MobileListScreen
      title={lang === "te" ? "గ్రామ సమాచారం" : "Village News & Notifications"}
      loading={loading}
      error={error}
      empty={lang === "te" ? "ప్రకటనలు లేవు." : "No announcements found."}
    >
      {items.map((item) => (
        <Text key={item.id} style={styles.row}>
          • <Text style={styles.rowTitle}>{item.title}</Text>
          {item.date ? ` — ${item.date}` : ""}
          {item.body ? `\n  ${item.body}` : ""}
        </Text>
      ))}
    </MobileListScreen>
  );
}
