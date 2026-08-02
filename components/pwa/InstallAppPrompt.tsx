"use client";

import { useEffect, useState } from "react";
import { withBase } from "@/lib/base";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "rvp-install-dismissed";
const DISMISS_MS = 14 * 24 * 60 * 60 * 1000;

function isStandalone() {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function InstallAppPrompt() {
  const [open, setOpen] = useState(false);
  const [ios, setIos] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );

  useEffect(() => {
    if (isStandalone()) return;

    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      if (raw && Date.now() - Number(raw) < DISMISS_MS) return;
    } catch {
      /* ignore */
    }

    const iosDevice = isIos();
    setIos(iosDevice);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // iOS has no beforeinstallprompt — show Share instructions after a delay.
    // Android/Chrome: only open when the install event is available.
    const timer = window.setTimeout(() => {
      if (iosDevice) setOpen(true);
    }, 5000);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  useEffect(() => {
    if (!deferred || isStandalone()) return;
    setOpen(true);
  }, [deferred]);

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  const install = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      dismiss();
    }
  };

  if (!open) return null;

  return (
    <div className="pwa-install" role="dialog" aria-labelledby="pwa-install-title">
      <div className="pwa-install-card">
        <button
          type="button"
          className="pwa-install-close"
          aria-label="Dismiss"
          onClick={dismiss}
        >
          ×
        </button>
        <img
          src={withBase("/logo/android-icon.png")}
          alt=""
          width={56}
          height={56}
          className="pwa-install-icon"
        />
        <div className="pwa-install-copy">
          <p className="eyebrow">Get the app</p>
          <h2 id="pwa-install-title">Install {SITE_NAME}</h2>
          <p className="lede pwa-install-lede">
            {SITE_TAGLINE} Add Reddivaripalli to your home screen for quick
            access.
          </p>

          {ios ? (
            <ol className="pwa-install-steps">
              <li>
                Tap the <strong>Share</strong> button in Safari
              </li>
              <li>
                Choose <strong>Add to Home Screen</strong>
              </li>
              <li>
                Tap <strong>Add</strong>
              </li>
            </ol>
          ) : (
            <p className="muted pwa-install-hint">
              Install for full-screen app mode on Android and Chrome.
            </p>
          )}

          <div className="pwa-install-actions">
            {!ios && deferred ? (
              <button type="button" className="btn" onClick={() => void install()}>
                Install app
              </button>
            ) : null}
            {ios ? (
              <button type="button" className="btn" onClick={dismiss}>
                Got it
              </button>
            ) : null}
            <button type="button" className="btn ghost" onClick={dismiss}>
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
