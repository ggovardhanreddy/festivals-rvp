import type { Announcement, Development, Member, SiteEvent } from "./types";
import { daysUntil, dobMonthDay, formatCountdown, monthDay } from "./dates";
import { memberAge } from "./member-groups";

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
export const NOTIFICATION_ASKED_KEY = "rvp-notification-permission-asked";

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
  /** Short banner label for homepage / modal */
  banner?: string;
};

function isFestival(event: SiteEvent) {
  return event.category === "festival";
}

function daysBetween(iso: string, now: Date): number {
  const target = new Date(`${iso.slice(0, 10)}T12:00:00`);
  const today = new Date(now);
  today.setHours(12, 0, 0, 0);
  return Math.round((today.getTime() - target.getTime()) / 86_400_000);
}

export function buildNotifications(input: {
  members: Member[];
  events: SiteEvent[];
  announcements?: Announcement[];
  developments?: Development[];
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
      const age = memberAge(member, now);
      const ageLine = age != null ? ` Turning ${age}.` : "";
      items.push({
        id: `birthday-${member.id}-${dayKey}`,
        kind: "birthday",
        title: `🎉 Happy Birthday, ${member.name}!`,
        body: `Wishing you a wonderful year filled with happiness, health, and success. Have a fantastic celebration!${ageLine}`,
        href: "/members/",
        image: member.photo || undefined,
        dayKey,
        popup: true,
        banner: "Today's Birthday",
      });
    }
  }

  for (const event of input.events) {
    const start = daysUntil(event.date, now);
    const end = daysUntil(event.endDate || event.date, now);
    const isToday = start <= 0 && end >= 0;
    const festival = isFestival(event);
    const href = event.slug ? `/${event.slug}/` : "/events/";

    if (festival && prefs.festivals) {
      if (isToday) {
        items.push({
          id: `festival-day-${event.id}-${dayKey}`,
          kind: "festival-day",
          title: `🎊 Happy ${event.title}!`,
          body: `May this special occasion bring happiness, prosperity, peace, and blessings to you and your family.`,
          href,
          image: event.image,
          dayKey,
          popup: true,
          banner: "Festival Day",
        });
      } else if (start === 1) {
        items.push({
          id: `festival-1d-${event.id}-${dayKey}`,
          kind: "festival-reminder",
          title: `📅 Tomorrow is ${event.title}`,
          body: `We look forward to celebrating together. Don't forget to join the festivities!`,
          href,
          image: event.image,
          dayKey,
          popup: true,
          banner: "Tomorrow",
        });
      } else if (start === 2) {
        items.push({
          id: `festival-2d-${event.id}-${dayKey}`,
          kind: "festival-reminder",
          title: `🎉 Only 2 days left until ${event.title}!`,
          body: `Get ready to celebrate with family, friends, and our village community.`,
          href,
          image: event.image,
          dayKey,
          popup: true,
          banner: "In 2 days",
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
          href,
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
          href,
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
          href,
          image: event.image,
          dayKey,
          popup: false,
        });
      }
    }
  }

  if (prefs.developments && input.developments?.length) {
    for (const project of input.developments) {
      const milestones = [...(project.milestones ?? [])].sort((a, b) =>
        b.date.localeCompare(a.date),
      );
      const latest = milestones[0];
      const ageDays = latest ? daysBetween(latest.date, now) : Number.POSITIVE_INFINITY;
      const active =
        project.status === "critical-decision" ||
        project.status === "under-construction" ||
        project.status === "ongoing" ||
        (ageDays >= 0 && ageDays <= 21);
      if (!active) continue;
      items.push({
        id: `development-${project.id}-${latest?.date || project.status}`,
        kind: "development",
        title: latest
          ? `${project.title}: ${latest.title}`
          : `Update: ${project.title}`,
        body:
          latest?.description ||
          project.description.slice(0, 160) ||
          "Village development update",
        href: "/developments/",
        image: project.images?.[0],
        dayKey: latest?.date || dayKey,
        popup: false,
        banner: "Development update",
      });
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
