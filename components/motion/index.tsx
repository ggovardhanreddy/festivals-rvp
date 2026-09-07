"use client";

/**
 * The reveal primitives.
 *
 * All of them share one rule that is easy to get wrong: nothing starts
 * invisible. `Reveal` already carried the scar tissue for this -- whileInView
 * can fail to fire on mobile when overflow is locked or the observer is late
 * after a navigation, and an element parked at opacity 0 then stays invisible
 * for good. Starting at full opacity and animating only the transform means a
 * missed trigger costs the animation, never the content. That matters more
 * here than elsewhere: a photograph of someone's grandmother that does not
 * appear is not a degraded animation, it is a missing person.
 *
 * Built on the framer-motion already in the project, through the `m` component
 * and the LazyMotion provider in Providers.tsx. No new dependency.
 */
import { m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { DIST, DUR, EASE, STAGGER, VIEWPORT, VIEWPORT_SAFE } from "./tokens";

type Common = {
  children: ReactNode;
  className?: string;
  /** Seconds. Use with an index for a sequence: `delay={i * STAGGER}`. */
  delay?: number;
  id?: string;
  /** Lower the viewport threshold, for tall or late-mounting blocks. */
  safe?: boolean;
  as?: "div" | "section" | "li" | "article" | "span" | "ul" | "ol";
};

function useMotionProps(reduce: boolean | null, safe?: boolean) {
  return {
    viewport: safe ? VIEWPORT_SAFE : VIEWPORT,
    reduce: Boolean(reduce),
  };
}

/** Opacity only. For something that should not move at all. */
export function FadeIn({ children, className, delay = 0, id, safe, as = "div" }: Common) {
  const reduce = useReducedMotion();
  const { viewport } = useMotionProps(reduce, safe);
  const Tag = m[as];
  return (
    <Tag
      id={id}
      className={className}
      initial={reduce ? false : { opacity: 0.001 }}
      whileInView={{ opacity: 1 }}
      viewport={viewport}
      transition={{ duration: DUR.reveal, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

/** The default arrival: rises a little and settles. */
export function FadeUp({
  children,
  className,
  delay = 0,
  id,
  safe,
  as = "div",
  distance = DIST.near,
}: Common & { distance?: number }) {
  const reduce = useReducedMotion();
  const { viewport } = useMotionProps(reduce, safe);
  const Tag = m[as];
  return (
    <Tag
      id={id}
      className={className}
      initial={reduce ? false : { opacity: 1, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: DUR.reveal, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

/** Enters from the side. For a timeline entry or an alternating layout. */
export function FadeSide({
  children,
  className,
  delay = 0,
  id,
  safe,
  as = "div",
  from = "left",
  distance = DIST.mid,
}: Common & { from?: "left" | "right"; distance?: number }) {
  const reduce = useReducedMotion();
  const { viewport } = useMotionProps(reduce, safe);
  const Tag = m[as];
  const x = from === "left" ? -distance : distance;
  return (
    <Tag
      id={id}
      className={className}
      initial={reduce ? false : { opacity: 1, x }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={viewport}
      transition={{ duration: DUR.reveal, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

/**
 * A photograph settling into place.
 *
 * Slower than text and barely scaled -- 1.03, not 1.1. The effect should be
 * noticed only as a sense that the picture arrived rather than blinked on.
 * Old photographs are not improved by being thrown around.
 */
export function ImageReveal({
  children,
  className,
  delay = 0,
  id,
  safe,
  as = "div",
}: Common) {
  const reduce = useReducedMotion();
  const { viewport } = useMotionProps(reduce, safe);
  const Tag = m[as];
  return (
    <Tag
      id={id}
      className={className}
      initial={reduce ? false : { opacity: 0.001, scale: 1.03 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={viewport}
      transition={{ duration: DUR.image, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

/** Grows very slightly into place. For a figure or a feature card. */
export function ScaleReveal({ children, className, delay = 0, id, safe, as = "div" }: Common) {
  const reduce = useReducedMotion();
  const { viewport } = useMotionProps(reduce, safe);
  const Tag = m[as];
  return (
    <Tag
      id={id}
      className={className}
      initial={reduce ? false : { opacity: 1, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={viewport}
      transition={{ duration: DUR.reveal, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

/**
 * A group whose children arrive one after another.
 *
 * The parent owns the timing so children need no index arithmetic. Wrap each
 * child in `StaggerItem`.
 */
export function StaggerChildren({
  children,
  className,
  delay = 0,
  id,
  safe,
  as = "div",
  step = STAGGER,
  /**
   * Layout hooks to forward, e.g. `{ "data-count": 3 }`.
   *
   * Wrapping an existing grid must not drop the attributes its CSS selects
   * on. Passing them here keeps the element that carries the class the same
   * element that carries the data.
   */
  dataset,
}: Common & { step?: number; dataset?: Record<string, string | number | boolean | undefined> }) {
  const reduce = useReducedMotion();
  const { viewport } = useMotionProps(reduce, safe);
  const Tag = m[as];
  return (
    <Tag
      id={id}
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="shown"
      viewport={viewport}
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: step, delayChildren: delay } },
      }}
      {...dataset}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
  distance = DIST.near,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article" | "span";
  distance?: number;
}) {
  const Tag = m[as];
  return (
    <Tag
      className={className}
      variants={{
        hidden: { opacity: 1, y: distance },
        shown: { opacity: 1, y: 0, transition: { duration: DUR.reveal, ease: EASE } },
      }}
    >
      {children}
    </Tag>
  );
}

/**
 * A heading arriving a line at a time.
 *
 * Splits on words, not characters. Per-character animation on a Telugu
 * heading would break the script apart -- Telugu combines consonants and
 * vowel signs into single clusters, and animating the pieces separately is
 * both wrong and unreadable.
 */
export function TextReveal({
  text,
  className,
  delay = 0,
  as: Tag = "h2",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p";
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  if (reduce) return <Tag className={className}>{text}</Tag>;
  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <m.span
          key={`${word}-${i}`}
          style={{ display: "inline-block", willChange: "transform" }}
          initial={{ opacity: 0.001, y: "0.4em" }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: DUR.reveal, delay: delay + i * 0.04, ease: EASE }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </m.span>
      ))}
    </Tag>
  );
}

export { DIST, DUR, EASE, STAGGER, VIEWPORT, VIEWPORT_SAFE } from "./tokens";
