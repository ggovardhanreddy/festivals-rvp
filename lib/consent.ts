/**
 * First-run consent, recorded once.
 *
 * The site previously asked twice on a first visit: a notification permission
 * card and, 2.8s later, a location card. They stacked on top of each other,
 * intercepted clicks, and gave the visitor two separate decisions before they
 * had seen any content. There is now exactly one consent interaction —
 * WelcomeConsent — and this module is the record of whether it has happened.
 *
 * Nothing here grants anything. The browser's own permission prompts remain
 * the only thing that can grant notifications or location; this only tracks
 * whether we have already asked, so we never ask twice unprompted.
 */
export const CONSENT_KEY = "rvp-consent-v1";

export type ConsentChoice = "granted" | "declined" | "skipped";

export type ConsentRecord = {
  /** ISO date of the single first-run ask. */
  seenAt: string;
  notifications: ConsentChoice;
  location: ConsentChoice;
};

export function readConsent(): ConsentRecord | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (!parsed || typeof parsed.seenAt !== "string") return null;
    return {
      seenAt: parsed.seenAt,
      notifications: parsed.notifications ?? "skipped",
      location: parsed.location ?? "skipped",
    };
  } catch {
    return null;
  }
}

export function writeConsent(record: ConsentRecord): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
  } catch {
    /* private mode / storage disabled — we simply ask again next visit */
  }
}

/** True once the visitor has been through the single first-run ask. */
export function consentSettled(): boolean {
  return readConsent() !== null;
}

/** Clear the record so Settings can offer "ask me again". */
export function clearConsent(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Other first-visit surfaces (the PWA install prompt) check this so nothing
 * ever stacks on top of the consent dialog again.
 */
export const CONSENT_OPEN_ATTR = "data-consent-open";

export function markConsentOpen(open: boolean): void {
  if (typeof document === "undefined") return;
  if (open) document.documentElement.setAttribute(CONSENT_OPEN_ATTR, "1");
  else document.documentElement.removeAttribute(CONSENT_OPEN_ATTR);
}

export function isConsentOpen(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.hasAttribute(CONSENT_OPEN_ATTR);
}
