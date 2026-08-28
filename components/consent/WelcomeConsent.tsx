"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, MapPin } from "lucide-react";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { useLocation } from "@/components/location/LocationProvider";
import { useNotifications } from "@/components/notifications/NotificationProvider";
import {
  markConsentOpen,
  readConsent,
  writeConsent,
  type ConsentChoice,
} from "@/lib/consent";

/**
 * The single first-run consent interaction.
 *
 * Replaces two dialogs that used to appear on a first visit — the notification
 * permission card and, 2.8 seconds later, the location card — which stacked,
 * intercepted clicks on the page beneath them, and asked a visitor for two
 * decisions before they had read a word of the site.
 *
 * Both items are optional and default to off. Nothing is requested until the
 * visitor presses a specific "Allow" button, and "Not now" settles the whole
 * thing so we never ask again unprompted. Settings remains the place to change
 * either one later.
 */
const OPEN_DELAY_MS = 1800;

export function WelcomeConsent() {
  const { t } = useUiLang();
  const location = useLocation();
  const notifications = useNotifications();

  const [open, setOpen] = useState(false);
  /**
   * True from mount until the visitor settles the dialog. The PWA install
   * prompt watches this (via markConsentOpen) so it cannot appear during the
   * 1.8s before consent opens — which is exactly what it used to do, putting
   * two cards on screen again by a different route.
   */
  const [pending, setPending] = useState(false);
  const [notifChoice, setNotifChoice] = useState<ConsentChoice | null>(null);
  const [locChoice, setLocChoice] = useState<ConsentChoice | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  const notifSupported = notifications.permission !== "unsupported";
  const notifPending =
    notifSupported && notifications.permission === "default";
  const locPending = location.supported && location.preference === "unknown";

  useEffect(() => {
    if (readConsent()) return;
    // Nothing to ask for (both already answered at the browser level, or
    // neither is supported): record that and never show the dialog.
    if (!notifPending && !locPending) return;

    const intro =
      document.documentElement.classList.contains("intro-pending") ||
      document.documentElement.classList.contains("intro-active");

    setPending(true);
    const show = () => setOpen(true);
    if (!intro) {
      const t1 = window.setTimeout(show, OPEN_DELAY_MS);
      return () => window.clearTimeout(t1);
    }
    window.addEventListener("rvp:intro-complete", show);
    const failsafe = window.setTimeout(show, 5000);
    return () => {
      window.removeEventListener("rvp:intro-complete", show);
      window.clearTimeout(failsafe);
    };
    // Runs once on mount; the permission states are read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const settle = useCallback(
    (notif: ConsentChoice | null, loc: ConsentChoice | null) => {
      writeConsent({
        seenAt: new Date().toISOString().slice(0, 10),
        notifications: notif ?? (notifPending ? "skipped" : "declined"),
        location: loc ?? (locPending ? "skipped" : "declined"),
      });
      setOpen(false);
      setPending(false);
    },
    [notifPending, locPending],
  );

  // Focus management: move focus in on open, trap Tab inside, restore on close.
  useEffect(() => {
    markConsentOpen(open || pending);
  }, [open, pending]);

  useEffect(() => {
    if (!open) {
      restoreFocusTo.current?.focus?.();
      return;
    }
    restoreFocusTo.current = document.activeElement as HTMLElement | null;
    const card = cardRef.current;
    card?.querySelector<HTMLElement>("button")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        settle(notifChoice, locChoice);
        return;
      }
      if (event.key !== "Tab" || !card) return;
      const focusable = card.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, settle, notifChoice, locChoice]);

  useEffect(() => () => markConsentOpen(false), []);

  if (!open) return null;

  const allowNotifications = async () => {
    await notifications.requestBrowserPermission();
    setNotifChoice("granted");
  };

  const allowLocation = () => {
    location.acceptConsent();
    setLocChoice("granted");
  };

  return (
    <div className="consent-scrim" role="presentation">
      <div
        ref={cardRef}
        className="consent-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
        aria-describedby="consent-body"
      >
        <p className="eyebrow">{t("consent.eyebrow")}</p>
        <h2 id="consent-title">{t("consent.title")}</h2>
        <p id="consent-body" className="lede">
          {t("consent.body")}
        </p>

        <ul className="consent-options">
          {notifPending ? (
            <li className="consent-option">
              <span className="consent-option-icon" aria-hidden>
                <Bell size={20} strokeWidth={1.75} />
              </span>
              <div className="consent-option-text">
                <strong>{t("consent.notifications.title")}</strong>
                <span className="muted">
                  {t("consent.notifications.body")}
                </span>
              </div>
              {notifChoice === "granted" ? (
                <span className="consent-option-done">
                  {notifications.permission === "granted"
                    ? t("consent.on")
                    : t("consent.notNow")}
                </span>
              ) : (
                <button
                  type="button"
                  className="btn ghost consent-option-btn"
                  onClick={() => void allowNotifications()}
                >
                  {t("consent.allow")}
                </button>
              )}
            </li>
          ) : null}

          {locPending ? (
            <li className="consent-option">
              <span className="consent-option-icon" aria-hidden>
                <MapPin size={20} strokeWidth={1.75} />
              </span>
              <div className="consent-option-text">
                <strong>{t("consent.location.title")}</strong>
                <span className="muted">{t("consent.location.body")}</span>
              </div>
              {locChoice === "granted" ? (
                <span className="consent-option-done">
                  {location.preference === "granted"
                    ? t("consent.on")
                    : t("consent.notNow")}
                </span>
              ) : (
                <button
                  type="button"
                  className="btn ghost consent-option-btn"
                  onClick={allowLocation}
                  disabled={location.status === "requesting"}
                >
                  {location.status === "requesting"
                    ? t("consent.requesting")
                    : t("consent.allow")}
                </button>
              )}
            </li>
          ) : null}
        </ul>

        <p className="muted consent-note">{t("consent.note")}</p>

        <div className="consent-actions">
          <button
            type="button"
            className="btn"
            onClick={() => settle(notifChoice, locChoice)}
          >
            {notifChoice || locChoice
              ? t("consent.done")
              : t("consent.continueWithout")}
          </button>
        </div>
      </div>
    </div>
  );
}
