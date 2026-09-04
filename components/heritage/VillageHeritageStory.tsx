import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { HistoryTimeline } from "@/components/home/HistoryTimeline";
import { VillageDepthMap } from "@/components/VillageDepthMap";
import { buildHistoryTimeline } from "@/lib/timeline";
import {
  VILLAGE_MAPS_EMBED,
  VILLAGE_MAPS_URL,
} from "@/lib/site";
import {
  loadVillageHeritage,
  villageHeritageAddressLine,
} from "@/lib/village-heritage";

const heritage = loadVillageHeritage();

const TOC = [
  { id: "about", label: "About Reddivaripalli" },
  { id: "history", label: "History" },
  { id: "map", label: "Village Map" },
  { id: "agriculture", label: "Agriculture" },
  { id: "places", label: "Important Places" },
] as const;

export function VillageHeritageStory() {
  const addressLine = villageHeritageAddressLine(heritage.address);

  return (
    <div className="village-heritage">
      <Reveal className="section village-heritage-intro">
        <div className="section-head">
          <div>
            <p className="eyebrow">{heritage.eyebrow}</p>
            <h2 className="village-heritage-story-title">About Reddivaripalli</h2>
            <p className="lede">{heritage.about.paragraphs[0]}</p>
            <p className="muted">{addressLine}</p>
            <div className="btn-row village-heritage-maps">
              <a className="btn" href="#history">
                Read the full history
              </a>
              <a
                className="btn ghost"
                href={heritage.maps.heritage}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open village map
              </a>
            </div>
          </div>
        </div>

        <nav className="village-heritage-toc" aria-label="Our Village">
          {TOC.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
        </nav>
      </Reveal>

      <Reveal className="section" id="about">
        <div className="section-head">
          <div>
            <p className="eyebrow">Identity</p>
            <h2>{heritage.about.title}</h2>
          </div>
        </div>
        <div className="village-heritage-prose">
          {heritage.about.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
        <div className="village-heritage-chips" aria-label="Community values">
          {heritage.about.values.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </Reveal>

      <Reveal className="section" id="history">
        <div className="section-head">
          <div>
            <p className="eyebrow">Village record</p>
            <h2>{heritage.history.title}</h2>
            <p className="lede">{heritage.origins.lede}</p>
            <p className="muted">
              This chronology is the written village record. Family memories
              and oral stories are kept separately in{" "}
              <Link href="/stories/">Village Stories</Link>.
            </p>
          </div>
        </div>

        <ol className="village-heritage-timeline">
          {heritage.origins.timeline.map((item) => (
            <li key={item.year + item.title}>
              <span className="village-heritage-timeline-year">{item.year}</span>
              <div>
                <h3>{item.title}</h3>
                <p className="muted">{item.note}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="village-heritage-prose">
          {heritage.history.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>

        <h3 className="village-heritage-subhead">Traditions of the village</h3>
        <ul className="story-chip-list">
          {heritage.history.traditionsIntroduced.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h3 className="village-heritage-subhead">Years that shaped us</h3>
        <HistoryTimeline entries={buildHistoryTimeline(16)} />
      </Reveal>

      <Reveal className="section" id="map">
        <div className="section-head">
          <div>
            <p className="eyebrow">Find us</p>
            <h2>Village Map</h2>
            <p className="lede">{heritage.nearby.lede}</p>
          </div>
        </div>
        <div className="village-map-embed">
          <iframe
            title="Map of Reddivaripalli"
            src={VILLAGE_MAPS_EMBED}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
        <div className="btn-row" style={{ marginTop: "1rem" }}>
          <a
            className="btn"
            href={VILLAGE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Google Maps
          </a>
        </div>
        <div className="village-heritage-list-grid" style={{ marginTop: "1.5rem" }}>
          {heritage.nearby.items.map((item) => (
            <article key={item.name} className="village-heritage-panel">
              <h3>{item.name}</h3>
              <p className="muted">{item.note}</p>
            </article>
          ))}
        </div>
        <VillageDepthMap />
      </Reveal>

      <Reveal className="section" id="agriculture">
        <div className="section-head">
          <div>
            <p className="eyebrow">The land</p>
            <h2>{heritage.agriculture.title}</h2>
            <p className="lede">{heritage.agriculture.lede}</p>
          </div>
        </div>
        <div className="village-heritage-crop-grid">
          {heritage.agriculture.categories.map((category) => (
            <article key={category.name} className="village-heritage-panel">
              <h3>{category.name}</h3>
              <ul>
                {category.crops.map((crop) => (
                  <li key={crop}>{crop}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="muted village-heritage-closing">
          {heritage.agriculture.closing}
        </p>
      </Reveal>

      <Reveal className="section" id="places">
        <div className="section-head">
          <div>
            <p className="eyebrow">In and around the village</p>
            <h2>{heritage.landmarks.title}</h2>
            <p className="lede">{heritage.landmarks.lede}</p>
          </div>
        </div>
        <div className="village-heritage-list-grid">
          {heritage.landmarks.items.map((item) => (
            <article key={item.name} className="village-heritage-panel">
              <h3>{item.name}</h3>
              <p className="muted">{item.note}</p>
            </article>
          ))}
        </div>
        <div className="btn-row">
          <Link className="btn ghost" href="/temples/">
            Temples & Festivals
          </Link>
          <Link className="btn ghost" href="/stories/">
            Village stories
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
