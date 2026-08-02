import fs from "node:fs";
import path from "node:path";
import type { Announcement, SiteEvent } from "./types";
import { daysUntil } from "./dates";

export { daysUntil, formatCountdown } from "./dates";

const EVENTS_PATH = path.join(process.cwd(), "content", "data", "events.json");
const ANNOUNCEMENTS_PATH = path.join(
  process.cwd(),
  "content",
  "data",
  "announcements.json",
);

let eventsCache: SiteEvent[] | null = null;
let announcementsCache: Announcement[] | null = null;

export function loadEvents(): SiteEvent[] {
  if (eventsCache) return eventsCache;
  if (!fs.existsSync(EVENTS_PATH)) {
    eventsCache = [];
    return eventsCache;
  }
  eventsCache = JSON.parse(fs.readFileSync(EVENTS_PATH, "utf8")) as SiteEvent[];
  return eventsCache;
}

export function loadAnnouncements(): Announcement[] {
  if (announcementsCache) return announcementsCache;
  if (!fs.existsSync(ANNOUNCEMENTS_PATH)) {
    announcementsCache = [];
    return announcementsCache;
  }
  announcementsCache = JSON.parse(
    fs.readFileSync(ANNOUNCEMENTS_PATH, "utf8"),
  ) as Announcement[];
  return announcementsCache;
}

export function upcomingEvents(limit = 5, from = new Date()): SiteEvent[] {
  return loadEvents()
    .filter((e) => daysUntil(e.endDate || e.date, from) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

export function pastEvents(from = new Date()): SiteEvent[] {
  return loadEvents()
    .filter((e) => daysUntil(e.endDate || e.date, from) < 0)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function todaysEvents(from = new Date()): SiteEvent[] {
  return loadEvents().filter((e) => {
    const start = daysUntil(e.date, from);
    const end = daysUntil(e.endDate || e.date, from);
    return start <= 0 && end >= 0;
  });
}

export function eventsNeedingReminder(from = new Date()): SiteEvent[] {
  return loadEvents().filter((e) => {
    const days = daysUntil(e.date, from);
    const window = e.reminderDaysBefore ?? 7;
    return days >= 0 && days <= window;
  });
}

export function eventsInMonth(year: number, monthIndex: number): SiteEvent[] {
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  return loadEvents().filter(
    (e) => e.date.startsWith(prefix) || e.endDate?.startsWith(prefix),
  );
}
