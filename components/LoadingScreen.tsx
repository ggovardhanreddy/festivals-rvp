"use client";

import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { withBase } from "@/lib/base";

/** Brief soft splash — never a long black screen. */
export function LoadingScreen() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (reduce) {
      const frame = window.requestAnimationFrame(() => setShow(false));
      return () => window.cancelAnimationFrame(frame);
    }
    const timer = window.setTimeout(() => setShow(false), 480);
    return () => window.clearTimeout(timer);
  }, [reduce]);

  return (
    <AnimatePresence>
      {show && (
        <m.div
          className="loader-screen landing-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          role="status"
          aria-live="polite"
          aria-label="Loading RVP Youth"
        >
          <img
            src={withBase("/brand/rvp-youth-photo.webp")}
            alt=""
            className="landing-loader-photo"
            aria-hidden
          />
          <img
            src={withBase("/brand/rvp-youth-logo-light.svg")}
            alt="RVP Youth"
            width={180}
            height={52}
            className="landing-loader-logo"
          />
        </m.div>
      )}
    </AnimatePresence>
  );
}
