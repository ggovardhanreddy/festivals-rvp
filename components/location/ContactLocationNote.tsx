"use client";

import Link from "next/link";
import { useLocation } from "./LocationProvider";
import { relationLabel } from "@/lib/location";
import { VILLAGE_MAPS_URL } from "@/lib/site";

/** Contact page helper — distance + directions when location is allowed. */
export function ContactLocationNote() {
  const { preference, location, status } = useLocation();

  if (preference !== "granted" || !location) {
    return (
      <p className="muted contact-location-hint">
        Optional: allow approximate location in{" "}
        <Link href="/settings/#location">Settings</Link> to see your distance to
        the village. Never required.
      </p>
    );
  }

  const mapsFromYou = `${VILLAGE_MAPS_URL}`;

  return (
    <div className="contact-location-note" aria-live="polite">
      <p>
        <strong>Using your approximate location</strong> — {relationLabel(location)}
        {status === "requesting" ? " (updating…)" : ""}.
      </p>
      <p className="muted">
        Coords stored on this device only: {location.lat.toFixed(2)},{" "}
        {location.lng.toFixed(2)}.
      </p>
      <a
        className="btn ghost"
        href={mapsFromYou}
        target="_blank"
        rel="noopener noreferrer"
      >
        Directions to Ramalayam
      </a>
    </div>
  );
}
