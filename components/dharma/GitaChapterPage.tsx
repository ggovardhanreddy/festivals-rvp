"use client";

/**
 * One chapter of the Bhagavad Gita.
 *
 * What this page does NOT do is print the verses. The Sanskrit is ancient and
 * free, but every Telugu translation worth reading belongs to somebody, and a
 * chapter page that showed Sanskrit a Telugu reader cannot parse would be
 * decoration rather than use. So the page gives the chapter's name, length and
 * subject in plain words, and sends the reader to a source that has the verses
 * lawfully — Wikisource, which is freely licensed, first.
 */
import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { navHref } from "@/lib/routes/registry";
import { SourceList } from "./SourceList";
import { GITA, gitaChapter } from "@/lib/dharma";

export function GitaChapterPage({ chapter }: { chapter: string }) {
  const { lang } = useUiLang();
  const te = lang === "te";
  const d = gitaChapter(chapter);
  if (!d) return null;

  const n = Number(chapter);
  const all = GITA.divisions ?? [];
  const prev = all.find((x) => Number(x.slug) === n - 1);
  const next = all.find((x) => Number(x.slug) === n + 1);

  return (
    <main className="page dharma-page dharma-chapter">
      <div className="section">
        <p className="eyebrow">
          <Link href={navHref("/dharma/", lang)}>{te ? "సనాతన ధర్మం" : "Sanatana Dharma"}</Link>
          {" · "}
          <Link href={navHref("/dharma/gita/", lang)}>{te ? "భగవద్గీత" : "Bhagavad Gita"}</Link>
        </p>
        <p className="dharma-chapter-number">
          {te ? `అధ్యాయం ${n}` : `Chapter ${n} of 18`}
        </p>
        <h1 lang="te">{d.name}</h1>
        <p className="dharma-chapter-roman">
          {d.nameRoman} — {d.nameEnglish}
        </p>
        {d.verses ? (
          <p className="muted">
            {d.verses} {te ? "శ్లోకాలు" : "verses"}
          </p>
        ) : null}
      </div>

      <section className="section dharma-prose">
        <p>{d.intro}</p>
      </section>

      {d.teachings && d.teachings.length > 0 ? (
        <section className="section">
          <h2>{te ? "ముఖ్య బోధనలు" : "What this chapter turns on"}</h2>
          <ul className="dharma-teachings dharma-teachings--large">
            {d.teachings.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <SourceList sources={GITA.sources} />

      <nav className="section dharma-chapter-nav" aria-label={te ? "అధ్యాయాలు" : "Chapters"}>
        {prev ? (
          <Link className="btn" href={navHref(`/dharma/gita/${prev.slug}/`, lang)}>
            ← {prev.nameRoman}
          </Link>
        ) : (
          <span />
        )}
        <Link className="btn" href={navHref("/dharma/gita/", lang)}>
          {te ? "అన్ని అధ్యాయాలు" : "All 18 chapters"}
        </Link>
        {next ? (
          <Link className="btn" href={navHref(`/dharma/gita/${next.slug}/`, lang)}>
            {next.nameRoman} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
