import { ScrollView, StyleSheet, Text, View } from "react-native";

export function MobileListScreen({
  title,
  loading,
  error,
  empty,
  children,
}: {
  title: string;
  loading?: boolean;
  error?: string | null;
  empty?: string;
  children?: React.ReactNode;
}) {
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {loading ? <Text style={styles.muted}>Loading...</Text> : null}
      {error ? <Text style={styles.muted}>Offline mode: live API unavailable.</Text> : null}
      <View style={styles.panel}>{children || <Text style={styles.row}>{empty || "-"}</Text>}</View>
    </ScrollView>
  );
}

export const styles = StyleSheet.create({
  wrap: { padding: 16, backgroundColor: "#f6f2e7", minHeight: "100%", gap: 10 },
  title: { fontSize: 26, fontWeight: "800", color: "#1f3d2e" },
  panel: {
    borderWidth: 1,
    borderColor: "#d7cba8",
    borderRadius: 12,
    backgroundColor: "#fffaf0",
    padding: 12,
    gap: 8,
  },
  row: { color: "#2a3f35", lineHeight: 20 },
  muted: { color: "#536b60" },
  rowTitle: { fontWeight: "700", color: "#1f3d2e" },
});
