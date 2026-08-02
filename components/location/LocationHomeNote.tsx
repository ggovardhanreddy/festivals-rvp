"use client";

import { LocationBadge } from "./LocationBadge";
import { useLocation } from "./LocationProvider";

/** Homepage personalization strip — only when location is granted. */
export function LocationHomeNote() {
  const { preference, location } = useLocation();
  if (preference !== "granted" || !location) return null;

  return (
    <div className="location-home-note" id="overview-location">
      <LocationBadge />
      {location.relation === "at-village" || location.relation === "nearby" ? (
        <p className="muted">
          Welcome home — upcoming festivals and the gallery are tuned for visitors
          near the village.
        </p>
      ) : (
        <p className="muted">
          Wherever you are, Reddivaripalli memories stay one tap away. Countdowns
          use your local time.
        </p>
      )}
    </div>
  );
}
