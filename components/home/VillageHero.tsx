"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { withBase } from "@/lib/base";
import {
  HOME_HERO_PHOTO,
  HOME_HERO_PHOTO_ALT,
  HOME_HERO_PILLARS,
  HOME_HERO_SUPPORT,
  HOME_HERO_TITLE,
} from "@/lib/site";

/**
 * Homepage hero.
 *
 * One message, one image, two links. The statistics, search field, filters and
 * six audience cards that used to live here now sit on the sections and pages
 * that own them, so the first screen says who this village is instead of
 * asking the visitor to choose from twenty things at once.
 *
 * The artwork is the approved village lockup (public/logo/logo-vertical.webp,
 * generated from the master by scripts/generate-logo-system.ts). No stock
 * photograph and no placeholder stands in for a real village photograph.
 */
export function VillageHero() {
  const reduce = useReducedMotion();

  // The loading screen locks the document until the first surface says it is
  // ready. That contract predates this component; keep honouring it.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("intro-pending", "intro-active", "intro-locked");
    window.dispatchEvent(new CustomEvent("rvp:intro-chrome"));
    window.dispatchEvent(new CustomEvent("rvp:intro-complete"));
  }, []);

  /**
   * Entrance motion that never hides anything.
   *
   * Starting at opacity 0 puts `style="opacity:0"` in the server-rendered
   * HTML: the badge is the largest element on the page, so it becomes the LCP
   * candidate and stays invisible until hydration — and stays invisible
   * forever if the JavaScript fails. The lift alone reads as an entrance.
   */
  const rise = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 1, y: 14 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section
      className="village-hero"
      data-photo={HOME_HERO_PHOTO ? true : undefined}
      aria-labelledby="village-hero-title"
    >
      {HOME_HERO_PHOTO ? (
        <div className="village-hero-photo">
          <img
            src={withBase(HOME_HERO_PHOTO)}
            alt={HOME_HERO_PHOTO_ALT}
            fetchPriority="high"
            decoding="async"
          />
          {/* The scrim is what makes the heading readable over a photograph we
              cannot predict. It is not decoration — without it contrast
              depends on whatever the sky was doing that day. */}
          <div className="village-hero-scrim" aria-hidden />
        </div>
      ) : null}
      <div className="village-hero-glow" aria-hidden />
      <div className="village-hero-inner">
        <m.img
          className="village-hero-emblem"
          src={withBase("/logo/logo-vertical.webp")}
          alt="Reddivaripalli Village — Heritage, Community, Progress"
          width={640}
          height={513}
          fetchPriority="high"
          decoding="async"
          {...rise(0)}
        />

        <div className="village-hero-copy">
          <m.h1 id="village-hero-title" className="village-hero-title" {...rise(0.06)}>
            {HOME_HERO_TITLE}
          </m.h1>
          <m.p className="village-hero-pillars" {...rise(0.12)}>
            {HOME_HERO_PILLARS}
          </m.p>
          <m.p className="village-hero-support" {...rise(0.18)}>
            {HOME_HERO_SUPPORT}
          </m.p>
          {/* One call to action. The badge, the pillars and the motto line
              already say "heritage" three times; a second button saying it a
              fourth was a duplicate, not a choice. The Heritage Archive is
              reachable from Our Village and from the More menu. */}
          <m.div className="village-hero-cta" {...rise(0.24)}>
            <Link className="btn" href="/about/">
              Explore Our Village <span aria-hidden>→</span>
            </Link>
          </m.div>
        </div>
      </div>
    </section>
  );
}
