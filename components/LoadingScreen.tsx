"use client";

import { m, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { withBase } from "@/lib/base";

export function LoadingScreen() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setShow(false), 1200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <m.div
          className="loader-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          role="status"
          aria-live="polite"
          aria-label="Loading RVP Youth"
        >
          <m.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: "grid",
              placeItems: "center",
              gap: "1rem",
              backgroundImage: `radial-gradient(circle at center, rgba(212,164,90,.18), transparent 55%), url(${withBase("/brand/splash-icon.png")})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "120px",
              minHeight: 180,
              minWidth: 220,
            }}
          >
            <Logo className="loader-logo" />
          </m.div>
          <m.p
            className="eyebrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            Digital Village Experience
          </m.p>
        </m.div>
      )}
    </AnimatePresence>
  );
}
