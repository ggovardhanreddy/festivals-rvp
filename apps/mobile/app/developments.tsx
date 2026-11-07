import { SectionPage } from "@/src/SectionPage";
import { useLang } from "@/src/lang";

export default function DevelopmentsPage() {
  const { lang } = useLang();
  return (
    <SectionPage
      title={lang === "te" ? "అభివృద్ధి పనులు" : "Development Projects"}
      list={
        lang === "te"
          ? ["రోడ్లు మరియు మౌలిక వసతులు", "నీటి వనరులు", "సమాజ అభివృద్ధి ట్రాకింగ్"]
          : ["Roads & infrastructure", "Water initiatives", "Community development tracking"]
      }
    />
  );
}
