"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Member, SiteEvent } from "@/lib/types";
import { EventsCalendar } from "@/components/events/EventsCalendar";
import { TodayBirthdays } from "@/components/home/TodayBirthdays";
import { UpcomingBirthdays } from "@/components/home/UpcomingBirthdays";
import { dobMonthDay, monthDay } from "@/lib/dates";
import { useLiveEvents } from "@/lib/live-calendar";
import { useUiLang } from "@/components/i18n/LanguageProvider";

type Tab = "events" | "birthdays";

function splitUpcomingArchive(events: SiteEvent[], from = new Date()) {
  const today = from.toISOString().slice(0, 10);
  const upcoming = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const archive = events
    .filter((e) => e.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));
  return { upcoming, archive };
}

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
  const { t } = useUiLang();
  const seed = useMemo(() => [...upcoming, ...archive], [upcoming, archive]);
  const liveEvents = useLiveEvents(seed);
  const liveSplit = useMemo(() => splitUpcomingArchive(liveEvents), [liveEvents]);
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
          aria-label={t("events.andBirthdays")}
        >
          <button
            type="button"
            role="tab"
            className="filter-chip"
            aria-selected={tab === "events"}
            data-active={tab === "events" || undefined}
            onClick={() => selectTab("events")}
          >
            {t("events.title")}
          </button>
          <button
            type="button"
            role="tab"
            className="filter-chip"
            aria-selected={tab === "birthdays"}
            data-active={tab === "birthdays" || undefined}
            onClick={() => selectTab("birthdays")}
          >
            {t("events.birthdays")}
          </button>
        </div>
      </div>

      {tab === "events" ? (
        <div role="tabpanel" aria-label={t("events.title")}>
          <EventsCalendar
            upcoming={liveSplit.upcoming}
            archive={liveSplit.archive}
            liveSlugs={liveSlugs}
            members={members}
            showBirthdays
            showEvents
            calendarEyebrow="Telugu calendar"
            calendarLede="Tap a date for Tithi, Nakshatra, Rahu Kalam, Yama Gandam, festivals, and birthdays."
          />
        </div>
      ) : (
        <div role="tabpanel" aria-label={t("events.birthdays")}>
          <TodayBirthdays members={todayMembers} />
          <UpcomingBirthdays members={members} />
          <EventsCalendar
            upcoming={liveSplit.upcoming}
            archive={liveSplit.archive}
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
                <p className="eyebrow">{t("events.celebrate")}</p>
                <h2>{t("events.birthdayWishes")}</h2>
                <p className="lede">
                  Share a smile with the birthday gallery — candles, laughter,
                  and the warmth of another year together.
                </p>
              </div>
              <Link className="btn" href="/rvp-birthdays/">
                {t("events.openBirthdayGallery")}
              </Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
