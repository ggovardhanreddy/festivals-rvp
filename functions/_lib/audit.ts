/**
 * Append Super Admin actions to R2 community/audit.json.
 */

type AuditEnv = {
  MEDIA?: R2Bucket;
};

export type AuditEntry = {
  id: string;
  ts: number;
  actor: string;
  action: string;
  collection?: string;
  target?: string;
  detail?: string;
};

const AUDIT_KEY = "community/audit.json";
const MAX_ENTRIES = 1000;

function asItems(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as { items?: unknown }).items)
  ) {
    return (data as { items: Record<string, unknown>[] }).items;
  }
  return [];
}

export async function appendAdminAudit(
  env: AuditEnv,
  entry: Omit<AuditEntry, "id" | "ts"> & { id?: string; ts?: number },
): Promise<void> {
  if (!env.MEDIA) return;
  try {
    const obj = await env.MEDIA.get(AUDIT_KEY);
    let existing: Record<string, unknown>[] = [];
    if (obj) {
      try {
        existing = asItems(await obj.json());
      } catch {
        existing = [];
      }
    }
    const item: AuditEntry = {
      id: entry.id || `audit-${Date.now().toString(36)}`,
      ts: entry.ts || Date.now(),
      actor: entry.actor,
      action: entry.action,
      collection: entry.collection,
      target: entry.target,
      detail: entry.detail,
    };
    const next = [...existing, item].slice(-MAX_ENTRIES);
    await env.MEDIA.put(AUDIT_KEY, JSON.stringify({ items: next }), {
      httpMetadata: { contentType: "application/json" },
    });
  } catch {
    /* never fail the primary mutation because audit write failed */
  }
}
