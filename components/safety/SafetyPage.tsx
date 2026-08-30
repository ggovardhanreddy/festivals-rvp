"use client";

import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { navHref } from "@/lib/routes/registry";
import { SectionIcon } from "@/components/platform/SectionIcon";
import { byIds } from "@/lib/directory";
import { OfficialLinkList } from "@/components/directory/OfficialLink";

/**
 * Cyber safety.
 *
 * Written as rules a person can remember standing at a shop counter, not as
 * a security lecture. Each scam is described by what the caller actually
 * says, because that is what someone recognises in the moment.
 */
const SCAMS = [
  "safety.scam.otp",
  "safety.scam.upi",
  "safety.scam.kyc",
  "safety.scam.job",
  "safety.scam.loan",
  "safety.scam.lottery",
  "safety.scam.fakeSite",
  "safety.scam.support",
] as const;

export function SafetyPage() {
  const { t, lang } = useUiLang();
  const report = byIds(["cybercrime", "sanchar-saathi", "consumer-helpline", "rbi"]);

  return (
    <main className="page safety-page">
      <div className="section">
        <span className="kids-intro-icon" aria-hidden>
          <SectionIcon name="shield" size={34} />
        </span>
        <h1>{t("safety.title")}</h1>
        <p className="lede">{t("safety.lede")}</p>
      </div>

      <div className="section">
        <p className="safety-rule">{t("safety.goldenRule")}</p>
      </div>

      <section className="section" aria-labelledby="safety-scams">
        <h2 id="safety-scams">{t("safety.common")}</h2>
        <ul className="safety-list">
          {SCAMS.map((key) => (
            <li key={key} className="safety-item">
              <strong>{t(`${key}.title`)}</strong>
              <span className="muted">{t(`${key}.body`)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="safety-report">
        <h2 id="safety-report">{t("safety.report")}</h2>
        <p className="muted">{t("safety.report.body")}</p>
        <OfficialLinkList items={report} />
        <p className="muted">
          <Link href={navHref("/emergency/", lang)}>{t("emergency.title")}</Link>
        </p>
      </section>
    </main>
  );
}
