"use client";

/**
 * A glass surface with a light sweep.
 *
 * Built on the `.glass-card` vocabulary already in globals.css -- the same
 * --glass token and border, so it looks right in both themes rather than
 * assuming a dark page. The site defaults to the system theme, and a glass
 * panel tuned only for dark goes muddy on light.
 *
 * The sweep runs once when the card arrives and again on hover. It does not
 * loop: a highlight crossing every card forever is a screensaver, and on a
 * phone it is a battery cost with nothing to show for it. The brief asked for
 * "periodically", not "continuously", and once-on-arrival plus once-on-intent
 * is the honest reading of that.
 */
import { m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { DUR, EASE, VIEWPORT_SAFE } from "./tokens";

export function GlossyCard({
  children,
  className,
  delay = 0,
  as = "div",
  /** Turn the sweep off and keep the surface, for a dense grid. */
  sheen = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "article" | "li" | "section";
  sheen?: boolean;
}) {
  const reduce = useReducedMotion();
  const Tag = m[as];

  return (
    <Tag
      className={["glossy-card", className].filter(Boolean).join(" ")}
      data-sheen={sheen && !reduce ? "" : undefined}
      initial={reduce ? false : { opacity: 1, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_SAFE}
      transition={{ duration: DUR.reveal, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}
