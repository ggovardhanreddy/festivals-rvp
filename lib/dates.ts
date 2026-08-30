/**
 * Pure date helpers safe for client + server bundles.
 *
 * Every "what day is it" question on this site is answered in the village's
 * own timezone, Asia/Kolkata. A build machine in UTC and a phone in New York
 * must agree with a phone in Sambepalle about whether Vinayaka Chavithi is
 * today, tomorrow, or over — otherwise a festival that has already been
 * celebrated shows up as "24 days" away.
 *
 * The unit of comparison is therefore the IST *calendar day*, never a raw
 * timestamp difference.
 */

export const VILLAGE_TIME_ZONE = "Asia/Kolkata";
/** IST is UTC+05:30 with no daylight saving — used as the ICU-free fallback. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 86_400_000;

let istFormatter: Intl.DateTimeFormat | null | undefined;

function formatter(): Intl.DateTimeFormat | null {
  if (istFormatter !== undefined) return istFormatter;
  try {
    istFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: VILLAGE_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    // Runtime without full ICU — fall back to fixed-offset arithmetic.
    istFormatter = null;
  }
  return istFormatter;
}

/** The current calendar date in the village, as `YYYY-MM-DD`. */
export function istDateKey(from: Date = new Date()): string {
  const fmt = formatter();
  if (fmt) {
    // en-CA yields YYYY-MM-DD.
    const out = fmt.format(from);
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) return out;
  }
  return new Date(from.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** Day index (days since epoch) for a `YYYY-MM-DD` string. Timezone-free. */
export function isoDayNumber(iso: string): number {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return Math.floor(Date.UTC(y || 1970, (m || 1) - 1, d || 1) / DAY_MS);
}

/** Day index of "today" in the village. */
export function istDayNumber(from: Date = new Date()): number {
  return isoDayNumber(istDateKey(from));
}

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function parseIsoDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y || 1970, (m || 1) - 1, d || 1);
}

/** MM-DD for the current village date (or for a supplied instant). */
export function monthDay(date = new Date()): string {
  return istDateKey(date).slice(5, 10);
}

/** Normalize member dob (MM-DD or YYYY-MM-DD) to MM-DD. */
export function dobMonthDay(dob: string | null | undefined): string | null {
  if (!dob) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(dob)) return dob.slice(5, 10);
  if (/^\d{2}-\d{2}$/.test(dob)) return dob;
  return null;
}

/** Human label e.g. "10 October" or null. */
export function formatBirthdayLabel(
  dob: string | null | undefined,
): string | null {
  const md = dobMonthDay(dob);
  if (!md) return null;
  const [mm, dd] = md.split("-").map(Number);
  const d = new Date(Date.UTC(2000, (mm || 1) - 1, dd || 1));
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

/** Long label e.g. "14 September 2026". Stable across server and client. */
export function formatEventDate(iso: string | null | undefined): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return "";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const date = new Date(Date.UTC(y!, (m || 1) - 1, d || 1));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "14 – 15 September 2026" when a range is given, otherwise the single date. */
export function formatEventDateRange(
  start: string,
  end?: string | null,
): string {
  const a = formatEventDate(start);
  if (!end || end.slice(0, 10) === start.slice(0, 10)) return a;
  const b = formatEventDate(end);
  return b ? `${a} – ${b}` : a;
}

/**
 * Whole days from today (in the village) to `isoDate`.
 * Negative means the date has already passed there.
 */
export function daysUntil(isoDate: string, from = new Date()): number {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}/.test(isoDate)) return 0;
  return isoDayNumber(isoDate) - istDayNumber(from);
}

export type EventPhase = "upcoming" | "today" | "completed";

/**
 * Where an event sits relative to the village's today.
 * A multi-day festival counts as "today" for every day it runs.
 */
export function eventPhase(
  date: string,
  endDate?: string | null,
  from = new Date(),
): EventPhase {
  const startsIn = daysUntil(date, from);
  const endsIn = daysUntil(endDate || date, from);
  if (endsIn < 0) return "completed";
  if (startsIn <= 0) return "today";
  return "upcoming";
}

export function formatCountdown(days: number): string {
  if (!Number.isFinite(days)) return "";
  if (days < 0) return "Completed";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} days`;
}

/** Countdown label that never contradicts the phase of a multi-day event. */
export function eventStatusLabel(
  date: string,
  endDate?: string | null,
  from = new Date(),
): string {
  const phase = eventPhase(date, endDate, from);
  if (phase === "completed") return "Completed";
  if (phase === "today") return "Today";
  return formatCountdown(daysUntil(date, from));
}
