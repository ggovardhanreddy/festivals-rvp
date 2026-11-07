"use client";

import Link from "next/link";
import { FestivalCalendar } from "@/components/home/FestivalCalendar";
import { Reveal } from "@/components/Reveal";
import { MediaImage } from "@/components/media/MediaImage";
import { ProtectedMedia } from "@/components/media/ProtectedMedia";
import { withBase } from "@/lib/base";
import { eventPhase } from "@/lib/dates";
import {
  CULTURE_FESTIVALS,
  festivalThumbPath,
  type CultureFestival,
} from "@/lib/festivals";
import { loadVillageHeritage } from "@/lib/village-heritage";
import { VILLAGE_MAPS_URL } from "@/lib/site";
import type { SiteEvent } from "@/lib/types";
import { useVillageNow } from "@/lib/use-village-now";

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
  locale = "en",
}: {
  upcoming: SiteEvent[];
  liveSlugs: string[];
  festivals?: SiteEvent[];
  locale?: "en" | "te";
}) {
  const isTe = locale === "te";
  const labels = {
    faithEyebrow: isTe ? "గ్రామ విశ్వాసం" : "Faith of the village",
    photoPending: isTe
      ? "నిజమైన ఆలయ ఫోటో లభించిన వెంటనే ఇక్కడ చూపిస్తాము"
      : "Authentic temple photograph will be added when available",
    openLocation: isTe ? "లొకేషన్ తెరవండి" : "Open location",
    villageCalendar: isTe ? "గ్రామ క్యాలెండర్" : "Village calendar",
    festivalCalendar: isTe ? "పండుగల క్యాలెండర్" : "Festival calendar",
    festivalLede: isTe
      ? "రెడ్డివారిపల్లిలో జరుపుకునే పండుగలు, జాతరల తేదీలు."
      : "Festivals and jatharas as they are celebrated in Reddivaripalli — not a general religious calendar.",
    upcomingOngoing: isTe ? "రానున్నవి & జరుగుతున్నవి" : "Upcoming & ongoing",
    completed: isTe ? "పూర్తైనవి" : "Completed",
    upcomingFestivals: isTe ? "రానున్న పండుగలు" : "Upcoming festivals",
    upcomingFestivalsLede: isTe
      ? "ఈ ఏడాది రెడ్డివారిపల్లిలో తెలిసిన పండుగ తేదీలు."
      : "Dates and gatherings as they are known in Reddivaripalli this year.",
    celebratedTogether: isTe ? "కలిసే జరుపుకుంటాం" : "Celebrated together",
    previousCelebrations: isTe ? "గత వేడుకల ఫోటోలు →" : "Previous celebrations →",
    villagePractices: isTe ? "గ్రామ ఆచారాలు" : "Village practices",
  };
  const heritage = loadVillageHeritage();
  const now = useVillageNow();
  const festivalEvents = festivals.filter((event) => event.category === "festival");
  const upcomingFestivals = festivalEvents
    .filter((event) => eventPhase(event.date, event.endDate, now) !== "completed")
    .sort((a, b) => a.date.localeCompare(b.date));
  const completedFestivals = festivalEvents
    .filter((event) => eventPhase(event.date, event.endDate, now) === "completed")
    .sort((a, b) => b.date.localeCompare(a.date));
  const nextFestivals = upcoming.filter(
    (event) =>
      event.category === "festival" &&
      eventPhase(event.date, event.endDate, now) !== "completed",
  );

  return (
    <div className="temples-page">
      <Reveal className="section" id="temples">
        <div className="section-head">
          <div>
            <p className="eyebrow">{labels.faithEyebrow}</p>
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
                    <img
                      src={withBase("/logo/logo-mark.webp")}
                      alt={`Authentic photo pending for ${temple.name}`}
                      width={220}
                      height={220}
                      loading="lazy"
                      decoding="async"
                    />
                    <span>{labels.photoPending}</span>
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
                      {labels.openLocation}
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </Reveal>

      {festivalEvents.length ? (
        <Reveal className="section" id="upcoming-festivals">
          <div className="section-head">
            <div>
              <p className="eyebrow">{labels.villageCalendar}</p>
              <h2>{labels.festivalCalendar}</h2>
              <p className="lede">{labels.festivalLede}</p>
            </div>
          </div>
          {upcomingFestivals.length ? (
            <>
              <p className="eyebrow">{labels.upcomingOngoing}</p>
              <FestivalCalendar festivals={upcomingFestivals} liveSlugs={liveSlugs} embedded />
            </>
          ) : null}
          {completedFestivals.length ? (
            <>
              <p className="eyebrow">{labels.completed}</p>
              <FestivalCalendar festivals={completedFestivals} liveSlugs={liveSlugs} embedded />
            </>
          ) : null}
        </Reveal>
      ) : nextFestivals.length ? (
        <Reveal className="section" id="upcoming-festivals">
          <div className="section-head">
            <div>
              <p className="eyebrow">{labels.villageCalendar}</p>
              <h2>{labels.upcomingFestivals}</h2>
              <p className="lede">{labels.upcomingFestivalsLede}</p>
            </div>
          </div>
          <FestivalCalendar festivals={nextFestivals} liveSlugs={liveSlugs} embedded />
        </Reveal>
      ) : null}

      <Reveal className="section" id="festivals">
        <div className="section-head">
          <div>
            <p className="eyebrow">{labels.celebratedTogether}</p>
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
                    fallback="/logo/logo-mark.webp"
                  />
                  <div>
                    <h3>{item.name}</h3>
                    <p className="muted">{item.note}</p>
                    {fest ? (
                      <span className="festival-card-cta">
                        {labels.previousCelebrations}
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
            <p className="eyebrow">{labels.villagePractices}</p>
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
