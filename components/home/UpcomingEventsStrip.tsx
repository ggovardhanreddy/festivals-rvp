"use client";

import Link from "next/link";
import { withBase } from "@/lib/base";
import { daysUntil, formatCountdown } from "@/lib/dates";
import { festivalCardImage } from "@/lib/festivals";
import type { SiteEvent } from "@/lib/types";

const FALLBACK_IMAGE = "/brand/village-aerial.webp";

export function UpcomingEventsStrip({
  events,
  liveSlugs = [],
}: {
  events: SiteEvent[];
  liveSlugs?: string[];
}) {
  if (!events.length) return null;
  const live = new Set(liveSlugs);

  return (
    <section className="section home-events" id="upcoming-events">
      <div className="section-head">
        <div>
          <p className="eyebrow">Coming soon</p>
          <h2>Upcoming events</h2>
          <p className="lede">The next five celebrations on the village calendar.</p>
        </div>
        <Link className="btn ghost" href="/events/">
          Full calendar
        </Link>
      </div>
      <div className="event-cards event-cards--clickable">
        {events.slice(0, 5).map((event) => {
          const days = daysUntil(event.date);
          const href = event.slug
            ? live.has(event.slug)
              ? `/${event.slug}/`
              : `/events/`
            : "/events/";
          return (
            <Link key={event.id} href={href} className="event-card event-card--link">
              <div className="event-card-media">
                <img
                  src={withBase(
                    festivalCardImage(event.image) || FALLBACK_IMAGE,
                  )}
                  alt={`${event.title} — Reddivaripalli`}
                  width={640}
                  height={360}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.src = withBase(FALLBACK_IMAGE);
                  }}
                />
              </div>
              <div className="event-card-body">
                <p className="eyebrow">{formatCountdown(days)}</p>
                <h3>{event.title}</h3>
                <p className="muted">{event.date}</p>
                <p className="lede">{event.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
