"use client";

import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { withLocale } from "@/lib/i18n/config";
import { SectionIcon } from "@/components/platform/SectionIcon";
import { KIDS_ACTIVITIES } from "@/lib/kids/catalog";

/**
 * Kids World.
 *
 * Two rules shape this page. Nothing here asks a child for a name, an email,
 * a phone number or a photograph — the only thing stored is arithmetic
 * progress on the device. And an activity that has no real content behind it
 * is shown greyed out with the reason, never as a link to an empty page.
 */
export function KidsHub() {
  const { t, lang } = useUiLang();
  const ready = KIDS_ACTIVITIES.filter((a) => a.ready);
  const pending = KIDS_ACTIVITIES.filter((a) => !a.ready);

  return (
    <main className="page kids-hub">
      <div className="section kids-intro">
        <span className="kids-intro-icon" aria-hidden>
          <SectionIcon name="kids" size={38} />
        </span>
        <p className="eyebrow">{t("common.free")}</p>
        <h1>{t("nav.kids")}</h1>
        <p className="lede">{t("kids.lede")}</p>
        <p className="muted kids-privacy">{t("kids.privacy")}</p>
      </div>

      <section className="section" aria-labelledby="kids-ready">
        <h2 id="kids-ready" className="sr-only">
          {t("kids.available")}
        </h2>
        <ul className="kids-grid">
          {ready.map((a) => (
            <li key={a.id}>
              <Link className="kids-card" href={withLocale(a.href, lang)}>
                <span className="kids-card-icon" aria-hidden>
                  <SectionIcon name={a.icon} size={26} />
                </span>
                <span className="kids-card-title">{t(a.labelKey)}</span>
                <span className="kids-card-desc">{t(a.descriptionKey)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {pending.length ? (
        <section className="section" aria-labelledby="kids-pending">
          <h2 id="kids-pending" className="kids-pending-title">
            {t("kids.notYet")}
          </h2>
          <p className="muted">{t("kids.notYet.body")}</p>
          <ul className="kids-grid kids-grid--pending">
            {pending.map((a) => (
              <li key={a.id}>
                <div className="kids-card is-pending" aria-disabled="true">
                  <span className="kids-card-icon" aria-hidden>
                    <SectionIcon name={a.icon} size={26} />
                  </span>
                  <span className="kids-card-title">{t(a.labelKey)}</span>
                  <span className="kids-card-desc">
                    {a.pendingKey ? t(a.pendingKey) : t("common.comingSoon")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
