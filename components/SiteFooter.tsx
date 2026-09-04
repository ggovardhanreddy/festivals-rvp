"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import {
  FOOTER_LEGAL,
  FOOTER_PRESERVE,
  NAV,
  SITE_CONTACT_EMAIL,
  SITE_TAGLINE,
  VILLAGE_ADDRESS_LINE,
  VILLAGE_MAPS_URL,
} from "@/lib/site";
import { BUILD_ID } from "@/lib/build-id";
import { useUiLang } from "./i18n/LanguageProvider";

/**
 * Simple village footer: identity, the seven primary links, then a quiet
 * legal row. Secondary destinations stay in More — not here.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const { t } = useUiLang();
  const inbox = SITE_CONTACT_EMAIL || "reddivaripalli.rvp@gmail.com";

  return (
    <footer className="site-footer" id="contact" data-build={BUILD_ID}>
      <div className="footer-inner footer-inner--village">
        <div className="footer-brand">
          <Logo />
          <p className="footer-village">REDDIVARIPALLI</p>
          <p className="muted footer-tagline">{t("home.hero.pillars", SITE_TAGLINE)}</p>
          <p className="muted footer-address">{VILLAGE_ADDRESS_LINE}</p>
          <a className="footer-map-link" href={`mailto:${inbox}`}>
            {t("email-us")}: {inbox}
          </a>
          <a
            className="footer-map-link"
            href={VILLAGE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("open-maps")}
          </a>
        </div>

        <div className="footer-col">
          <p className="footer-heading">Reddivaripalli</p>
          <div className="footer-links">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                {t(item.href, item.label)}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-copy">
        <p>
          © {year} Reddivaripalli — {t("footer.preserve", FOOTER_PRESERVE)}
        </p>
        <p className="footer-legal-inline">
          {FOOTER_LEGAL.map((item) => (
            <Link key={item.href} href={item.href}>
              {t(item.href, item.label)}
            </Link>
          ))}
        </p>
      </div>
    </footer>
  );
}
