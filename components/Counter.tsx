"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

export function Counter({ value, label }: { value: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

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
    <div ref={ref} className="glass-card" style={{ padding: "1.2rem 1.3rem" }}>
      <strong
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "2.2rem",
          display: "block",
        }}
      >
        {n}
      </strong>
      <span className="muted">{label}</span>
    </div>
  );
}
