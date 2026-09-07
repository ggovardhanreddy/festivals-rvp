"use client";

/**
 * A hairline showing how far down the page you are.
 *
 * Two pixels, the accent colour, pinned to the top. It exists to answer "how
 * much of this is left" on the long pages -- a family tree, the timeline --
 * and to do nothing at all on the short ones.
 *
 * The document height is measured once and re-measured only on resize, never
 * inside the scroll handler: reading scrollHeight every frame forces a layout
 * on every scroll event, which is the classic way to make a progress bar the
 * jankiest thing on the page. The bar itself is a scaleX on a composited
 * layer, so scrolling costs one transform.
 */
import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;

    let max = 1;
    let frame = 0;

    const measure = () => {
      // One layout read, outside the scroll path.
      max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      paint();
    };

    const paint = () => {
      const ratio = Math.min(1, Math.max(0, window.scrollY / max));
      bar.style.transform = `scaleX(${ratio})`;
      // Out of the way entirely at the very top, so the hero opens clean.
      bar.style.opacity = ratio > 0.005 ? "1" : "0";
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        paint();
      });
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    // The page grows as images load and overlays render; watching the document
    // keeps the scale honest without polling.
    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden>
      <div
        ref={ref}
        className="scroll-progress-bar"
        // Reduced motion keeps the indicator -- it is information, not
        // decoration -- but drops the easing so it tracks instantly.
        data-instant={reduce ? "" : undefined}
      />
    </div>
  );
}
