"use client";

/**
 * One curated knowledge entry, rendered.
 *
 * Every page under /dharma/ uses this, which is deliberate: the Vedas page and
 * the Puranas page should feel like the same section, and a single renderer
 * makes that automatic rather than a thing to remember.
 *
 * The part that matters legally is the sources block at the foot. Each source
 * shows its own access position — freely licensed, read at the source, or
 * plays here — so a reader is never offered a download of something we are not
 * permitted to host, and a maintainer can see the reason at a glance.
 */
import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { navHref } from "@/lib/routes/registry";
import { SourceList } from "./SourceList";
import type { KnowledgeEntry } from "@/lib/dharma";

export function KnowledgePage({
  entry,
  eyebrow,
  eyebrowHref,
  /** When set, each division links to its own page (used by the Gita). */
  divisionHrefBase,
}: {
  entry: KnowledgeEntry;
  eyebrow: string;
  eyebrowHref: string;
  divisionHrefBase?: string;
}) {
  const { lang } = useUiLang();
  const te = lang === "te";
  const title = (te && entry.titleTe) || entry.title;
  const summary = (te && entry.summaryTe) || entry.summary;

  return (
    <main className="page dharma-page">
      <div className="section">
        <p className="eyebrow">
          <Link href={navHref(eyebrowHref, lang)}>{eyebrow}</Link>
        </p>
        <h1>{title}</h1>
        <p className="lede">{summary}</p>
      </div>

      <section className="section dharma-prose">
        {entry.body.map((para, i) => (
          <Paragraph key={i} text={para} />
        ))}
      </section>

      {entry.divisions && entry.divisions.length > 0 ? (
        <section className="section">
          <h2>{te ? "విభాగాలు" : "Contents"}</h2>
          <ol className="dharma-divisions">
            {entry.divisions.map((d, i) => {
              const inner = (
                <>
                  <span className="dharma-division-head">
                    <span className="dharma-division-name" lang="te">
                      {d.name}
                    </span>
                    <span className="dharma-division-roman">
                      {d.nameRoman}
                      {d.nameEnglish && d.nameEnglish !== d.nameRoman ? ` — ${d.nameEnglish}` : ""}
                    </span>
                    {d.verses ? (
                      <span className="dharma-division-count">
                        {d.verses.toLocaleString("en-IN")} {te ? "శ్లోకాలు" : "verses"}
                      </span>
                    ) : null}
                  </span>
                  <span className="dharma-division-intro">{d.intro}</span>
                  {d.teachings && d.teachings.length > 0 ? (
                    <ul className="dharma-teachings">
                      {d.teachings.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  ) : null}
                </>
              );
              return (
                <li key={d.slug} className="dharma-division">
                  {divisionHrefBase ? (
                    <Link className="dharma-division-link" href={navHref(`${divisionHrefBase}${d.slug}/`, lang)}>
                      <span className="dharma-division-number" aria-hidden>
                        {i + 1}
                      </span>
                      {inner}
                    </Link>
                  ) : (
                    <div className="dharma-division-link is-static">
                      <span className="dharma-division-number" aria-hidden>
                        {i + 1}
                      </span>
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      <SourceList sources={entry.sources} />

      {entry.related && entry.related.length > 0 ? (
        <section className="section">
          <h2>{te ? "సంబంధిత పేజీలు" : "Related"}</h2>
          <ul className="dharma-related">
            {entry.related.map((r) => (
              <li key={r.href}>
                <Link href={navHref(r.href, lang)}>{r.label}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}

/**
 * Body paragraphs may carry a single **bold lead** — used where a paragraph is
 * a caution rather than narration, as on the Sri Sri page. Deliberately the
 * only markup supported: anything richer belongs in a component, not a string.
 */
function Paragraph({ text }: { text: string }) {
  const m = text.match(/^\*\*([^*]+)\*\*\s*([\s\S]*)$/);
  if (!m) return <p>{text}</p>;
  return (
    <p className="dharma-note">
      <strong>{m[1]}</strong> {m[2]}
    </p>
  );
}
