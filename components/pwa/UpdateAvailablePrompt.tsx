"use client";

import { useEffect, useState } from "react";
import { withBase } from "@/lib/base";
import {
  PWA_BUILD_KEY,
  PWA_UPDATE_EVENT,
  applyPwaUpdate,
  type PwaUpdateDetail,
} from "@/lib/pwa-update";

/**
 * One-click update banner when a new deploy / service worker is ready.
 */
export function UpdateAvailablePrompt() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [buildId, setBuildId] = useState<string | undefined>();

  useEffect(() => {
    const onUpdate = (event: Event) => {
      const detail = (event as CustomEvent<PwaUpdateDetail>).detail;
      if (detail?.buildId) setBuildId(detail.buildId);
      setOpen(true);
    };
    window.addEventListener(PWA_UPDATE_EVENT, onUpdate);

    const versionUrl = withBase("/version.json");
    const check = async () => {
      try {
        const res = await fetch(`${versionUrl}?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { buildId?: string };
        if (!data.buildId) return;
        const prev = localStorage.getItem(PWA_BUILD_KEY);
        if (prev && prev !== data.buildId) {
          setBuildId(data.buildId);
          setOpen(true);
          return;
        }
        if (!prev) localStorage.setItem(PWA_BUILD_KEY, data.buildId);
      } catch {
        /* offline */
      }
    };

    void check();
    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", onVisible);
    const id = window.setInterval(() => void check(), 60_000);

    return () => {
      window.removeEventListener(PWA_UPDATE_EVENT, onUpdate);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(id);
    };
  }, []);

  const updateNow = async () => {
    setBusy(true);
    let nextBuild = buildId;
    try {
      const res = await fetch(`${withBase("/version.json")}?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as { buildId?: string };
        if (data.buildId) nextBuild = data.buildId;
      }
    } catch {
      /* use known buildId */
    }
    await applyPwaUpdate(nextBuild);
  };

  if (!open) return null;

  return (
    <div className="update-banner" role="status" aria-live="polite">
      <p>A new version of the Reddivaripalli App is available.</p>
      <div className="btn-row">
        <button
          type="button"
          className="btn"
          disabled={busy}
          onClick={() => void updateNow()}
        >
          {busy ? "Updating…" : "Update Now"}
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
