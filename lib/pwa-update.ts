/** Shared events / helpers for PWA update detection across client components. */

export const PWA_UPDATE_EVENT = "rvp:update-available";
export const PWA_BUILD_KEY = "rvp-app-build";

export type PwaUpdateDetail = {
  buildId: string;
  reason: "version" | "service-worker";
};

export function announcePwaUpdate(detail: PwaUpdateDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<PwaUpdateDetail>(PWA_UPDATE_EVENT, { detail }),
  );
}

export async function applyPwaUpdate(buildId?: string) {
  if (typeof window === "undefined") return;

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

  // Hard reload so HTML/JS/CSS are not served from bfcache
  window.location.reload();
}
