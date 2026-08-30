"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Animated statistic.
 *
 * The real number is what renders on the server and on first paint — the
 * count-up is decoration layered on top. Starting at zero and relying on an
 * IntersectionObserver to reach the truth is how a page ends up telling
 * visitors the village has 0 members.
 */
export function Counter({
  value,
  label,
  id,
}: {
  value: number;
  label: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2, margin: "0px 0px -5% 0px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(value);
  const animated = useRef(false);

  useEffect(() => {
    setN(value);
  }, [value]);

  useEffect(() => {
    if (!inView || reduce || animated.current || value <= 0) return;
    animated.current = true;

    let frame = 0;
    const total = 24;
    setN(0);
    const id = window.setInterval(() => {
      frame += 1;
      setN(Math.round((value * frame) / total));
      if (frame >= total) {
        setN(value);
        window.clearInterval(id);
      }
    }, 26);
    return () => {
      window.clearInterval(id);
      setN(value);
    };
  }, [inView, value, reduce]);

  return (
    <div ref={ref} className="stat-counter">
      <strong id={id}>{n.toLocaleString("en-IN")}</strong>
      <span className="muted">{label}</span>
    </div>
  );
}
