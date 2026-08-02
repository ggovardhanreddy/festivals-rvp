"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { withBase } from "@/lib/base";
import {
  LANDING_BRAND_TAGLINES,
  SITE_NAME,
  SITE_TAGLINE_LANDING,
  VILLAGE_ALSO_KNOWN_AS,
  VILLAGE_NAME,
} from "@/lib/site";
import { useIsClient, useLowPowerDevice } from "@/lib/client";
import { MusicStartButton } from "@/components/music/MusicStartButton";
import { CursorPrefs } from "./CursorPrefs";
import { CinematicFireworks } from "./CinematicFireworks";
import { NightVillageBackdrop } from "./NightVillageBackdrop";
import { IntroProvider, useIntro, type IntroPhase } from "./IntroContext";

const LandingFlythrough = dynamic(
  () =>
    import("./village/LandingFlythrough").then((mod) => mod.LandingFlythrough),
  { ssr: false },
);

function useWebGlSupport() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") || canvas.getContext("webgl");
      setOk(!!gl);
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

function IntroStages() {
  const client = useIsClient();
  const reduce = useReducedMotion();
  const lowPower = useLowPowerDevice();
  const webgl = useWebGlSupport();
  const {
    phase,
    setPhase,
    flyProgress,
    beginExplore,
    scrubExplore,
    complete,
    highlighting,
  } = useIntro();

  useEffect(() => {
    if (!client) return;
    if (reduce) {
      const frame = window.requestAnimationFrame(() => complete());
      return () => window.cancelAnimationFrame(frame);
    }
    // Phones: short brand open so Explore appears quickly
    const timeline: { phase: IntroPhase; at: number }[] = lowPower
      ? [
          { phase: "sky", at: 180 },
          { phase: "logo", at: 420 },
          { phase: "ready", at: 900 },
        ]
      : [
          { phase: "sky", at: 800 },
          { phase: "logo", at: 1500 },
          { phase: "ready", at: 3200 },
        ];
    const timers = timeline.map((step) =>
      window.setTimeout(() => setPhase(step.phase), step.at),
    );
    // Failsafe — never leave mobile stuck on a black locked intro
    const failsafe = window.setTimeout(() => {
      if (!document.documentElement.classList.contains("intro-active")) return;
      complete();
      document.documentElement.classList.remove(
        "intro-active",
        "intro-locked",
        "intro-pending",
      );
      window.dispatchEvent(new CustomEvent("rvp:intro-complete"));
    }, lowPower ? 7000 : 14000);
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(failsafe);
    };
  }, [client, reduce, lowPower, setPhase, complete]);

  useEffect(() => {
    if (phase !== "ready" && phase !== "fly") return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      scrubExplore(Math.max(0.012, Math.abs(e.deltaY) * 0.00085));
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        beginExplore();
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [phase, beginExplore, scrubExplore]);

  useEffect(() => {
    document.documentElement.classList.remove("intro-pending");
    document.documentElement.classList.toggle("intro-active", phase !== "done");
    document.documentElement.classList.toggle("intro-locked", phase !== "done");
    return () => {
      document.documentElement.classList.remove(
        "intro-active",
        "intro-locked",
        "intro-pending",
      );
    };
  }, [phase]);

  if (phase === "done") return null;

  const showSky = phase !== "black";
  const showUi =
    phase === "logo" ||
    phase === "ready" ||
    phase === "highlight" ||
    phase === "fly";
  const showWelcome = showUi;
  const showCta = phase === "ready" || phase === "highlight" || phase === "fly";
  const flying = phase === "fly" || flyProgress > 0.02;
  const use3d = webgl && !lowPower && !reduce;

  const logoScale = highlighting
    ? 0.82
    : 1 - flyProgress * 0.68;
  const logoY = highlighting ? -4 : flyProgress * -10;
  const logoFade = highlighting ? 0.35 : 1 - Math.min(1, flyProgress * 1.3);
  const uiFade = flying ? 1 - Math.min(1, flyProgress * 1.3) : 1;
  const welcomeFade = flying ? uiFade : 1;
  const backdropFade = 1 - flyProgress * 0.8;
  // Opening sky + surge through the mid-fly climax, then ease down
  const fwIntensity = lowPower
    ? 1.2 + (flying ? Math.sin(flyProgress * Math.PI) * 0.55 : 0)
    : 2.25 + (flying ? Math.sin(flyProgress * Math.PI) * 0.85 : 0);

  return (
    <section
      className={`cinematic-landing aaa-landing ${flying ? "is-flying" : ""} ${highlighting ? "is-highlighting-welcome" : ""}`}
      aria-label="Cinematic village entrance"
    >
      <div className="cinematic-landing-stage">
        {showSky && (
          <>
            <div
              className="aaa-backdrop-layer"
              style={{ opacity: backdropFade }}
            >
              <NightVillageBackdrop brighten={flyProgress > 0.4} />
              {!lowPower && <CinematicFireworks intensity={fwIntensity} />}
            </div>
            {use3d &&
              (phase === "ready" ||
                phase === "highlight" ||
                phase === "fly" ||
                flyProgress > 0) && (
                <LandingFlythrough
                  progress={flyProgress}
                  active={phase === "fly" || flyProgress > 0.02}
                  className="aaa-flythrough"
                />
              )}
          </>
        )}
        <div className="cinematic-landing-veil" data-phase={phase} />

        {showUi && (
          <div className="aaa-hero-frame">
            <div
              className="aaa-logo-wrap"
              style={{
                opacity: logoFade,
                transform: `translate3d(0, ${logoY}vh, 0) scale(${logoScale})`,
              }}
            >
              <m.div
                className="aaa-logo-inner"
                initial={{ opacity: 0, scale: 0.95, filter: "blur(12px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="aaa-logo-glow" aria-hidden />
                <div className="aaa-logo-glass" aria-hidden />
                <img
                  src={withBase("/logo/logo-vertical.png")}
                  alt={SITE_NAME}
                  className="aaa-logo-img"
                  width={640}
                  height={860}
                />
                <div className="aaa-logo-sweep" aria-hidden />
              </m.div>
            </div>

            <div className="aaa-copy-band" style={{ opacity: welcomeFade }}>
              {showWelcome && (
                <m.div
                  className={`aaa-welcome ${highlighting ? "is-spotlight" : ""}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: highlighting ? 1.08 : 1,
                  }}
                  transition={{ duration: highlighting ? 0.7 : 0.85, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="aaa-welcome-eyebrow">Welcome to</p>
                  <h1 className="aaa-welcome-title">
                    <span className="aaa-welcome-line">REDDIVARIPALLI</span>
                    <br />
                    <span className="aaa-welcome-line aaa-welcome-sub">
                      YOUTH FESTIVALS
                    </span>
                  </h1>

                  <div className="aaa-taglines-under-welcome">
                    <p className="aaa-tagline">{SITE_TAGLINE_LANDING}</p>
                    <ul className="aaa-brand-taglines">
                      {LANDING_BRAND_TAGLINES.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                </m.div>
              )}

              {showCta && (
                <m.div
                  className="aaa-cta-block"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{
                    opacity: highlighting ? 0.35 : 1,
                    y: 0,
                  }}
                  transition={{ delay: 0.2, duration: 0.7 }}
                >
                  <button
                    type="button"
                    className="btn magnetic aaa-explore-btn"
                    onClick={beginExplore}
                    disabled={highlighting || flying}
                  >
                    Explore
                  </button>
                  <button
                    type="button"
                    className="btn ghost aaa-skip-btn"
                    onClick={() => {
                      complete();
                      window.dispatchEvent(new CustomEvent("rvp:intro-complete"));
                      window.requestAnimationFrame(() => {
                        document
                          .getElementById("home-start")
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      });
                    }}
                  >
                    Skip intro
                  </button>
                  <div className="aaa-controls">
                    <MusicStartButton />
                    {!lowPower && <CursorPrefs />}
                  </div>
                  {!lowPower && (
                    <div className="aaa-scroll-hint" aria-hidden>
                      <span className="aaa-scroll-mouse">
                        <i />
                      </span>
                      <span className="aaa-scroll-arrow">↓</span>
                      <span className="aaa-scroll-label">Scroll to Begin</span>
                    </div>
                  )}
                </m.div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PostIntroHero() {
  return (
    <section
      className="landing-hero festival-hero cine-home-hero"
      id="home-start"
      aria-label="Homepage hero"
    >
      <NightVillageBackdrop brighten />
      <div className="landing-hero-stage cine-home-stage">
        <m.figure
          className="landing-hero-portrait"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={withBase("/brand/rvp-youth-festival.webp")}
            alt={`${SITE_NAME} — friends of ${VILLAGE_NAME}`}
            width={1400}
            height={900}
            loading="lazy"
            decoding="async"
          />
          <figcaption>RVP Youth · Festival night at home</figcaption>
        </m.figure>
        <div className="landing-hero-copy festival-copy">
          <img
            src={withBase("/logo/logo-vertical.png")}
            alt={SITE_NAME}
            className="landing-hero-brand landing-hero-brand-vertical"
            width={140}
            height={190}
          />
          <p className="eyebrow">
            {VILLAGE_ALSO_KNOWN_AS} · {VILLAGE_NAME}
          </p>
          <h1>Enter the memories.</h1>
          <p className="lede">{SITE_TAGLINE_LANDING}</p>
          <div className="btn-row">
            <a className="btn magnetic" href="#map">
              Explore Village
            </a>
            <Link className="btn ghost" href="/sankranthi/">
              Sankranthi
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingInner() {
  const { phase } = useIntro();
  return (
    <>
      <IntroStages />
      {phase === "done" && <PostIntroHero />}
    </>
  );
}

export function CinematicLanding() {
  return (
    <IntroProvider>
      <LandingInner />
    </IntroProvider>
  );
}
