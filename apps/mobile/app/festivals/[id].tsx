/* eslint-disable jsx-a11y/alt-text */
import { useLocalSearchParams } from "expo-router";
import { Image, ScrollView, Text } from "react-native";
import { useVillageContent } from "@/src/content";
import { festivalStatus } from "@/src/dates";
import { useLang } from "@/src/lang";

const BASE = "https://www.reddivaripalli.com";

export default function FestivalDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading } = useVillageContent();
  const { lang } = useLang();
  const event = data.events.find((item) => item.id === id) || null;
  const title = event ? (lang === "te" ? event.titleTe || event.title : event.title) : "";
  const status = event ? festivalStatus(event.date) : null;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: "#f6f2e7", minHeight: "100%" }}>
      {loading ? <Text style={{ color: "#536b60" }}>Loading...</Text> : null}
      {event ? (
        <>
          <Text style={{ fontSize: 26, fontWeight: "800", color: "#1f3d2e" }}>{title}</Text>
          <Text style={{ marginTop: 6, color: "#4a6055" }}>
            {event.date} · {status?.label}
          </Text>
          <Image
            source={{ uri: `${BASE}${event.image || "/logo/logo-mark.webp"}` }}
            style={{ width: "100%", height: 220, borderRadius: 14, marginTop: 12 }}
            resizeMode="cover"
          />
          <Text style={{ marginTop: 12, color: "#2a3f35", lineHeight: 22 }}>
            {event.description ||
              (lang === "te"
                ? "ఈ పండుగ వివరాలు త్వరలో నవీకరించబడతాయి."
                : "Festival details will be updated as new content is published.")}
          </Text>
        </>
      ) : (
        <Text style={{ color: "#536b60" }}>
          {lang === "te" ? "పండుగ వివరాలు లభించలేదు." : "Festival not found."}
        </Text>
      )}
    </ScrollView>
  );
}
