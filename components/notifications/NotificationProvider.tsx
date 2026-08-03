"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import {
  buildNotifications,
  loadNotificationPrefs,
  saveNotificationPrefs,
  DEFAULT_NOTIFICATION_PREFS,
  NOTIFICATION_ASKED_KEY,
  type AppNotification,
  type NotificationPrefs,
} from "@/lib/notifications";
import { withBase } from "@/lib/base";
import type { Announcement, Development, Member, SiteEvent } from "@/lib/types";

type Ctx = {
  items: AppNotification[];
  unread: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  requestBrowserPermission: () => Promise<void>;
  permission: NotificationPermission | "unsupported";
  prefs: NotificationPrefs;
  setPrefs: (prefs: NotificationPrefs) => void;
};

const NotificationContext = createContext<Ctx | null>(null);

const READ_KEY = "rvp-notif-read";
const POPUP_KEY = "rvp-notif-popup-shown";
const BROWSER_SENT_KEY = "rvp-notif-browser-sent";

function loadSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

function kindLabel(kind: AppNotification["kind"]) {
  switch (kind) {
    case "birthday":
      return "Birthday";
    case "festival-day":
    case "festival-reminder":
      return "Festival";
    case "event-day":
    case "event-reminder":
      return "Event";
    case "development":
      return "Development";
    default:
      return "Announcement";
  }
}

export function NotificationProvider({
  members,
  events,
  announcements = [],
  developments = [],
  children,
}: {
  members: Member[];
  events: SiteEvent[];
  announcements?: Announcement[];
  developments?: Development[];
  children: React.ReactNode;
}) {
  const [read, setRead] = useState<Set<string>>(new Set());
  const [popupQueue, setPopupQueue] = useState<AppNotification[]>([]);
  const [activePopup, setActivePopup] = useState<AppNotification | null>(null);
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [ready, setReady] = useState(false);
  const [askPermission, setAskPermission] = useState(false);
  const [prefs, setPrefsState] = useState<NotificationPrefs>(
    DEFAULT_NOTIFICATION_PREFS,
  );

  const items = useMemo(
    () =>
      buildNotifications({
        members,
        events,
        announcements,
        developments,
        prefs,
      }),
    [members, events, announcements, developments, prefs],
  );

  const setPrefs = useCallback((next: NotificationPrefs) => {
    setPrefsState(next);
    saveNotificationPrefs(next);
  }, []);

  useEffect(() => {
    setRead(loadSet(READ_KEY));
    setPrefsState(loadNotificationPrefs());
    setPermission(
      typeof Notification === "undefined" ? "unsupported" : Notification.permission,
    );

    const shown = loadSet(POPUP_KEY);
    const popups = items.filter((i) => i.popup && !shown.has(i.id));
    setPopupQueue(popups);

    const asked = localStorage.getItem(NOTIFICATION_ASKED_KEY) === "1";
    if (
      !asked &&
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      setAskPermission(true);
    }

    const pending =
      document.documentElement.classList.contains("intro-pending") ||
      document.documentElement.classList.contains("intro-active");

    const arm = () => setReady(true);
    if (!pending) {
      const t = window.setTimeout(arm, 600);
      return () => window.clearTimeout(t);
    }
    window.addEventListener("rvp:intro-complete", arm);
    const failsafe = window.setTimeout(arm, 4500);
    return () => {
      window.removeEventListener("rvp:intro-complete", arm);
      window.clearTimeout(failsafe);
    };
  }, [items]);

  useEffect(() => {
    if (!ready || activePopup || !popupQueue.length) return;
    const [next, ...rest] = popupQueue;
    setActivePopup(next || null);
    setPopupQueue(rest);
  }, [ready, activePopup, popupQueue]);

  const fireBrowserNotifications = useCallback(
    (list: AppNotification[]) => {
      if (typeof Notification === "undefined" || Notification.permission !== "granted") {
        return;
      }
      const sent = loadSet(BROWSER_SENT_KEY);
      let changed = false;
      for (const item of list.slice(0, 5)) {
        if (sent.has(item.id)) continue;
        try {
          new Notification(item.title, {
            body: item.body,
            icon: withBase("/logo/android-icon.png"),
            badge: withBase("/logo/android-icon.png"),
            tag: item.id,
            data: { href: item.href },
          });
          sent.add(item.id);
          changed = true;
        } catch {
          /* ignore Notification constructor failures */
        }
      }
      if (changed) saveSet(BROWSER_SENT_KEY, sent);
    },
    [],
  );

  useEffect(() => {
    if (!ready || permission !== "granted") return;
    const unreadItems = items.filter((i) => !read.has(i.id));
    fireBrowserNotifications(unreadItems);
  }, [ready, permission, items, read, fireBrowserNotifications]);

  const dismissPopup = useCallback(() => {
    if (activePopup) {
      const shown = loadSet(POPUP_KEY);
      shown.add(activePopup.id);
      saveSet(POPUP_KEY, shown);
      setRead((prev) => {
        const next = new Set(prev);
        next.add(activePopup.id);
        saveSet(READ_KEY, next);
        return next;
      });
    }
    setActivePopup(null);
  }, [activePopup]);

  const markRead = useCallback((id: string) => {
    setRead((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveSet(READ_KEY, next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setRead(() => {
      const next = new Set(items.map((i) => i.id));
      saveSet(READ_KEY, next);
      return next;
    });
  }, [items]);

  const requestBrowserPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    localStorage.setItem(NOTIFICATION_ASKED_KEY, "1");
    setAskPermission(false);
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      const unreadItems = items.filter((i) => !read.has(i.id));
      fireBrowserNotifications(unreadItems);
    }
  }, [items, read, fireBrowserNotifications]);

  const declinePermissionAsk = useCallback(() => {
    localStorage.setItem(NOTIFICATION_ASKED_KEY, "1");
    setAskPermission(false);
  }, []);

  const unread = items.filter((i) => !read.has(i.id)).length;

  const value = useMemo(
    () => ({
      items,
      unread,
      markRead,
      markAllRead,
      requestBrowserPermission,
      permission,
      prefs,
      setPrefs,
    }),
    [
      items,
      unread,
      markRead,
      markAllRead,
      requestBrowserPermission,
      permission,
      prefs,
      setPrefs,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {ready && askPermission && !activePopup ? (
        <div className="notif-permission" role="dialog" aria-labelledby="notif-ask-title">
          <div className="notif-permission-card">
            <p className="eyebrow">Stay connected</p>
            <h2 id="notif-ask-title">Enable celebration reminders?</h2>
            <p className="lede">
              We can gently remind you about birthdays, festivals, and village
              events. You can change this anytime in Settings.
            </p>
            <div className="notif-modal-actions">
              <button
                type="button"
                className="btn"
                onClick={() => void requestBrowserPermission()}
              >
                Allow notifications
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={declinePermissionAsk}
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {activePopup ? (
        <div
          className="notif-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notif-modal-title"
        >
          <div
            className={`notif-modal${activePopup.kind === "birthday" ? " notif-modal--birthday" : ""}`}
          >
            {activePopup.kind === "birthday" ? (
              <div className="notif-modal-confetti" aria-hidden>
                {Array.from({ length: 14 }, (_, i) => (
                  <span key={i} style={{ "--i": i } as CSSProperties} />
                ))}
              </div>
            ) : null}
            {activePopup.banner ? (
              <p className="notif-modal-banner">{activePopup.banner}</p>
            ) : (
              <p className="eyebrow">{kindLabel(activePopup.kind)}</p>
            )}
            {activePopup.image ? (
              <div className="notif-modal-media">
                <img
                  src={withBase(activePopup.image)}
                  alt=""
                  width={320}
                  height={180}
                />
              </div>
            ) : null}
            <h2 id="notif-modal-title">{activePopup.title}</h2>
            <p className="lede">{activePopup.body}</p>
            <div className="notif-modal-actions">
              {activePopup.href ? (
                <Link
                  className="btn"
                  href={activePopup.href}
                  onClick={dismissPopup}
                >
                  {activePopup.kind.startsWith("festival")
                    ? "Open festival"
                    : activePopup.kind === "birthday"
                      ? "View members"
                      : "Open"}
                </Link>
              ) : null}
              <button type="button" className="btn ghost" onClick={dismissPopup}>
                {activePopup.kind === "birthday" ? "Celebrate" : "Dismiss"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}
