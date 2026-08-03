"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import {
  m,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Particles } from "./Particles";
import { Logo } from "./Logo";
import { Clouds } from "./atmosphere/Clouds";
import { Birds } from "./atmosphere/Birds";
import { SunRays } from "./atmosphere/SunRays";
import { withBase } from "@/lib/base";
import type { VantaEffectName } from "@/components/vanta/VantaBackground";

const VantaBackground = dynamic(
  () =>
    import("@/components/vanta/VantaBackground").then((m) => m.VantaBackground),
  { ssr: false },
);

export function MemoryHero({
  eyebrow,
  title,
  lede,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  backgroundImage,
  backgroundVideo,
  showLogo = false,
  fullBleed = false,
  atmosphere = false,
  vantaEffect,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  showLogo?: boolean;
  fullBleed?: boolean;
  atmosphere?: boolean;
  /** Fixed identity Vanta background — never replace with festival hero images. */
  vantaEffect?: VantaEffectName;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 40, damping: 20 });
  const sy = useSpring(y, { stiffness: 40, damping: 20 });
  const moveX = useTransform(sx, [-40, 40], [-14, 14]);
  const moveY = useTransform(sy, [-40, 40], [-12, 12]);
  const useVanta = Boolean(vantaEffect);

  return (
    <section
      className={`${fullBleed ? "hero hero-fullbleed" : "hero"}${useVanta ? " hero--vanta" : ""}`}
      onMouseMove={(event) => {
        if (reduce || useVanta) return;
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - rect.left - rect.width / 2);
        y.set(event.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {useVanta && vantaEffect ? (
        <>
          <div className="hero-vanta-media" aria-hidden>
            <VantaBackground effect={vantaEffect} />
            <div className="hero-vanta-veil" />
          </div>
        </>
      ) : (
        <>
          <m.div
            className="hero-media"
            style={{
              x: moveX,
              y: moveY,
              backgroundImage: backgroundImage
                ? `linear-gradient(180deg, rgba(10,16,12,.2), rgba(10,16,12,.78)), url(${withBase(backgroundImage)})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {backgroundVideo && (
            <video
              className="hero-video"
              autoPlay
              muted
              loop
              playsInline
              poster={backgroundImage ? withBase(backgroundImage) : undefined}
              aria-hidden
            >
              <source src={withBase(backgroundVideo)} />
            </video>
          )}
          <div className="aurora" aria-hidden />
          {atmosphere && (
            <>
              <SunRays />
              <Clouds />
              <Birds />
            </>
          )}
          <Particles />
        </>
      )}
      <div className="hero-fade" />
      <div className="hero-copy">
        {showLogo && (
          <m.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            style={{ marginBottom: "1.25rem" }}
          >
            <Logo className="hero-logo" />
          </m.div>
        )}
        {!showLogo && (
          <m.p
            className="eyebrow"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {eyebrow}
          </m.p>
        )}
        <m.h1
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
        >
          {title}
        </m.h1>
        <m.p
          className="lede"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12 }}
        >
          {lede}
        </m.p>
        <m.div
          className="btn-row"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
        >
          <Link className="btn magnetic" href={primaryHref}>
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel && (
            <Link className="btn ghost" href={secondaryHref}>
              {secondaryLabel}
            </Link>
          )}
        </m.div>
        <m.div
          className="scroll-hint"
          initial={{ opacity: 0 }}
          animate={reduce ? { opacity: 0.8 } : { opacity: 0.8, y: [0, 6, 0] }}
          transition={
            reduce ? { delay: 0.8 } : { delay: 0.8, duration: 2.2, repeat: Infinity }
          }
        >
          Scroll
        </m.div>
      </div>
    </section>
  );
}
