"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import {
  FOOTER_COMMUNITY,
  FOOTER_LEGAL,
  FOOTER_SERVICES,
  NAV,
  OFFICIAL_TITLE,
  SITE_CONTACT_EMAIL,
  SITE_NAME,
  SITE_TAGLINE_PILLARS,
  VILLAGE_ADDRESS_LINE,
  VILLAGE_ALSO_KNOWN_AS,
  VILLAGE_MAPS_URL,
  VILLAGE_NAME,
  VILLAGE_SHORT_DESCRIPTION,
} from "@/lib/site";
import { BUILD_ID } from "@/lib/build-id";
import { useMemberAuth } from "./auth/MemberAuthProvider";
import { FunFestLoginDialog } from "./auth/FunFestLoginDialog";
import { useUiLang } from "./i18n/LanguageProvider";

/**
 * Five columns: who we are, Explore, Community, Services, Legal.
 * Deliberately not a second copy of every route — the header, the More menu
 * and the section pages carry the rest.
 */
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

  const column = (
    heading: string,
    items: readonly { href: string; label: string }[],
    id?: string,
  ) => (
    <div className="footer-col" id={id}>
      <p className="footer-heading">{heading}</p>
      <div className="footer-links">
        {items.map((item) =>
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
      </div>
    </div>
  );

  return (
    <footer className="site-footer" id="contact">
      <div className="footer-inner footer-inner--minimal">
        <div className="footer-brand">
          <Logo />
          <p className="footer-village">REDDIVARIPALLI</p>
          <p className="muted footer-tagline">{SITE_TAGLINE_PILLARS}</p>
          <p className="muted footer-about">{VILLAGE_SHORT_DESCRIPTION}</p>
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

        {column("Explore", NAV)}
        {column("Community", FOOTER_COMMUNITY)}
        {column("Services", FOOTER_SERVICES)}
        {column("Legal", FOOTER_LEGAL, "legal")}
      </div>

      <div className="footer-copy">
        <p>
          © {year} {OFFICIAL_TITLE}. Stewards: {SITE_NAME}.{" "}
          {VILLAGE_ALSO_KNOWN_AS} · {VILLAGE_NAME}.
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
