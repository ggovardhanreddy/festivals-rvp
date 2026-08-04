"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import {
  COMMUNITY_NAV,
  NAV,
  OFFICIAL_SUBTITLE,
  OFFICIAL_TITLE,
  SITE_CONTACT_EMAIL,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_TAGLINE_PILLARS,
  VILLAGE_ADDRESS_LINE,
  VILLAGE_ALSO_KNOWN_AS,
  VILLAGE_MAPS_URL,
  VILLAGE_NAME,
} from "@/lib/site";
import { BUILD_ID } from "@/lib/build-id";
import { useMemberAuth } from "./auth/MemberAuthProvider";
import { FunFestLoginDialog } from "./auth/FunFestLoginDialog";
import { useUiLang } from "./i18n/LanguageProvider";

const FOOTER_UTILITY = [
  { href: "/search/", label: "Search" },
  { href: "/settings/", label: "Settings" },
  { href: "/contact/", label: "Contact" },
] as const;

const FOOTER_LEGAL = [
  { href: "/privacy/", label: "Privacy Policy" },
  { href: "/terms/", label: "Terms of Use" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();
  const router = useRouter();
  const { session, ready } = useMemberAuth();
  const { t } = useUiLang();
  const [funFestLoginOpen, setFunFestLoginOpen] = useState(false);
  const inbox = SITE_CONTACT_EMAIL || "reddivaripalli.rvp@gmail.com";

  const onFunFest = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!ready) {
      event.preventDefault();
      return;
    }
    if (!session) {
      event.preventDefault();
      setFunFestLoginOpen(true);
      return;
    }
    event.preventDefault();
    router.push("/fun-trips/");
  };

  return (
    <footer className="site-footer" id="contact">
      <div className="footer-inner footer-inner--minimal">
        <div className="footer-brand">
          <Logo variant="auto" />
          <p className="footer-village">{OFFICIAL_TITLE}</p>
          <p className="muted footer-tagline">
            {OFFICIAL_SUBTITLE} · {VILLAGE_NAME} ({VILLAGE_ALSO_KNOWN_AS})
          </p>
          <p className="muted footer-tagline">{SITE_TAGLINE_PILLARS}</p>
          <p className="muted footer-tagline">{SITE_TAGLINE}</p>
          <p className="muted footer-tagline footer-tagline-te" lang="te">
            {"\u0c2a\u0c4d\u0c30\u0c24\u0c3f \u0c09\u0c24\u0c4d\u0c38\u0c35\u0c02 \u0c35\u0c3e\u0c30\u0c38\u0c24\u0c4d\u0c35\u0c02\u0c17\u0c3e \u2014 \u0c30\u0c46\u0c21\u0c4d\u0c21\u0c3f\u0c35\u0c3e\u0c30\u0c3f\u0c2a\u0c32\u0c4d\u0c32\u0c3f"}
          </p>
        </div>

        <div className="footer-col">
          <p className="footer-heading">{t("quick-links")}</p>
          <div className="footer-links">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                {t(item.href, item.label)}
              </Link>
            ))}
            {COMMUNITY_NAV.map((item) =>
              item.href === "/fun-trips/" ? (
                <Link key={item.href} href={item.href} onClick={onFunFest}>
                  {t(item.href, item.label)}
                </Link>
              ) : (
                <Link key={item.href} href={item.href}>
                  {t(item.href, item.label)}
                </Link>
              ),
            )}
            {FOOTER_UTILITY.map((item) => (
              <Link key={item.href} href={item.href}>
                {t(item.href, item.label)}
              </Link>
            ))}
          </div>
        </div>

        <div className="footer-col" id="contact-details">
          <p className="footer-heading">{t("footer-contact")}</p>
          <p className="muted footer-address">{VILLAGE_ADDRESS_LINE}</p>
          <a
            className="footer-map-link"
            href={`mailto:${inbox}`}
            aria-label={`Email ${inbox}`}
          >
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

        <div className="footer-col" id="legal">
          <p className="footer-heading">Legal</p>
          <div className="footer-links">
            {FOOTER_LEGAL.map((item) => (
              <Link key={item.href} href={item.href}>
                {t(item.href, item.label)}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-copy">
        <p>
          © {year} {OFFICIAL_TITLE}. Stewards: {SITE_NAME}. {VILLAGE_ALSO_KNOWN_AS} ·{" "}
          {VILLAGE_NAME}.
        </p>
        <p className="footer-build" title="Build id from public/version.json / generate-all">
          Build {BUILD_ID}
        </p>
      </div>
      <FunFestLoginDialog
        open={funFestLoginOpen}
        onClose={() => setFunFestLoginOpen(false)}
        next="/fun-trips/"
      />
    </footer>
  );
}
