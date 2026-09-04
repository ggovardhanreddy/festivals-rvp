"use client";

/**
 * Reading the stored audit log at save time rather than at build time.
 *
 * §17 forbids the public site from exposing audit history. The site is a
 * static export, so anything handed to the admin page as a server prop is
 * baked into /admin/index.html — a file anyone can fetch without logging in.
 * The audit log therefore never travels that way: the admin page is built with
 * an empty audit array and the real history is fetched here, over the
 * admin-authenticated API, only when it is about to be appended to.
 *
 * Fetching at save time (not on mount) also keeps the append correct when two
 * admins edit in the same period — each save is based on what is actually
 * stored, not on a snapshot taken when the page loaded.
 */
import type { AuditLog } from "./entities";

/** How many audit rows to keep. Oldest beyond this are dropped on write. */
export const AUDIT_LIMIT = 2000;

/**
 * The audit rows currently in R2, newest first.
 *
 * A failure here must not block the save — losing the tree correction would be
 * worse than losing history — so it resolves to an empty array and lets the
 * caller write the new rows on their own.
 */
export async function fetchStoredAudit(): Promise<AuditLog[]> {
  try {
    const res = await fetch("/api/community/family-audit?admin=1", {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return [];
    const body = (await res.json()) as { items?: unknown };
    if (!Array.isArray(body.items)) return [];
    return body.items as AuditLog[];
  } catch {
    return [];
  }
}

/** New rows in front of stored ones, capped. Newest-first ordering is kept. */
export function mergeAudit(fresh: AuditLog[], stored: AuditLog[]): AuditLog[] {
  const seen = new Set<string>();
  const out: AuditLog[] = [];
  for (const row of [...fresh, ...stored]) {
    if (!row || seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out.slice(0, AUDIT_LIMIT);
}
