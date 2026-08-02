"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { useLocation } from "./LocationProvider";
import { relationLabel } from "@/lib/location";

/** Subtle indicator when a cached location is personalizing the page. */
export function LocationBadge({ className = "" }: { className?: string }) {
  const { preference, location, status } = useLocation();

  if (preference !== "granted" || !location || status === "requesting") {
    return null;
  }

  return (
    <p className={`location-badge ${className}`.trim()} role="status">
      <MapPin size={14} strokeWidth={2} aria-hidden />
      <span>{relationLabel(location)}</span>
      <Link href="/settings/#location">Settings</Link>
    </p>
  );
}
