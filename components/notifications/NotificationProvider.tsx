"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  buildNotifications,
  loadNotificationPrefs,
  saveNotificationPrefs,
  DEFAULT_NOTIFICATION_PREFS,
  type AppNotification,
  type NotificationPrefs,
} from "@/lib/notifications";
import type { Announcement, Member, SiteEvent } from "@/lib/types";

type Ctx = {
  items: AppNotification[];
  unread: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  requestBrowserPermission: () => Promise<void>;
  permission: NotificationPermission | "unsupported";
  prefs: NotificationPrefs;
  setPrefs: (prefs: NotificationPrefs) => void;
}

const NotificationContext = createContext<Ctx | null>(null);

const READ_KEY = "rvp-notif-read";
const POPUP_KEY = "rvp-notif-popup-shown";

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

export function NotificationProvider({
  members,
  events,
  announcements = [],
  children,
}: {
  members: Member[];
  events: SiteEvent[];
  announcements?: Announcement[];
  children: React.ReactNode;
}) {
  const [read, setRead] = useState<Set<string>>(new Set());
  const [popupQueue, setPopupQueue] = useState<AppNotification[]>([]);
  const [activePopup, setActivePopup] = useState<AppNotification | null>(null);
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [ready, setReady] = useState(false);
  const [prefs, setPrefsState] = useState<NotificationPrefs>(
    DEFAULT_NOTIFICATION_PREFS,
  );

  const items = useMemo(
    () => buildNotifications({ members, events, announcements, prefs }),
    [members, events, announcements, prefs],
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
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      const unreadItems = items.filter((i) => !read.has(i.id)).slice(0, 3);
      for (const item of unreadItems) {
        new Notification(item.title, {
          body: item.body,
          icon: "/logo/android-icon.png",
        });
      }
    }
  }, [items, read]);

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
      {activePopup ? (
        <div
          className="notif-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notif-modal-title"
        >
          <div className="notif-modal">
            <p className="eyebrow">
              {activePopup.kind === "birthday" ? "Birthday" : "Celebration"}
            </p>
            <h2 id="notif-modal-title">{activePopup.title}</h2>
            <p className="lede">{activePopup.body}</p>
            <div className="notif-modal-actions">
              <button type="button" className="btn" onClick={dismissPopup}>
                Celebrate
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
