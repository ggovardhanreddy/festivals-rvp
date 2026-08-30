import Link from "next/link";
import { withBase } from "@/lib/base";
import {
  VILLAGE_ALSO_KNOWN_AS,
  VILLAGE_NAME,
  VILLAGE_SHORT_DESCRIPTION,
} from "@/lib/site";

/**
 * Three or four lines about the village, and a door to the full story.
 *
 * The founding history, temples, agriculture, notable people and the whole
 * culture-and-traditions section now live on /about/ and /heritage/, where
 * someone who wants them can read them properly.
 */
export function VillageIntro() {
  return (
    <section className="home-panel home-village" aria-labelledby="home-village-heading">
      <p className="eyebrow">{VILLAGE_ALSO_KNOWN_AS}</p>
      <h2 id="home-village-heading">Our Village</h2>
      <p className="home-panel-lede">{VILLAGE_SHORT_DESCRIPTION}</p>
      <p className="muted home-village-alt">
        Also known as {VILLAGE_NAME}, in Sambepalle Mandal, Annamayya district.
      </p>

      <div className="home-heritage-teaser">
        <img
          className="home-heritage-teaser-mark"
          src={withBase("/logo/logo-mark.webp")}
          alt=""
          width={56}
          height={56}
          loading="lazy"
          decoding="async"
          aria-hidden
        />
        <p>
          Generations of festivals, faith, agriculture and community traditions
          continue to shape Reddivaripalli.
        </p>
      </div>

      <div className="home-panel-actions">
        <Link className="btn" href="/about/">
          Read Our Story <span aria-hidden>→</span>
        </Link>
        <Link className="btn ghost" href="/about/#culture">
          Explore Our Heritage <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
