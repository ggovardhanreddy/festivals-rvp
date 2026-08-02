"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { withBase } from "@/lib/base";
import {
  SITE_NAME,
  SITE_TAGLINE_LANDING,
  VILLAGE_ALSO_KNOWN_AS,
  VILLAGE_NAME,
} from "@/lib/site";

const VantaBirds = dynamic(
  () => import("./VantaBirds").then((m) => m.VantaBirds),
  { ssr: false },
);

const DEFAULT_SLIDES = [
  "/brand/village-aerial.webp",
  "/brand/vinayaka-hero.webp",
  "/brand/sankranthi-hero.webp",
  "/brand/mathamma-hero.webp",
  "/brand/rama-navami-hero.webp",
  "/brand/funfest-hero.webp",
];

export function HeroSlideshow({
  slides = DEFAULT_SLIDES,
}: {
  slides?: string[];
}) {
  const reduce = useReducedMotion();
  const images = slides.length ? slides : DEFAULT_SLIDES;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce || images.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [images.length, reduce]);

  return (
    <section className="clean-hero hero-slideshow" aria-label="Welcome">
      <div className="clean-hero-media" aria-hidden>
        <VantaBirds />
        <AnimatePresence mode="sync">
          <m.img
            key={images[index]}
            src={withBase(images[index]!)}
            alt=""
            className="hero-slide hero-slide--soft"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: reduce ? 0.55 : 0.28 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            width={1920}
            height={1080}
            fetchPriority={index === 0 ? "high" : "low"}
            decoding="async"
          />
        </AnimatePresence>
        <div className="clean-hero-veil" />
      </div>

      <div className="clean-hero-content">
        <m.p
          className="eyebrow clean-hero-eyebrow"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {VILLAGE_NAME} · {VILLAGE_ALSO_KNOWN_AS}
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
          <Link className="btn" href="/gallery/">
            Explore
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
