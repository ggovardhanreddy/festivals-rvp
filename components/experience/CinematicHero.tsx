"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { withBase } from "@/lib/base";
import { VILLAGE_ALSO_KNOWN_AS, VILLAGE_NAME, SITE_NAME } from "@/lib/site";
import { Fireworks } from "./Fireworks";

/**
 * Festival landing — RVP Youth portrait with fireworks celebration sky.
 */
export function CinematicHero() {
  const reduce = useReducedMotion();

  return (
    <section className="landing-hero festival-hero" aria-label={`${SITE_NAME} home`}>
      <div className="landing-hero-sky" aria-hidden>
        <img
          src={withBase("/brand/village-night-sky.webp")}
          alt=""
          className="landing-hero-sky-photo"
          width={1800}
          height={1200}
          fetchPriority="high"
          decoding="async"
        />
        <div className="landing-hero-sky-wash" />
        <div className="landing-hero-sparkles" />
      </div>

      <Fireworks />

      <div className="landing-hero-stage">
        <m.figure
          className="landing-hero-portrait"
          initial={reduce ? false : { opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={withBase("/brand/rvp-youth-festival.webp")}
            alt={`${SITE_NAME} — friends of ${VILLAGE_NAME}`}
            width={1400}
            height={900}
            fetchPriority="high"
            decoding="async"
          />
          <figcaption>RVP Youth · Celebration of home</figcaption>
        </m.figure>

        <m.div
          className="landing-hero-copy festival-copy"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: reduce ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={withBase("/logo/logo-white.svg")}
            alt={SITE_NAME}
            className="landing-hero-brand"
            width={220}
            height={64}
          />
          <p className="eyebrow">Festival night · {VILLAGE_NAME}</p>
          <h1>RVP Youth</h1>
          <p className="lede">
            Fireworks over {VILLAGE_NAME} ({VILLAGE_ALSO_KNOWN_AS}) — friendships,
            festivals, and the Digital Village Experience.
          </p>
          <div className="btn-row">
            <a className="btn magnetic" href="#map">
              Explore Village
            </a>
            <Link className="btn ghost" href="/sankranthi/">
              Sankranthi
            </Link>
            <Link className="btn ghost" href="/about/">
              About
            </Link>
          </div>
        </m.div>
      </div>
    </section>
  );
}
