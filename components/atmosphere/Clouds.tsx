"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";

export function Clouds() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;
    const nodes = ref.current.querySelectorAll(".cloud");
    const tweens = Array.from(nodes).map((node, index) =>
      gsap.to(node, {
        x: index % 2 === 0 ? 40 : -50,
        duration: 18 + index * 4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      }),
    );
    return () => {
      tweens.forEach((tween) => tween.kill());
    };
  }, [reduce]);

  return (
    <div className="atm-clouds" ref={ref} aria-hidden>
      <span className="cloud c1" />
      <span className="cloud c2" />
      <span className="cloud c3" />
    </div>
  );
}
