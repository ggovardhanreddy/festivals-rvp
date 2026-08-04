import { getDailyPanchang } from "panchang-ts";
import { VILLAGE_COORDS } from "@/lib/site";
import {
  bareTithiName,
  masaTe,
  nakshatraTe,
  normalizeNakshatra,
  pakshaTe,
  tithiTe,
  varaTe,
  WEEKDAYS_EN,
} from "@/lib/telugu-calendar-labels";

const LOCATION = {
  latitude: VILLAGE_COORDS.lat,
  longitude: VILLAGE_COORDS.lng,
} as const;

/** IST offset in minutes (UTC+5:30) — panchang-ts convention */
export const IST_TZ_MINUTES = 330;

export type DayPanchangam = {
  dateKey: string;
  year: number;
  month: number;
  day: number;
  weekdayEn: string;
  weekdayTe: string;
  tithiEn: string;
  tithiTe: string;
  tithiShortTe: string;
  pakshaEn: string;
  pakshaTe: string;
  nakshatraEn: string;
  nakshatraTe: string;
  nakshatraShortTe: string;
  pada: number | null;
  masaEn: string;
  masaTe: string;
  rahuKalam: string;
  yamaGandam: string;
  gulika: string;
  sunrise: string;
  sunset: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function dateKey(year: number, monthIndex: number, day: number) {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

/** Format panchang-ts offset-adjusted Date via UTC getters (IST when tz=330). */
export function formatIstTime(d: Date | null | undefined): string {
  if (!d || Number.isNaN(d.getTime())) return "—";
  let h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${pad2(m)} ${ampm}`;
}

export function formatIstRange(
  start: Date | null | undefined,
  end: Date | null | undefined,
): string {
  if (!start || !end) return "—";
  return `${formatIstTime(start)} – ${formatIstTime(end)}`;
}

function shortTe(label: string, max = 6): string {
  if (label.length <= max) return label;
  return label.slice(0, max);
}

export function getDayPanchangam(
  year: number,
  monthIndex: number,
  day: number,
): DayPanchangam | null {
  const date = new Date(year, monthIndex, day, 12, 0, 0, 0);
  const result = getDailyPanchang(date, LOCATION, { timezone: IST_TZ_MINUTES });
  if (!result) return null;

  const tithi = result.tithis[0];
  const nak = result.nakshatras[0];
  const weekdayEn =
    result.vara.englishName || WEEKDAYS_EN[date.getDay()] || "Sunday";
  const bareTithi = bareTithiName(tithi?.name || "");
  const nakEn = normalizeNakshatra(nak?.name || "");
  // Prefer Amanta month names for Andhra / Telugu calendar convention.
  const masaName =
    result.chandramasa?.amantaName ||
    result.chandramasa?.name ||
    result.masa?.name ||
    "";

  const tithiTeLabel = tithiTe(bareTithi);
  const nakTeLabel = nakshatraTe(nakEn);

  return {
    dateKey: dateKey(year, monthIndex, day),
    year,
    month: monthIndex,
    day,
    weekdayEn,
    weekdayTe: varaTe(weekdayEn),
    tithiEn: bareTithi || tithi?.name || "—",
    tithiTe: tithiTeLabel,
    tithiShortTe: shortTe(tithiTeLabel, 5),
    pakshaEn: tithi?.paksha || "",
    pakshaTe: pakshaTe(tithi?.paksha || ""),
    nakshatraEn: nakEn || "—",
    nakshatraTe: nakTeLabel,
    nakshatraShortTe: shortTe(nakTeLabel, 5),
    pada: typeof nak?.pada === "number" ? nak.pada : null,
    masaEn: masaName,
    masaTe: masaTe(masaName),
    rahuKalam: formatIstRange(result.rahuKalam?.start, result.rahuKalam?.end),
    yamaGandam: formatIstRange(result.yamaganda?.start, result.yamaganda?.end),
    gulika: formatIstRange(
      result.gulikaKalam?.start,
      result.gulikaKalam?.end,
    ),
    sunrise: formatIstTime(result.sunrise),
    sunset: formatIstTime(result.sunset),
  };
}

/** Precompute panchangam for every day in a Gregorian month. */
export function getMonthPanchangam(
  year: number,
  monthIndex: number,
): Map<number, DayPanchangam> {
  const days = new Date(year, monthIndex + 1, 0).getDate();
  const map = new Map<number, DayPanchangam>();
  for (let d = 1; d <= days; d++) {
    const p = getDayPanchangam(year, monthIndex, d);
    if (p) map.set(d, p);
  }
  return map;
}

/** Next anniversary date (local) for an MM-DD / YYYY-MM-DD dob. */
export function nextBirthdayDate(
  dob: string,
  from = new Date(),
): Date | null {
  const md = /^\d{4}-\d{2}-\d{2}/.test(dob)
    ? dob.slice(5, 10)
    : /^\d{2}-\d{2}$/.test(dob)
      ? dob
      : null;
  if (!md) return null;
  const [mm, dd] = md.split("-").map(Number);
  const base = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let next = new Date(base.getFullYear(), (mm || 1) - 1, dd || 1);
  if (next < base) {
    next = new Date(base.getFullYear() + 1, (mm || 1) - 1, dd || 1);
  }
  return next;
}

export function panchangHintForDob(
  dob: string | null | undefined,
  from = new Date(),
): string | null {
  if (!dob) return null;
  const next = nextBirthdayDate(dob, from);
  if (!next) return null;
  const p = getDayPanchangam(
    next.getFullYear(),
    next.getMonth(),
    next.getDate(),
  );
  if (!p) return null;
  return `${p.tithiTe} · ${p.nakshatraTe}`;
}
