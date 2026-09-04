"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { useUiLang } from "@/components/i18n/LanguageProvider";
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
 * Village name, tagline, a short promise, and two doors into the site.
 * The aerial photograph is the village itself — not a stock image.
 */
export function VillageHero() {
  const reduce = useReducedMotion();
  const { t } = useUiLang();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("intro-pending", "intro-active", "intro-locked");
    window.dispatchEvent(new CustomEvent("rvp:intro-chrome"));
    window.dispatchEvent(new CustomEvent("rvp:intro-complete"));
  }, []);

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
          <div className="village-hero-scrim" aria-hidden />
        </div>
      ) : null}
      <div className="village-hero-glow" aria-hidden />
      <div className="village-hero-inner">
        {HOME_HERO_PHOTO ? null : (
          <m.img
            className="village-hero-emblem"
            src={withBase("/logo/logo-vertical.webp")}
            alt="Reddivaripalli Village — Our Village. Our Heritage. Our Home."
            width={640}
            height={513}
            fetchPriority="high"
            decoding="async"
            {...rise(0)}
          />
        )}

        <div className="village-hero-copy">
          <m.h1 id="village-hero-title" className="village-hero-title" {...rise(0.06)}>
            {t("village.name", HOME_HERO_TITLE)}
          </m.h1>
          <m.p className="village-hero-pillars" {...rise(0.12)}>
            {t("home.hero.pillars", HOME_HERO_PILLARS)}
          </m.p>
          <m.p className="village-hero-support" {...rise(0.18)}>
            {t("home.hero.support", HOME_HERO_SUPPORT)}
          </m.p>
          <m.div className="village-hero-cta" {...rise(0.24)}>
            <Link className="btn" href="/about/">
              {t("home.exploreOurVillage")} <span aria-hidden>→</span>
            </Link>
            <Link className="btn ghost" href="/gallery/">
              {t("home.hero.viewGallery", t("home.viewGallery"))} <span aria-hidden>→</span>
            </Link>
          </m.div>
        </div>
      </div>
    </section>
  );
}
