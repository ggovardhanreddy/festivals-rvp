"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
};

type Burst = {
  x: number;
  y: number;
  particles: Particle[];
  age: number;
};

const COLORS = ["#f0d7a0", "#d4a45a", "#ff9a5c", "#e8efe9", "#7ec8a3", "#ff6b6b"];

/**
 * Lightweight canvas fireworks for the RVP Youth landing celebration.
 */
export function Fireworks({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    const bursts: Burst[] = [];
    let lastSpawn = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth || window.innerWidth;
      const h = parent?.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = (w: number, h: number) => {
      const x = w * (0.12 + Math.random() * 0.76);
      const y = h * (0.08 + Math.random() * 0.42);
      const count = 28 + Math.floor(Math.random() * 22);
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]!;
      const particles: Particle[] = [];
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
        const speed = 1.2 + Math.random() * 3.4;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color,
          size: 1.2 + Math.random() * 2.2,
        });
      }
      bursts.push({ x, y, particles, age: 0 });
      if (bursts.length > 7) bursts.shift();
    };

    const tick = (now: number) => {
      if (!running) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      if (now - lastSpawn > 900 + Math.random() * 700) {
        spawn(w, h);
        lastSpawn = now;
      }

      for (const burst of bursts) {
        burst.age += 1;
        for (const p of burst.particles) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.02;
          p.vx *= 0.985;
          p.life -= 0.012 + Math.random() * 0.008;
          if (p.life <= 0) continue;
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };

    resize();
    spawn(canvas.clientWidth, canvas.clientHeight);
    lastSpawn = performance.now();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`landing-fireworks ${className}`.trim()}
      aria-hidden
    />
  );
}
