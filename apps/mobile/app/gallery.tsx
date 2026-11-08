import { Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { MobileListScreen, styles } from "@/src/MobileListScreen";
import { useVillageContent } from "@/src/content";
import { useLang } from "@/src/lang";

export default function GalleryPage() {
  const { lang } = useLang();
  const router = useRouter();
  const { data, loading, error } = useVillageContent();
  const eventsWithImages = (data?.events || []).filter((event) => event.image).slice(0, 24);
  return (
    <MobileListScreen
      title={lang === "te" ? "గ్రామ గ్యాలరీ" : "Village Gallery"}
      loading={loading}
      error={error}
      empty={lang === "te" ? "గ్యాలరీ అంశాలు లేవు." : "No gallery entries yet."}
    >
      {eventsWithImages.map((event) => (
        <Pressable key={event.id} onPress={() => router.push(`/gallery/${event.id}`)}>
          <Text style={styles.row}>
            • <Text style={styles.rowTitle}>{lang === "te" ? event.titleTe || event.title : event.title}</Text>
          </Text>
        </Pressable>
      ))}
    </MobileListScreen>
  );
}
