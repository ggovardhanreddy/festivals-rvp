import { withBase } from "@/lib/base";

/** Keeps Vinayaka Chavithi visually rich even before scrolling the gallery. */
export function FestivalIdolBanner({
  title = "Vinayaka Chavithi",
  lede = "Lamp light, clay beginnings, and the first prayer of the season.",
}: {
  title?: string;
  lede?: string;
}) {
  return (
    <section className="section festival-idol-banner" aria-label={title}>
      <div className="festival-idol-panel">
        <img
          src={withBase("/brand/vinayaka-crest.svg")}
          alt=""
          className="festival-idol-crest"
          width={180}
          height={180}
        />
        <div>
          <p className="eyebrow">Auspicious beginning</p>
          <h2>{title}</h2>
          <p className="lede">{lede}</p>
        </div>
        <figure className="festival-idol-photo">
          <img
            src={withBase("/brand/vinayaka-idol.webp")}
            alt="Ganesha idol — Nritya form, village celebration"
            width={640}
            height={640}
          />
          <figcaption className="muted">Idol of home · RVP Youth memories</figcaption>
        </figure>
      </div>
    </section>
  );
}
