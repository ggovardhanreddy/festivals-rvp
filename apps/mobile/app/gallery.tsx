import { SectionPage } from "@/src/SectionPage";
import { useLang } from "@/src/lang";

export default function GalleryPage() {
  const { lang } = useLang();
  return (
    <SectionPage
      title={lang === "te" ? "గ్రామ గ్యాలరీ" : "Village Gallery"}
      list={
        lang === "te"
          ? ["పండుగ ఫోటోలు", "గ్రామ జీవితం", "వర్షన్‌డ్ మీడియా కంటెంట్ API"]
          : ["Festival photo archives", "Village life moments", "Versioned media content API"]
      }
    />
  );
}
