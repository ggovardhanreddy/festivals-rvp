/**
 * Expiry-date extraction from notification text.
 *
 * §11: exam notifications, application deadlines, scholarship announcements
 * and job notices are temporary. Finding their end date automatically is what
 * lets the Learning Center archive them instead of showing a village student
 * a scholarship that closed in March.
 *
 * The parser is deliberately conservative. It only fires on an explicit
 * deadline phrase followed by a date. A bare date anywhere in a notice is
 * ignored, because government PDFs are full of dates — issue dates, meeting
 * dates, G.O. dates — and guessing wrong would archive live resources.
 *
 * Client-safe.
 */

const MONTHS: Record<string, number> = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
  may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8, sep: 9, sept: 9,
  september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
};

/** Phrases that actually mean "this closes on". Lowercase. */
const DEADLINE_CUES = [
  "last date",
  "last day",
  "closing date",
  "closes on",
  "due date",
  "deadline",
  "apply before",
  "apply on or before",
  "on or before",
  "up to",
  "upto",
  "valid till",
  "valid until",
  "expires on",
  "final date",
  "last date for submission",
  "last date of application",
  "last date to apply",
];

function iso(y: number, m: number, d: number): string | null {
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  if (y < 2000 || y > 2100) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${y.toString().padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/**
 * Parse one date out of a fragment. Handles the formats these portals
 * actually use, including the two that appear on the same NSP page:
 * `31-10-2026` and `30/11/2026`.
 *
 * Day-first is assumed throughout, which is correct for every Indian
 * government portal in the source list. `03-02-2026` is 3 February.
 */
export function parseIndianDate(fragment: string): string | null {
  const text = fragment.trim();

  // 31-10-2026 | 30/11/2026 | 31.10.2026
  const numeric = text.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})\b/);
  if (numeric) {
    return iso(Number(numeric[3]), Number(numeric[2]), Number(numeric[1]));
  }

  // 2026-10-31 (ISO, occasionally in API payloads)
  const isoish = text.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (isoish) {
    return iso(Number(isoish[1]), Number(isoish[2]), Number(isoish[3]));
  }

  // 31 October 2026 | 31st Oct, 2026
  const dmy = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9})\.?,?\s+(\d{4})\b/);
  if (dmy) {
    const month = MONTHS[dmy[2]!.toLowerCase()];
    if (month) return iso(Number(dmy[3]), month, Number(dmy[1]));
  }

  // October 31, 2026
  const mdy = text.match(/\b([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b/);
  if (mdy) {
    const month = MONTHS[mdy[1]!.toLowerCase()];
    if (month) return iso(Number(mdy[3]), month, Number(mdy[2]));
  }

  return null;
}

/**
 * Find the expiry date in a notification.
 *
 * Returns the LATEST date found after a deadline cue. Latest rather than
 * first because a notice often lists several deadlines — student submission,
 * institute verification, final verification — and the resource stops being
 * useful only after the last one.
 */
export function extractExpiryDate(...parts: Array<string | undefined>): string | null {
  const text = parts.filter(Boolean).join("\n").toLowerCase();
  if (!text) return null;

  let latest: string | null = null;
  for (const cue of DEADLINE_CUES) {
    let from = 0;
    for (;;) {
      const at = text.indexOf(cue, from);
      if (at === -1) break;
      from = at + cue.length;
      // Look ahead a short window: a deadline's date follows its label
      // closely. 80 chars covers "Last date for submission of application
      // by the student : 31-10-2026" without spilling into the next row.
      const window = text.slice(at, at + 80);
      const found = parseIndianDate(window.slice(cue.length));
      if (found && (!latest || found > latest)) latest = found;
    }
  }
  return latest;
}

/** True when an ISO date is strictly before today in the village's timezone. */
export function isExpired(isoDate: string | undefined, todayKey: string): boolean {
  if (!isoDate) return false;
  return isoDate < todayKey;
}

/** Resource types whose content is inherently time-bound. */
export const EXPIRING_TYPES = new Set(["notification"]);
