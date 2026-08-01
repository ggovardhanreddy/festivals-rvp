"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import {
  INTRO_CAMERA,
  OVERVIEW_CAMERA,
  VILLAGE_HOTSPOTS,
  lightingForHour,
  type CameraPose,
  type VillageHotspotId,
  type WeatherMode,
} from "@/lib/experience";
import { useIsClient, useLowPowerDevice } from "@/lib/client";
import { withBase } from "@/lib/base";
import { AudioAmbience } from "./AudioAmbience";

const VillageCanvas = dynamic(
  () => import("./village/VillageCanvas").then((mod) => mod.VillageCanvas),
  {
    ssr: false,
    loading: () => <div className="village-canvas village-canvas-fallback" />,
  },
);

type Phase = "black" | "logo" | "light" | "fly" | "sunrise" | "alive" | "ready";

export function CinematicHero() {
  const reduce = useReducedMotion();
  const client = useIsClient();
  const lowPower = useLowPowerDevice();
  const use3d = client && !reduce;
  const [phase, setPhase] = useState<Phase>("black");
  const [activeId, setActiveId] = useState<VillageHotspotId | null>(null);
  const [hoveredId, setHoveredId] = useState<VillageHotspotId | null>(null);
  const [pose, setPose] = useState<CameraPose>(INTRO_CAMERA);
  const [progress, setProgress] = useState(0);

  const lighting = useMemo(() => {
    if (phase === "black" || phase === "logo" || phase === "light") return "night";
    if (phase === "fly" || phase === "sunrise") return "morning";
    return lightingForHour();
  }, [phase]);

  const weather: WeatherMode = lighting === "night" ? "night" : "sunny";
  const activeSpot = VILLAGE_HOTSPOTS.find((s) => s.id === activeId) || null;
  const hoveredSpot = VILLAGE_HOTSPOTS.find((s) => s.id === hoveredId) || null;
  const panelSpot = activeSpot || hoveredSpot;

  useEffect(() => {
    if (reduce) {
      const frame = window.requestAnimationFrame(() => {
        setPhase("ready");
        setProgress(100);
        setPose(OVERVIEW_CAMERA);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    const steps: { phase: Phase; at: number; progress: number; pose?: CameraPose }[] =
      [
        { phase: "logo", at: 600, progress: 18 },
        { phase: "light", at: 1600, progress: 34 },
        { phase: "fly", at: 2600, progress: 55, pose: INTRO_CAMERA },
        { phase: "sunrise", at: 4200, progress: 78, pose: OVERVIEW_CAMERA },
        { phase: "alive", at: 5600, progress: 92 },
        { phase: "ready", at: 6800, progress: 100 },
      ];

    const timers = steps.map((step) =>
      window.setTimeout(() => {
        setPhase(step.phase);
        setProgress(step.progress);
        if (step.pose) setPose(step.pose);
      }, step.at),
    );

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [reduce]);

  const selectSpot = (id: VillageHotspotId) => {
    const spot = VILLAGE_HOTSPOTS.find((s) => s.id === id);
    if (!spot) return;
    setActiveId(id);
    setPose(spot.camera);
  };

  const returnOverview = () => {
    setActiveId(null);
    setPose(OVERVIEW_CAMERA);
  };

  const showUi = phase === "alive" || phase === "ready";
  const showLogo = phase !== "black" && phase !== "ready" && phase !== "alive";

  return (
    <section className="cinematic-hero" aria-label="Cinematic village entrance">
      {use3d ? (
        <VillageCanvas
          pose={pose}
          lighting={lighting}
          weather={weather}
          reduced={!!reduce}
          lowPower={lowPower}
          activeId={activeId}
          hoveredId={hoveredId}
          onHover={setHoveredId}
          onSelect={selectSpot}
          className="village-canvas cinematic-canvas"
        />
      ) : (
        <div
          className="village-canvas village-canvas-fallback"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(15,26,20,.35), rgba(15,26,20,.75)), url(${withBase("/brand/og-banner.jpg")})`,
          }}
        />
      )}

      <div className="cinematic-veil" data-phase={phase} />

      <AnimatePresence>
        {showLogo && (
          <m.div
            className="cinematic-logo-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
            transition={{ duration: 0.8 }}
          >
            <div className={`cinematic-logo ${phase === "light" ? "light-sweep" : ""}`}>
              <img
                src={withBase("/brand/rvp-youth-logo-dark.svg")}
                alt="RVP Youth"
                width={220}
                height={64}
              />
            </div>
            <div className="cinematic-progress" aria-hidden>
              <span style={{ width: `${progress}%` }} />
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUi && (
          <m.div
            className="cinematic-copy"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="eyebrow">RVP Youth</p>
            <h1>Enter the village.</h1>
            <p className="lede">
              A cinematic digital heritage experience — temples, festivals, and
              memories waiting under the morning sky.
            </p>
            <div className="btn-row">
              <a className="btn magnetic" href="#map">
                Explore Village
              </a>
              <Link className="btn ghost" href="/sankranthi/">
                Sankranthi
              </Link>
              <AudioAmbience />
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUi && panelSpot && (
          <m.aside
            className="cinematic-panel glass-card"
            key={panelSpot.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
          >
            <p className="eyebrow">Location</p>
            <h3>{panelSpot.label}</h3>
            <p className="muted">{panelSpot.blurb}</p>
            <div className="btn-row">
              <Link className="btn" href={panelSpot.href}>
                Open memories
              </Link>
              {activeId && (
                <button type="button" className="btn ghost" onClick={returnOverview}>
                  Return
                </button>
              )}
            </div>
          </m.aside>
        )}
      </AnimatePresence>

      {showUi && (
        <div className="cinematic-hotspot-list" aria-label="Village places">
          {VILLAGE_HOTSPOTS.map((spot) => (
            <button
              key={spot.id}
              type="button"
              className="hotspot-chip"
              data-active={activeId === spot.id}
              onClick={() => selectSpot(spot.id)}
            >
              {spot.label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
