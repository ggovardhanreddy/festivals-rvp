"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useFinePointer } from "@/lib/client";

export function CursorLight() {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const [pos, setPos] = useState({ x: -200, y: -200 });

  useEffect(() => {
    if (reduce || !fine) return;
    const onMove = (event: MouseEvent) => {
      setPos({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, fine]);

  if (reduce || !fine) return null;

  return (
    <div
      className="cursor-light"
      aria-hidden
      style={{
        transform: `translate3d(${pos.x - 120}px, ${pos.y - 120}px, 0)`,
      }}
    />
  );
}
