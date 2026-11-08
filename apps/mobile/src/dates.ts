export const IST_ZONE = "Asia/Kolkata";

function istDateKey(from = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(from);
}

function dayNumber(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.floor(Date.UTC(y || 1970, (m || 1) - 1, d || 1) / 86_400_000);
}

export function daysUntilIst(iso: string, from = new Date()): number {
  return dayNumber(iso) - dayNumber(istDateKey(from));
}

export function festivalStatus(iso: string, from = new Date()) {
  const days = daysUntilIst(iso, from);
  if (days < 0) return { key: "completed", label: "Completed" };
  if (days === 0) return { key: "today", label: "Today" };
  if (days === 1) return { key: "tomorrow", label: "Tomorrow" };
  return { key: "upcoming", label: `${days} days` };
}
