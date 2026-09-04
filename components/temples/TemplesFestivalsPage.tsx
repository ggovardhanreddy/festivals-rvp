import Link from "next/link";
import { FestivalCalendar } from "@/components/home/FestivalCalendar";
import { Reveal } from "@/components/Reveal";
import { MediaImage } from "@/components/media/MediaImage";
import { ProtectedMedia } from "@/components/media/ProtectedMedia";
import { withBase } from "@/lib/base";
import { daysUntil, eventPhase, formatEventDateRange } from "@/lib/dates";
import {
  CULTURE_FESTIVALS,
  festivalThumbPath,
  type CultureFestival,
} from "@/lib/festivals";
import { loadVillageHeritage } from "@/lib/village-heritage";
import { VILLAGE_MAPS_URL } from "@/lib/site";
import type { SiteEvent } from "@/lib/types";

const TEMPLE_PHOTOS: Record<string, string> = {
  "Sri Ramalayam": "/brand/rama-navami-hero.webp",
  "Sri Mathamma Temple": "/brand/mathamma-hero.webp",
  "Sri Devapatlamma Temple": "/brand/devapatlamma-hero.webp",
  "Sri Mulasthanamma Temple": "/brand/mulasthanamma.webp",
};

const TEMPLE_CELEBRATIONS: Record<string, string[]> = {
  "Sri Ramalayam": ["Sri Rama Navami", "Daily prayers", "Village gatherings"],
  "Sri Mathamma Temple": ["Mathamma Jathara", "Offerings and processions"],
  "Sri Devapatlamma Temple": ["Devapatlamma Jathara", "Festival prayers"],
  "Sri Shiva Temple": ["Remembered in village tradition"],
  "Sri Mulasthanamma Temple": ["Village worship and seasonal prayers"],
};

const TEMPLE_LOCATION: Record<string, string> = {
  "Sri Ramalayam": "Heart of Reddivaripalli",
  "Sri Mathamma Temple": "Reddivaripalli",
  "Sri Devapatlamma Temple": "Devapatla — closely tied to Reddivaripalli",
  "Sri Shiva Temple": "Reddivaripalli (historic site)",
  "Sri Mulasthanamma Temple": "Reddivaripalli",
};

function festivalForName(name: string): CultureFestival | undefined {
  const n = name.toLowerCase().replace("sankranthi", "sankranti");
  return CULTURE_FESTIVALS.find((f) => {
    const title = f.title.toLowerCase();
    return n === title || n.includes(title) || title.includes(n);
  });
}

export function TemplesFestivalsPage({
  upcoming,
  liveSlugs,
  festivals = [],
}: {
  upcoming: SiteEvent[];
  liveSlugs: string[];
  festivals?: SiteEvent[];
}) {
  const heritage = loadVillageHeritage();
  const live = new Set(liveSlugs);
  const nextFestivals = upcoming.filter(
    (event) => eventPhase(event.date, event.endDate) !== "completed",
  );

  return (
    <div className="temples-page">
      <Reveal className="section" id="temples">
        <div className="section-head">
          <div>
            <p className="eyebrow">Faith of the village</p>
            <h2>{heritage.temples.title}</h2>
            <p className="lede">{heritage.temples.lede}</p>
          </div>
        </div>
        <p className="muted">{heritage.temples.preservationIntro}</p>
        <div className="temple-card-grid">
          {heritage.temples.items.map((temple) => {
            const photo = TEMPLE_PHOTOS[temple.name];
            const celebrations = TEMPLE_CELEBRATIONS[temple.name] ?? [];
            return (
              <article key={temple.name} className="temple-card">
                {photo ? (
                  <div className="temple-card-photo">
                    <ProtectedMedia>
                      <img
                        src={withBase(photo)}
                        alt={temple.name}
                        width={640}
                        height={400}
                        loading="lazy"
                        draggable={false}
                      />
                    </ProtectedMedia>
                  </div>
                ) : (
                  <div className="temple-card-photo temple-card-photo--empty">
                    <span>Information not yet provided</span>
                  </div>
                )}
                <div className="temple-card-body">
                  <h3>{temple.name}</h3>
                  <p className="eyebrow">
                    {TEMPLE_LOCATION[temple.name] ?? "Reddivaripalli"}
                  </p>
                  <p className="muted">{temple.note}</p>
                  {celebrations.length ? (
                    <ul className="temple-traditions">
                      {celebrations.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  {temple.name === "Sri Ramalayam" ? (
                    <a
                      className="btn ghost"
                      href={VILLAGE_MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open location
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </Reveal>

      {festivals.length ? (
        <Reveal className="section" id="upcoming-festivals">
          <div className="section-head">
            <div>
              <p className="eyebrow">Village calendar</p>
              <h2>Festival calendar</h2>
              <p className="lede">
                Festivals and jatharas as they are celebrated in
                Reddivaripalli — not a general religious calendar.
              </p>
            </div>
          </div>
          <FestivalCalendar festivals={festivals} liveSlugs={liveSlugs} embedded />
        </Reveal>
      ) : nextFestivals.length ? (
        <Reveal className="section" id="upcoming-festivals">
          <div className="section-head">
            <div>
              <p className="eyebrow">Village calendar</p>
              <h2>Upcoming festivals</h2>
              <p className="lede">
                Dates and gatherings as they are known in Reddivaripalli this
                year.
              </p>
            </div>
          </div>
          <ul className="temple-upcoming-list">
            {nextFestivals.map((event) => {
              const href =
                event.slug && live.has(event.slug)
                  ? `/${event.slug}/`
                  : "/gallery/";
              const days = daysUntil(event.date);
              return (
                <li key={event.id}>
                  <Link href={href} className="temple-upcoming-card">
                    <span className="temple-upcoming-date">
                      {formatEventDateRange(event.date, event.endDate)}
                    </span>
                    <strong>{event.title}</strong>
                    <span className="muted">
                      {days <= 0
                        ? "Today"
                        : days === 1
                          ? "Tomorrow"
                          : `In ${days} days`}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Reveal>
      ) : null}

      <Reveal className="section" id="festivals">
        <div className="section-head">
          <div>
            <p className="eyebrow">Celebrated together</p>
            <h2>{heritage.festivals.title}</h2>
            <p className="lede">{heritage.festivals.lede}</p>
          </div>
        </div>
        <div className="festival-card-grid">
          {heritage.festivals.items.map((item) => {
            const fest = festivalForName(item.name);
            const href = fest ? `/${fest.slug}/` : "/gallery/";
            const photo = fest
              ? festivalThumbPath(fest.folder)
              : "/brand/village-aerial.webp";
            return (
              <article key={item.name} className="festival-card">
                <Link href={href} className="festival-card-link">
                  <MediaImage
                    src={photo}
                    alt={`${item.name} in Reddivaripalli`}
                    width={640}
                    height={360}
                    loading="lazy"
                  />
                  <div>
                    <h3>{item.name}</h3>
                    <p className="muted">{item.note}</p>
                    {fest ? (
                      <span className="festival-card-cta">
                        Previous celebrations →
                      </span>
                    ) : null}
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </Reveal>

      <Reveal className="section" id="traditions">
        <div className="section-head">
          <div>
            <p className="eyebrow">Village practices</p>
            <h2>{heritage.culturalEvents.title}</h2>
            <p className="lede">{heritage.culturalEvents.lede}</p>
          </div>
        </div>
        <div className="village-heritage-list-grid">
          {heritage.culturalEvents.items.map((item) => (
            <article key={item.name} className="village-heritage-panel">
              <h3>{item.name}</h3>
              <p className="muted">{item.note}</p>
            </article>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
