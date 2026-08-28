"use client";

import Link from "next/link";
import { useState } from "react";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { withLocale } from "@/lib/i18n/config";
import { SectionIcon } from "@/components/platform/SectionIcon";
import {
  ENGLISH_ALPHABET,
  TELUGU_CONSONANTS,
  TELUGU_VOWELS,
} from "@/lib/kids/alphabet";
import { AlphabetPlayer } from "./AlphabetPlayer";

/**
 * Early learning: letters with sound.
 *
 * Three sets, one switch. English is first because the phonics flow ("A for
 * Apple") is what most parents are looking for, but the Telugu aksharamala
 * gets the same treatment rather than being a footnote — this is a Telugu
 * village, and its own script deserves the better experience, not the lesser.
 */
const SETS = [
  { id: "en", labelKey: "kids.abc.english", locale: "en" as const, letters: ENGLISH_ALPHABET },
  { id: "te-v", labelKey: "kids.telugu.vowels", locale: "te" as const, letters: TELUGU_VOWELS },
  { id: "te-c", labelKey: "kids.telugu.consonants", locale: "te" as const, letters: TELUGU_CONSONANTS },
];

export function AlphabetRoute() {
  const { t, lang } = useUiLang();
  const [set, setSet] = useState(SETS[0]!);

  return (
    <main className="page abc-page">
      <div className="section abc-head">
        <p className="eyebrow">
          <Link href={withLocale("/kids/", lang)}>{t("nav.kids")}</Link>
        </p>
        <span className="kids-intro-icon" aria-hidden>
          <SectionIcon name="letter" size={32} />
        </span>
        <h1>{t("kids.abc")}</h1>
        <p className="lede">{t("kids.abc.lede")}</p>
      </div>

      <div className="section">
        <div className="searchpage-facets" role="group" aria-label={t("kids.abc.chooseSet")}>
          {SETS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`filter-chip${set.id === s.id ? " is-active" : ""}`}
              aria-pressed={set.id === s.id}
              onClick={() => setSet(s)}
            >
              {t(s.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <AlphabetPlayer
          key={set.id}
          letters={set.letters}
          locale={set.locale}
          labelKey={set.labelKey}
        />
      </div>

      <p className="muted section abc-note">{t("kids.abc.note")}</p>
    </main>
  );
}
