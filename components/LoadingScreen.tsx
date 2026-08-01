"use client";

import { m, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setShow(false), 900);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <m.div
          className="loader-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <m.div
            className="loader-mark"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            Festivals <span style={{ color: "var(--accent)" }}>RVP</span>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
