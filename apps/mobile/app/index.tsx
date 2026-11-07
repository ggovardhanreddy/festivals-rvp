import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLang } from "@/src/lang";
import { useVillageContent } from "@/src/content";

const ROUTES = [
  "history",
  "people",
  "temples",
  "festivals",
  "news",
  "gallery",
  "developments",
  "contact",
] as const;

export default function Home() {
  const { t } = useLang();
  const { data, loading, error } = useVillageContent();

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>{t("appTitle")}</Text>
      <Text style={styles.sub}>
        {loading
          ? "Loading content..."
          : error
            ? "Live content unavailable. Please check connection."
            : `${data?.events.length || 0} events • ${data?.members.length || 0} members`}
      </Text>
      <View style={styles.grid}>
        {ROUTES.map((route) => (
          <Link key={route} href={`/${route}` as never} style={styles.card}>
            {t(route)}
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, backgroundColor: "#f6f2e7", minHeight: "100%" },
  title: { fontSize: 30, fontWeight: "800", color: "#1f3d2e" },
  sub: { marginTop: 8, marginBottom: 16, color: "#475b50" },
  grid: { gap: 10 },
  card: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#1f3d2e",
    color: "#f6f2e7",
    fontWeight: "700",
    overflow: "hidden",
  },
});
