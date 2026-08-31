"use client";

/**
 * /dharma/knowledge/ — §4's list of concepts.
 *
 * Each one gets a short honest explanation and nothing more. The temptation
 * with a page like this is to write an essay per idea; the more useful thing
 * for a village reader is one clear paragraph they can hold, under the Telugu
 * name they already know it by.
 */
import { useUiLang } from "@/components/i18n/LanguageProvider";
import Link from "next/link";
import { navHref } from "@/lib/routes/registry";
import { DHARMA_ABOUT, DHARMA_CONCEPTS } from "@/lib/dharma";

export function ConceptsPage() {
  const { lang } = useUiLang();
  const te = lang === "te";

  return (
    <main className="page dharma-page">
      <div className="section">
        <p className="eyebrow">
          <Link href={navHref("/dharma/", lang)}>{te ? "సనాతన ధర్మం" : "Sanatana Dharma"}</Link>
        </p>
        <h1>{te ? "ధర్మం & ఆధ్యాత్మిక జ్ఞానం" : "Dharma & Spiritual Knowledge"}</h1>
        <p className="lede">
          {te
            ? "సంప్రదాయంలోని ముఖ్య భావనలు — తెలుగు పేర్లతో, సరళంగా."
            : "The ideas the tradition works with, under the names this village already knows them by."}
        </p>
      </div>

      <section className="section dharma-prose">
        {DHARMA_ABOUT.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      <section className="section">
        <h2>{te ? "భావనలు" : "The ideas"}</h2>
        <dl className="dharma-concepts">
          {DHARMA_CONCEPTS.map((c) => (
            <div key={c.slug} className="dharma-concept">
              <dt>
                <span className="dharma-concept-name" lang="te">
                  {c.name}
                </span>
                <span className="dharma-concept-roman">
                  {c.nameRoman} — {c.nameEnglish}
                </span>
              </dt>
              <dd>{c.intro}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
