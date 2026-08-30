"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Announcement } from "@/lib/types";
import { daysUntil, formatEventDate } from "@/lib/dates";
import { useLiveAnnouncements } from "@/lib/live-calendar";

/** Newest announcement that has actually been published. */
function pickLatest(list: Announcement[]): Announcement | null {
  const live = list
    .filter((a) => a.title && (!a.date || daysUntil(a.date) <= 0))
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return live.find((a) => a.important) ?? live[0] ?? null;
}

/**
 * A single band carrying the most recent village announcement.
 *
 * Reads the live announcement feed when one is mounted and falls back to the
 * build-time seed otherwise, so a new notice appears without a redeploy.
 * Renders nothing when there is no announcement — an empty band is better than
 * an invented one, and this component never writes copy of its own.
 */
export function VillageUpdate({ seed }: { seed: Announcement[] }) {
  const live = useLiveAnnouncements(seed);
  const announcement = useMemo(
    () => pickLatest(live.length ? live : seed),
    [live, seed],
  );

  if (!announcement) return null;
  const date = formatEventDate(announcement.date);

  return (
    <section className="village-update" aria-labelledby="village-update-heading">
      <div className="village-update-card">
        <div className="village-update-body">
          <p className="village-update-label">
            <span aria-hidden>📢</span> Village Update
          </p>
          <h2 className="village-update-title" id="village-update-heading">
            {announcement.title}
          </h2>
          {announcement.body ? (
            <p className="village-update-text">{announcement.body}</p>
          ) : null}
          {date ? <p className="village-update-date muted">{date}</p> : null}
        </div>
        {/* A notice can carry its own destination — the contact notice sends
            people to Contact rather than to a list of notices. Everything else
            falls back to the full list. */}
        <Link
          className="btn ghost village-update-cta"
          href={announcement.href || "/events/#updates"}
        >
          {announcement.cta || "View All Updates"} <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
