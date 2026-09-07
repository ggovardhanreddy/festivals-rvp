"use client";

/**
 * A photograph that arrives and, where it makes sense, leans in.
 *
 * The homepage had this behaviour four times over in CSS -- temple cards,
 * event rows, memory tiles and people cards each declaring their own overflow,
 * their own transform and their own reduced-motion escape. This is the same
 * effect written once.
 *
 * The frame clips and the picture moves inside it, so a hover never changes
 * the element's box and nothing around it reflows. Only transform and opacity
 * are animated -- no filters, no blur, nothing that would cost a repaint on a
 * phone.
 *
 * Scale is deliberately small. These are photographs of people's families and
 * their temples; the movement should read as the picture settling, never as an
 * effect applied to it.
 */
import { m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { DUR, EASE, VIEWPORT_SAFE } from "./tokens";

export function CinematicImage({
  children,
  className,
  /** Scale it starts from on entry. 1 disables the entrance move. */
  from = 1.02,
  /** Scale on hover and keyboard focus. 1 disables it. */
  hover = 1.035,
  delay = 0,
  /** Rounding on the clipping frame, when the surrounding CSS has none. */
  radius,
  /**
   * Reveal through a mask that opens from the middle outward, rather than a
   * plain fade. Off by default: on a grid of many thumbnails the effect reads
   * as noise, and it earns its keep on the large photographs.
   */
  mask = false,
}: {
  children: ReactNode;
  className?: string;
  from?: number;
  hover?: number;
  delay?: number;
  radius?: string;
  mask?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <m.span
      className={className}
      // The clip lives on the frame, so the picture can move without the
      // layout noticing.
      style={{
        display: "block",
        overflow: "hidden",
        borderRadius: radius,
      }}
      initial={
        reduce
          ? false
          : mask
            // inset() opens from the centre. Animated on the frame, not the
            // picture, so the photograph itself is never scaled by the mask.
            ? { opacity: 0.001, clipPath: "inset(10% 0% 10% 0%)" }
            : { opacity: 0.001 }
      }
      whileInView={
        mask ? { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" } : { opacity: 1 }
      }
      viewport={VIEWPORT_SAFE}
      transition={{
        duration: mask ? DUR.image : DUR.reveal,
        delay,
        ease: EASE,
      }}
    >
      <m.span
        style={{ display: "block", willChange: reduce ? undefined : "transform" }}
        initial={reduce ? false : { scale: from }}
        whileInView={{ scale: 1 }}
        viewport={VIEWPORT_SAFE}
        transition={{ duration: DUR.image, delay, ease: EASE }}
        // Hover and focus share the state: a keyboard user reaching the card
        // should see what a pointer user sees.
        whileHover={reduce || hover === 1 ? undefined : { scale: hover }}
        whileFocus={reduce || hover === 1 ? undefined : { scale: hover }}
      >
        {children}
      </m.span>
    </m.span>
  );
}
