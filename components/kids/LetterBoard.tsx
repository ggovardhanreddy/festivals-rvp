"use client";

import { useState } from "react";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import type { Letter } from "@/lib/kids/alphabet";

/**
 * A tappable letter grid.
 *
 * Selecting a letter enlarges it and shows its transliteration and, where one
 * exists, an example word. Letters with no example simply show none — the
 * data file deliberately leaves that field empty rather than inventing one.
 */
export function LetterBoard({
  groups,
}: {
  groups: { titleKey: string; letters: Letter[] }[];
}) {
  const { t } = useUiLang();
  const [active, setActive] = useState<Letter | null>(null);

  return (
    <div className="letterboard">
      {groups.map((group) => (
        <section key={group.titleKey} className="letterboard-group">
          <h2 className="letterboard-group-title">{t(group.titleKey)}</h2>
          <ul className="letterboard-grid">
            {group.letters.map((letter, i) => {
              const selected = active?.glyph === letter.glyph && active.roman === letter.roman;
              return (
                <li key={`${letter.glyph}-${i}`}>
                  <button
                    type="button"
                    className={`letterboard-cell${selected ? " is-active" : ""}`}
                    aria-pressed={selected}
                    onClick={() => setActive(selected ? null : letter)}
                  >
                    <span className="letterboard-glyph">{letter.glyph}</span>
                    <span className="letterboard-roman">{letter.roman}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <div className="letterboard-detail" role="status" aria-live="polite">
        {active ? (
          <>
            <span className="letterboard-detail-glyph">{active.glyph}</span>
            <span className="letterboard-detail-text">
              <strong>{active.roman}</strong>
              {active.example ? (
                <span>
                  {active.example}
                  {active.exampleGloss ? (
                    <span className="muted"> · {active.exampleGloss}</span>
                  ) : null}
                </span>
              ) : null}
            </span>
          </>
        ) : (
          <span className="muted">{t("kids.tapLetter")}</span>
        )}
      </div>
    </div>
  );
}
