"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "framer-motion";

export function SmoothScroll() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      touchMultiplier: 1.1,
    });

    let frame = 0;
    const raf = (time: number) => {
      if (!document.documentElement.classList.contains("intro-locked")) {
        lenis.raf(time);
      }
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const stop = () => lenis.stop();
    const start = () => lenis.start();
    window.addEventListener("rvp:intro-complete", start);
    if (document.documentElement.classList.contains("intro-locked")) stop();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("rvp:intro-complete", start);
      lenis.destroy();
    };
  }, [reduce]);

  return null;
}
