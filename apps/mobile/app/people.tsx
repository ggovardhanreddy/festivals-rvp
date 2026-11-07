import { SectionPage } from "@/src/SectionPage";
import { useLang } from "@/src/lang";

export default function PeoplePage() {
  const { lang } = useLang();
  return (
    <SectionPage
      title={lang === "te" ? "సభ్యుల వివరాలు" : "People Directory"}
      list={
        lang === "te"
          ? ["గ్రామ పెద్దలు", "కుటుంబాలు", "సంప్రదింపు సమాచారం"]
          : ["Elders", "Families", "Directory contacts"]
      }
    />
  );
}
