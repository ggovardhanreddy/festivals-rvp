"use client";

import { useNotifications } from "./NotificationProvider";
import type { NotificationPrefKey } from "@/lib/notifications";

const LABELS: { key: NotificationPrefKey; label: string; hint: string }[] = [
  {
    key: "birthdays",
    label: "Birthday notifications",
    hint: "Push and in-app celebration alerts on member birthdays",
  },
  {
    key: "festivals",
    label: "Festival notifications",
    hint: "Reminders 2 days before, 1 day before, and on the festival day",
  },
  {
    key: "events",
    label: "Event reminders",
    hint: "Countdowns and day-of alerts for village events",
  },
  {
    key: "developments",
    label: "Development updates",
    hint: "Village project and construction progress",
  },
  {
    key: "announcements",
    label: "General announcements",
    hint: "Community notices from RVP Youth",
  },
];

export function NotificationPrefs() {
  const { prefs, setPrefs, requestBrowserPermission, permission } =
    useNotifications();

  return (
    <section className="section" id="notifications">
      <div className="section-head">
        <div>
          <p className="eyebrow">Alerts</p>
          <h2>Notification preferences</h2>
          <p className="lede muted">
            Choose what this device should surface in the bell and browser
            notifications.
          </p>
        </div>
      </div>
      <div className="notif-prefs">
        {LABELS.map((row) => (
          <label key={row.key} className="notif-pref-row">
            <input
              type="checkbox"
              checked={prefs[row.key]}
              onChange={(e) =>
                setPrefs({ ...prefs, [row.key]: e.target.checked })
              }
            />
            <span>
              <strong>{row.label}</strong>
              <span className="muted">{row.hint}</span>
            </span>
          </label>
        ))}
        <div className="btn-row" style={{ marginTop: "0.75rem" }}>
          <button
            type="button"
            className="btn"
            onClick={() => void requestBrowserPermission()}
            disabled={permission === "granted" || permission === "unsupported"}
          >
            {permission === "granted"
              ? "Browser notifications enabled"
              : permission === "unsupported"
                ? "Browser notifications unavailable"
                : "Enable browser notifications"}
          </button>
        </div>
      </div>
    </section>
  );
}
