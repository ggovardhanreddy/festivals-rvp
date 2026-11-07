import { SectionPage } from "@/src/SectionPage";
import { useLang } from "@/src/lang";

export default function TemplesPage() {
  const { lang } = useLang();
  return (
    <SectionPage
      title={lang === "te" ? "దేవాలయాలు" : "Temple Information"}
      list={
        lang === "te"
          ? ["శ్రీ రామాలయం", "శ్రీ శివాలయం (చారిత్రిక స్థలం)", "జాతరలు & పూజలు"]
          : ["Sri Ramalayam", "Sri Shiva Temple (historic site)", "Jatharas & rituals"]
      }
    />
  );
}
