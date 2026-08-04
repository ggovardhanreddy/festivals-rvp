import Link from "next/link";
import type { Member, SiteEvent } from "@/lib/types";
import type { DayPanchangam } from "@/lib/telugu-panchangam";
import { withBase } from "@/lib/base";

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
          <h4>Birthdays</h4>
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
            <p className="muted">No birthdays on file for this day.</p>
          )}
          <Link className="btn ghost" href="/events/?tab=birthdays">
            Birthday wishes
          </Link>
        </section>

        <section>
          <h4>Village events</h4>
          {events.length ? (
            <ul className="day-panchang-events">
              {events.map((e) => (
                <li key={e.id}>
                  <strong>{e.title}</strong>
                  {e.slug && live.has(e.slug) ? (
                    <Link href={`/${e.slug}/`}>Gallery</Link>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No village events listed for this day.</p>
          )}
        </section>
      </div>
    </article>
  );
}
