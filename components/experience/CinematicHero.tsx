"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { withBase } from "@/lib/base";
import { VILLAGE_ALSO_KNOWN_AS, VILLAGE_NAME, SITE_NAME } from "@/lib/site";

/**
 * Landing hero — RVP Youth photo first.
 * No black intro stages; village 3D lives in the map section below.
 */
export function CinematicHero() {
  const reduce = useReducedMotion();

  return (
    <section className="landing-hero" aria-label={`${SITE_NAME} home`}>
      <div className="landing-hero-media" aria-hidden={!reduce}>
        <img
          src={withBase("/brand/rvp-youth-photo.webp")}
          alt=""
          className="landing-hero-photo"
          width={1400}
          height={900}
          fetchPriority="high"
          decoding="async"
        />
        <div className="landing-hero-shade" aria-hidden />
      </div>

      <m.div
        className="landing-hero-copy"
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src={withBase("/brand/rvp-youth-logo-light.svg")}
          alt={SITE_NAME}
          className="landing-hero-brand"
          width={200}
          height={58}
        />
        <p className="eyebrow">
          {SITE_NAME} · {VILLAGE_NAME}
        </p>
        <h1>{VILLAGE_NAME}</h1>
        <p className="lede">
          Digital Village Experience for {VILLAGE_NAME} ({VILLAGE_ALSO_KNOWN_AS}) —
          festivals, friendships, and memories of home.
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
    </section>
  );
}
