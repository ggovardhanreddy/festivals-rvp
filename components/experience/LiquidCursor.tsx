"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useFinePointer, useLowPowerDevice } from "@/lib/client";
import { getCursorMode, type CursorMode } from "./CursorPrefs";

type Drop = { x: number; y: number; vx: number; vy: number; life: number; r: number };

/** Premium water-bubble cursor — desktop fine pointer only. */
export function LiquidCursor() {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const lowPower = useLowPowerDevice();
  const [mode, setMode] = useState<CursorMode>("full");
  const blob = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const ripple = useRef<HTMLDivElement>(null);
  const dropsRoot = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100 });
  const velocity = useRef({ x: 0, y: 0 });
  const magnetic = useRef<{ x: number; y: number } | null>(null);
  const drops = useRef<Drop[]>([]);

  useEffect(() => {
    setMode(getCursorMode());
    const onMode = (e: Event) => {
      const detail = (e as CustomEvent<CursorMode>).detail;
      if (detail) setMode(detail);
    };
    window.addEventListener("rvp:cursor-mode", onMode);
    return () => window.removeEventListener("rvp:cursor-mode", onMode);
  }, []);

  const enabled = !reduce && fine && !lowPower && mode !== "off";
  const simple = mode === "simple" || lowPower;

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove("has-liquid-cursor", "cursor-magnetic");
      return;
    }
    document.documentElement.classList.add("has-liquid-cursor");

    const onMove = (e: PointerEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const mag = el?.closest("a, button, .btn, .magnetic, .album-card") as
        | HTMLElement
        | null;
      if (mag) {
        const r = mag.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        magnetic.current = {
          x: e.clientX + (cx - e.clientX) * 0.28,
          y: e.clientY + (cy - e.clientY) * 0.28,
        };
        document.documentElement.classList.add("cursor-magnetic");
      } else {
        magnetic.current = null;
        document.documentElement.classList.remove("cursor-magnetic");
      }
    };

    const onDown = (e: PointerEvent) => {
      if (simple) return;
      if (ripple.current) {
        ripple.current.style.left = `${e.clientX}px`;
        ripple.current.style.top = `${e.clientY}px`;
        ripple.current.classList.remove("is-splash");
        void ripple.current.offsetWidth;
        ripple.current.classList.add("is-splash");
      }
      for (let i = 0; i < 5; i += 1) {
        const a = Math.random() * Math.PI * 2;
        const s = 1.1 + Math.random() * 2.4;
        drops.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          life: 1,
          r: 2 + Math.random() * 3,
        });
      }
    };

    let raf = 0;
    const ease = simple ? 0.28 : 0.2;
    const tick = () => {
      const aim = magnetic.current ?? target.current;
      const c = current.current;
      const prevX = c.x;
      const prevY = c.y;
      c.x += (aim.x - c.x) * ease;
      c.y += (aim.y - c.y) * ease;
      velocity.current.x = c.x - prevX;
      velocity.current.y = c.y - prevY;
      const speed = Math.min(
        1.35,
        Math.hypot(velocity.current.x, velocity.current.y) * 0.08,
      );
      const stretch = simple ? 1 : 1 + speed * 0.35;
      const squash = 1 / stretch;

      if (blob.current) {
        blob.current.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) translate(-50%, -50%) scale(${stretch}, ${squash})`;
      }
      if (ring.current) {
        const rx = c.x + (aim.x - c.x) * 0.4;
        const ry = c.y + (aim.y - c.y) * 0.4;
        ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }
      if (trailRef.current && !simple) {
        const tx = c.x - velocity.current.x * 2.2;
        const ty = c.y - velocity.current.y * 2.2;
        trailRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%) scale(${1 + speed * 0.2})`;
      }

      if (dropsRoot.current && !simple) {
        const alive: Drop[] = [];
        dropsRoot.current.innerHTML = "";
        for (const d of drops.current) {
          d.x += d.vx;
          d.y += d.vy;
          d.vy += 0.12;
          d.life -= 0.035;
          if (d.life <= 0) continue;
          alive.push(d);
          const el = document.createElement("span");
          el.className = "liquid-cursor-drop";
          el.style.transform = `translate3d(${d.x}px, ${d.y}px, 0) translate(-50%, -50%)`;
          el.style.width = `${d.r}px`;
          el.style.height = `${d.r}px`;
          el.style.opacity = String(d.life);
          dropsRoot.current.appendChild(el);
        }
        drops.current = alive;
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      document.documentElement.classList.remove(
        "has-liquid-cursor",
        "cursor-magnetic",
      );
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [enabled, simple]);

  if (!enabled) return null;

  return (
    <div className={`liquid-cursor-root ${simple ? "is-simple" : ""}`} aria-hidden>
      {!simple && <div ref={trailRef} className="liquid-cursor-trail" />}
      <div ref={ring} className="liquid-cursor-ring" />
      <div ref={blob} className="liquid-cursor-blob" />
      {!simple && <div ref={ripple} className="liquid-cursor-ripple" />}
      {!simple && <div ref={dropsRoot} className="liquid-cursor-drops" />}
    </div>
  );
}
