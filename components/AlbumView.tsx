import type { Album } from "@/lib/types";
import { festivalByKey } from "@/lib/site";
import { Gallery } from "./Gallery";
import { Slideshow } from "./Slideshow";
import { PrivateNotice } from "./PrivateNotice";
import { Reveal } from "./Reveal";
import { withBase } from "@/lib/base";

export function AlbumView({ album }: { album: Album }) {
  const festival = festivalByKey(album.festival);
  return (
    <div className="page">
      <section className="hero" style={{ minHeight: "62vh" }}>
        <div
          className="hero-media"
          style={
            album.cover
              ? {
                  backgroundImage: `url(${withBase(album.cover)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        />
        <div className="hero-fade" />
        <div className="hero-copy">
          <p className="eyebrow">
            {album.category === "Birthdays"
              ? `${album.personName || album.title} · ${album.birthdayDate || album.year}`
              : festival?.eyebrow || `${album.year} · Festival`}
          </p>
          <h1>{album.title}</h1>
          <p className="lede">{album.description}</p>
        </div>
      </section>

      <PrivateNotice />

      {album.story && (
        <Reveal className="section">
          <p className="eyebrow">Story</p>
          <h2>A chapter worth keeping</h2>
          <p className="lede">{album.story}</p>
        </Reveal>
      )}

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

      <Reveal className="section" delay={0.08}>
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

      <Reveal className="section" delay={0.12}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Gallery</p>
            <h2>Every frame</h2>
          </div>
        </div>
        <Gallery items={album.media} />
      </Reveal>
    </div>
  );
}
