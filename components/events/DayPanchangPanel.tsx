"use client";

import Link from "next/link";
import type { Member, SiteEvent } from "@/lib/types";
import type { DayPanchangam } from "@/lib/telugu-panchangam";
import { withBase } from "@/lib/base";
import { useUiLang } from "@/components/i18n/LanguageProvider";

export function DayPanchangPanel({
  panchang,
  birthdays = [],
  events = [],
  liveSlugs = [],
  emphasizeBirthdays = false,
}: {
  panchang: DayPanchangam;
  birthdays?: Member[];
  events?: SiteEvent[];
  liveSlugs?: string[];
  emphasizeBirthdays?: boolean;
}) {
  const { t } = useUiLang();
  const live = new Set(liveSlugs);
  const dateLabel = new Date(
    panchang.year,
    panchang.month,
    panchang.day,
  ).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article
      className="day-panchang-panel"
      aria-label={`Panchangam for ${dateLabel}`}
    >
      <header className="day-panchang-panel-head">
        <p className="eyebrow">Telugu calendar · తెలుగు పంచాంగం</p>
        <h3>{dateLabel}</h3>
        <p className="day-panchang-panel-sub">
          {panchang.weekdayTe}
          {panchang.masaTe ? ` · ${panchang.masaTe}` : ""}
          {panchang.pakshaTe ? ` · ${panchang.pakshaTe}` : ""}
        </p>
      </header>

      <dl className="day-panchang-grid">
        <div>
          <dt>తిథి / Tithi</dt>
          <dd>
            <strong>
              {panchang.tithiTe} ({panchang.tithiEn})
            </strong>
            {panchang.pakshaEn ? (
              <span className="muted"> · {panchang.pakshaEn} Paksha</span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt>నక్షత్రం / Nakshatra</dt>
          <dd>
            <strong>
              {panchang.nakshatraTe} ({panchang.nakshatraEn})
            </strong>
            {panchang.pada != null ? (
              <span className="muted"> · Pada {panchang.pada}</span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt>రాహు కాలం / Rahu Kalam</dt>
          <dd>
            <strong>{panchang.rahuKalam}</strong>
          </dd>
        </div>
        <div>
          <dt>యమగండం / Yama Gandam</dt>
          <dd>
            <strong>{panchang.yamaGandam}</strong>
          </dd>
        </div>
        <div>
          <dt>గులిక / Gulika</dt>
          <dd>
            <strong>{panchang.gulika}</strong>
          </dd>
        </div>
        <div>
          <dt>సూర్యోదయం–అస్తమయం / Sunrise–Sunset</dt>
          <dd>
            <strong>
              {panchang.sunrise} – {panchang.sunset}
            </strong>
          </dd>
        </div>
      </dl>

      <div
        className="day-panchang-side"
        data-emphasize-birthdays={emphasizeBirthdays || undefined}
      >
        <section>
          <h4>{t("events.birthdays")}</h4>
          {birthdays.length ? (
            <ul className="day-panchang-people">
              {birthdays.map((m) => (
                <li key={m.id}>
                  {m.photo ? (
                    <img
                      src={withBase(m.photo)}
                      alt=""
                      width={36}
                      height={36}
                      loading="lazy"
                    />
                  ) : (
                    <span className="member-avatar" aria-hidden>
                      {m.name
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((p) => p[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                  )}
                  <span>{m.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">{t("events.noBirthdaysToday")}</p>
          )}
          <Link className="btn ghost" href="/events/?tab=birthdays">
            {t("events.birthdayWishes")}
          </Link>
        </section>

        <section>
          <h4>{t("events.villageEvents")}</h4>
          {events.length ? (
            <ul className="day-panchang-events">
              {events.map((e) => (
                <li key={e.id}>
                  <strong>{e.title}</strong>
                  {e.slug && live.has(e.slug) ? (
                    <Link href={`/${e.slug}/`}>{t("events.gallery")}</Link>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">{t("events.noneToday")}</p>
          )}
        </section>
      </div>
    </article>
  );
}
