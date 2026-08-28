/** Locale-aware date and number formatting. */
import { LOCALE_TAG, type Locale } from "./config";

export function formatDate(
  value: string | number | Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" },
): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(LOCALE_TAG[locale], { timeZone: "Asia/Kolkata", ...options }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export function formatNumber(value: number, locale: Locale): string {
  try {
    return new Intl.NumberFormat(LOCALE_TAG[locale]).format(value);
  } catch {
    return String(value);
  }
}
