"use client";

import { useRef, type MouseEvent } from "react";
import Link from "next/link";
import { m, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { VILLAGE_MAPS_URL, VILLAGE_NAME } from "@/lib/site";
import { withBase } from "@/lib/base";

/**
 * "8D" style depth map — layered parallax over the real village aerial.
 */
export function VillageDepthMap() {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 120, damping: 18 });
  const sy = useSpring(y, { stiffness: 120, damping: 18 });
  const layerFar = useTransform(sx, [-40, 40], ["2%", "-2%"]);
  const layerMidY = useTransform(sy, [-40, 40], ["1.5%", "-1.5%"]);
  const layerNear = useTransform(sx, [-40, 40], ["-3%", "3%"]);
  const layerNearY = useTransform(sy, [-40, 40], ["-2%", "2%"]);
  const glowX = useTransform(sx, [-40, 40], ["42%", "58%"]);
  const glowY = useTransform(sy, [-40, 40], ["38%", "52%"]);

  function onMove(e: MouseEvent<HTMLDivElement>) {
    if (reduce || !stage.current) return;
    const rect = stage.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width - 0.5) * 80;
    const py = ((e.clientY - rect.top) / rect.height - 0.5) * 80;
    x.set(px);
    y.set(py);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className="village-depth-map">
      <div
        ref={stage}
        className="village-depth-stage"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <m.div
          className="village-depth-layer village-depth-far"
          style={{ x: layerFar, y: layerMidY }}
        >
          <img
            src={withBase("/brand/village-aerial.webp")}
            alt={`${VILLAGE_NAME} aerial map centered on Ramalayam`}
            draggable={false}
          />
        </m.div>
        <m.div
          className="village-depth-layer village-depth-mist"
          style={{ x: layerNear, y: layerNearY }}
          aria-hidden
        />
        <m.div
          className="village-depth-glow"
          style={{ left: glowX, top: glowY }}
          aria-hidden
        />
        <div className="village-depth-pin">
          <span className="village-depth-pin-dot" />
          <span className="village-depth-pin-label">
            Ramalayam
            <small>రామాలయం</small>
          </span>
        </div>
        <div className="village-depth-vignette" aria-hidden />
      </div>
      <aside className="village-map-panel glass-card">
        <p className="eyebrow">Real village · Depth view</p>
        <h3>{VILLAGE_NAME}</h3>
        <p className="muted">
          Aerial memory of home — Ramalayam at the heart. Move to feel depth; open
          Maps to walk the lanes.
        </p>
        <div className="btn-row">
          <a className="btn" href={VILLAGE_MAPS_URL} target="_blank" rel="noreferrer">
            Open in Google Maps
          </a>
          <Link className="btn ghost" href="/vinayaka-chavithi/">
            Temple memories
          </Link>
        </div>
      </aside>
    </div>
  );
}
