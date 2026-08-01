"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "framer-motion";

/** Starts after intro (or shortly on other pages) so first paint stays light. */
export function SmoothScroll() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    let cancelled = false;
    let lenis: Lenis | null = null;
    let frame = 0;
    let idleTimer = 0;

    const boot = () => {
      if (cancelled || lenis) return;
      lenis = new Lenis({
        duration: 1.05,
        smoothWheel: true,
        touchMultiplier: 1.05,
      });

      const raf = (time: number) => {
        if (!document.documentElement.classList.contains("intro-locked")) {
          lenis?.raf(time);
        }
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);

      if (document.documentElement.classList.contains("intro-locked")) {
        lenis.stop();
      }
    };

    const onComplete = () => boot();
    window.addEventListener("rvp:intro-complete", onComplete);

    const pending =
      document.documentElement.classList.contains("intro-pending") ||
      document.documentElement.classList.contains("intro-active");

    if (!pending) {
      idleTimer = window.setTimeout(boot, 500);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(idleTimer);
      window.removeEventListener("rvp:intro-complete", onComplete);
      cancelAnimationFrame(frame);
      lenis?.destroy();
      lenis = null;
    };
  }, [reduce]);

  return null;
}
