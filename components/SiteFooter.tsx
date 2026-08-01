import Link from "next/link";
import { Logo } from "./Logo";
import {
  LANDING_BRAND_TAGLINES,
  SITE_NAME,
  VILLAGE_ADDRESS_LINE,
  VILLAGE_NAME,
} from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <Logo variant="auto" />
          {LANDING_BRAND_TAGLINES.map((line, i) => (
            <p
              key={line}
              className={`muted ${i === 0 ? "brand-tagline" : ""}`}
              style={{ marginTop: i === 0 ? "0.75rem" : "0.35rem", maxWidth: "42ch" }}
            >
              {line}
            </p>
          ))}
          <p className="muted" style={{ marginTop: "0.75rem", maxWidth: "48ch", fontSize: "0.85rem" }}>
            {SITE_NAME} · {VILLAGE_NAME}. Sankranthi, Vinayaka Chavithi, birthdays,
            and journeys.
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
