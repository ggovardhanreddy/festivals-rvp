import {
  VILLAGE_ADDRESS,
  VILLAGE_ADDRESS_LINE,
  VILLAGE_MAPS_EMBED,
  VILLAGE_MAPS_URL,
  VILLAGE_NAME,
  VILLAGE_ALSO_KNOWN_AS,
  SITE_NAME,
} from "@/lib/site";
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
              Reach {SITE_NAME} in {VILLAGE_NAME} ({VILLAGE_ALSO_KNOWN_AS}).
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
