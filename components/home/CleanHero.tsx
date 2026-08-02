"use client";

import Link from "next/link";
import { useEffect } from "react";
import { m, useReducedMotion } from "framer-motion";
import { withBase } from "@/lib/base";
import {
  SITE_NAME,
  SITE_TAGLINE_LANDING,
  VILLAGE_NAME,
} from "@/lib/site";

const HERO_IMAGE = "/brand/village-aerial.webp";

export function CleanHero() {
  const reduce = useReducedMotion();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("intro-pending", "intro-active", "intro-locked");
    window.dispatchEvent(new CustomEvent("rvp:intro-chrome"));
    window.dispatchEvent(new CustomEvent("rvp:intro-complete"));
  }, []);

  return (
    <section className="clean-hero" aria-label="Welcome">
      <div className="clean-hero-media" aria-hidden>
        <img
          src={withBase(HERO_IMAGE)}
          alt=""
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
        />
        <div className="clean-hero-veil" />
      </div>

      <div className="clean-hero-content">
        <m.p
          className="eyebrow clean-hero-eyebrow"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {VILLAGE_NAME}
        </m.p>
        <m.h1
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18 }}
        >
          {SITE_NAME}
        </m.h1>
        <m.p
          className="clean-hero-lede"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
        >
          {SITE_TAGLINE_LANDING}
        </m.p>
        <m.div
          className="clean-hero-cta"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.38 }}
        >
          <Link className="btn" href="#timeline">
            Explore our story
          </Link>
        </m.div>
      </div>

      <a className="clean-hero-scroll" href="#overview" aria-label="Scroll to overview">
        <span>Scroll</span>
        <span className="clean-hero-scroll-line" aria-hidden />
      </a>
    </section>
  );
}
