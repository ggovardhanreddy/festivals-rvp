import type { Album } from "@/lib/types";
import { festivalByKey, bucketByKey } from "@/lib/site";
import { Gallery } from "./Gallery";
import { Slideshow } from "./Slideshow";
import { PrivateNotice } from "./PrivateNotice";
import { Reveal } from "./Reveal";
import { MemoryHero } from "./MemoryHero";

export function AlbumView({ album }: { album: Album }) {
  const festival = festivalByKey(album.festival);
  const bucket = bucketByKey(album.bucket || "");
  const story =
    album.story ||
    bucket?.story ||
    festival?.blurb ||
    "A chapter from the village archive.";

  const eyebrow =
    album.category === "Birthdays"
      ? `${album.personName || album.title} · ${album.birthdayDate || album.year}`
      : festival?.eyebrow || `${album.year} · ${album.bucket || album.category}`;

  return (
    <main className="page">
      <MemoryHero
        eyebrow={eyebrow}
        title={album.title}
        lede={album.description}
        primaryHref="#gallery"
        primaryLabel="Open gallery"
        secondaryHref="#slideshow"
        secondaryLabel="Slideshow"
        backgroundImage={album.cover}
      />

      <PrivateNotice />

      <Reveal className="section">
        <p className="eyebrow">Festival Story</p>
        <h2>A chapter worth keeping</h2>
        <p className="lede">{story}</p>
      </Reveal>

      {!!album.notes?.length && (
        <Reveal className="section" delay={0.05}>
          <p className="eyebrow">Memory notes</p>
          <h2>Little details</h2>
          <div className="notes">
            {album.notes.map((note) => (
              <div className="note" key={note}>
                {note}
              </div>
            ))}
          </div>
        </Reveal>
      )}

      <Reveal className="section" delay={0.08} id="slideshow">
        <div className="section-head">
          <div>
            <p className="eyebrow">Slideshow</p>
            <h2>In motion</h2>
          </div>
        </div>
        <Slideshow items={album.media} />
      </Reveal>

      <Reveal className="section" delay={0.1}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Timeline</p>
            <h2>Moments in order</h2>
          </div>
        </div>
        <div className="timeline">
          {album.media.map((media) => (
            <div className="timeline-item glass-card" key={media.id}>
              <p className="eyebrow">{media.date}</p>
              <h3>{media.title}</h3>
              {media.note && <p className="muted">{media.note}</p>}
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className="section" delay={0.12} id="gallery">
        <div className="section-head">
          <div>
            <p className="eyebrow">Gallery</p>
            <h2>Every frame</h2>
          </div>
        </div>
        <Gallery items={album.media} />
      </Reveal>
    </main>
  );
}
