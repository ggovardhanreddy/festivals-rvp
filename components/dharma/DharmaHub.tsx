"use client";

/**
 * 🕉️ Sanatana Dharma — the section hub.
 *
 * Replaces what used to be /learn/. The brief is explicit that this must not
 * look like a school or a coaching portal, so there are no course cards, no
 * progress, no "start learning" call to action — it reads as a library index,
 * which is what it is.
 *
 * Every card leads to a page that exists and has content written for it. That
 * was the failing of the old hub: it advertised sections nobody had built.
 */
import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { navHref } from "@/lib/routes/registry";
import { DHARMA_ABOUT, DHARMA_PAGES } from "@/lib/dharma";
import { DHARMA_NAV } from "@/lib/site";

const CARD_ICON: Record<string, string> = {
  "/dharma/": "🕉️",
  "/dharma/vedas/": "📜",
  "/dharma/upanishads/": "📖",
  "/dharma/gita/": "🕉️",
  "/dharma/ramayanam/": "📖",
  "/dharma/mahabharatam/": "📖",
  "/dharma/puranas/": "📜",
  "/dharma/slokas/": "🙏",
  "/dharma/music/": "🎵",
  "/dharma/knowledge/": "✨",
  "/events/": "🪔",
};

export function DharmaHub() {
  const { lang } = useUiLang();
  const te = lang === "te";

  return (
    <main className="page dharma-hub">
      <div className="section">
        <p className="eyebrow">{te ? "జ్ఞాన విభాగం" : "Knowledge"}</p>
        <h1>🕉️ {te ? "సనాతన ధర్మం" : "Sanatana Dharma"}</h1>
        <p className="lede">
          {te
            ? "వేదాలు, ఉపనిషత్తులు, భగవద్గీత, రామాయణం, మహాభారతం, పురాణాలు, శ్లోకాలు మరియు భక్తి సంగీతం — పరిచయాలు మరియు అధికారిక మూలాలు."
            : "The Vedas, the Upanishads, the Gita, the epics, the Puranas, the slokas said at home, and the devotional music of this region — each introduced, and each pointing at where it can actually be read."}
        </p>
      </div>

      <section className="section dharma-prose">
        {DHARMA_ABOUT.body.slice(0, 2).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      <section className="section">
        <h2>{te ? "విభాగాలు" : "In this section"}</h2>
        <ul className="dharma-cards">
          {DHARMA_NAV.filter((item) => item.href !== "/dharma/").map((item) => {
            const key = item.href.replace(/^\/dharma\//, "").replace(/\/$/, "");
            const entry = DHARMA_PAGES[key];
            return (
              <li key={item.href}>
                <Link className="dharma-card" href={navHref(item.href, lang)}>
                  <span className="dharma-card-icon" aria-hidden>
                    {CARD_ICON[item.href] ?? "📖"}
                  </span>
                  <span className="dharma-card-title">{te ? item.labelTe : item.label}</span>
                  <span className="dharma-card-desc">
                    {entry ? ((te && entry.summaryTe) || entry.summary) : sectionBlurb(item.href, te)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="section">
        <h2>{te ? "ఈ గ్రామం యొక్క ఆధ్యాత్మిక వారసత్వం" : "This village's own spiritual heritage"}</h2>
        <p className="muted">
          {te
            ? "శ్రీ రామాలయం, ఆలయ చరిత్ర, జాతరలు, స్థానిక భజనలు మరియు పెద్దల జ్ఞాపకాలు — మన గ్రామం మరియు పండుగల పేజీలలో ఉన్నాయి."
            : "The Sri Ramalayam, the jatharas, the local bhajans and the elders' memories live on Our Village, the festival calendar, and the gallery."}
        </p>
        <p>
          <Link className="btn btn-primary" href={navHref("/about/", lang)}>
            {te ? "మన గ్రామం" : "Our Village →"}
          </Link>
          {" "}
          <Link className="btn" href={navHref("/events/", lang)}>
            {te ? "పండుగలు" : "Festivals →"}
          </Link>
        </p>
      </section>
    </main>
  );
}

function sectionBlurb(href: string, te: boolean): string {
  if (href === "/dharma/knowledge/") {
    return te
      ? "ధర్మం, కర్మ, మోక్షం, భక్తి, జ్ఞానం, సేవ, యోగం, ధ్యానం మరియు సంస్కారాలు."
      : "Dharma, karma, moksha, bhakti, jnana, seva, yoga, meditation, the guru lineage and the samskaras.";
  }
  if (href === "/events/") {
    return te
      ? "గ్రామ పండుగల క్యాలెండర్ — వినాయక చవితి, దసరా, సంక్రాంతి, జాతరలు."
      : "The village festival calendar — Vinayaka Chavithi, Dasara, Sankranthi and the jatharas.";
  }
  return "";
}
