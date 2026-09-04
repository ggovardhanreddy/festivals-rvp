"use client";

import {
  SITE_CONTACT_EMAIL,
  VILLAGE_ADDRESS_LINE,
  VILLAGE_MAPS_EMBED,
  VILLAGE_MAPS_URL,
} from "@/lib/site";
import { useUiLang } from "@/components/i18n/LanguageProvider";

export function HomeContact() {
  const { t } = useUiLang();
  const inbox = SITE_CONTACT_EMAIL;

  return (
    <section className="section home-contact" aria-labelledby="home-contact-heading">
      <div className="home-section-head">
        <div>
          <p className="eyebrow">{t("nav.contact")}</p>
          <h2 id="home-contact-heading">{t("home.contactLocation")}</h2>
          <p className="home-panel-lede">{VILLAGE_ADDRESS_LINE}</p>
        </div>
        <div className="btn-row">
          <a className="btn" href={`mailto:${inbox}`}>
            {inbox}
          </a>
          <a
            className="btn ghost"
            href={VILLAGE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("open-maps")}
          </a>
        </div>
      </div>
      <div className="home-contact-map">
        <iframe
          title={t("home.contactLocation")}
          src={VILLAGE_MAPS_EMBED}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </section>
  );
}
