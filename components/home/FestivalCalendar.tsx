"use client";

import Link from "next/link";
import { withBase } from "@/lib/base";
import { daysUntil, formatCountdown } from "@/lib/dates";
import { festivalCardImage } from "@/lib/festivals";
import { Reveal } from "@/components/Reveal";
import type { SiteEvent } from "@/lib/types";
import { useUiLang } from "@/components/i18n/LanguageProvider";

const FALLBACK_IMAGE = "/brand/village-aerial.webp";

export function FestivalCalendar({
  festivals,
  liveSlugs = [],
  embedded = false,
}: {
  festivals: SiteEvent[];
  liveSlugs?: string[];
  /** When true, render only the grid — parent supplies the heading. */
  embedded?: boolean;
}) {
  const { t } = useUiLang();
  if (!festivals.length) return null;

  const live = new Set(liveSlugs);

  // One card per festival slug — prefer the next upcoming occurrence.
  const bySlug = new Map<string, SiteEvent>();
  for (const event of [...festivals].sort((a, b) =>
    a.date.localeCompare(b.date),
  )) {
    const key = event.slug || event.id;
    const existing = bySlug.get(key);
    if (!existing) {
      bySlug.set(key, event);
      continue;
    }
    const existingDays = daysUntil(existing.date);
    const nextDays = daysUntil(event.date);
    if (existingDays < 0 && nextDays >= 0) bySlug.set(key, event);
  }

  const withDays = [...bySlug.values()]
    .map((event) => ({ event, days: daysUntil(event.date) }))
    .sort((a, b) => {
      const aUpcoming = a.days >= 0 ? a.days : 10_000 + Math.abs(a.days);
      const bUpcoming = b.days >= 0 ? b.days : 10_000 + Math.abs(b.days);
      return aUpcoming - bUpcoming;
    });

  const nextId =
    withDays.find((item) => item.days >= 0)?.event.id || withDays[0]?.event.id;

  const grid = (
    <div className="festival-calendar-grid">
      {withDays.map(({ event, days }) => {
        const href = event.slug ? `/${event.slug}/` : "/temples/";
        const isNext = event.id === nextId;
        return (
          <Link
            key={event.id}
            href={href}
            className="festival-card"
            data-next={isNext || undefined}
          >
            <div className="festival-card-media">
              <img
                src={withBase(festivalCardImage(event.image) || FALLBACK_IMAGE)}
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
            <div className="festival-card-body">
              {isNext ? <p className="festival-card-badge">{t("home.nextUp")}</p> : null}
              <p className="eyebrow">{formatCountdown(days)}</p>
              <h3>{event.title}</h3>
              <p className="muted">{event.date}</p>
              <p className="lede">{event.description}</p>
              {event.slug && live.has(event.slug) ? (
                <span className="festival-card-link">{t("home.viewChapter")}</span>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );

  if (embedded) return grid;

  return (
    <Reveal className="section home-festivals" id="festivals">
      <div className="section-head">
        <div>
          <p className="eyebrow">{t("home.annualTraditions")}</p>
          <h2>{t("home.festivalCalendar")}</h2>
          <p className="lede">
            {t("home.recurringCelebrations")}
          </p>
        </div>
        <Link className="btn ghost" href="/temples/#upcoming-festivals">
          {t("home.templesFestivals")}
        </Link>
      </div>
      {grid}
    </Reveal>
  );
}
