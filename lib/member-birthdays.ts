import { dobMonthDay, istDateKey } from "./dates";

/**
 * Days until the next occurrence of an MM-DD / YYYY-MM-DD birthday (0 = today),
 * measured against the village's calendar day in Asia/Kolkata.
 */
export function daysUntilNextBirthday(
  dob: string,
  from = new Date(),
): number {
  const md = dobMonthDay(dob);
  if (!md) return Number.POSITIVE_INFINITY;
  const [mm, dd] = md.split("-").map(Number);
  if (!mm || !dd) return Number.POSITIVE_INFINITY;

  const today = istDateKey(from);
  const year = Number(today.slice(0, 4));
  const todayMs = Date.parse(`${today}T00:00:00Z`);

  let nextMs = Date.UTC(year, mm - 1, dd);
  if (nextMs < todayMs) nextMs = Date.UTC(year + 1, mm - 1, dd);
  return Math.round((nextMs - todayMs) / 86_400_000);
}
