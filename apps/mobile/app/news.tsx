import { SectionPage } from "@/src/SectionPage";
import { useLang } from "@/src/lang";

export default function NewsPage() {
  const { lang } = useLang();
  return (
    <SectionPage
      title={lang === "te" ? "గ్రామ సమాచారం" : "Village News & Notifications"}
      list={
        lang === "te"
          ? ["గ్రామ పంచాయతీ నోటీసులు", "యూత్ అప్డేట్లు", "పుష్ నోటిఫికేషన్లు (Expo-ready)"]
          : ["Panchayat notices", "Youth updates", "Push notifications (Expo-ready)"]
      }
    />
  );
}
