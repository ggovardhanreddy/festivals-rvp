"use client";

import { useEffect, useState } from "react";

/** True when the boot script marked the document as a mobile shell. */
export function isMobileShell(): boolean {
  if (typeof document === "undefined") return false;
  return (
    document.documentElement.classList.contains("rvp-mobile") ||
    window.matchMedia("(max-width:820px)").matches
  );
}

/** Client hook — starts false (SSR-safe), then resolves after mount. */
export function useAllowHeavyEffects(): boolean {
  const [allow, setAllow] = useState(false);
  useEffect(() => {
    setAllow(!isMobileShell());
  }, []);
  return allow;
}
