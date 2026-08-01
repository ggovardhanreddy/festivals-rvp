"use client";

import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

export function LoadingScreen() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(true);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    let frame = 0;
    if (reduce) {
      frame = window.requestAnimationFrame(() => {
        setProgress(100);
        setShow(false);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1400);
      setProgress(Math.round(8 + t * 92));
      if (t < 1) frame = requestAnimationFrame(tick);
      else setShow(false);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduce]);

  return (
    <AnimatePresence>
      {show && (
        <m.div
          className="loader-screen cinematic-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          role="status"
          aria-live="polite"
          aria-label="Loading RVP Youth experience"
        >
          <div className="loader-rays" aria-hidden />
          <m.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <Logo className="loader-logo" />
          </m.div>
          <p className="eyebrow">Entering the village</p>
          <div className="cinematic-progress loader-progress" aria-hidden>
            <span style={{ width: `${progress}%` }} />
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
