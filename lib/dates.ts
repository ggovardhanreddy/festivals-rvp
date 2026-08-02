/** Pure date helpers safe for client + server bundles. */

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function parseIsoDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y || 1970, (m || 1) - 1, d || 1);
}

/** MM-DD for a Date in local time */
export function monthDay(date = new Date()): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

/** Normalize member dob (MM-DD or YYYY-MM-DD) to MM-DD. */
export function dobMonthDay(dob: string | null | undefined): string | null {
  if (!dob) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(dob)) return dob.slice(5, 10);
  if (/^\d{2}-\d{2}$/.test(dob)) return dob;
  return null;
}

/** Human label e.g. "10 Oct" or null. */
export function formatBirthdayLabel(
  dob: string | null | undefined,
): string | null {
  const md = dobMonthDay(dob);
  if (!md) return null;
  const [mm, dd] = md.split("-").map(Number);
  const d = new Date(2000, (mm || 1) - 1, dd || 1);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function daysUntil(isoDate: string, from = new Date()): number {
  const target = startOfDay(parseIsoDate(isoDate));
  const base = startOfDay(from);
  return Math.round((target.getTime() - base.getTime()) / 86400000);
}

export function formatCountdown(days: number): string {
  if (days < 0) return "Completed";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} days`;
}
