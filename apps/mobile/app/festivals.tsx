import { SectionPage } from "@/src/SectionPage";
import { useLang } from "@/src/lang";

export default function FestivalsPage() {
  const { lang } = useLang();
  return (
    <SectionPage
      title={lang === "te" ? "పండుగల క్యాలెండర్" : "Festival Calendar"}
      list={
        lang === "te"
          ? ["ఆసియా/కొల్కతా సమయానికి డైనమిక్ కౌంట్‌డౌన్", "పూర్తైన పండుగలు", "రాబోయే పండుగలు"]
          : ["Dynamic countdowns (Asia/Kolkata)", "Completed festivals", "Upcoming festivals"]
      }
    />
  );
}
