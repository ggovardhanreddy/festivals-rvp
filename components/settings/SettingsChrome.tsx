"use client";

import { useUiLang } from "@/components/i18n/LanguageProvider";
import { SITE_NAME } from "@/lib/site";

export function SettingsChrome() {
  const { t } = useUiLang();
  return (
    <div className="section-head">
      <div>
        <p className="eyebrow">{SITE_NAME}</p>
        <h1>{t("settings-title")}</h1>
        <p className="lede">{t("settings-lede")}</p>
      </div>
    </div>
  );
}