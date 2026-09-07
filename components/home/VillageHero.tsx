"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { useEffect, useRef } from "react";
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

  /**
   * A few pixels of pointer parallax, on desktop only.
   *
   * The photograph and the words shift by different amounts, which reads as
   * depth rather than as movement -- the whole range is 14px on the image and
   * 6px the other way on the copy. Written to CSS custom properties and
   * applied with a transform, so the browser composites it and no React
   * render happens on pointer move.
   *
   * Skipped entirely on anything without a fine pointer: a phone has no
   * hover, and a touch-drag reading as parallax feels like a bug. Also
   * skipped under reduced motion, where the spec asks for no parallax at all.
   */
  useEffect(() => {
    if (reduce) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;
    const el = heroRef.current;
    if (!el) return;

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const box = el.getBoundingClientRect();
        // -1 .. 1 from the centre of the hero.
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        el.style.setProperty("--par-x", `${(x * 12).toFixed(2)}px`);
        el.style.setProperty("--par-y", `${(y * 12).toFixed(2)}px`);
      });
    };
    const onLeave = () => {
      el.style.setProperty("--par-x", "0px");
      el.style.setProperty("--par-y", "0px");
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce]);

  const heroRef = useRef<HTMLElement>(null);

  const rise = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 1, y: 14 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section
      ref={heroRef}
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
          <m.h1 id="village-hero-title" className="village-hero-title" {...rise(0.05)}>
            {t("village.name", HOME_HERO_TITLE)}
          </m.h1>
          <m.p className="village-hero-pillars" {...rise(0.12)}>
            {t("home.hero.pillars", HOME_HERO_PILLARS)}
          </m.p>
          <m.p className="village-hero-support" {...rise(0.18)}>
            {t("home.hero.support", HOME_HERO_SUPPORT)}
          </m.p>
          <m.div className="village-hero-cta" {...rise(0.25)}>
            <Link className="btn" href="/about/">
              {t("home.exploreOurVillage")} <span aria-hidden>→</span>
            </Link>
            <Link className="btn ghost" href="/gallery/">
              {t("home.hero.viewGallery", t("home.viewGallery"))} <span aria-hidden>→</span>
            </Link>
          </m.div>

          {/* Arrives last, once the words have settled, and only to say that
              there is more below. Hidden from assistive tech: it is a hint
              about scrolling, not content. */}
          <m.div
            className="village-hero-scrollcue"
            aria-hidden
            initial={reduce ? false : { opacity: 0.001 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <span />
          </m.div>
        </div>
      </div>
    </section>
  );
}
