import { dobMonthDay, startOfDay } from "./dates";

/** Days until the next occurrence of an MM-DD / YYYY-MM-DD birthday (0 = today). */
export function daysUntilNextBirthday(
  dob: string,
  from = new Date(),
): number {
  const md = dobMonthDay(dob);
  if (!md) return Number.POSITIVE_INFINITY;
  const [mm, dd] = md.split("-").map(Number);
  const base = startOfDay(from);
  let next = new Date(base.getFullYear(), (mm || 1) - 1, dd || 1);
  if (next < base) next = new Date(base.getFullYear() + 1, (mm || 1) - 1, dd || 1);
  return Math.round((next.getTime() - base.getTime()) / 86400000);
}
