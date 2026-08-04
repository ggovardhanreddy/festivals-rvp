"use client";

import Link from "next/link";
import { withBase } from "@/lib/base";
import { daysUntil, formatCountdown } from "@/lib/dates";
import type { Member, SiteEvent } from "@/lib/types";
import { TeluguCalendar } from "@/components/events/TeluguCalendar";

export function EventsCalendar({
  upcoming,
  archive,
  liveSlugs = [],
  members = [],
  showBirthdays = true,
  showEvents = true,
  calendarOnly = false,
  emphasizeBirthdays = false,
  calendarEyebrow = "Telugu calendar",
  calendarTitle,
  calendarLede = "Tap a date for Tithi, Nakshatra, Rahu Kalam, Yama Gandam, and birthdays.",
}: {
  upcoming: SiteEvent[];
  archive: SiteEvent[];
  liveSlugs?: string[];
  members?: Member[];
  showBirthdays?: boolean;
  showEvents?: boolean;
  calendarOnly?: boolean;
  emphasizeBirthdays?: boolean;
  calendarEyebrow?: string;
  calendarTitle?: string;
  calendarLede?: string;
}) {
  const live = new Set(liveSlugs);

  return (
    <div className="events-module">
      {!calendarOnly ? (
        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Next up</p>
              <h2>Upcoming events</h2>
            </div>
          </div>
          <div className="event-cards">
            {upcoming.length ? (
              upcoming.map((event) => {
                const days = daysUntil(event.date);
                return (
                  <article
                    key={event.id}
                    className="event-card event-card--featured"
                  >
                    {event.image ? (
                      <div className="event-card-media">
                        <img
                          src={withBase(event.image)}
                          alt=""
                          width={800}
                          height={450}
                          loading="lazy"
                        />
                      </div>
                    ) : null}
                    <div className="event-card-body">
                      <p className="eyebrow">{formatCountdown(days)}</p>
                      <h3>{event.title}</h3>
                      <p className="muted">
                        {event.date}
                        {event.endDate && event.endDate !== event.date
                          ? ` – ${event.endDate}`
                          : ""}
                      </p>
                      <p className="lede">{event.description}</p>
                      {event.slug && live.has(event.slug) ? (
                        <Link className="btn" href={`/${event.slug}/`}>
                          View gallery
                        </Link>
                      ) : null}
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="muted">No upcoming events on the calendar yet.</p>
            )}
          </div>
        </section>
      ) : null}

      <TeluguCalendar
        upcoming={upcoming}
        archive={archive}
        members={members}
        liveSlugs={liveSlugs}
        showBirthdays={showBirthdays}
        showEvents={showEvents}
        emphasizeBirthdays={emphasizeBirthdays}
        eyebrow={calendarEyebrow}
        title={calendarTitle}
        lede={calendarLede}
      />

      {!calendarOnly && archive.length ? (
        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Archive</p>
              <h2>Past events</h2>
            </div>
          </div>
          <ul className="event-archive">
            {archive.map((event) => (
              <li key={event.id}>
                <span className="muted">{event.date}</span>
                <strong>{event.title}</strong>
                {event.slug && live.has(event.slug) ? (
                  <Link href={`/${event.slug}/`}>Gallery</Link>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
