"use client";

import Link from "next/link";
import { withBase } from "@/lib/base";
import {
  daysUntil,
  eventPhase,
  eventStatusLabel,
  formatEventDateRange,
} from "@/lib/dates";
import { festivalCardImage } from "@/lib/festivals";
import type { SiteEvent } from "@/lib/types";

const FALLBACK_IMAGE = "/logo/logo-mark.webp";

/**
 * The next three events, and nothing else.
 *
 * Anything whose last day has already passed in Asia/Kolkata is filtered out
 * here as well as in upcomingEvents(), so a festival that was celebrated last
 * week can never reappear with a positive countdown. The full festival
 * calendar, past events and the panchangam live on /events/.
 */
export function HomeUpcomingEvents({
  events,
  liveSlugs = [],
  limit = 3,
}: {
  events: SiteEvent[];
  liveSlugs?: string[];
  limit?: number;
}) {
  const live = new Set(liveSlugs);
  const upcoming = events
    .filter((event) => eventPhase(event.date, event.endDate) !== "completed")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);

  return (
    <section className="home-panel home-events" aria-labelledby="home-events-heading">
      <p className="eyebrow">Village calendar</p>
      <h2 id="home-events-heading">Upcoming Events</h2>

      {upcoming.length ? (
        <ul className="home-event-list">
          {upcoming.map((event) => {
            const phase = eventPhase(event.date, event.endDate);
            const href =
              event.slug && live.has(event.slug) ? `/${event.slug}/` : "/events/";
            return (
              <li key={event.id}>
                <Link className="home-event" href={href}>
                  <span className="home-event-media">
                    <img
                      src={withBase(
                        festivalCardImage(event.image) || FALLBACK_IMAGE,
                      )}
                      alt=""
                      width={160}
                      height={160}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.src = withBase(FALLBACK_IMAGE);
                      }}
                    />
                  </span>
                  <span className="home-event-body">
                    <span className="home-event-name">{event.title}</span>
                    <span className="home-event-date muted">
                      {formatEventDateRange(event.date, event.endDate)}
                    </span>
                  </span>
                  <span className="home-event-status" data-phase={phase}>
                    {eventStatusLabel(event.date, event.endDate)}
                    <span className="sr-only">
                      {phase === "today"
                        ? " — happening today"
                        : ` — in ${daysUntil(event.date)} days`}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="home-empty">
          No events are scheduled yet. The full calendar has every past
          celebration.
        </p>
      )}

      <div className="home-panel-actions">
        <Link className="btn ghost" href="/events/">
          View Calendar <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
