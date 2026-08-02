"use client";

import { useEffect } from "react";
import { withBase } from "@/lib/base";

const BUILD_KEY = "rvp-app-build";

/**
 * Registers the service worker and auto-applies new deploys
 * (pages + images + JSON) when version.json changes.
 */
export function ServiceWorkerManager() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const swUrl = withBase("/sw.js");
    const versionUrl = withBase("/version.json");
    let refreshing = false;

    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    const forceUpdate = async (reg: ServiceWorkerRegistration) => {
      try {
        await reg.update();
      } catch {
        /* ignore */
      }
      if (reg.waiting) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    };

    const checkDeployVersion = async (reg?: ServiceWorkerRegistration) => {
      try {
        const res = await fetch(`${versionUrl}?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { buildId?: string };
        if (!data.buildId) return;
        const prev = sessionStorage.getItem(BUILD_KEY);
        if (prev && prev !== data.buildId) {
          // New deploy detected — pull SW + reload so app data refreshes
          if (reg) await forceUpdate(reg);
          sessionStorage.setItem(BUILD_KEY, data.buildId);
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
          return;
        }
        sessionStorage.setItem(BUILD_KEY, data.buildId);
      } catch {
        /* offline */
      }
    };

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register(swUrl, {
          scope: withBase("/") || "/",
          updateViaCache: "none",
        });

        const check = () => {
          void forceUpdate(reg);
          void checkDeployVersion(reg);
        };

        check();
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") check();
        });
        window.addEventListener("online", check);
        // Poll while the installed app stays open
        const interval = window.setInterval(check, 60 * 1000);

        if (reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        reg.addEventListener("updatefound", () => {
          const worker = reg.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (
              worker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });

        return () => {
          window.clearInterval(interval);
          window.removeEventListener("online", check);
        };
      } catch {
        return () => {};
      }
    };

    let cleanup: (() => void) | undefined;
    const boot = () => {
      void register().then((fn) => {
        cleanup = fn;
      });
    };

    if (document.readyState === "complete") boot();
    else window.addEventListener("load", boot, { once: true });

    return () => {
      cleanup?.();
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, []);

  return null;
}
