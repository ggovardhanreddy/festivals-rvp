import { SectionPage } from "@/src/SectionPage";
import { useLang } from "@/src/lang";

export default function HistoryPage() {
  const { lang } = useLang();
  return (
    <SectionPage
      title={lang === "te" ? "గ్రామ చరిత్ర" : "Village History"}
      list={
        lang === "te"
          ? ["గ్రామ ఆవిర్భావం", "సంస్కృతి, వారసత్వం", "తరాల జ్ఞాపకాలు"]
          : ["Village origin", "Cultural heritage", "Intergenerational memories"]
      }
    />
  );
}
