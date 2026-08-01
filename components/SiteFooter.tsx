import Link from "next/link";
import { Logo } from "./Logo";
import {
  SITE_NAME,
  SITE_TAGLINE,
  VILLAGE_ADDRESS_LINE,
  VILLAGE_NAME,
} from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <Logo variant="auto" />
          <p className="muted" style={{ marginTop: "0.75rem", maxWidth: "42ch" }}>
            {SITE_NAME} — {SITE_TAGLINE} for {VILLAGE_NAME}. A private heritage
            archive of Sankranthi, Vinayaka Chavithi, birthdays, and journeys.
          </p>
          <p className="muted" style={{ marginTop: "0.5rem", maxWidth: "48ch", fontSize: "0.85rem" }}>
            {VILLAGE_ADDRESS_LINE}
          </p>
        </div>
        <div className="footer-links">
          <Link href="/sankranthi/">Sankranthi</Link>
          <Link href="/vinayaka-chavithi/">Vinayaka Chavithi</Link>
          <Link href="/rvp-birthdays/">RVP Birthdays</Link>
          <Link href="/fun-trips/">Fun Trips</Link>
          <Link href="/about/">About</Link>
        </div>
      </div>
    </footer>
  );
}
