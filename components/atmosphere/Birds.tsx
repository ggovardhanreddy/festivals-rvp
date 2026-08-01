"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";

export function Birds() {
  const ref = useRef<SVGSVGElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;
    const birds = ref.current.querySelectorAll(".bird");
    const tweens = Array.from(birds).map((bird, index) =>
      gsap.to(bird, {
        x: 120 + index * 40,
        y: index % 2 === 0 ? -18 : 14,
        duration: 12 + index * 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 0.6,
      }),
    );
    return () => tweens.forEach((t) => t.kill());
  }, [reduce]);

  return (
    <svg ref={ref} className="atm-birds" viewBox="0 0 400 120" aria-hidden>
      <g className="bird" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M20 40 q12 -12 24 0" />
        <path d="M44 40 q12 -12 24 0" />
      </g>
      <g className="bird" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M90 22 q10 -10 20 0" />
        <path d="M110 22 q10 -10 20 0" />
      </g>
      <g className="bird" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M160 55 q11 -11 22 0" />
        <path d="M182 55 q11 -11 22 0" />
      </g>
    </svg>
  );
}
