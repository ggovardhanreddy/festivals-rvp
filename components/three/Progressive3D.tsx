"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
};

function canRender3D(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const lowCore = (navigator.hardwareConcurrency || 2) <= 4;
  const lowMem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
    ? ((navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4) <= 4
    : false;
  if (lowCore && lowMem) return false;
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export function Progressive3D({ children, fallback = null, className }: Props) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    setEnabled(canRender3D());
  }, []);
  const body = useMemo(() => (enabled ? children : fallback), [children, enabled, fallback]);
  return <div className={className}>{body}</div>;
}
