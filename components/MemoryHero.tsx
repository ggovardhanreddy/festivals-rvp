"use client";

import Link from "next/link";
import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Particles } from "./Particles";

export function MemoryHero({
  eyebrow,
  title,
  lede,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 40, damping: 20 });
  const sy = useSpring(y, { stiffness: 40, damping: 20 });
  const moveX = useTransform(sx, [-40, 40], [-12, 12]);
  const moveY = useTransform(sy, [-40, 40], [-10, 10]);

  return (
    <section
      className="hero"
      onMouseMove={(event) => {
        if (reduce) return;
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - rect.left - rect.width / 2);
        y.set(event.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <m.div className="hero-media" style={{ x: moveX, y: moveY }} />
      <Particles />
      <div className="hero-fade" />
      <div className="hero-copy">
        <m.p
          className="eyebrow"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {eyebrow}
        </m.p>
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
          <Link className="btn" href={primaryHref}>
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel && (
            <Link className="btn ghost" href={secondaryHref}>
              {secondaryLabel}
            </Link>
          )}
        </m.div>
      </div>
    </section>
  );
}
