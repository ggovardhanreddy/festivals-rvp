import Link from "next/link";
import {
  OFFICIAL_TITLE,
  SITE_CONTACT_EMAIL,
  SITE_NAME,
  VILLAGE_ADDRESS_LINE,
  VILLAGE_ALSO_KNOWN_AS,
  VILLAGE_NAME,
} from "@/lib/site";

const inbox = SITE_CONTACT_EMAIL || "reddivaripalli.rvp@gmail.com";

export function PrivacyPage() {
  return (
    <main className="page">
      <div className="section legal-page">
        <p className="eyebrow">{OFFICIAL_TITLE}</p>
        <h1>Privacy Policy</h1>
        <p className="lede">
          How {SITE_NAME} handles personal information on the{" "}
          {VILLAGE_ALSO_KNOWN_AS} ({VILLAGE_NAME}) digital home.
        </p>
        <p className="muted">Last updated: August 2026</p>

        <div className="legal-body">
          <h2>Who we are</h2>
          <p>
            This website is the official digital identity of {OFFICIAL_TITLE},
            stewarded by {SITE_NAME}. Contact:{" "}
            <a href={`mailto:${inbox}`}>{inbox}</a>. Address:{" "}
            {VILLAGE_ADDRESS_LINE}.
          </p>

          <h2>Information we publish</h2>
          <p>
            Community pages may show member names, photos, nicknames,
            professions, blood group (when provided), and birthday month/day for
            celebrations. Directory listings may include doctors, teachers, and
            public servants who consent to appear. Festival galleries and
            heritage archives show community photographs and videos.
          </p>

          <h2>Information we collect</h2>
          <ul>
            <li>
              <strong>Contact form</strong> — opens your email app; messages are
              sent to {inbox}. We do not store form submissions on this server.
            </li>
            <li>
              <strong>Optional location</strong> — only if you enable it in
              Settings, used to show approximate distance to the village. Never
              required.
            </li>
            <li>
              <strong>Usage analytics</strong> — anonymous page views and device
              class (mobile/desktop) to improve the site. Error reports may
              include a short technical message if something breaks.
            </li>
            <li>
              <strong>Accounts</strong> — Super Admin and Fun Fest member logins
              use secure cookies. Passwords are never stored in plain text.
            </li>
          </ul>

          <h2>Photos and birthdays</h2>
          <p>
            Member photos and celebration dates are published for community
            recognition. To update or remove your listing, email{" "}
            <a href={`mailto:${inbox}`}>{inbox}</a> or contact {SITE_NAME}{" "}
            stewards in the village.
          </p>

          <h2>Cookies and local storage</h2>
          <p>
            We use cookies for authenticated sessions and local storage for
            theme, music, and preference settings on your device. You can clear
            these in your browser or via Settings.
          </p>

          <h2>Third parties</h2>
          <p>
            Maps may load from Google Maps. Media may be served from Cloudflare
            R2. Optional Plausible analytics loads only when configured. We do
            not sell personal data.
          </p>

          <h2>Children</h2>
          <p>
            Birthday and gallery content may include minors within a closed
            village community context. We do not knowingly collect contact
            details from children through this site.
          </p>

          <h2>Your choices</h2>
          <p>
            Request correction or removal of your directory/member data by
            emailing <a href={`mailto:${inbox}`}>{inbox}</a>. See also our{" "}
            <Link href="/terms/">Terms of Use</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}

export function TermsPage() {
  return (
    <main className="page">
      <div className="section legal-page">
        <p className="eyebrow">{OFFICIAL_TITLE}</p>
        <h1>Terms of Use</h1>
        <p className="lede">
          Ground rules for using the {VILLAGE_ALSO_KNOWN_AS} community website.
        </p>
        <p className="muted">Last updated: August 2026</p>

        <div className="legal-body">
          <h2>Purpose</h2>
          <p>
            This site preserves festivals, people, projects, and history of{" "}
            {VILLAGE_ALSO_KNOWN_AS} ({VILLAGE_NAME}) for the community. It is
            stewarded by {SITE_NAME} on behalf of {OFFICIAL_TITLE}.
          </p>

          <h2>Acceptable use</h2>
          <ul>
            <li>Do not attempt to break into admin or member accounts.</li>
            <li>
              Do not upload unlawful, harassing, or non-consensual content via
              community features.
            </li>
            <li>
              Do not scrape or republish private member details or Fun Fest
              media outside the community without permission.
            </li>
          </ul>

          <h2>Content ownership</h2>
          <p>
            Festival photos, heritage materials, and member portraits remain the
            property of their contributors and the village community.{" "}
            {SITE_NAME} may display them for archival and celebration purposes.
            Official notices may reflect Gram Panchayat communications.
          </p>

          <h2>No professional advice</h2>
          <p>
            Directory listings and developments are community information, not
            medical, legal, or government guarantees. Verify important services
            directly with the provider or office.
          </p>

          <h2>Availability</h2>
          <p>
            The site is provided as-is. Outages, incomplete archives, or delayed
            updates may occur. Offline/PWA caching may show older pages until you
            reconnect.
          </p>

          <h2>Accounts</h2>
          <p>
            Fun Fest and Super Admin access are for authorized community members
            only. Keep credentials private. We may revoke access for misuse.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms:{" "}
            <a href={`mailto:${inbox}`}>{inbox}</a>. Privacy details:{" "}
            <Link href="/privacy/">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
