"use client";

import { MapPin } from "lucide-react";
import { useLocation } from "./LocationProvider";
import { VILLAGE_ALSO_KNOWN_AS } from "@/lib/site";

export function LocationConsentDialog() {
  const { showConsent, acceptConsent, dismissConsent, status } = useLocation();

  if (!showConsent) return null;

  return (
    <div
      className="location-consent"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-consent-title"
    >
      <div className="location-consent-card">
        <div className="location-consent-icon" aria-hidden>
          <MapPin size={22} strokeWidth={1.75} />
        </div>
        <p className="eyebrow">Optional</p>
        <h2 id="location-consent-title">Share your approximate location?</h2>
        <p className="lede">
          We use it only on this device to show how far you are from{" "}
          {VILLAGE_ALSO_KNOWN_AS} and personalize local tips. Precise street-level
          location is never stored, and nothing is sent to third-party map
          services.
        </p>
        <ul className="location-consent-points">
          <li>You can change or clear this anytime in Settings</li>
          <li>Denying access never blocks the website</li>
        </ul>
        <div className="location-consent-actions">
          <button
            type="button"
            className="btn"
            onClick={acceptConsent}
            disabled={status === "requesting"}
          >
            {status === "requesting" ? "Requesting…" : "Allow location"}
          </button>
          <button type="button" className="btn ghost" onClick={dismissConsent}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
