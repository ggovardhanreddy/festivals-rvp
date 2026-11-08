import { useState } from "react";
import { Platform, Pressable, Text, TextInput } from "react-native";
import { MobileListScreen, styles } from "@/src/MobileListScreen";
import { useVillageContent } from "@/src/content";
import { useLang } from "@/src/lang";
import { registerPushToken } from "@/src/notifications";

export default function NewsPage() {
  const { lang } = useLang();
  const { data, loading, error } = useVillageContent();
  const items = (data?.announcements || []).slice(0, 20);
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function submitToken() {
    if (!token.trim()) return;
    try {
      await registerPushToken({
        token: token.trim(),
        platform: Platform.OS === "ios" ? "ios" : "android",
      });
      setStatus(lang === "te" ? "నోటిఫికేషన్ టోకెన్ నమోదైంది." : "Notification token registered.");
      setToken("");
    } catch {
      setStatus(lang === "te" ? "టోకెన్ నమోదు కాలేదు." : "Token registration failed.");
    }
  }

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
      <Text style={styles.rowTitle}>
        {lang === "te" ? "పుష్ నోటిఫికేషన్ టోకెన్" : "Push notification token"}
      </Text>
      <TextInput
        value={token}
        onChangeText={setToken}
        placeholder={lang === "te" ? "Expo push token ఇక్కడ ఇవ్వండి" : "Paste Expo push token"}
        style={{
          borderWidth: 1,
          borderColor: "#d7cba8",
          borderRadius: 10,
          paddingHorizontal: 10,
          paddingVertical: 8,
          backgroundColor: "#fff",
        }}
      />
      <Pressable
        onPress={submitToken}
        style={{
          backgroundColor: "#1f3d2e",
          borderRadius: 10,
          paddingVertical: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#f6f2e7", fontWeight: "700" }}>
          {lang === "te" ? "టోకెన్ నమోదు చేయండి" : "Register token"}
        </Text>
      </Pressable>
      {status ? <Text style={styles.muted}>{status}</Text> : null}
    </MobileListScreen>
  );
}
