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
import { Reveal } from "@/components/Reveal";
import type { SiteEvent } from "@/lib/types";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { useVillageNow } from "@/lib/use-village-now";

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
  const { t, lang } = useUiLang();
  const tag = LOCALE_TAG[lang];
  const now = useVillageNow();
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
    const existingPhase = eventPhase(existing.date, existing.endDate, now);
    const nextPhase = eventPhase(event.date, event.endDate, now);
    if (existingPhase === "completed" && nextPhase !== "completed") bySlug.set(key, event);
  }

  const withStatus = [...bySlug.values()]
    .map((event) => ({
      event,
      days: daysUntil(event.date, now),
      phase: eventPhase(event.date, event.endDate, now),
    }))
    .sort((a, b) => {
      const aRank = a.phase === "today" ? -1 : a.phase === "upcoming" ? a.days : 10_000 + Math.abs(a.days);
      const bRank = b.phase === "today" ? -1 : b.phase === "upcoming" ? b.days : 10_000 + Math.abs(b.days);
      const aUpcoming = aRank;
      const bUpcoming = bRank;
      return aUpcoming - bUpcoming;
    });

  const nextId =
    withStatus.find((item) => item.phase !== "completed")?.event.id || withStatus[0]?.event.id;
  const hasUpcoming = withStatus.some((item) => item.phase !== "completed");

  const grid = (
    <div className="festival-calendar-grid">
      {withStatus.map(({ event, phase }) => {
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
              {isNext && hasUpcoming && phase !== "completed" ? (
                <p className="festival-card-badge">{t("home.nextUp")}</p>
              ) : null}
              <p className="eyebrow">{eventStatusLabel(event.date, event.endDate, now)}</p>
              <h3>{(lang === "te" && event.titleTe) || event.title}</h3>
              <p className="muted">{formatEventDateRange(event.date, event.endDate, tag)}</p>
              <p className="lede">{event.description}</p>
              {event.slug && live.has(event.slug) ? (
                <span className="festival-card-link">{t("home.viewChapter")}</span>
              ) : null}
              {phase === "completed" ? (
                <span className="sr-only">{` ${t("common.completed")}`}</span>
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
