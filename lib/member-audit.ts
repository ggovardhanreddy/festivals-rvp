import { withBase } from "@/lib/base";
import { newCommunityId } from "@/lib/community";
import type { Member, MemberAuditEntry } from "@/lib/types";

export async function appendMemberAudit(
  entry: Omit<MemberAuditEntry, "id" | "ts"> & { ts?: number; id?: string },
): Promise<void> {
  const item: MemberAuditEntry = {
    id: entry.id || newCommunityId("audit"),
    ts: entry.ts || Date.now(),
    adminName: entry.adminName,
    memberId: entry.memberId,
    memberName: entry.memberName,
    action: entry.action,
    fields: entry.fields,
    before: entry.before ?? null,
    after: entry.after ?? null,
  };
  const res = await fetch(withBase("/api/community/audit"), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ item }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Audit log failed");
  }
}

export async function fetchMemberAudit(): Promise<MemberAuditEntry[]> {
  const res = await fetch(withBase("/api/community/audit?admin=1"), {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { items?: MemberAuditEntry[] };
  const items = Array.isArray(data.items) ? data.items : [];
  return [...items].sort((a, b) => (b.ts || 0) - (a.ts || 0));
}

export function memberAuditSummary(
  before: Member | null | undefined,
  after: Member,
  fields: string[],
): Pick<MemberAuditEntry, "before" | "after" | "fields" | "memberName"> {
  const beforeSnap: Partial<Member> = {};
  const afterSnap: Partial<Member> = {};
  for (const key of fields) {
    const k = key as keyof Member;
    (beforeSnap as Record<string, unknown>)[key] = before?.[k] ?? null;
    (afterSnap as Record<string, unknown>)[key] = after[k] ?? null;
  }
  return {
    fields,
    before: beforeSnap,
    after: afterSnap,
    memberName: after.name,
  };
}
