"use client";

import { useEffect } from "react";
import { withBase } from "@/lib/base";
import {
  PWA_BUILD_KEY,
  announcePwaUpdate,
} from "@/lib/pwa-update";

/**
 * Registers the service worker and detects new deploys.
 * Surfaces updates via UpdateAvailablePrompt instead of silent reload.
 */
export function ServiceWorkerManager() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const swUrl = withBase("/sw.js");
    const versionUrl = withBase("/version.json");

    const notifyWaiting = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting && navigator.serviceWorker.controller) {
        announcePwaUpdate({
          buildId: `sw-${Date.now()}`,
          reason: "service-worker",
        });
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

        let prev: string | null = null;
        try {
          prev =
            localStorage.getItem(PWA_BUILD_KEY) ||
            sessionStorage.getItem(PWA_BUILD_KEY);
        } catch {
          prev = null;
        }

        if (prev && prev !== data.buildId) {
          announcePwaUpdate({ buildId: data.buildId, reason: "version" });
          if (reg) {
            try {
              await reg.update();
            } catch {
              /* ignore */
            }
            notifyWaiting(reg);
          }
          return;
        }

        try {
          localStorage.setItem(PWA_BUILD_KEY, data.buildId);
          sessionStorage.setItem(PWA_BUILD_KEY, data.buildId);
        } catch {
          /* ignore */
        }
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
          void reg.update().catch(() => undefined);
          void checkDeployVersion(reg);
          notifyWaiting(reg);
        };

        check();
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") check();
        });
        window.addEventListener("online", check);
        const interval = window.setInterval(check, 45 * 1000);

        reg.addEventListener("updatefound", () => {
          const worker = reg.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (
              worker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              announcePwaUpdate({
                buildId: `sw-${Date.now()}`,
                reason: "service-worker",
              });
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
    };
  }, []);

  return null;
}
