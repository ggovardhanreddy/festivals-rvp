"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import {
  OVERVIEW_CAMERA,
  VILLAGE_HOTSPOTS,
  lightingForHour,
  type CameraPose,
  type VillageHotspotId,
} from "@/lib/experience";
import { useIsClient, useLowPowerDevice } from "@/lib/client";
import { VillageMap } from "@/components/VillageMap";
import { VILLAGE_MAPS_URL } from "@/lib/site";
import { mediaDisplaySrc, prefetchImage } from "@/lib/media-src";
import type { Media } from "@/lib/types";

const VillageCanvas = dynamic(
  () => import("./village/VillageCanvas").then((mod) => mod.VillageCanvas),
  { ssr: false, loading: () => <div className="village-canvas map-canvas" /> },
);

const IDLE_MS = 3800;
const HOVER_MS = 1400;

function MapViewportSlideshow({
  items,
}: {
  items: Media[];
}) {
  const reduce = useReducedMotion();
  const slides = useMemo(
    () => items.filter((item) => item.type === "image").slice(0, 8),
    [items],
  );
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const id = window.setInterval(
      () => setIndex((value) => (value + 1) % slides.length),
      hovered ? HOVER_MS : IDLE_MS,
    );
    return () => window.clearInterval(id);
  }, [slides.length, reduce, hovered]);

  useEffect(() => {
    if (!slides.length) return;
    const next = slides[(index + 1) % slides.length];
    if (next) prefetchImage(mediaDisplaySrc(next));
  }, [index, slides]);

  if (!slides.length) return null;
  const current = slides[index]!;

  return (
    <div
      className="map-viewport-slideshow"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-roledescription="carousel"
      aria-label="Village memory slideshow"
    >
      <AnimatePresence mode="sync">
        <m.img
          key={current.id}
          className="map-viewport-slideshow-img"
          src={mediaDisplaySrc(current)}
          alt={current.title || "Village memory"}
          initial={reduce ? false : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          draggable={false}
          decoding="async"
          loading="eager"
        />
      </AnimatePresence>
      <div className="map-viewport-slideshow-veil" aria-hidden />
      <div className="map-viewport-slideshow-caption">
        <p className="eyebrow">{hovered ? "Hovering" : "Slideshow"}</p>
        <h4>{current.title || "From home"}</h4>
      </div>
      {slides.length > 1 && slides.length <= 14 ? (
        <div className="map-viewport-slideshow-dots" aria-hidden>
          {slides.map((slide, i) => (
            <span
              key={slide.id}
              className={`map-viewport-slideshow-dot${i === index ? " is-active" : ""}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function InteractiveVillageMap({
  accent = "default",
  slides = [],
}: {
  accent?: "default" | "sankranthi" | "vinayaka" | "birthday" | "trips";
  slides?: Media[];
}) {
  const reduce = useReducedMotion();
  const client = useIsClient();
  const lowPower = useLowPowerDevice();
  const use3d = client && !reduce;
  const [activeId, setActiveId] = useState<VillageHotspotId | null>(null);
  const [hoveredId, setHoveredId] = useState<VillageHotspotId | null>(null);
  const [pose, setPose] = useState<CameraPose>(OVERVIEW_CAMERA);
  const hasSlides = slides.some((item) => item.type === "image");

  if (!use3d && !hasSlides) return <VillageMap />;

  const spot = VILLAGE_HOTSPOTS.find((s) => s.id === (activeId || hoveredId));
  const lighting = lightingForHour();

  return (
    <div className="interactive-village-map">
      <div className={`map-canvas map-viewport${hasSlides ? " has-slideshow" : ""}`}>
        {hasSlides ? (
          <MapViewportSlideshow items={slides} />
        ) : use3d ? (
          <VillageCanvas
            pose={pose}
            lighting={lighting}
            weather={lighting === "night" ? "night" : "sunny"}
            reduced={!!reduce}
            lowPower={lowPower}
            activeId={activeId}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            onSelect={(id) => {
              const found = VILLAGE_HOTSPOTS.find((s) => s.id === id);
              if (!found) return;
              setActiveId(id);
              setPose(found.camera);
            }}
            accent={accent}
            className="village-canvas"
          />
        ) : (
          <VillageMap />
        )}

        {hasSlides && (
          <div className="map-hotspot-strip" role="list" aria-label="Memory places">
            {VILLAGE_HOTSPOTS.map((h) => (
              <button
                key={h.id}
                type="button"
                role="listitem"
                className={`map-hotspot-chip${activeId === h.id || hoveredId === h.id ? " is-active" : ""}`}
                onMouseEnter={() => setHoveredId(h.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => {
                  setActiveId(h.id);
                  setPose(h.camera);
                }}
              >
                {h.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <aside className="village-map-panel glass-card">
        <p className="eyebrow">{spot ? "Memory place" : "Explore"}</p>
        <h3>{spot?.label || "Choose a glowing place"}</h3>
        <p className="muted">
          {spot?.blurb ||
            (hasSlides
              ? "Memories play on the left. Hover to speed the slideshow. Pick a place to open its chapter."
              : "Hover to glow. Click to fly the camera. Open memories when you arrive.")}
        </p>
        <div className="btn-row">
          {spot && (
            <Link className="btn" href={spot.href}>
              Open memories
            </Link>
          )}
          <a className="btn ghost" href={VILLAGE_MAPS_URL} target="_blank" rel="noreferrer">
            Google Maps
          </a>
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              setActiveId(null);
              setPose(OVERVIEW_CAMERA);
            }}
          >
            Return
          </button>
        </div>
      </aside>
    </div>
  );
}
