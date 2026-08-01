import Link from "next/link";
import { Logo } from "./Logo";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <Logo />
          <p className="muted" style={{ marginTop: "0.75rem", maxWidth: "36ch" }}>
            {SITE_NAME} — {SITE_TAGLINE}. A private archive of Sankranthi,
            Vinayaka Chavithi, birthdays, and fun trips.
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
