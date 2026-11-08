"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { m, useReducedMotion } from "framer-motion";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { useEffect, useRef, useState } from "react";
import { withBase } from "@/lib/base";
import { MediaImage } from "@/components/media/MediaImage";
import {
  HOME_HERO_PILLARS,
  HOME_HERO_SUPPORT,
  HOME_HERO_TITLE,
} from "@/lib/site";
import { Progressive3D } from "@/components/three/Progressive3D";

const VillageLandingScene = dynamic(
  () => import("@/components/three/VillageLandingScene").then((m) => m.VillageLandingScene),
  { ssr: false },
);

/**
 * Homepage hero.
 *
 * Village name, tagline, a short promise, and two doors into the site.
 * When available, the backdrop is selected from the published public photo archive.
 */
type VillageHeroProps = {
  /** Public archive image selected by HomePage; never a generated concept image. */
  photo?: string | null;
  photoAlt?: string;
};

export function VillageHero({ photo, photoAlt }: VillageHeroProps) {
  const reduce = useReducedMotion();
  const { t } = useUiLang();
  const [entered, setEntered] = useState(false);

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
      data-photo={photo ? true : undefined}
      data-entered={entered || undefined}
      aria-labelledby="village-hero-title"
    >
      {photo ? (
        <div className="village-hero-photo">
          <MediaImage
            src={photo}
            alt={photoAlt || "Photograph from the Reddivaripalli village archive"}
            className="village-hero-archive-image"
            protect={false}
            fetchPriority="high"
            loading="eager"
            sizes="100vw"
            width={1920}
            height={1080}
          />
          <div className="village-hero-scrim" aria-hidden />
        </div>
      ) : null}
      <Progressive3D className="village-hero-3d-wrap">
        <VillageLandingScene entered={entered} />
      </Progressive3D>
      {!entered ? (
        <div className="village-hero-intro">
          <p className="eyebrow">{t("village.name", HOME_HERO_TITLE)}</p>
          <h2>{t("home.hero.pillars", "Our Village. Our Heritage. Our Home.")}</h2>
          <p className="muted">
            {t(
              "home.hero.support",
              "Explore culture, temples, stories, festivals, and people through an immersive digital village experience.",
            )}
          </p>
          <button className="btn" onClick={() => setEntered(true)} type="button">
            {t("common.enterVillage", "Enter Village")}
          </button>
        </div>
      ) : null}
      <div className="village-hero-glow" aria-hidden />
      <div className="village-hero-inner">
        {photo ? null : (
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
          <m.p className="village-hero-kicker" {...rise(0.02)}>
            OUR VILLAGE · OUR HERITAGE · OUR HOME
          </m.p>
          <m.h1 id="village-hero-title" className="village-hero-title" {...rise(0.05)}>
            {t("village.name", HOME_HERO_TITLE)}
          </m.h1>
          <m.p className="village-hero-pillars" {...rise(0.12)}>
            {t("home.hero.pillars", HOME_HERO_PILLARS)}
          </m.p>
          <m.p className="village-hero-support" {...rise(0.18)}>
            {t("home.hero.support", HOME_HERO_SUPPORT)}
          </m.p>
          <m.ul className="village-hero-highlights" {...rise(0.22)}>
            <li>{t("nav.templesFestivals", "Temples & Festivals")}</li>
            <li>{t("nav.gallery", "Gallery")}</li>
            <li>{t("nav.people", "Community")}</li>
          </m.ul>
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
