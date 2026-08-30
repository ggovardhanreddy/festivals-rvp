import Link from "next/link";
import { VILLAGE_NAME, VILLAGE_SHORT_DESCRIPTION } from "@/lib/site";

/**
 * Three or four lines about the village, and one door to the full story.
 *
 * Deliberately says nothing about heritage beyond the description itself. The
 * hero already carries "Heritage · Community · Progress" and "One Village ·
 * One Family · One Heritage"; a teaser paragraph and a second heritage button
 * here made the word appear four times above the fold and gave the panel two
 * competing calls to action.
 *
 * The founding history, temples, agriculture, notable people and the whole
 * culture-and-traditions section live on /about/ and /heritage/, where someone
 * who wants them can read them properly.
 */
export function VillageIntro() {
  return (
    <section className="home-panel home-village" aria-labelledby="home-village-heading">
      {/* The village's other name, kept because half the district searches for it. */}
      <p className="eyebrow">{VILLAGE_NAME}</p>
      <h2 id="home-village-heading">Our Village</h2>
      <p className="home-panel-lede">{VILLAGE_SHORT_DESCRIPTION}</p>

      <div className="home-panel-actions">
        <Link className="btn" href="/about/">
          Read Our Story <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
