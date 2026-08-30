"use client";

import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { withBase } from "@/lib/base";

/**
 * Soft route splash. Must never trap taps or block pages if JS is slow —
 * CSS auto-hides as a hard fallback, and the React timer always clears.
 */
export function LoadingScreen() {
  const pathname = usePathname() || "/";
  const isHome = pathname === "/";
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isHome || reduce) {
      setShow(false);
      return;
    }

    setShow(true);
    const timer = window.setTimeout(() => setShow(false), 420);
    return () => window.clearTimeout(timer);
  }, [pathname, isHome, reduce]);

  if (isHome || reduce) return null;

  return (
    <AnimatePresence>
      {show ? (
        <m.div
          className="loader-screen landing-loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          role="status"
          aria-live="polite"
          aria-label="Loading RVP Youth"
          // Never intercept taps while fading / if stuck
          style={{ pointerEvents: "none" }}
        >
          <img
            src={withBase("/logo/logo-master.webp")}
            alt="Reddivaripalli Village"
            width={320}
            height={256}
            className="landing-loader-logo"
          />
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
