"use client";

import Link from "next/link";
import { withBase } from "@/lib/base";
import {
  CULTURE_DESCRIPTION,
  CULTURE_FESTIVALS,
  festivalThumbPath,
} from "@/lib/festivals";
import { Reveal } from "@/components/Reveal";

/**
 * Visual index of the festival chapters.
 *
 * Lives on Our Village, below the written Culture & Traditions section — the
 * prose is the account, this is the way in to each chapter's own page. It does
 * not repeat the heading or the id of that section: two "Culture & Traditions"
 * blocks on one page, both anchored at #culture, is what this used to be.
 */
export function CultureTraditions() {
  return (
    <Reveal className="section culture-traditions" id="festival-chapters">
      <div className="section-head">
        <div>
          <p className="eyebrow">Village life</p>
          <h2>Festival Chapters</h2>
          <p className="lede">{CULTURE_DESCRIPTION}</p>
        </div>
      </div>

      <ul className="culture-festival-list">
        {CULTURE_FESTIVALS.map((fest) => (
          <li key={fest.key}>
            <Link href={`/${fest.slug}/`} className="culture-festival-card">
              <img
                src={withBase(festivalThumbPath(fest.folder))}
                alt=""
                width={640}
                height={360}
                loading="lazy"
                decoding="async"
              />
              <div className="culture-festival-copy">
                <p className="eyebrow">{fest.eyebrow}</p>
                <h3>{fest.title}</h3>
                <p className="muted">{fest.blurb}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
