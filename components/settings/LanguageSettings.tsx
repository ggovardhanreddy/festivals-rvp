"use client";

import { Reveal } from "@/components/Reveal";
import { useUiLang } from "@/components/i18n/LanguageProvider";

export function LanguageSettings() {
  const { lang, setLang, t } = useUiLang();

  return (
    <Reveal className="section">
      <div className="section-head">
        <div>
          <p className="eyebrow">{t("language")}</p>
          <h2>{t("language")}</h2>
          <p className="lede">{t("language-lede")}</p>
        </div>
      </div>
      <div className="dev-filters" role="radiogroup" aria-label={t("language")}>
        <button
          type="button"
          className="dev-filter-btn"
          aria-pressed={lang === "en"}
          onClick={() => setLang("en")}
        >
          {t("language-en")}
        </button>
        <button
          type="button"
          className="dev-filter-btn"
          aria-pressed={lang === "te"}
          onClick={() => setLang("te")}
        >
          {t("language-te")}
        </button>
      </div>
    </Reveal>
  );
}
