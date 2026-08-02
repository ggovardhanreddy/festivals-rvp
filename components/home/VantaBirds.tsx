"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { useLowPowerDevice } from "@/lib/client";

const THREE_CDN =
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js";
const VANTA_CDN =
  "https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.birds.min.js";

type VantaEffect = { destroy: () => void };

declare global {
  interface Window {
    THREE?: unknown;
    VANTA?: {
      BIRDS: (opts: Record<string, unknown>) => VantaEffect;
    };
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-rvp-src="${src}"]`,
    );
    if (existing) {
      if (existing.dataset.loaded === "1") resolve();
      else existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.rvpSrc = src;
    script.onload = () => {
      script.dataset.loaded = "1";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

/**
 * Premium Vanta Birds hero background — richer motion, theme-aware colors.
 */
export function VantaBirds({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const effectRef = useRef<VantaEffect | null>(null);
  const reduce = useReducedMotion();
  const lowPower = useLowPowerDevice();
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;

    let cancelled = false;

    const boot = async () => {
      try {
        await loadScript(THREE_CDN);
        await loadScript(VANTA_CDN);
        if (cancelled || !ref.current || !window.VANTA?.BIRDS) return;

        effectRef.current?.destroy();
        effectRef.current = window.VANTA.BIRDS({
          el: ref.current,
          THREE: window.THREE,
          mouseControls: !lowPower,
          touchControls: false,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1,
          scaleMobile: 1,
          backgroundColor: dark ? 0x0c1210 : 0x1a2820,
          color1: dark ? 0xe0b56a : 0xd4a45a,
          color2: dark ? 0x3d7a5c : 0x2f6b45,
          colorMode: "lerpGradient",
          birdSize: lowPower ? 1.1 : 1.45,
          wingSpan: lowPower ? 22 : 28,
          separation: lowPower ? 32 : 42,
          alignment: 36,
          cohesion: 28,
          quantity: lowPower ? 3 : 5,
          speedLimit: lowPower ? 4 : 5.5,
          backgroundAlpha: 1,
        });
      } catch {
        /* hero still works with slideshow */
      }
    };

    void boot();

    return () => {
      cancelled = true;
      effectRef.current?.destroy();
      effectRef.current = null;
    };
  }, [reduce, lowPower, dark]);

  if (reduce) return null;

  return (
    <div
      ref={ref}
      className={`hero-vanta ${className}`.trim()}
      aria-hidden
    />
  );
}
