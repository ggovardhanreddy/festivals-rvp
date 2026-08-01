"use client";

import { useEffect, useState } from "react";

const KEY = "rvp-cursor-mode";

export type CursorMode = "full" | "simple" | "off";

export function getCursorMode(): CursorMode {
  if (typeof window === "undefined") return "full";
  const v = window.localStorage.getItem(KEY);
  if (v === "simple" || v === "off" || v === "full") return v;
  return "full";
}

/** Toggle liquid cursor quality — persists in localStorage. */
export function CursorPrefs({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<CursorMode>("full");

  useEffect(() => {
    setMode(getCursorMode());
  }, []);

  const cycle = () => {
    const next: CursorMode =
      mode === "full" ? "simple" : mode === "simple" ? "off" : "full";
    setMode(next);
    window.localStorage.setItem(KEY, next);
    window.dispatchEvent(new CustomEvent("rvp:cursor-mode", { detail: next }));
    document.documentElement.dataset.cursorMode = next;
  };

  useEffect(() => {
    document.documentElement.dataset.cursorMode = mode;
  }, [mode]);

  const label =
    mode === "full" ? "Cursor: fluid" : mode === "simple" ? "Cursor: simple" : "Cursor: off";

  return (
    <button
      type="button"
      className={`cursor-prefs-btn ${className}`.trim()}
      onClick={cycle}
      aria-label={`Liquid cursor mode: ${mode}. Click to change.`}
    >
      {label}
    </button>
  );
}
