"use client";

import { useEffect, useId, useRef, useState } from "react";
import { withBase } from "@/lib/base";
import { SITE_NAME, VILLAGE_ALSO_KNOWN_AS } from "@/lib/site";
import { consentSettled, isConsentOpen } from "@/lib/consent";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "rvp-install-dismissed-v2";
const NEVER_KEY = "rvp-install-never-v2";
const DISMISS_MS = 3 * 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 1600;

type WindowWithInstall = Window & {
  __rvpDeferredInstall?: BeforeInstallPromptEvent | null;
};

/** Capture the install event as early as possible — it fires once. */
let earlyDeferred: BeforeInstallPromptEvent | null = null;
let earlyListenerBound = false;

function bindEarlyInstallListener() {
  if (typeof window === "undefined" || earlyListenerBound) return;
  earlyListenerBound = true;
  const w = window as WindowWithInstall;
  if (w.__rvpDeferredInstall) {
    earlyDeferred = w.__rvpDeferredInstall;
  }
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    const bip = event as BeforeInstallPromptEvent;
    earlyDeferred = bip;
    w.__rvpDeferredInstall = bip;
    window.dispatchEvent(new CustomEvent("rvp:install-ready"));
  });
}

bindEarlyInstallListener();

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
  // iPadOS 13+ reports as Macintosh with touch
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  return (
    navigator.platform === "MacIntel" &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1
  );
}

function isAndroid() {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

function isMobileDevice() {
  if (typeof window === "undefined") return false;
  if (isIos() || isAndroid()) return true;
  return (
    window.matchMedia("(max-width: 820px)").matches ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

function isSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const webkit = /Safari/i.test(ua);
  const other = /CriOS|FxiOS|EdgiOS|OPiOS|Chrome|Android|DuckDuckGo/i.test(ua);
  return webkit && !other;
}

function wasDismissed() {
  try {
    if (localStorage.getItem(NEVER_KEY) === "1") return true;
    const raw = localStorage.getItem(DISMISS_KEY);
    if (raw && Date.now() - Number(raw) < DISMISS_MS) return true;
  } catch {
    /* ignore */
  }
  return false;
}

function ShareIcon() {
  return (
    <svg
      className="pwa-step-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 3v12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 7l4-4 4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      className="pwa-step-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InstallAppPrompt() {
  const titleId = useId();
  const descId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [ios, setIos] = useState(false);
  const [android, setAndroid] = useState(false);
  const [safari, setSafari] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    bindEarlyInstallListener();
    if (isStandalone() || wasDismissed() || !isMobileDevice()) return;

    const iosDevice = isIos();
    const androidDevice = isAndroid();
    setIos(iosDevice);
    setAndroid(androidDevice);
    setSafari(isSafari());

    if (earlyDeferred) setDeferred(earlyDeferred);

    const onReady = () => {
      if (earlyDeferred) setDeferred(earlyDeferred);
    };
    window.addEventListener("rvp:install-ready", onReady);

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      const bip = event as BeforeInstallPromptEvent;
      earlyDeferred = bip;
      setDeferred(bip);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // A first-time visitor gets exactly one interruption: the consent dialog.
    // If consent has not been answered yet when this mounts, the install
    // prompt sits out this whole page view rather than queueing behind it —
    // asking someone to install an app they have not read a word of is worse
    // than not asking at all.
    const firstVisit = !consentSettled();
    let retry = 0;
    const show = () => {
      if (firstVisit || isStandalone() || wasDismissed()) return;
      if (isConsentOpen()) {
        if (retry > 20) return;
        retry += 1;
        window.setTimeout(show, 1000);
        return;
      }
      setOpen(true);
    };

    const onManualShow = () => {
      try {
        localStorage.removeItem(NEVER_KEY);
        localStorage.removeItem(DISMISS_KEY);
      } catch {
        /* ignore */
      }
      setOpen(true);
    };
    window.addEventListener("rvp:show-install", onManualShow);

    const timer = window.setTimeout(show, SHOW_DELAY_MS);
    // Hard failsafe so the install prompt always appears on mobile browsers
    const failsafe = window.setTimeout(show, 5000);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(failsafe);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("rvp:install-ready", onReady);
      window.removeEventListener("rvp:show-install", onManualShow);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissTemporarily();
    };
    window.addEventListener("keydown", onKey);
    // Focus primary action for accessibility
    const btn = cardRef.current?.querySelector<HTMLButtonElement>(
      "button.btn:not(.ghost)",
    );
    btn?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const dismissTemporarily = () => {
    setOpen(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  const dismissForever = () => {
    setOpen(false);
    try {
      localStorage.setItem(NEVER_KEY, "1");
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  const install = async () => {
    const promptEvent = deferred || earlyDeferred;
    if (!promptEvent) return;
    setBusy(true);
    try {
      await promptEvent.prompt();
      await promptEvent.userChoice;
      earlyDeferred = null;
      setDeferred(null);
      dismissForever();
    } catch {
      dismissTemporarily();
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  const canNativeInstall = Boolean(deferred || earlyDeferred) && !ios;

  return (
    <div
      className="pwa-install"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div className="pwa-install-backdrop" aria-hidden onClick={dismissTemporarily} />
      <div className="pwa-install-card" ref={cardRef}>
        <button
          type="button"
          className="pwa-install-close"
          aria-label="Close install prompt"
          onClick={dismissTemporarily}
        >
          ×
        </button>

        <div className="pwa-install-brand">
          <img
            src={withBase("/logo/app-icon.png")}
            alt={`${SITE_NAME} logo`}
            width={64}
            height={64}
            className="pwa-install-icon"
          />
          <span className="pwa-install-badge" aria-hidden>
            Install
          </span>
        </div>

        <div className="pwa-install-copy">
          <p className="eyebrow">Reddivaripalli App</p>
          <h2 id={titleId}>Install {SITE_NAME}</h2>
          <p id={descId} className="lede pwa-install-lede">
            Install the Reddivaripalli App for faster access, offline support,
            and instant notifications.
          </p>

          {ios ? (
            <>
              {!safari ? (
                <p className="muted pwa-install-hint">
                  Open this page in <strong>Safari</strong> on your iPhone or
                  iPad for the Home Screen install option.
                </p>
              ) : null}
              <ol className="pwa-install-steps">
                <li>
                  <ShareIcon />
                  <span>
                    Tap the <strong>Share</strong> button in Safari
                  </span>
                </li>
                <li>
                  <HomeIcon />
                  <span>
                    Select <strong>Add to Home Screen</strong>
                  </span>
                </li>
                <li>
                  <span className="pwa-step-num" aria-hidden>
                    3
                  </span>
                  <span>
                    Tap <strong>Add</strong>
                  </span>
                </li>
                <li>
                  <span className="pwa-step-num" aria-hidden>
                    4
                  </span>
                  <span>
                    Launch {SITE_NAME} from your Home Screen
                  </span>
                </li>
              </ol>
            </>
          ) : canNativeInstall ? (
            <p className="muted pwa-install-hint">
              Adds {VILLAGE_ALSO_KNOWN_AS} to your home screen like a native
              app — works offline after the first visit.
            </p>
          ) : (
            <>
              <p className="muted pwa-install-hint">
                {android
                  ? "Use Chrome’s menu to install:"
                  : "Install from your browser menu:"}
              </p>
              <ol className="pwa-install-steps">
                <li>
                  <span className="pwa-step-num" aria-hidden>
                    ⋮
                  </span>
                  <span>
                    Tap the browser <strong>menu</strong>
                  </span>
                </li>
                <li>
                  <HomeIcon />
                  <span>
                    Choose <strong>Install app</strong> or{" "}
                    <strong>Add to Home screen</strong>
                  </span>
                </li>
              </ol>
            </>
          )}

          <div className="pwa-install-actions">
            {canNativeInstall ? (
              <button
                type="button"
                className="btn"
                disabled={busy}
                onClick={() => void install()}
              >
                {busy ? "Opening…" : "Install Now"}
              </button>
            ) : ios ? (
              <button type="button" className="btn" onClick={dismissTemporarily}>
                Got It
              </button>
            ) : (
              <button type="button" className="btn" onClick={dismissTemporarily}>
                Got It
              </button>
            )}
            <button
              type="button"
              className="btn ghost"
              onClick={dismissTemporarily}
            >
              Maybe Later
            </button>
          </div>

          <button
            type="button"
            className="pwa-install-never"
            onClick={dismissForever}
          >
            Don&apos;t Show Again
          </button>
        </div>
      </div>
    </div>
  );
}
