"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { m, useReducedMotion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { VILLAGE_ALSO_KNOWN_AS } from "@/lib/site";

const VantaBirds = dynamic(
  () => import("./VantaBirds").then((m) => m.VantaBirds),
  { ssr: false },
);

const HERO_LINES = [
  "Gram Panchayat",
  "Devapatla Post",
  "Sambepalle Mandal",
  "Annamayya District",
  "Andhra Pradesh – 516215",
] as const;

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
        <m.h1
          className="home-hero-title"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15 }}
        >
          {VILLAGE_ALSO_KNOWN_AS}
        </m.h1>
        <m.ul
          className="home-hero-address"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.28 }}
        >
          {HERO_LINES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </m.ul>
        <m.div
          className="clean-hero-cta home-hero-cta"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.42 }}
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
