"use client";

import { useEffect, useState } from "react";
import { withBase } from "@/lib/base";

const BUILD_KEY = "rvp-app-build";

/**
 * Friendly update prompt when a new deploy is detected via version.json / SW.
 */
export function UpdateAvailablePrompt() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const versionUrl = withBase("/version.json");

    const check = async () => {
      try {
        const res = await fetch(`${versionUrl}?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { buildId?: string };
        if (!data.buildId) return;
        const prev = localStorage.getItem(BUILD_KEY);
        if (prev && prev !== data.buildId) {
          setOpen(true);
          return;
        }
        if (!prev) localStorage.setItem(BUILD_KEY, data.buildId);
      } catch {
        /* offline */
      }
    };

    void check();
    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", onVisible);
    const id = window.setInterval(() => void check(), 90_000);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(id);
    };
  }, []);

  const updateNow = async () => {
    setBusy(true);
    try {
      const versionUrl = withBase("/version.json");
      const res = await fetch(`${versionUrl}?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as { buildId?: string };
        if (data.buildId) localStorage.setItem(BUILD_KEY, data.buildId);
      }
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.waiting) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
      }
      await reg?.update();
    } catch {
      /* continue to reload */
    }
    window.location.reload();
  };

  if (!open) return null;

  return (
    <div className="update-banner" role="status">
      <p>A new version is available. Update now?</p>
      <div className="btn-row">
        <button
          type="button"
          className="btn"
          disabled={busy}
          onClick={() => void updateNow()}
        >
          {busy ? "Updating…" : "Update now"}
        </button>
        <button
          type="button"
          className="btn ghost"
          disabled={busy}
          onClick={() => setOpen(false)}
        >
          Later
        </button>
      </div>
    </div>
  );
}
