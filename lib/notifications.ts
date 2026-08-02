import type { Announcement, Member, SiteEvent } from "./types";
import { daysUntil, dobMonthDay, formatCountdown, monthDay } from "./dates";

export type NotificationKind =
  | "birthday"
  | "event-reminder"
  | "event-day"
  | "festival-reminder"
  | "festival-day"
  | "development"
  | "announcement";

export type NotificationPrefKey =
  | "birthdays"
  | "festivals"
  | "events"
  | "developments"
  | "announcements";

export type NotificationPrefs = Record<NotificationPrefKey, boolean>;

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  birthdays: true,
  festivals: true,
  events: true,
  developments: true,
  announcements: true,
};

export const NOTIFICATION_PREFS_KEY = "rvp-notification-prefs";

export function loadNotificationPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_PREFS;
  try {
    const raw = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFS;
    return { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_PREFS;
  }
}

export function saveNotificationPrefs(prefs: NotificationPrefs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
}

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href?: string;
  image?: string;
  dayKey: string;
  popup?: boolean;
};

function isFestival(event: SiteEvent) {
  return event.category === "festival";
}

export function buildNotifications(input: {
  members: Member[];
  events: SiteEvent[];
  announcements?: Announcement[];
  prefs?: NotificationPrefs;
  now?: Date;
}): AppNotification[] {
  const now = input.now || new Date();
  const dayKey = now.toISOString().slice(0, 10);
  const md = monthDay(now);
  const prefs = input.prefs || DEFAULT_NOTIFICATION_PREFS;
  const items: AppNotification[] = [];

  if (prefs.birthdays) {
    for (const member of input.members) {
      if (dobMonthDay(member.dob) !== md) continue;
      items.push({
        id: `birthday-${member.id}-${dayKey}`,
        kind: "birthday",
        title: `Happy Birthday to ${member.name}`,
        body: "Wishing you happiness, good health, and prosperity.",
        href: "/members/",
        image: member.photo || undefined,
        dayKey,
        popup: true,
      });
    }
  }

  for (const event of input.events) {
    const start = daysUntil(event.date, now);
    const end = daysUntil(event.endDate || event.date, now);
    const isToday = start <= 0 && end >= 0;
    const festival = isFestival(event);

    if (festival && prefs.festivals) {
      if (isToday) {
        items.push({
          id: `festival-day-${event.id}-${dayKey}`,
          kind: "festival-day",
          title: `Happy ${event.title}!`,
          body: `Wishing everyone joy and prosperity. ${event.description}`,
          href: event.slug ? `/${event.slug}/` : "/events/",
          image: event.image,
          dayKey,
          popup: true,
        });
      } else if (start === 1) {
        items.push({
          id: `festival-1d-${event.id}-${dayKey}`,
          kind: "festival-reminder",
          title: `Tomorrow is ${event.title}!`,
          body: event.description,
          href: event.slug ? `/${event.slug}/` : "/events/",
          image: event.image,
          dayKey,
          popup: true,
        });
      } else if (start === 2) {
        items.push({
          id: `festival-2d-${event.id}-${dayKey}`,
          kind: "festival-reminder",
          title: `Only 2 days left until ${event.title}!`,
          body: event.description,
          href: event.slug ? `/${event.slug}/` : "/events/",
          image: event.image,
          dayKey,
          popup: false,
        });
      }
      continue;
    }

    if (!festival && prefs.events) {
      if (isToday) {
        items.push({
          id: `event-day-${event.id}-${dayKey}`,
          kind: "event-day",
          title: `Today is ${event.title}`,
          body: `Join us! ${event.description}`,
          href: event.slug ? `/${event.slug}/` : "/events/",
          image: event.image,
          dayKey,
          popup: true,
        });
      } else if (start === 1) {
        items.push({
          id: `event-1d-${event.id}-${dayKey}`,
          kind: "event-reminder",
          title: `Reminder: ${event.title} is tomorrow`,
          body: event.description,
          href: event.slug ? `/${event.slug}/` : "/events/",
          image: event.image,
          dayKey,
          popup: true,
        });
      } else if (start > 1 && start <= (event.reminderDaysBefore ?? 7)) {
        items.push({
          id: `event-reminder-${event.id}-${dayKey}`,
          kind: "event-reminder",
          title: `${event.title} in ${formatCountdown(start)}`,
          body: event.description,
          href: event.slug ? `/${event.slug}/` : "/events/",
          image: event.image,
          dayKey,
          popup: false,
        });
      }
    }
  }

  if (prefs.announcements) {
    for (const note of input.announcements || []) {
      if (!note.important) continue;
      items.push({
        id: `announcement-${note.id}`,
        kind: "announcement",
        title: note.title,
        body: note.body,
        href: "/events/",
        dayKey: note.date,
        popup: false,
      });
    }
  }

  return items;
}
