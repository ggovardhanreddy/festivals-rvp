"use client";

import { useState } from "react";
import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { VILLAGE_SPOTS, type VillageSpot } from "@/lib/village";
import { withBase } from "@/lib/base";

export function VillageMap() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<VillageSpot | null>(VILLAGE_SPOTS[0]!);
  const [zoom, setZoom] = useState(1);

  return (
    <div className="village-map">
      <div className="village-map-stage">
        <m.div
          className="village-map-canvas"
          animate={{ scale: zoom }}
          transition={{ duration: reduce ? 0 : 0.45 }}
        >
          <img
            src={withBase("/brand/village-map.svg")}
            alt="Illustrated map of the village"
            className="village-map-art"
            draggable={false}
          />
          {VILLAGE_SPOTS.map((spot) => (
            <button
              key={spot.id}
              type="button"
              className="map-hotspot"
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              data-active={active?.id === spot.id}
              aria-label={`${spot.label}: ${spot.blurb}`}
              onClick={() => {
                setActive(spot);
                if (!reduce) setZoom(1.08);
              }}
              onMouseEnter={() => setActive(spot)}
            >
              <span className="map-hotspot-glow" aria-hidden />
              <span className="map-hotspot-dot" aria-hidden />
            </button>
          ))}
        </m.div>
        <div className="map-controls">
          <button
            type="button"
            className="btn ghost"
            onClick={() => setZoom((z) => Math.min(1.25, z + 0.08))}
            aria-label="Zoom in"
          >
            Zoom in
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => setZoom(1)}
            aria-label="Reset zoom"
          >
            Reset
          </button>
        </div>
      </div>
      {active && (
        <m.aside
          className="village-map-panel glass-card"
          key={active.id}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="eyebrow">{active.memoryHint}</p>
          <h3>{active.label}</h3>
          <p className="muted">{active.blurb}</p>
          <Link className="btn" href={active.href}>
            Open memories
          </Link>
        </m.aside>
      )}
    </div>
  );
}
