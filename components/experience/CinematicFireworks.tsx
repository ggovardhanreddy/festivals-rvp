"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useLowPowerDevice } from "@/lib/client";

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
  gravity: number;
  drag: number;
};

type Rocket = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  color: string;
  trail: { x: number; y: number; a: number }[];
  power: number;
};

const PALETTE = [
  "#f6d58a",
  "#ff9a5c",
  "#7ec8ff",
  "#b28cff",
  "#ff6b9d",
  "#8dffb0",
  "#ffffff",
  "#ffd36a",
];

/** Powerful cinematic fireworks — big blooms, dense sparks, soft trails. */
export function CinematicFireworks({
  className = "",
  intensity = 1,
}: {
  className?: string;
  intensity?: number;
}) {
  const reduce = useReducedMotion();
  const lowPower = useLowPowerDevice();
  const ref = useRef<HTMLCanvasElement>(null);
  const intensityRef = useRef(intensity);

  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    if (reduce) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let alive = true;
    let last = 0;
    let spawnAt = 0;
    const rockets: Rocket[] = [];
    const sparks: Spark[] = [];

    const powerOf = () => Math.max(0.35, intensityRef.current);
    const maxRocketsOf = () =>
      lowPower
        ? Math.min(5, 2 + Math.floor(powerOf()))
        : Math.min(14, 5 + Math.floor(powerOf() * 2.4));
    const sparkBudgetOf = () =>
      lowPower
        ? Math.floor(240 * powerOf())
        : Math.floor(860 * Math.min(2.6, powerOf()));

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth || window.innerWidth;
      const h = parent?.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.85);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const burst = (
      x: number,
      y: number,
      color: string,
      scale: number,
      ring = false,
    ) => {
      const power = powerOf();
      const base = lowPower ? 40 : 78;
      const count = Math.floor((base + Math.random() * 44) * scale * power);
      for (let i = 0; i < count; i += 1) {
        if (sparks.length > sparkBudgetOf()) sparks.shift();
        const angle = ring
          ? (i / count) * Math.PI * 2 + Math.random() * 0.08
          : Math.random() * Math.PI * 2;
        const speed = (1.5 + Math.random() * 5.6) * scale * (0.85 + power * 0.28);
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed * 0.92,
          life: 1,
          max: 0.9 + Math.random() * 1.15,
          color: Math.random() > 0.7 ? "#fff6df" : color,
          size: (1.25 + Math.random() * 3) * scale,
          gravity: 0.02 + Math.random() * 0.028,
          drag: 0.982 + Math.random() * 0.012,
        });
      }
    };

    const explode = (x: number, y: number, color: string, pwr: number) => {
      burst(x, y, color, 1.2 * pwr, true);
      burst(x, y, color, 0.8 * pwr, false);
      if (!lowPower && pwr > 0.85) {
        window.setTimeout(() => {
          if (!alive) return;
          burst(
            x,
            y + 6,
            PALETTE[Math.floor(Math.random() * PALETTE.length)]!,
            0.62 * pwr,
          );
        }, 80 + Math.random() * 90);
      }
    };

    const launch = (w: number, h: number, force = false) => {
      if (!force && rockets.length >= maxRocketsOf()) return;
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)]!;
      const pwr = 0.9 + Math.random() * 0.65;
      const power = powerOf();
      const count = !lowPower && (force || Math.random() > 0.5) ? 2 : 1;
      for (let n = 0; n < count; n += 1) {
        if (!force && rockets.length >= maxRocketsOf()) break;
        rockets.push({
          x: w * (0.06 + Math.random() * 0.88),
          y: h + 10,
          vx: (Math.random() - 0.5) * 0.95,
          vy: -(5.6 + Math.random() * 3.6) * power * pwr,
          targetY: h * (0.06 + Math.random() * 0.3),
          color,
          trail: [],
          power: pwr,
        });
      }
    };

    const salvo = (count = 6) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      for (let i = 0; i < count; i += 1) {
        window.setTimeout(() => {
          if (alive) launch(w, h, true);
        }, i * 110);
      }
    };

    const onClimax = () => salvo(lowPower ? 4 : 8);
    const onExplore = () => salvo(lowPower ? 3 : 6);

    const tick = (now: number) => {
      if (!alive) return;
      if (document.hidden) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dt = Math.min(32, now - last || 16) / 16;
      last = now;
      const power = powerOf();

      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";

      if (now > spawnAt) {
        launch(w, h);
        const gap = (lowPower ? 820 : 420) / Math.max(0.55, power);
        spawnAt = now + gap + Math.random() * (gap * 0.4);
      }

      ctx.globalCompositeOperation = "lighter";

      for (let i = rockets.length - 1; i >= 0; i -= 1) {
        const r = rockets[i]!;
        r.x += r.vx * dt;
        r.y += r.vy * dt;
        r.vy += 0.014 * dt;
        r.trail.push({ x: r.x, y: r.y, a: 1 });
        if (r.trail.length > 20) r.trail.shift();
        for (const t of r.trail) {
          t.a *= 0.9;
          ctx.fillStyle = `rgba(255, 220, 160, ${0.3 * t.a})`;
          ctx.beginPath();
          ctx.arc(t.x, t.y, 1.9, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 246, 223, 0.38)`;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 7.2, 0, Math.PI * 2);
        ctx.fill();
        if (r.y <= r.targetY || r.vy >= -0.15) {
          explode(r.x, r.y, r.color, r.power);
          rockets.splice(i, 1);
        }
      }

      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const s = sparks[i]!;
        s.vx *= s.drag;
        s.vy = s.vy * s.drag + s.gravity * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= 0.009 * dt;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        const alpha = Math.max(0, s.life / s.max);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        if (!lowPower && s.size > 2) {
          ctx.globalAlpha = alpha * 0.24;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * alpha * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(tick);
    };

    resize();
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    spawnAt = performance.now() + 100;
    for (let i = 0; i < (lowPower ? 3 : 5); i += 1) {
      window.setTimeout(() => {
        if (alive) launch(canvas.clientWidth, canvas.clientHeight, true);
      }, 140 + i * 140);
    }
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    window.addEventListener("rvp:fireworks-climax", onClimax);
    window.addEventListener("rvp:intro-chrome", onExplore);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("rvp:fireworks-climax", onClimax);
      window.removeEventListener("rvp:intro-chrome", onExplore);
    };
  }, [reduce, lowPower]);

  if (reduce) return null;
  return (
    <canvas ref={ref} className={`cinematic-fireworks ${className}`.trim()} aria-hidden />
  );
}
