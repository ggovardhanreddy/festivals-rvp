"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { withBase } from "@/lib/base";
import { daysUntil, dobMonthDay, formatCountdown } from "@/lib/dates";
import type { Member, SiteEvent } from "@/lib/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function EventsCalendar({
  upcoming,
  archive,
  liveSlugs = [],
  members = [],
}: {
  upcoming: SiteEvent[];
  archive: SiteEvent[];
  liveSlugs?: string[];
  members?: Member[];
}) {
  const live = new Set(liveSlugs);
  const now = new Date();
  const [cursor, setCursor] = useState(
    () => new Date(now.getFullYear(), now.getMonth(), 1),
  );

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const label = cursor.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  const byDay = useMemo(() => {
    const map = new Map<number, SiteEvent[]>();
    for (const event of [...upcoming, ...archive]) {
      const d = new Date(event.date + "T12:00:00");
      if (d.getFullYear() !== year || d.getMonth() !== month) continue;
      const day = d.getDate();
      const list = map.get(day) || [];
      list.push(event);
      map.set(day, list);
    }
    return map;
  }, [upcoming, archive, year, month]);

  const birthdaysByDay = useMemo(() => {
    const map = new Map<number, Member[]>();
    for (const member of members) {
      const md = dobMonthDay(member.dob);
      if (!md) continue;
      const [mm, dd] = md.split("-").map(Number);
      if ((mm || 1) - 1 !== month) continue;
      const day = dd || 1;
      const list = map.get(day) || [];
      list.push(member);
      map.set(day, list);
    }
    return map;
  }, [members, month]);

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="events-module">
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
                <article key={event.id} className="event-card event-card--featured">
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

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Calendar</p>
            <h2>{label}</h2>
            <p className="lede muted">
              Festivals and member birthdays (when dates are on file).
            </p>
          </div>
          <div className="calendar-nav">
            <button
              type="button"
              className="btn ghost"
              onClick={() => setCursor(new Date(year, month - 1, 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setCursor(new Date(year, month + 1, 1))}
            >
              Next
            </button>
          </div>
        </div>
        <div className="calendar-grid" role="grid" aria-label={label}>
          {WEEKDAYS.map((d) => (
            <div key={d} className="calendar-dow">
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            const events = day ? byDay.get(day) || [] : [];
            const bdays = day ? birthdaysByDay.get(day) || [] : [];
            const hasMark = events.length > 0 || bdays.length > 0;
            return (
              <div
                key={`${year}-${month}-${i}`}
                className="calendar-cell"
                data-empty={!day || undefined}
                data-has-event={hasMark || undefined}
                data-has-birthday={bdays.length ? true : undefined}
              >
                {day ? <span className="calendar-day">{day}</span> : null}
                {events.map((e) => (
                  <span key={e.id} className="calendar-event-dot" title={e.title}>
                    {e.title}
                  </span>
                ))}
                {bdays.map((m) => (
                  <span
                    key={m.id}
                    className="calendar-event-dot calendar-birthday-dot"
                    title={`${m.name} — Birthday`}
                  >
                    {m.name}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      {archive.length ? (
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
