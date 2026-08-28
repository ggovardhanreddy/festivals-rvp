"use client";

import { useUiLang } from "@/components/i18n/LanguageProvider";
import { NUMBERS } from "@/lib/kids/alphabet";

/** Numbers 0–20 in Telugu numerals, Telugu words and English words. */
export function NumberBoard() {
  const { t } = useUiLang();
  return (
    <div className="numberboard">
      <p className="muted">{t("kids.numbers.hint")}</p>
      <ul className="numberboard-grid">
        {NUMBERS.map((n) => (
          <li key={n.value} className="numberboard-cell">
            <span className="numberboard-digit">{n.value}</span>
            <span className="numberboard-telugu">{n.telugu}</span>
            <span className="numberboard-word">{n.teluguWord}</span>
            <span className="numberboard-word muted">{n.englishWord}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
