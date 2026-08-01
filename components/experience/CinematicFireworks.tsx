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
    const power = Math.max(0.35, intensity);
    const maxRockets = lowPower
      ? Math.min(4, 2 + Math.floor(power))
      : Math.min(10, 5 + Math.floor(power * 2));
    const sparkBudget = lowPower
      ? Math.floor(220 * power)
      : Math.floor(720 * Math.min(2.4, power));

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
      const base = lowPower ? 36 : 70;
      const count = Math.floor((base + Math.random() * 40) * scale * power);
      for (let i = 0; i < count; i += 1) {
        if (sparks.length > sparkBudget) sparks.shift();
        const angle = ring
          ? (i / count) * Math.PI * 2 + Math.random() * 0.08
          : Math.random() * Math.PI * 2;
        const speed = (1.4 + Math.random() * 5.2) * scale * (0.85 + power * 0.25);
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed * 0.92,
          life: 1,
          max: 0.85 + Math.random() * 1.1,
          color: Math.random() > 0.7 ? "#fff6df" : color,
          size: (1.2 + Math.random() * 2.8) * scale,
          gravity: 0.02 + Math.random() * 0.028,
          drag: 0.982 + Math.random() * 0.012,
        });
      }
    };

    const explode = (x: number, y: number, color: string, pwr: number) => {
      burst(x, y, color, 1.15 * pwr, true);
      burst(x, y, color, 0.75 * pwr, false);
      if (!lowPower && pwr > 0.9) {
        // Secondary delayed bloom for big shells
        window.setTimeout(() => {
          if (!alive) return;
          burst(x, y + 6, PALETTE[Math.floor(Math.random() * PALETTE.length)]!, 0.55 * pwr);
        }, 90 + Math.random() * 80);
      }
    };

    const launch = (w: number, h: number) => {
      if (rockets.length >= maxRockets) return;
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)]!;
      const pwr = 0.85 + Math.random() * 0.55;
      // Occasional double launch for festival power
      const count = !lowPower && Math.random() > 0.55 ? 2 : 1;
      for (let n = 0; n < count; n += 1) {
        if (rockets.length >= maxRockets) break;
        rockets.push({
          x: w * (0.08 + Math.random() * 0.84),
          y: h + 10,
          vx: (Math.random() - 0.5) * 0.85,
          vy: -(5.2 + Math.random() * 3.2) * power * pwr,
          targetY: h * (0.08 + Math.random() * 0.32),
          color,
          trail: [],
          power: pwr,
        });
      }
    };

    const tick = (now: number) => {
      if (!alive) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dt = Math.min(32, now - last || 16) / 16;
      last = now;

      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";

      if (now > spawnAt) {
        launch(w, h);
        const gap = (lowPower ? 900 : 480) / Math.max(0.6, power);
        spawnAt = now + gap + Math.random() * (gap * 0.45);
      }

      ctx.globalCompositeOperation = "lighter";

      for (let i = rockets.length - 1; i >= 0; i -= 1) {
        const r = rockets[i]!;
        r.x += r.vx * dt;
        r.y += r.vy * dt;
        r.vy += 0.014 * dt;
        r.trail.push({ x: r.x, y: r.y, a: 1 });
        if (r.trail.length > 18) r.trail.shift();
        for (const t of r.trail) {
          t.a *= 0.9;
          ctx.fillStyle = `rgba(255, 220, 160, ${0.28 * t.a})`;
          ctx.beginPath();
          ctx.arc(t.x, t.y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        // Bright rocket head + soft bloom
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 246, 223, 0.35)`;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 6.5, 0, Math.PI * 2);
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
        // Soft bloom halo on bright sparks
        if (!lowPower && s.size > 2) {
          ctx.globalAlpha = alpha * 0.22;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * alpha * 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(tick);
    };

    resize();
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    // Opening salvo
    spawnAt = performance.now() + 120;
    for (let i = 0; i < (lowPower ? 2 : 4); i += 1) {
      window.setTimeout(() => {
        if (alive) launch(canvas.clientWidth, canvas.clientHeight);
      }, 180 + i * 160);
    }
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduce, lowPower, intensity]);

  if (reduce) return null;
  return (
    <canvas ref={ref} className={`cinematic-fireworks ${className}`.trim()} aria-hidden />
  );
}
