"use client";

import Link from "next/link";
import { AUDIENCE_DOORS, isReady } from "@/lib/platform/doors";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { withLocale } from "@/lib/i18n/config";
import { SectionIcon } from "./SectionIcon";

export function AudienceDoors() {
  const { t, lang } = useUiLang();
  return (
    <section className="section doors-section" aria-labelledby="doors-heading">
      <h2 id="doors-heading" className="doors-heading">
        {t("home.whatDoYouWant")}
      </h2>
      <ul className="doors-grid">
        {AUDIENCE_DOORS.map((door) => (
          <li key={door.id}>
            <Link
              className="door-card"
              href={withLocale(door.href, lang)}
              data-door={door.id}
              data-pending={isReady(door.href) ? undefined : true}
            >
              <span className="door-icon" aria-hidden>
                <SectionIcon name={door.icon} size={28} />
              </span>
              <span className="door-text">
                <span className="door-label">{t(door.labelKey)}</span>
                <span className="door-tagline">{t(door.taglineKey)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
