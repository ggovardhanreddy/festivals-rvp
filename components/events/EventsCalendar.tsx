"use client";

import Link from "next/link";
import { withBase } from "@/lib/base";
import { eventStatusLabel, formatEventDateRange } from "@/lib/dates";
import type { Member, SiteEvent } from "@/lib/types";
import { TeluguCalendar } from "@/components/events/TeluguCalendar";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { LOCALE_TAG } from "@/lib/i18n/config";

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
  const { t, lang } = useUiLang();
  const tag = LOCALE_TAG[lang];
  const live = new Set(liveSlugs);

  return (
    <div className="events-module">
      {!calendarOnly ? (
        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">{t("events.nextUp")}</p>
              <h2>{t("events.upcoming")}</h2>
            </div>
          </div>
          <div className="event-cards">
            {upcoming.length ? (
              upcoming.map((event) => {
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
                      <p className="eyebrow">
                        {eventStatusLabel(event.date, event.endDate)}
                      </p>
                      <h3>{(lang === "te" && event.titleTe) || event.title}</h3>
                      <p className="muted">
                        {formatEventDateRange(event.date, event.endDate, tag)}
                      </p>
                      <p className="lede">{event.description}</p>
                      {event.slug && live.has(event.slug) ? (
                        <Link className="btn" href={`/${event.slug}/`}>
                          {t("events.viewGallery")}
                        </Link>
                      ) : null}
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="muted">{t("events.none")}</p>
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
              <p className="eyebrow">{t("events.archive")}</p>
              <h2>{t("events.past")}</h2>
            </div>
          </div>
          <ul className="event-archive">
            {archive.map((event) => (
              <li key={event.id}>
                <span className="muted">{formatEventDateRange(event.date, event.endDate, tag)}</span>
                <strong>{(lang === "te" && event.titleTe) || event.title}</strong>
                {event.slug && live.has(event.slug) ? (
                  <Link href={`/${event.slug}/`}>{t("events.gallery")}</Link>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
