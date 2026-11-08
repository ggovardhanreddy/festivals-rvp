/* eslint-disable jsx-a11y/alt-text */
import { useLocalSearchParams } from "expo-router";
import { Image, ScrollView, Text } from "react-native";
import { useVillageContent } from "@/src/content";
import { useLang } from "@/src/lang";

const BASE = "https://www.reddivaripalli.com";

export default function GalleryItemPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading } = useVillageContent();
  const { lang } = useLang();
  const event = data.events.find((item) => item.id === id) || null;
  const title = event ? (lang === "te" ? event.titleTe || event.title : event.title) : "";

  return (
    <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: "#f6f2e7", minHeight: "100%" }}>
      {loading ? <Text style={{ color: "#536b60" }}>Loading...</Text> : null}
      {event ? (
        <>
          <Text style={{ fontSize: 25, fontWeight: "800", color: "#1f3d2e" }}>{title}</Text>
          <Image
            source={{ uri: `${BASE}${event.image || "/logo/logo-mark.webp"}` }}
            style={{ width: "100%", height: 240, borderRadius: 14, marginTop: 12 }}
            resizeMode="cover"
          />
          <Text style={{ marginTop: 10, color: "#2a3f35", lineHeight: 22 }}>
            {event.description ||
              (lang === "te"
                ? "చిత్ర వివరణ త్వరలో అందుబాటులో ఉంటుంది."
                : "Image description will be available as new content is published.")}
          </Text>
        </>
      ) : (
        <Text style={{ color: "#536b60" }}>
          {lang === "te" ? "గ్యాలరీ అంశం లభించలేదు." : "Gallery item not found."}
        </Text>
      )}
    </ScrollView>
  );
}
