"use client";

/**
 * Where a text can actually be read, and on what terms.
 *
 * This block is the visible face of the copyright work behind this section.
 * Three access states, each meaning something different to a reader:
 *
 *   open  — freely licensed. We could host a copy, and say so.
 *   link  — readable at the source, but its terms do not let us copy it.
 *   embed — plays here through the platform's own player, never downloaded.
 *
 * Showing the licence line rather than hiding it is the point. A villager
 * following a link to TTD should understand they are going to the temple's own
 * library, not to a copy we made.
 */
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { ACCESS_LABEL, WIKISOURCE_CAUTION, type TextSource } from "@/lib/dharma";

const LANGUAGE_LABEL: Record<TextSource["language"], string> = {
  sa: "Sanskrit",
  te: "తెలుగు",
  en: "English",
  mixed: "Multiple languages",
};

export function SourceList({ sources }: { sources: TextSource[] }) {
  const { lang } = useUiLang();
  const te = lang === "te";
  if (sources.length === 0) return null;

  const hasWikisource = sources.some((s) => s.url.includes("wikisource.org"));

  return (
    <section className="section">
      <h2>{te ? "ఎక్కడ చదవాలి" : "Where to read this"}</h2>
      <p className="muted">
        {te
          ? "ఈ మూలాలను నేరుగా చదవండి. మేము కాపీ చేయడానికి అనుమతి ఉన్నవి మాత్రమే ఇక్కడ నిల్వ చేస్తాము."
          : "These are the sources themselves. We only ever keep a copy of something whose licence permits it — everything else is a link to the original, which is also the version to trust."}
      </p>
      <ul className="dharma-sources">
        {sources.map((s) => (
          <li key={s.url} className={`dharma-source dharma-source--${s.access}`}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.label}
            </a>
            <span className={`dharma-access dharma-access--${s.access}`}>{ACCESS_LABEL[s.access]}</span>
            <span className="dharma-source-lang">{LANGUAGE_LABEL[s.language]}</span>
            <span className="dharma-source-licence">{s.licence}</span>
            {s.note ? <span className="dharma-source-note">{s.note}</span> : null}
          </li>
        ))}
      </ul>
      {hasWikisource ? <p className="dharma-caution">{WIKISOURCE_CAUTION}</p> : null}
    </section>
  );
}
