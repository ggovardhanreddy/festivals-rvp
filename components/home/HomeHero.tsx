"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { m, useReducedMotion } from "framer-motion";
import { Logo } from "@/components/Logo";
import {
  OFFICIAL_MISSION,
  OFFICIAL_SUBTITLE,
  SITE_NAME,
  SITE_TAGLINE_LANDING,
  VILLAGE_ALSO_KNOWN_AS,
  VILLAGE_NAME,
} from "@/lib/site";

const VantaBirds = dynamic(
  () => import("./VantaBirds").then((m) => m.VantaBirds),
  { ssr: false },
);

/**
 * Locked homepage hero — Vanta Birds background only.
 * Festival / event / seasonal images must never replace this surface.
 */
export function HomeHero() {
  const reduce = useReducedMotion();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("intro-pending", "intro-active", "intro-locked");
    window.dispatchEvent(new CustomEvent("rvp:intro-chrome"));
    window.dispatchEvent(new CustomEvent("rvp:intro-complete"));
  }, []);

  return (
    <section className="clean-hero home-hero" aria-label="Welcome">
      <div className="clean-hero-media" aria-hidden>
        <VantaBirds />
        <div className="clean-hero-veil home-hero-veil" />
      </div>

      <div className="clean-hero-content home-hero-content">
        <m.div
          className="home-hero-logo-wrap"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Logo variant="vertical" className="home-hero-logo" />
        </m.div>
        <m.p
          className="eyebrow clean-hero-eyebrow"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
        >
          {OFFICIAL_SUBTITLE} · {VILLAGE_ALSO_KNOWN_AS} · {VILLAGE_NAME}
        </m.p>
        <m.h1
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2 }}
        >
          {VILLAGE_ALSO_KNOWN_AS}
        </m.h1>
        <m.p
          className="clean-hero-lede"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 }}
        >
          {SITE_TAGLINE_LANDING}
        </m.p>
        <m.p
          className="home-hero-intro"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.38 }}
        >
          {OFFICIAL_MISSION} Stewards: {SITE_NAME}.
        </m.p>
        <m.div
          className="clean-hero-cta home-hero-cta"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.46 }}
        >
          <Link className="btn" href="/gallery/">
            Gallery
          </Link>
          <Link className="btn ghost" href="/members/">
            Members
          </Link>
          <Link className="btn ghost" href="/directory/">
            Directory
          </Link>
        </m.div>
      </div>

      <a
        className="clean-hero-scroll"
        href="#overview"
        aria-label="Scroll to overview"
      >
        <span>Scroll</span>
        <span className="clean-hero-scroll-line" aria-hidden />
      </a>
    </section>
  );
}
