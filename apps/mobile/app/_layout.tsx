import { Stack } from "expo-router";
import { Pressable, Text } from "react-native";
import { LangProvider, useLang } from "@/src/lang";

function HeaderToggle() {
  const { lang, setLang, t } = useLang();
  return (
    <Pressable onPress={() => setLang(lang === "en" ? "te" : "en")}>
      <Text style={{ color: "#f4ecd7", fontWeight: "700", paddingRight: 10 }}>
        {t("switchLabel")}
      </Text>
    </Pressable>
  );
}

function LayoutInner() {
  const { t } = useLang();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#1f3d2e" },
        headerTintColor: "#f4ecd7",
        headerTitleStyle: { fontWeight: "700" },
        headerRight: () => <HeaderToggle />,
      }}
    >
      <Stack.Screen name="index" options={{ title: t("home") }} />
      <Stack.Screen name="history" options={{ title: t("history") }} />
      <Stack.Screen name="people" options={{ title: t("people") }} />
      <Stack.Screen name="temples" options={{ title: t("temples") }} />
      <Stack.Screen name="festivals" options={{ title: t("festivals") }} />
      <Stack.Screen name="festivals/[id]" options={{ title: t("festivals") }} />
      <Stack.Screen name="news" options={{ title: t("news") }} />
      <Stack.Screen name="gallery" options={{ title: t("gallery") }} />
      <Stack.Screen name="gallery/[id]" options={{ title: t("gallery") }} />
      <Stack.Screen name="developments" options={{ title: t("developments") }} />
      <Stack.Screen name="contact" options={{ title: t("contact") }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <LangProvider>
      <LayoutInner />
    </LangProvider>
  );
}
