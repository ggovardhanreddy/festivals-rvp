"use client";

import { m, useReducedMotion } from "framer-motion";

const DOTS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 17) % 100}%`,
  top: `${(i * 29) % 100}%`,
  size: 4 + (i % 5) * 2,
  duration: 8 + (i % 6),
  delay: i * 0.15,
}));

export function Particles() {
  const reduce = useReducedMotion();
  return (
    <div className="particles" aria-hidden>
      {DOTS.map((dot) => (
        <m.span
          key={dot.id}
          className="particle"
          style={{
            left: dot.left,
            top: dot.top,
            width: dot.size,
            height: dot.size,
          }}
          animate={
            reduce
              ? undefined
              : {
                  y: [0, -18, 0],
                  x: [0, 10, 0],
                  opacity: [0.2, 0.55, 0.2],
                }
          }
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            delay: dot.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
