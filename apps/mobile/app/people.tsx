import { Text } from "react-native";
import { MobileListScreen, styles } from "@/src/MobileListScreen";
import { useVillageContent } from "@/src/content";
import { useLang } from "@/src/lang";

export default function PeoplePage() {
  const { lang } = useLang();
  const { data, loading, error } = useVillageContent();
  const members = (data?.members || []).slice(0, 25);
  return (
    <MobileListScreen
      title={lang === "te" ? "సభ్యుల వివరాలు" : "People Directory"}
      loading={loading}
      error={error}
      empty={lang === "te" ? "సభ్యుల సమాచారం లేదు." : "No members available."}
    >
      {members.map((member) => (
        <Text key={member.id} style={styles.row}>
          • <Text style={styles.rowTitle}>{member.name}</Text>
          {member.role ? ` — ${member.role}` : ""}
        </Text>
      ))}
    </MobileListScreen>
  );
}
