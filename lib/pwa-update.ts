/** Shared helpers for silent PWA deploy refresh (no user prompt). */

export const PWA_UPDATE_EVENT = "rvp:update-available";
export const PWA_BUILD_KEY = "rvp-app-build";
const PWA_APPLY_LOCK = "rvp-last-apply";

export type PwaUpdateDetail = {
  buildId: string;
  reason: "version" | "service-worker";
};

/** @deprecated Kept for compatibility; silent apply is preferred. */
export function announcePwaUpdate(detail: PwaUpdateDetail) {
  if (typeof window === "undefined") return;
  void applyPwaUpdate(detail.buildId);
}

export async function applyPwaUpdate(buildId?: string) {
  if (typeof window === "undefined") return;

  // Debounce reloads so SW controllerchange + version check don't loop.
  try {
    const last = Number(sessionStorage.getItem(PWA_APPLY_LOCK) || "0");
    if (last && Date.now() - last < 12_000) return;
    sessionStorage.setItem(PWA_APPLY_LOCK, String(Date.now()));
  } catch {
    /* ignore */
  }

  try {
    if (buildId) {
      localStorage.setItem(PWA_BUILD_KEY, buildId);
      sessionStorage.setItem(PWA_BUILD_KEY, buildId);
    }
  } catch {
    /* ignore */
  }

  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {
    /* ignore */
  }

  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    if (reg?.active) {
      reg.active.postMessage({ type: "CLEAR_CACHES" });
    }
    await reg?.update();
  } catch {
    /* continue to reload */
  }

  window.location.reload();
}
