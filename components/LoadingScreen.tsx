"use client";

import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { withBase } from "@/lib/base";

/** Brief soft splash — on home, stay black so the cinematic intro owns the open. */
export function LoadingScreen() {
  const pathname = usePathname() || "/";
  const isHome = pathname === "/";
  const reduce = useReducedMotion();
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (isHome || reduce) {
      const frame = window.requestAnimationFrame(() => setShow(false));
      return () => window.cancelAnimationFrame(frame);
    }
    const timer = window.setTimeout(() => setShow(false), 480);
    return () => window.clearTimeout(timer);
  }, [isHome, reduce]);

  if (isHome) return null;

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
            src={withBase("/brand/rvp-youth-festival.webp")}
            alt=""
            className="landing-loader-photo"
            aria-hidden
          />
          <img
            src={withBase("/logo/loading-logo.svg")}
            alt="RVP Youth"
            width={200}
            height={56}
            className="landing-loader-logo"
          />
        </m.div>
      )}
    </AnimatePresence>
  );
}
