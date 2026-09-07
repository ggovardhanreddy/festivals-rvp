"use client";

import { useEffect, useRef, useState } from "react";

/**
 * AuroraField — the ambient liquid-blob layer behind the whole site.
 *
 * Original work: the shapes are hand-authored SVG paths and CSS gradients,
 * not a traced or embedded stock asset. Nothing licence-encumbered ships.
 *
 * Design notes:
 * - It is a fixed, `aria-hidden`, pointer-transparent backdrop. It must never
 *   intercept a click or appear in the accessibility tree.
 * - The blobs drift with a long CSS animation rather than a rAF loop. A
 *   background decoration should not own a frame budget, and CSS transforms
 *   here stay on the compositor.
 * - `prefers-reduced-motion` freezes the drift but keeps the colour, because
 *   the colour is the design and the motion is the garnish.
 * - On phones the blur radius and blob count drop: a 120px blur across four
 *   full-viewport shapes is the single most expensive thing a mid-range
 *   Android would be asked to paint here.
 */
export function AuroraField() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [lean, setLean] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 820px), (prefers-reduced-motion: reduce)");
    const sync = () => setLean(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div
      ref={ref}
      className="aurora-field"
      data-lean={lean ? "" : undefined}
      aria-hidden="true"
    >
      <svg
        className="aurora-blobs"
        viewBox="0 0 1200 900"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <defs>
          <radialGradient id="aurora-a" cx="35%" cy="30%" r="72%">
            <stop offset="0%" stopColor="var(--color-violet)" stopOpacity="0.85" />
            <stop offset="60%" stopColor="var(--color-indigo)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--color-indigo)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="aurora-b" cx="60%" cy="40%" r="70%">
            <stop offset="0%" stopColor="var(--color-magenta)" stopOpacity="0.7" />
            <stop offset="65%" stopColor="var(--color-violet)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-violet)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="aurora-c" cx="45%" cy="55%" r="68%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.6" />
            <stop offset="70%" stopColor="var(--color-indigo)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--color-indigo)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Three organic shapes, drawn as closed cubic curves. Each drifts on
            its own timing so they never fall into visible lockstep. */}
        <path
          className="aurora-blob aurora-blob--1"
          fill="url(#aurora-a)"
          d="M244 96c118-46 268-22 336 74s46 232-34 314-214 128-318 86S82 434 96 330 126 142 244 96Z"
        />
        <path
          className="aurora-blob aurora-blob--2"
          fill="url(#aurora-b)"
          d="M916 44c112 26 214 128 220 244s-84 214-186 268-232 46-300-42-58-232 20-320S804 18 916 44Z"
        />
        <path
          className="aurora-blob aurora-blob--3"
          fill="url(#aurora-c)"
          d="M640 520c126-34 268 30 316 140s-32 224-146 260-262 6-330-84-4-222 160-316Z"
        />
      </svg>
    </div>
  );
}
