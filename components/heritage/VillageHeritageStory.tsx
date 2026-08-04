import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import {
  loadVillageHeritage,
  villageHeritageAddressLine,
} from "@/lib/village-heritage";

const heritage = loadVillageHeritage();

const TOC = [
  { id: "history", label: "Our History" },
  { id: "agriculture", label: "Agriculture" },
  { id: "festivals", label: "Festivals" },
  { id: "cultural-events", label: "Cultural Events" },
  { id: "temples", label: "Sacred Temples" },
  { id: "landmarks", label: "Landmarks" },
  { id: "professionals", label: "Education & Professionals" },
  { id: "farmers", label: "Farmers" },
  { id: "memorial", label: "In Loving Memory" },
  { id: "vision", label: "Vision" },
] as const;

export function VillageHeritageStory() {
  const addressLine = villageHeritageAddressLine(heritage.address);

  return (
    <div className="village-heritage">
      <Reveal className="section village-heritage-intro">
        <div className="section-head">
          <div>
            <p className="eyebrow">{heritage.eyebrow}</p>
            <h1>{heritage.title}</h1>
            <p className="lede">{heritage.lede}</p>
            <p className="village-heritage-tagline">{heritage.tagline}</p>
            <p className="muted">{addressLine}</p>
            <div className="btn-row village-heritage-maps">
              <a
                className="btn"
                href={heritage.maps.heritage}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open village map
              </a>
              <a
                className="btn ghost"
                href={heritage.maps.ramalayam}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Ramalayam map
              </a>
              <Link className="btn ghost" href="/heritage/">
                Heritage Archive
              </Link>
            </div>
          </div>
        </div>

        <nav className="village-heritage-toc" aria-label="Heritage sections">
          {TOC.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
        </nav>
      </Reveal>

      <Reveal className="section" id="history">
        <div className="section-head">
          <div>
            <p className="eyebrow">Beginnings</p>
            <h2>{heritage.history.title}</h2>
          </div>
        </div>
        <div className="village-heritage-prose">
          {heritage.history.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
        <div className="village-heritage-chips" aria-label="Traditions introduced">
          {heritage.history.traditionsIntroduced.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </Reveal>

      <Reveal className="section" id="agriculture">
        <div className="section-head">
          <div>
            <p className="eyebrow">Livelihood</p>
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

      <Reveal className="section" id="festivals">
        <div className="section-head">
          <div>
            <p className="eyebrow">Celebration</p>
            <h2>{heritage.festivals.title}</h2>
            <p className="lede">{heritage.festivals.lede}</p>
          </div>
        </div>
        <div className="village-heritage-list-grid">
          {heritage.festivals.items.map((item) => (
            <article key={item.name} className="village-heritage-panel">
              <h3>{item.name}</h3>
              <p className="muted">{item.note}</p>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="section" id="cultural-events">
        <div className="section-head">
          <div>
            <p className="eyebrow">Tradition</p>
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

      <Reveal className="section" id="temples">
        <div className="section-head">
          <div>
            <p className="eyebrow">Faith</p>
            <h2>{heritage.temples.title}</h2>
            <p className="lede">{heritage.temples.lede}</p>
          </div>
        </div>
        <p className="muted village-heritage-closing">
          {heritage.temples.preservationIntro}
        </p>
        <div className="village-heritage-list-grid">
          {heritage.temples.items.map((item) => (
            <article key={item.name} className="village-heritage-panel">
              <h3>{item.name}</h3>
              <p className="muted">{item.note}</p>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="section" id="landmarks">
        <div className="section-head">
          <div>
            <p className="eyebrow">Places</p>
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
      </Reveal>

      <Reveal className="section" id="professionals">
        <div className="section-head">
          <div>
            <p className="eyebrow">Pride</p>
            <h2>{heritage.professionals.title}</h2>
            <p className="lede">{heritage.professionals.lede}</p>
          </div>
        </div>
        <div className="village-heritage-professionals">
          {heritage.professionals.groups.map((group) => (
            <article key={group.name} className="village-heritage-panel">
              <h3>{group.name}</h3>
              <ul>
                {group.people.map((person) => (
                  <li key={`${group.name}-${person.name}-${person.role}`}>
                    <strong>{person.name}</strong>
                    {person.role ? (
                      <span className="muted"> — {person.role}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="section" id="farmers">
        <div className="section-head">
          <div>
            <p className="eyebrow">Land & labour</p>
            <h2>{heritage.farmers.title}</h2>
            <p className="lede">{heritage.farmers.lede}</p>
          </div>
        </div>
        <ul className="village-heritage-name-cloud">
          {heritage.farmers.names.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </Reveal>

      <Reveal className="section village-heritage-memorial" id="memorial">
        <div className="section-head">
          <div>
            <p className="eyebrow">Remembrance</p>
            <h2>{heritage.memorial.title}</h2>
            <p className="lede">{heritage.memorial.lede}</p>
          </div>
        </div>
        <div className="village-heritage-memorial-bios">
          <article className="village-heritage-panel">
            <h3>{heritage.memorial.founder.name}</h3>
            <p className="eyebrow">{heritage.memorial.founder.role}</p>
            <p className="muted">{heritage.memorial.founder.bio}</p>
          </article>
          <article className="village-heritage-panel">
            <h3>{heritage.memorial.successor.name}</h3>
            <p className="eyebrow">{heritage.memorial.successor.role}</p>
            <p className="muted">{heritage.memorial.successor.bio}</p>
          </article>
        </div>
        <h3 className="village-heritage-forever-title">
          {heritage.memorial.foreverRememberedTitle}
        </h3>
        <ul className="village-heritage-memorial-list">
          {heritage.memorial.foreverRemembered.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <p className="village-heritage-memorial-closing">
          {heritage.memorial.closing}
        </p>
      </Reveal>

      <Reveal className="section" id="vision">
        <div className="section-head">
          <div>
            <p className="eyebrow">Dedication</p>
            <h2>{heritage.vision.title}</h2>
          </div>
        </div>
        <div className="village-heritage-prose">
          {heritage.vision.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
        <p className="village-heritage-tagline village-heritage-tagline--end">
          {heritage.tagline}
        </p>
        <div className="btn-row">
          <Link className="btn" href="/heritage/">
            Explore Heritage Archive
          </Link>
          <Link className="btn ghost" href="/contact/">
            Contact
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
