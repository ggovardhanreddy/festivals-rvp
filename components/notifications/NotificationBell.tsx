"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useNotifications } from "./NotificationProvider";
import { trackAnalyticsHit } from "@/lib/use-community";

export function NotificationBell() {
  const { items, unread, markRead, markAllRead, requestBrowserPermission, permission } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="notif-bell" ref={rootRef}>
      <button
        type="button"
        className="notif-bell-btn"
        aria-label={unread ? `${unread} unread notifications` : "Notifications"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5L3 18v1h18v-1l-2-2Z"
          />
        </svg>
        {unread > 0 ? <span className="notif-badge">{unread > 9 ? "9+" : unread}</span> : null}
      </button>
      {open ? (
        <div className="notif-panel" role="menu">
          <div className="notif-panel-head">
            <strong>Notifications</strong>
            <button type="button" className="btn ghost" onClick={markAllRead}>
              Mark all read
            </button>
          </div>
          {permission === "default" ? (
            <button
              type="button"
              className="btn ghost notif-enable"
              onClick={() => void requestBrowserPermission()}
            >
              Enable browser reminders
            </button>
          ) : null}
          <ul className="notif-list">
            {items.length ? (
              items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href || "/events/"}
                    onClick={() => {
                      markRead(item.id);
                      setOpen(false);
                      void trackAnalyticsHit({
                        path: item.href || "/events/",
                        kind: "notif-click",
                        meta: item.kind,
                      });
                    }}
                  >
                    {item.banner ? (
                      <span className="notif-item-banner">{item.banner}</span>
                    ) : null}
                    <strong>{item.title}</strong>
                    <span className="muted">{item.body}</span>
                  </Link>
                </li>
              ))
            ) : (
              <li className="muted">No notifications right now.</li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
