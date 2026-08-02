import Link from "next/link";
import { Logo } from "./Logo";
import {
  SITE_NAME,
  SITE_TAGLINE,
  VILLAGE_ADDRESS_LINE,
  VILLAGE_ALSO_KNOWN_AS,
  VILLAGE_MAPS_URL,
  VILLAGE_NAME,
} from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" id="contact">
      <div className="footer-inner footer-inner--minimal">
        <div className="footer-brand">
          <Logo variant="auto" />
          <p className="footer-village">
            {VILLAGE_NAME} ({VILLAGE_ALSO_KNOWN_AS})
          </p>
          <p className="muted footer-tagline">{SITE_TAGLINE}</p>
        </div>

        <div className="footer-col">
          <p className="footer-heading">Quick links</p>
          <div className="footer-links">
            <Link href="/">Home</Link>
            <Link href="/gallery/">Gallery</Link>
            <Link href="/events/">Events</Link>
            <Link href="/members/">Members</Link>
            <Link href="/contact/">Contact</Link>
            <Link href="/settings/">Settings</Link>
            <Link href="/fun-trips/">Fun Fest</Link>
            <Link href="/login/">Member sign in</Link>
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
          © {year} {SITE_NAME}. {VILLAGE_ALSO_KNOWN_AS} · {VILLAGE_NAME}.
        </p>
      </div>
    </footer>
  );
}
