"use client";

import { useUiLang } from "@/components/i18n/LanguageProvider";

/**
 * The banner that matters most on these pages.
 *
 * A village user arriving at a "government services" page has, statistically,
 * already met at least one site that wanted their Aadhaar number and a fee.
 * Saying plainly what this site will never ask for is the cheapest and most
 * effective protection we can offer.
 */
export function SafetyBanner({ kind }: { kind: "gov" | "bank" }) {
  const { t } = useUiLang();
  return (
    <aside
      className={`safety-banner safety-banner--${kind}`}
      role="note"
      aria-label={t(kind === "bank" ? "safety.bank.title" : "safety.gov.title")}
    >
      <span className="safety-banner-icon" aria-hidden>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm-1 6h2v5h-2V8Zm0 7h2v2h-2v-2Z" />
        </svg>
      </span>
      <div>
        <strong>{t(kind === "bank" ? "safety.bank.title" : "safety.gov.title")}</strong>
        <p>{t(kind === "bank" ? "safety.bank.body" : "safety.gov.body")}</p>
      </div>
    </aside>
  );
}
