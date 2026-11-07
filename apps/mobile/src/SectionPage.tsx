import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useVillageContent } from "@/src/content";

type Props = {
  title: string;
  list?: string[];
};

export function SectionPage({ title, list = [] }: Props) {
  const { data, loading, error } = useVillageContent();
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {loading ? <Text style={styles.muted}>Loading...</Text> : null}
      {error ? <Text style={styles.muted}>Offline mode: live API unavailable.</Text> : null}
      <View style={styles.panel}>
        {list.map((item) => (
          <Text key={item} style={styles.row}>
            • {item}
          </Text>
        ))}
      </View>
      {data ? (
        <Text style={styles.muted}>
          Synced: {data.events.length} events, {data.announcements.length} updates,{" "}
          {data.developments.length} projects.
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, backgroundColor: "#f6f2e7", minHeight: "100%", gap: 10 },
  title: { fontSize: 26, fontWeight: "800", color: "#1f3d2e" },
  panel: {
    borderWidth: 1,
    borderColor: "#d7cba8",
    borderRadius: 12,
    backgroundColor: "#fffaf0",
    padding: 12,
    gap: 6,
  },
  row: { color: "#2a3f35" },
  muted: { color: "#536b60" },
});
