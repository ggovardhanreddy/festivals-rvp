"use client";

import Link from "next/link";
import { withBase } from "@/lib/base";
import { daysUntil, eventPhase, formatEventDateRange } from "@/lib/dates";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { festivalCardImage } from "@/lib/festivals";
import type { SiteEvent } from "@/lib/types";

const FALLBACK_IMAGE = "/logo/logo-mark.webp";

/**
 * The next three events, and nothing else.
 *
 * Anything whose last day has already passed in Asia/Kolkata is filtered out
 * here as well as in upcomingEvents(), so a festival that was celebrated last
 * week can never reappear with a positive countdown. The full festival
 * calendar lives on /temples/.
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
  const { t, lang } = useUiLang();
  const tag = LOCALE_TAG[lang];

  /** Countdown wording, translated. Never derived from colour alone. */
  const statusLabel = (date: string, endDate?: string | null) => {
    const phase = eventPhase(date, endDate);
    if (phase === "completed") return t("common.completed");
    if (phase === "today") return t("common.today");
    const days = daysUntil(date);
    if (days === 1) return t("common.tomorrow");
    return t("common.inDays", undefined, { days });
  };

  const live = new Set(liveSlugs);
  const upcoming = events
    .filter((event) => eventPhase(event.date, event.endDate) !== "completed")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);

  return (
    <section className="home-panel home-events" aria-labelledby="home-events-heading">
      <p className="eyebrow">{t("home.eyebrow.villageCalendar")}</p>
      <h2 id="home-events-heading">{t("home.upcomingEvents")}</h2>

      {upcoming.length ? (
        <ul className="home-event-list">
          {upcoming.map((event) => {
            const phase = eventPhase(event.date, event.endDate);
            const href =
              event.slug && live.has(event.slug) ? `/${event.slug}/` : "/temples/";
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
                    <span className="home-event-name">
                      {(lang === "te" && event.titleTe) || event.title}
                    </span>
                    <span className="home-event-date muted">
                      {formatEventDateRange(event.date, event.endDate, tag)}
                    </span>
                  </span>
                  <span className="home-event-status" data-phase={phase}>
                    {statusLabel(event.date, event.endDate)}
                    <span className="sr-only">
                      {" — "}
                      {phase === "today"
                        ? t("home.events.srToday")
                        : t("home.events.srInDays", undefined, {
                            days: daysUntil(event.date),
                          })}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="home-empty">{t("home.events.empty")}</p>
      )}

      <div className="home-panel-actions">
        <Link className="btn ghost" href="/temples/#upcoming-festivals">
          {t("home.viewCalendar")} <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
