import { SectionPage } from "@/src/SectionPage";
import { useLang } from "@/src/lang";

export default function ContactPage() {
  const { lang } = useLang();
  return (
    <SectionPage
      title={lang === "te" ? "సంప్రదింపు" : "Contact"}
      list={
        lang === "te"
          ? ["గ్రామ పంచాయతీ", "RVP యూత్ టీమ్", "అత్యవసర సంప్రదింపు"]
          : ["Gram Panchayat office", "RVP Youth team", "Emergency contacts"]
      }
    />
  );
}
