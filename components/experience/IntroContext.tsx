"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type IntroPhase =
  | "black"
  | "sky"
  | "logo"
  | "ready"
  | "highlight"
  | "fly"
  | "done";

type IntroContextValue = {
  phase: IntroPhase;
  setPhase: (phase: IntroPhase) => void;
  flyProgress: number;
  setFlyProgress: (n: number) => void;
  complete: () => void;
  beginExplore: () => void;
  scrubExplore: (delta: number) => void;
  isLocked: boolean;
  showChrome: boolean;
  highlighting: boolean;
};

const IntroContext = createContext<IntroContextValue | null>(null);

function finishExplore(
  setPhase: (p: IntroPhase) => void,
  setFlyProgress: (n: number) => void,
) {
  setFlyProgress(1);
  setPhase("done");
  window.dispatchEvent(new CustomEvent("rvp:intro-complete"));
  window.requestAnimationFrame(() => {
    window.setTimeout(() => {
      document
        .getElementById("home-start")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 40);
  });
}

export function IntroProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<IntroPhase>("black");
  const [flyProgress, setFlyProgress] = useState(0);
  const animating = useRef(false);
  const progressRef = useRef(0);

  const complete = useCallback(() => {
    animating.current = false;
    progressRef.current = 1;
    setFlyProgress(1);
    setPhase("done");
    window.dispatchEvent(new CustomEvent("rvp:intro-complete"));
  }, []);

  const runFly = useCallback(() => {
    setPhase("fly");
    window.dispatchEvent(new CustomEvent("rvp:intro-chrome"));
    const start = performance.now();
    const from = progressRef.current;
    const dur = 4200 * (1 - from);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / Math.max(400, dur));
      const eased = 1 - Math.pow(1 - t, 3);
      const value = from + (1 - from) * eased;
      progressRef.current = value;
      setFlyProgress(value);
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        animating.current = false;
        finishExplore(setPhase, setFlyProgress);
      }
    };
    requestAnimationFrame(tick);
  }, []);

  const beginExplore = useCallback(() => {
    if (animating.current || phase === "done" || phase === "highlight") return;
    animating.current = true;
    // First spotlight the welcome line, then fly into the village
    setPhase("highlight");
    window.setTimeout(() => {
      runFly();
    }, 1400);
  }, [phase, runFly]);

  const scrubExplore = useCallback(
    (delta: number) => {
      if (phase === "done" || animating.current) return;
      if (phase !== "ready" && phase !== "fly") return;
      if (phase === "ready") {
        beginExplore();
        return;
      }
      const next = Math.min(1, Math.max(0, progressRef.current + delta));
      progressRef.current = next;
      setFlyProgress(next);
      if (next >= 1) {
        finishExplore(setPhase, setFlyProgress);
      }
    },
    [phase, beginExplore],
  );

  const value = useMemo(
    () => ({
      phase,
      setPhase,
      flyProgress,
      setFlyProgress,
      complete,
      beginExplore,
      scrubExplore,
      isLocked: phase !== "done",
      showChrome: phase === "done" || phase === "fly",
      highlighting: phase === "highlight",
    }),
    [phase, flyProgress, complete, beginExplore, scrubExplore],
  );

  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>;
}

export function useIntro() {
  const ctx = useContext(IntroContext);
  if (!ctx) {
    return {
      phase: "done" as IntroPhase,
      setPhase: () => undefined,
      flyProgress: 1,
      setFlyProgress: () => undefined,
      complete: () => undefined,
      beginExplore: () => undefined,
      scrubExplore: () => undefined,
      isLocked: false,
      showChrome: true,
      highlighting: false,
    };
  }
  return ctx;
}
