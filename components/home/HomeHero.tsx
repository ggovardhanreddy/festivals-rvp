"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { m, useReducedMotion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { useAllowHeavyEffects } from "@/lib/mobile-shell";
import { VILLAGE_ALSO_KNOWN_AS } from "@/lib/site";

const VantaBirds = dynamic(
  () => import("./VantaBirds").then((m) => m.VantaBirds),
  { ssr: false },
);

/** Exact two-line hero address (home-only copy). */
const HERO_LINES = [
  "Reddivaripalli Grama Panchayat, Devepatla (P),",
  "Sambepalli (M), Annamayya (D), A.P 516215",
] as const;

/**
 * Locked homepage hero — Vanta Birds background only.
 * Festival / event / seasonal images must never replace this surface.
 */
export function HomeHero() {
  const reduce = useReducedMotion();
  const allowVanta = useAllowHeavyEffects();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("intro-pending", "intro-active", "intro-locked");
    window.dispatchEvent(new CustomEvent("rvp:intro-chrome"));
    window.dispatchEvent(new CustomEvent("rvp:intro-complete"));
  }, []);

  return (
    <section className="clean-hero home-hero" aria-labelledby="home-hero-title">
      <div className="clean-hero-media" aria-hidden>
        {allowVanta ? <VantaBirds soft /> : null}
        <div className="clean-hero-veil home-hero-veil" />
      </div>

      <div className="clean-hero-content home-hero-content">
        {/* Wordmark lives in the logo artwork — keep one SEO H1, visually hidden. */}
        <h1 id="home-hero-title" className="sr-only">
          {VILLAGE_ALSO_KNOWN_AS} Village — Heritage, Community, Progress
        </h1>
        <m.div
          className="home-hero-logo-wrap"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Logo variant="vertical" className="home-hero-logo" priority glossy={false} />
        </m.div>
        <m.ul
          className="home-hero-address"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.22 }}
        >
          {HERO_LINES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </m.ul>
        <m.div
          className="clean-hero-cta home-hero-cta"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.36 }}
        >
          <Link className="btn" href="#overview">
            Explore the village
          </Link>
          <Link className="btn ghost" href="/about/">
            Our heritage
          </Link>
          <Link className="btn ghost" href="/gallery/">
            Gallery
          </Link>
        </m.div>

        <a
          className="clean-hero-scroll home-hero-scroll"
          href="#overview"
          aria-label="Scroll to About Reddivaripalli"
        >
          <span>Scroll</span>
          <span className="clean-hero-scroll-line" aria-hidden />
          <span className="clean-hero-scroll-chevron" aria-hidden />
        </a>
      </div>
    </section>
  );
}
