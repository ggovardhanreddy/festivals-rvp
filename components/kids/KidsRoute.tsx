"use client";

import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { navHref } from "@/lib/routes/registry";
import {
  ENGLISH_ALPHABET,
  TELUGU_CONSONANTS,
  TELUGU_VOWELS,
} from "@/lib/kids/alphabet";
type ActivitySlug = "telugu" | "english" | "numbers" | "math" | "drawing" | "gk";
import { LetterBoard } from "./LetterBoard";
import { NumberBoard } from "./NumberBoard";
import { MathPractice } from "./MathPractice";
import { DrawingPad } from "./DrawingPad";
import { TopicQuiz } from "./TopicQuiz";

const TITLE_KEY: Record<ActivitySlug, string> = {
  telugu: "kids.telugu",
  english: "kids.english",
  numbers: "kids.numbers",
  math: "kids.math",
  drawing: "kids.drawing",
  gk: "kids.gk",
};

const DESC_KEY: Record<ActivitySlug, string> = {
  telugu: "kids.telugu.desc",
  english: "kids.english.desc",
  numbers: "kids.numbers.desc",
  math: "kids.math.desc",
  drawing: "kids.drawing.desc",
  gk: "kids.gk.desc",
};

export function KidsRoute({ slug }: { slug: ActivitySlug }) {
  const { t, lang } = useUiLang();

  return (
    <main className="page kids-page">
      <div className="section">
        <p className="eyebrow">
          <Link href={navHref("/kids/", lang)}>{t("nav.kids")}</Link>
        </p>
        <h1>{t(TITLE_KEY[slug])}</h1>
        <p className="lede">{t(DESC_KEY[slug])}</p>
      </div>
      <div className="section">
        {slug === "telugu" ? (
          <LetterBoard
            groups={[
              { titleKey: "kids.telugu.vowels", letters: TELUGU_VOWELS },
              { titleKey: "kids.telugu.consonants", letters: TELUGU_CONSONANTS },
            ]}
          />
        ) : null}
        {slug === "english" ? (
          <LetterBoard
            groups={[{ titleKey: "kids.english.letters", letters: ENGLISH_ALPHABET }]}
          />
        ) : null}
        {slug === "numbers" ? <NumberBoard /> : null}
        {slug === "math" ? <MathPractice /> : null}
        {slug === "drawing" ? <DrawingPad /> : null}
        {slug === "gk" ? <TopicQuiz topic="gk" /> : null}
      </div>
    </main>
  );
}
