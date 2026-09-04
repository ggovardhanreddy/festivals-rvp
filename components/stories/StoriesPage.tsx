import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { withBase } from "@/lib/base";
import { loadHeritageSeed } from "@/lib/community";
import { loadVillageHeritage } from "@/lib/village-heritage";

/**
 * Village stories and memories — the emotional heart of the site.
 *
 * Built from existing Reddivaripalli records: founder memory, oral heritage
 * submissions, cultural practices, and the written village history. Nothing
 * here is general religion or literature.
 */
export function StoriesPage() {
  const heritage = loadVillageHeritage();
  const archive = loadHeritageSeed().filter(
    (item) => item.status === "approved",
  );

  return (
    <div className="stories-page">
      <Reveal className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Remembered together</p>
            <h2>Village Stories & Memories</h2>
            <p className="lede">
              Stories from elders, old village memories, traditional practices,
              and the people who grew up in Reddivaripalli. This is community
              memory — not the official village chronology. The written history
              is on{" "}
              <Link href="/about/#history">Our Village → History</Link>.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal className="section" id="elders">
        <div className="section-head">
          <div>
            <p className="eyebrow">Stories from elders</p>
            <h2>{heritage.memorial.title}</h2>
            <p className="lede">{heritage.memorial.lede}</p>
          </div>
        </div>
        <div className="stories-grid">
          <article className="story-card">
            <p className="eyebrow">{heritage.memorial.founder.role}</p>
            <h3>{heritage.memorial.founder.name}</h3>
            <p>{heritage.memorial.founder.bio}</p>
          </article>
          <article className="story-card">
            <p className="eyebrow">{heritage.memorial.successor.role}</p>
            <h3>{heritage.memorial.successor.name}</h3>
            <p>{heritage.memorial.successor.bio}</p>
          </article>
        </div>
        {heritage.memorial.legends?.length ? (
          <div className="story-names">
            <h3>{heritage.memorial.legendsTitle}</h3>
            {heritage.memorial.legendsLede ? (
              <p className="muted">{heritage.memorial.legendsLede}</p>
            ) : null}
            <ul>
              {heritage.memorial.legends.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </Reveal>

      <Reveal className="section" id="history-memories">
        <div className="section-head">
          <div>
            <p className="eyebrow">Community memory</p>
            <h2>Stories, not the official record</h2>
            <p className="lede">
              What follows is remembered by families and elders. Dates and
              details may differ from the written village history.
            </p>
          </div>
        </div>
        <Link className="btn ghost" href="/about/#history">
          Read the village record
        </Link>
      </Reveal>

      <Reveal className="section" id="practices">
        <div className="section-head">
          <div>
            <p className="eyebrow">Traditional practices</p>
            <h2>Ways of the village</h2>
            <p className="lede">
              Practices introduced in Reddivaripalli and still spoken of with
              pride.
            </p>
          </div>
        </div>
        <ul className="story-chip-list">
          {heritage.history.traditionsIntroduced.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="village-heritage-list-grid" style={{ marginTop: "1.5rem" }}>
          {heritage.culturalEvents.items.map((item) => (
            <article key={item.name} className="village-heritage-panel">
              <h3>{item.name}</h3>
              <p className="muted">{item.note}</p>
            </article>
          ))}
        </div>
      </Reveal>

      {archive.length ? (
        <Reveal className="section" id="old-photographs">
          <div className="section-head">
            <div>
              <p className="eyebrow">Old photographs</p>
              <h2>Pictures with a story</h2>
              <p className="lede">
                Heritage photographs kept with the words that belong to them.
              </p>
            </div>
          </div>
          <ul className="story-photo-list">
            {archive.map((item) => (
              <li key={item.id} className="story-photo-card">
                {item.mediaUrl && item.mediaType === "image" ? (
                  <img
                    src={withBase(item.mediaUrl)}
                    alt={item.title || "Heritage photograph from Reddivaripalli"}
                    width={640}
                    height={400}
                    loading="lazy"
                  />
                ) : null}
                <div>
                  <h3>{item.title}</h3>
                  <p className="muted">{item.description}</p>
                  {item.date ? (
                    <p className="eyebrow">{item.date.slice(0, 4)}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          <Link className="btn" href="/gallery/">
            Open the gallery
          </Link>
        </Reveal>
      ) : null}

      <Reveal className="section" id="vision">
        <div className="section-head">
          <div>
            <p className="eyebrow">For the next generation</p>
            <h2>{heritage.vision.title}</h2>
          </div>
        </div>
        <div className="stories-prose">
          {heritage.vision.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
