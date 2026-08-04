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
  SITE_NAME,
  SITE_TAGLINE,
  VILLAGE_ADDRESS_LINE,
  VILLAGE_ALSO_KNOWN_AS,
  VILLAGE_MAPS_URL,
  VILLAGE_NAME,
} from "@/lib/site";
import { BUILD_ID } from "@/lib/build-id";
import { useMemberAuth } from "./auth/MemberAuthProvider";
import { FunFestLoginDialog } from "./auth/FunFestLoginDialog";

const FOOTER_EXTRA = [
  { href: "/search/", label: "Search" },
  { href: "/settings/", label: "Settings" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();
  const router = useRouter();
  const { session, ready } = useMemberAuth();
  const [funFestLoginOpen, setFunFestLoginOpen] = useState(false);

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
          <p className="footer-village">
            {OFFICIAL_TITLE}
          </p>
          <p className="muted footer-tagline">
            {OFFICIAL_SUBTITLE} · {VILLAGE_NAME} ({VILLAGE_ALSO_KNOWN_AS})
          </p>
          <p className="muted footer-tagline">{SITE_TAGLINE}</p>
        </div>

        <div className="footer-col">
          <p className="footer-heading">Quick links</p>
          <div className="footer-links">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            {COMMUNITY_NAV.map((item) =>
              item.href === "/fun-trips/" ? (
                <Link key={item.href} href={item.href} onClick={onFunFest}>
                  {item.label}
                </Link>
              ) : (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ),
            )}
            {FOOTER_EXTRA.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="footer-col" id="contact-details">
          <p className="footer-heading">Contact</p>
          <p className="muted footer-address">{VILLAGE_ADDRESS_LINE}</p>
          <a
            className="footer-map-link"
            href={VILLAGE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Google Maps
          </a>
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
