"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Member, SiteEvent } from "@/lib/types";
import { EventsCalendar } from "@/components/events/EventsCalendar";
import { TodayBirthdays } from "@/components/home/TodayBirthdays";
import { UpcomingBirthdays } from "@/components/home/UpcomingBirthdays";
import { dobMonthDay, monthDay } from "@/lib/dates";

type Tab = "events" | "birthdays";

export function EventsBirthdaysHub({
  upcoming,
  archive,
  liveSlugs = [],
  members = [],
  initialTab = "events",
}: {
  upcoming: SiteEvent[];
  archive: SiteEvent[];
  liveSlugs?: string[];
  members?: Member[];
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [todayMembers, setTodayMembers] = useState<Member[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("tab");
    if (fromQuery === "birthdays" || fromQuery === "events") {
      setTab(fromQuery);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const key = monthDay(new Date());
      setTodayMembers(members.filter((m) => dobMonthDay(m.dob) === key));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [members]);

  function selectTab(next: Tab) {
    setTab(next);
    const url = new URL(window.location.href);
    if (next === "events") url.searchParams.delete("tab");
    else url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }

  return (
    <div className="events-birthdays-hub">
      <div className="section events-birthdays-tabs-wrap">
        <div
          className="events-birthdays-tabs"
          role="tablist"
          aria-label="Events and birthdays"
        >
          <button
            type="button"
            role="tab"
            className="filter-chip"
            aria-selected={tab === "events"}
            data-active={tab === "events" || undefined}
            onClick={() => selectTab("events")}
          >
            Events
          </button>
          <button
            type="button"
            role="tab"
            className="filter-chip"
            aria-selected={tab === "birthdays"}
            data-active={tab === "birthdays" || undefined}
            onClick={() => selectTab("birthdays")}
          >
            Birthdays
          </button>
        </div>
      </div>

      {tab === "events" ? (
        <div role="tabpanel" aria-label="Events">
          <EventsCalendar
            upcoming={upcoming}
            archive={archive}
            liveSlugs={liveSlugs}
            members={members}
            showBirthdays
            showEvents
            calendarEyebrow="Telugu calendar"
            calendarLede="Tap a date for Tithi, Nakshatra, Rahu Kalam, Yama Gandam, festivals, and birthdays."
          />
        </div>
      ) : (
        <div role="tabpanel" aria-label="Birthdays">
          <TodayBirthdays members={todayMembers} />
          <UpcomingBirthdays members={members} />
          <EventsCalendar
            upcoming={upcoming}
            archive={archive}
            liveSlugs={liveSlugs}
            members={members}
            showBirthdays
            showEvents
            calendarOnly
            emphasizeBirthdays
            calendarEyebrow="Birthday · Telugu calendar"
            calendarTitle="When we celebrate"
            calendarLede="Member birthdays with Tithi, Nakshatra, Rahu Kalam, and Yama Gandam — tap a date for details."
          />
          <section className="section" id="birthday-wishes">
            <div className="section-head">
              <div>
                <p className="eyebrow">Celebrate</p>
                <h2>Birthday wishes</h2>
                <p className="lede">
                  Share a smile with the birthday gallery — candles, laughter,
                  and the warmth of another year together.
                </p>
              </div>
              <Link className="btn" href="/rvp-birthdays/">
                Open birthday gallery
              </Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
