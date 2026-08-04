"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { withBase } from "@/lib/base";
import { useLowPowerDevice } from "@/lib/client";

export type VantaEffectName =
  | "birds"
  | "fog"
  | "halo"
  | "topology"
  | "clouds2"
  | "net";

type VantaEffect = { destroy: () => void };

type EffectConfig = {
  apiKey: string;
  local: string;
  cdn: string;
  needsP5?: boolean;
};

const THREE_LOCAL = "/vendor/three.min.js";
const THREE_CDN =
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js";
const P5_LOCAL = "/vendor/p5.min.js";
const P5_CDN = "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.1.9/p5.min.js";

const EFFECTS: Record<VantaEffectName, EffectConfig> = {
  birds: {
    apiKey: "BIRDS",
    local: "/vendor/vanta.birds.min.js",
    cdn: "https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.birds.min.js",
  },
  fog: {
    apiKey: "FOG",
    local: "/vendor/vanta.fog.min.js",
    cdn: "https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.fog.min.js",
  },
  halo: {
    apiKey: "HALO",
    local: "/vendor/vanta.halo.min.js",
    cdn: "https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.halo.min.js",
  },
  topology: {
    apiKey: "TOPOLOGY",
    local: "/vendor/vanta.topology.min.js",
    cdn: "https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.topology.min.js",
    needsP5: true,
  },
  clouds2: {
    apiKey: "CLOUDS2",
    local: "/vendor/vanta.clouds2.min.js",
    cdn: "https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.clouds2.min.js",
  },
  net: {
    apiKey: "NET",
    local: "/vendor/vanta.net.min.js",
    cdn: "https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.net.min.js",
  },
};

declare global {
  interface Window {
    THREE?: unknown;
    p5?: unknown;
    VANTA?: Record<string, (opts: Record<string, unknown>) => VantaEffect>;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-rvp-src="${src}"]`,
    );
    if (existing) {
      if (existing.dataset.loaded === "1") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error(`Failed ${src}`)),
        { once: true },
      );
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

async function loadScriptWithFallback(localPath: string, cdn: string) {
  const local = withBase(localPath);
  try {
    await loadScript(local);
  } catch {
    await loadScript(cdn);
  }
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

function effectOptions(
  effect: VantaEffectName,
  dark: boolean,
  lowPower: boolean,
  soft: boolean,
): Record<string, unknown> {
  switch (effect) {
    case "birds": {
      // Soft home hero: fewer, smaller, slower birds so copy stays readable.
      return {
        backgroundColor: dark ? 0x0a100e : 0x14241c,
        color1: dark ? 0xe8c07a : 0xd9ae62,
        color2: dark ? 0x4a8f6a : 0x3a7a55,
        colorMode: "lerpGradient",
        birdSize: soft ? (lowPower ? 1.05 : 1.25) : lowPower ? 1.55 : 2.05,
        wingSpan: soft ? (lowPower ? 22 : 26) : lowPower ? 28 : 36,
        separation: soft ? 40 : lowPower ? 34 : 46,
        alignment: soft ? 48 : lowPower ? 42 : 50,
        cohesion: soft ? 36 : lowPower ? 32 : 40,
        quantity: soft ? (lowPower ? 2 : 3) : lowPower ? 4 : 6,
        speedLimit: soft ? (lowPower ? 1.8 : 2.2) : lowPower ? 3 : 3.8,
        backgroundAlpha: soft ? 0.85 : 1,
      };
    }
    case "fog":
      return {
        highlightColor: dark ? 0xc9a66b : 0xe8c07a,
        midtoneColor: dark ? 0x2a4a38 : 0x4a8f6a,
        lowlightColor: dark ? 0x0c1410 : 0x1a2c22,
        baseColor: dark ? 0x0a100e : 0xf4f1ea,
        blurFactor: lowPower ? 0.45 : 0.55,
        speed: lowPower ? 0.6 : 0.9,
        zoom: lowPower ? 0.85 : 1.05,
      };
    case "halo":
      return {
        backgroundColor: dark ? 0x0a100e : 0x101816,
        baseColor: dark ? 0x1a3a2c : 0x2a5a40,
        size: lowPower ? 1.1 : 1.35,
        amplitudeFactor: lowPower ? 0.85 : 1.05,
        xOffset: 0,
        yOffset: 0.1,
      };
    case "topology":
      return {
        backgroundColor: dark ? 0x0a100e : 0xf7f4ef,
        color: dark ? 0x4a8f6a : 0x2f6b4a,
      };
    case "clouds2":
      return {
        backgroundColor: dark ? 0x0a100e : 0xdce8f0,
        skyColor: dark ? 0x1a2a38 : 0x68a0c8,
        cloudColor: dark ? 0x3a4a58 : 0xffffff,
        lightColor: dark ? 0xe8c07a : 0xfff5e0,
        speed: lowPower ? 0.6 : 0.9,
      };
    case "net":
      return {
        color: dark ? 0xe8c07a : 0xc9a66b,
        backgroundColor: dark ? 0x0a100e : 0x14241c,
        points: lowPower ? 8 : 11,
        maxDistance: lowPower ? 18 : 22,
        spacing: lowPower ? 16 : 18,
        showDots: true,
      };
  }
}

/**
 * Fixed page identity background — Vanta effect assigned per route.
 * Initializes after mount, destroys on leave, falls back without WebGL / reduced motion.
 */
export function VantaBackground({
  effect,
  className = "",
  soft = false,
}: {
  effect: VantaEffectName;
  className?: string;
  /** Lower intensity / cost — used on the homepage hero. */
  soft?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const effectRef = useRef<VantaEffect | null>(null);
  const reduce = useReducedMotion();
  const lowPower = useLowPowerDevice();
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";
  const [ready, setReady] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Heavy effects (net/topology) often freeze mid-range phones — use CSS fallback.
    const mobile =
      typeof window !== "undefined" &&
      (window.matchMedia("(max-width: 820px)").matches ||
        window.matchMedia("(pointer: coarse)").matches);
    const heavyOnMobile =
      mobile && (effect === "net" || effect === "topology" || effect === "halo");

    if (reduce || !hasWebGL() || heavyOnMobile || lowPower) {
      setUseFallback(true);
      setReady(true);
      return;
    }

    let cancelled = false;
    const cfg = EFFECTS[effect];

    const boot = async () => {
      try {
        if (cfg.needsP5) {
          await loadScriptWithFallback(P5_LOCAL, P5_CDN);
        } else {
          await loadScriptWithFallback(THREE_LOCAL, THREE_CDN);
        }
        await loadScriptWithFallback(cfg.local, cfg.cdn);
        const factory = window.VANTA?.[cfg.apiKey];
        if (cancelled || !ref.current || !factory) {
          if (!cancelled) {
            setUseFallback(true);
            setReady(true);
          }
          return;
        }

        effectRef.current?.destroy();
        // Decorative only — never steal taps from nav / page chrome
        effectRef.current = factory({
          el: ref.current,
          THREE: window.THREE,
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: soft ? 0.85 : 1,
          scaleMobile: soft ? 0.75 : 1,
          ...effectOptions(effect, dark, lowPower, soft),
        });
        const host = ref.current;
        if (host) {
          host.style.pointerEvents = "none";
          host.querySelectorAll("canvas").forEach((node) => {
            (node as HTMLElement).style.pointerEvents = "none";
          });
        }
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) {
          setUseFallback(true);
          setReady(true);
        }
      }
    };

    // Soft hero: defer boot so LCP text/logo paint first.
    const kick = window.setTimeout(() => {
      if (!cancelled) void boot();
    }, soft ? 280 : 40);

    // Fail-safe: never leave the hero blank if Vanta hangs
    const failsafe = window.setTimeout(() => {
      if (!cancelled && !effectRef.current) {
        setUseFallback(true);
        setReady(true);
      }
    }, soft ? 2800 : 3500);

    return () => {
      cancelled = true;
      window.clearTimeout(kick);
      window.clearTimeout(failsafe);
      effectRef.current?.destroy();
      effectRef.current = null;
    };
  }, [effect, reduce, lowPower, dark, soft]);

  return (
    <div
      ref={ref}
      className={`hero-vanta hero-vanta--${effect} ${ready ? "hero-vanta--ready" : ""} ${useFallback ? "hero-vanta--fallback" : ""} ${className}`.trim()}
      data-vanta={effect}
      aria-hidden
    />
  );
}
