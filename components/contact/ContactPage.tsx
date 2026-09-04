import {
  SITE_CONTACT_EMAIL,
  VILLAGE_ADDRESS,
  VILLAGE_ADDRESS_LINE,
  VILLAGE_MAPS_EMBED,
  VILLAGE_MAPS_URL,
  VILLAGE_NAME,
} from "@/lib/site";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { ContactLocationNote } from "@/components/location/ContactLocationNote";
import { ContactForm } from "./ContactForm";

export function ContactPage() {
  return (
    <div className="contact-page">
      <Reveal className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Get in touch</p>
            <h1>Contact</h1>
            <p className="lede">
              Reach Reddivaripalli. Write to the village inbox, find us on the
              map, or share a suggestion.
            </p>
          </div>
        </div>

        <ContactLocationNote />

        <div className="contact-grid contact-grid--form">
          <ContactForm />

          <div className="contact-card">
            <h2>Village address</h2>
            <p className="muted">
              {VILLAGE_ADDRESS.village}
              <br />
              {VILLAGE_ADDRESS.post}
              <br />
              {VILLAGE_ADDRESS.mandal}
              <br />
              {VILLAGE_ADDRESS.district}, {VILLAGE_ADDRESS.state}
              <br />
              PIN {VILLAGE_ADDRESS.pincode}, {VILLAGE_ADDRESS.country}
            </p>
            <p className="muted" style={{ marginTop: "1rem" }}>
              {VILLAGE_ADDRESS_LINE}
            </p>
            <a
              className="btn"
              href={VILLAGE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginTop: "1.25rem" }}
            >
              Open in Google Maps
            </a>
            <a
              className="btn ghost"
              href={`mailto:${SITE_CONTACT_EMAIL}`}
              style={{ marginTop: "0.75rem" }}
            >
              {SITE_CONTACT_EMAIL}
            </a>
            <Link className="btn ghost" href="/suggestions/" style={{ marginTop: "0.75rem" }}>
              Share a suggestion
            </Link>
          </div>

          <div className="contact-card">
            <h2>Correct or remove personal information</h2>
            <p className="muted">
              If your name, photograph or other personal details appear on this
              site and you want them updated or removed, email the village
              inbox. Please include the name as it is shown and what should
              change. Village stewards will confirm the request before the next
              site update.
            </p>
            <a
              className="btn"
              href={`mailto:${SITE_CONTACT_EMAIL}?subject=${encodeURIComponent("Request to correct or remove personal information")}`}
              style={{ marginTop: "1.25rem" }}
            >
              Email a correction request
            </a>
            <Link className="btn ghost" href="/privacy/" style={{ marginTop: "0.75rem" }}>
              Privacy policy
            </Link>
          </div>

          <div className="contact-card contact-card--map">
            <h2>Ramalayam</h2>
            <div className="contact-map">
              <iframe
                title={`Map of Ramalayam, ${VILLAGE_NAME}`}
                src={VILLAGE_MAPS_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
