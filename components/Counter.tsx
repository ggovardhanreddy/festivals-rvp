"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

export function Counter({ value, label }: { value: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // Generous rootMargin so mobile Safari / short viewports still trigger
  const inView = useInView(ref, { once: true, amount: 0.2, margin: "0px 0px -5% 0px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    // Fallback if IntersectionObserver never fires (some WebViews)
    const fallback = window.setTimeout(() => {
      setN((prev) => (prev === 0 ? value : prev));
    }, 1800);
    return () => window.clearTimeout(fallback);
  }, [value]);

  useEffect(() => {
    if (!inView) return;

    if (reduce) {
      const frame = window.requestAnimationFrame(() => setN(value));
      return () => window.cancelAnimationFrame(frame);
    }

    let frame = 0;
    const total = 28;
    const id = window.setInterval(() => {
      frame += 1;
      setN(Math.round((value * frame) / total));
      if (frame >= total) window.clearInterval(id);
    }, 28);
    return () => window.clearInterval(id);
  }, [inView, value, reduce]);

  return (
    <div ref={ref} className="stat-counter">
      <strong>{n.toLocaleString()}</strong>
      <span className="muted">{label}</span>
    </div>
  );
}
