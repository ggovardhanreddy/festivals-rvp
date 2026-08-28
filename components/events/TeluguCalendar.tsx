"use client";

import { useMemo, useState } from "react";
import type { Member, SiteEvent } from "@/lib/types";
import { dobMonthDay } from "@/lib/dates";
import {
  getMonthPanchangam,
  type DayPanchangam,
} from "@/lib/telugu-panchangam";
import { VARA_TE_SHORT, WEEKDAYS_EN } from "@/lib/telugu-calendar-labels";
import { DayPanchangPanel } from "@/components/events/DayPanchangPanel";

export function TeluguCalendar({
  upcoming = [],
  archive = [],
  members = [],
  liveSlugs = [],
  showBirthdays = true,
  showEvents = true,
  emphasizeBirthdays = false,
  eyebrow = "Telugu calendar",
  title,
  lede = "Tap a date for Tithi, Nakshatra, Rahu Kalam, Yama Gandam, and birthdays.",
}: {
  upcoming?: SiteEvent[];
  archive?: SiteEvent[];
  members?: Member[];
  liveSlugs?: string[];
  showBirthdays?: boolean;
  showEvents?: boolean;
  emphasizeBirthdays?: boolean;
  eyebrow?: string;
  title?: string;
  lede?: string;
}) {
  const now = new Date();
  const [cursor, setCursor] = useState(
    () => new Date(now.getFullYear(), now.getMonth(), 1),
  );
  const [selectedDay, setSelectedDay] = useState<number>(now.getDate());

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  const monthLabel = cursor.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  const panchangByDay = useMemo(
    () => getMonthPanchangam(year, month),
    [year, month],
  );

  // Keep selection valid when month changes
  const selected =
    selectedDay >= 1 && selectedDay <= new Date(year, month + 1, 0).getDate()
      ? selectedDay
      : 1;

  const selectedPanchang: DayPanchangam | null =
    panchangByDay.get(selected) || null;

  const eventsByDay = useMemo(() => {
    const map = new Map<number, SiteEvent[]>();
    if (!showEvents) return map;
    for (const event of [...upcoming, ...archive]) {
      const d = new Date(event.date + "T12:00:00");
      if (d.getFullYear() !== year || d.getMonth() !== month) continue;
      const day = d.getDate();
      const list = map.get(day) || [];
      list.push(event);
      map.set(day, list);
    }
    return map;
  }, [upcoming, archive, year, month, showEvents]);

  const birthdaysByDay = useMemo(() => {
    const map = new Map<number, Member[]>();
    if (!showBirthdays) return map;
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
  }, [members, month, showBirthdays]);

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const masaHint = selectedPanchang?.masaTe || "";

  function goMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setCursor(next);
    const today = new Date();
    if (
      next.getFullYear() === today.getFullYear() &&
      next.getMonth() === today.getMonth()
    ) {
      setSelectedDay(today.getDate());
    } else {
      setSelectedDay(1);
    }
  }

  return (
    <section className="section telugu-calendar">
      <div className="section-head">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title || monthLabel}</h2>
          <p className="lede muted">
            {lede}
            {masaHint ? ` · ${masaHint}` : ""}
          </p>
          <p className="muted telugu-calendar-place">
            Reddivaripalli · IST · Panchangam
          </p>
        </div>
        <div className="calendar-nav">
          <button
            type="button"
            className="btn ghost"
            onClick={() => goMonth(-1)}
          >
            Previous
          </button>
          <button type="button" className="btn ghost" onClick={() => goMonth(1)}>
            Next
          </button>
        </div>
      </div>

      <div
        className="telugu-calendar-grid"
        role="grid"
        aria-label={`${monthLabel} Telugu calendar`}
      >
        {WEEKDAYS_EN.map((en) => (
          <div key={en} className="telugu-calendar-dow" role="columnheader">
            <span>{VARA_TE_SHORT[en]}</span>
            <span className="muted">{en.slice(0, 3)}</span>
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day) {
            return (
              <div
                key={`e-${year}-${month}-${i}`}
                className="telugu-calendar-cell"
                data-empty
                aria-hidden
              />
            );
          }
          const p = panchangByDay.get(day);
          const events = eventsByDay.get(day) || [];
          const bdays = birthdaysByDay.get(day) || [];
          const isToday = `${year}-${month}-${day}` === todayKey;
          const isSelected = day === selected;
          return (
            <button
              key={`${year}-${month}-${day}`}
              type="button"
              role="gridcell"
              className="telugu-calendar-cell"
              data-today={isToday || undefined}
              data-selected={isSelected || undefined}
              data-has-birthday={bdays.length ? true : undefined}
              data-has-event={events.length ? true : undefined}
              aria-selected={isSelected}
              aria-label={`${day} ${monthLabel}${p ? `, ${p.tithiEn}, ${p.nakshatraEn}` : ""}`}
              onClick={() => setSelectedDay(day)}
            >
              <span className="telugu-calendar-daynum">{day}</span>
              {p ? (
                <>
                  <span className="telugu-calendar-tithi">{p.tithiShortTe}</span>
                  <span className="telugu-calendar-nak">{p.nakshatraShortTe}</span>
                </>
              ) : null}
              {bdays.length || events.length ? (
                <span className="telugu-calendar-marks" aria-hidden>
                  {bdays.length ? (
                    <span className="telugu-calendar-mark telugu-calendar-mark--bday">
                      {bdays.length > 1 ? `${bdays.length}★` : "★"}
                    </span>
                  ) : null}
                  {events.length ? (
                    <span className="telugu-calendar-mark telugu-calendar-mark--event">
                      •
                    </span>
                  ) : null}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {selectedPanchang ? (
        <DayPanchangPanel
          panchang={selectedPanchang}
          birthdays={birthdaysByDay.get(selected) || []}
          events={eventsByDay.get(selected) || []}
          liveSlugs={liveSlugs}
          emphasizeBirthdays={emphasizeBirthdays}
        />
      ) : (
        <p className="muted">Panchangam unavailable for this date.</p>
      )}
    </section>
  );
}
