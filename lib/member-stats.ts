import type { Member, MemberGroup } from "./types";
import { resolveMemberGroup } from "./member-groups";
import removedMemberIds from "@/content/data/members-removed.json";

const REMOVED_MEMBER_IDS = new Set<string>(removedMemberIds as string[]);

export type ProfessionKey =
  | "doctors"
  | "government"
  | "teachers"
  | "software"
  | "farmers"
  | "business";

export const PROFESSION_LABELS: Record<ProfessionKey, string> = {
  doctors: "Doctors",
  government: "Government Employees",
  teachers: "Teachers",
  software: "Software Engineers",
  farmers: "Farmers",
  business: "Business Owners",
};

export const PROFESSION_ORDER: ProfessionKey[] = [
  "doctors",
  "government",
  "teachers",
  "software",
  "farmers",
  "business",
];

export function matchProfession(
  designation: string | undefined,
  key: ProfessionKey,
): boolean {
  const d = (designation || "").toLowerCase();
  if (!d) return false;
  switch (key) {
    case "doctors":
      return /doctor|surgeon|orthop(?:a)?edic|md\b|physician|veterinary/.test(
        d,
      );
    case "government":
      // Bank staff and temple priests stay in Other Professionals
      return /government|vro|vigilance|post office|headmaster|indian army/.test(
        d,
      );
    case "teachers":
      return /teacher|headmaster|school/.test(d);
    case "software":
      return /software|cyber security|e-commerce/.test(d);
    case "farmers":
      return /farmer|agriculture|poultry/.test(d);
    case "business":
      return /business|retail|real estate|medical shop|sales manager|grt/.test(d);
    default:
      return false;
  }
}

export function professionKeysFor(member: Member): ProfessionKey[] {
  return PROFESSION_ORDER.filter((key) =>
    matchProfession(member.designation, key),
  );
}

export type MemberDirectoryStats = {
  total: number;
  byGroup: Record<MemberGroup, number>;
  byProfession: Record<ProfessionKey, number>;
};

export function computeMemberStats(members: Member[]): MemberDirectoryStats {
  const active = members.filter((m) => !m.archived);
  const byGroup: Record<MemberGroup, number> = {
    legacy: 0,
    core: 0,
    nextgen: 0,
  };
  const byProfession = Object.fromEntries(
    PROFESSION_ORDER.map((k) => [k, 0]),
  ) as Record<ProfessionKey, number>;

  for (const member of active) {
    byGroup[resolveMemberGroup(member)] += 1;
    for (const key of professionKeysFor(member)) {
      byProfession[key] += 1;
    }
  }

  return { total: active.length, byGroup, byProfession };
}

function pickStr(
  next: string | null | undefined,
  prev: string | null | undefined,
): string | null | undefined {
  if (next === null) return null;
  if (typeof next === "string") {
    const t = next.trim();
    if (t) return t;
  }
  return prev;
}

function preferPhoto(
  remote: string | null | undefined,
  seed: string | null | undefined,
): string | null {
  if (remote === null) return null;
  const r = (remote || "").trim();
  const s = (seed || "").trim();
  if (!r) return s || null;
  if (!s) return r;
  // Prefer absolute CDN URLs over site-relative stubs (strip-local leaves 32-byte files).
  const rAbs = /^https?:\/\//i.test(r);
  const sAbs = /^https?:\/\//i.test(s);
  if (sAbs && !rAbs) return s;
  // Keep site-relative /members/… paths — edge middleware proxies them from R2.
  return r;
}

function mergeOne(prev: Member | undefined, item: Member): Member {
  if (!prev) return item;
  return {
    ...prev,
    ...item,
    name: item.name?.trim() || prev.name,
    nickname: pickStr(item.nickname, prev.nickname) as string | undefined,
    photo: preferPhoto(item.photo, prev.photo),
    dob: pickStr(item.dob, prev.dob) as string | null,
    designation: pickStr(item.designation, prev.designation) as
      | string
      | undefined,
    profession: pickStr(item.profession, prev.profession) as string | undefined,
    company: pickStr(item.company, prev.company) as string | undefined,
    bio: pickStr(item.bio, prev.bio) as string | undefined,
    phone: pickStr(item.phone, prev.phone) as string | undefined,
    email: pickStr(item.email, prev.email) as string | undefined,
    bloodGroup: pickStr(item.bloodGroup, prev.bloodGroup) as string | undefined,
    memorial: item.memorial ?? prev.memorial,
    status: item.status || prev.status,
    archived: item.archived ?? prev.archived,
    achievements:
      item.achievements && item.achievements.length
        ? item.achievements
        : prev.achievements,
    social: item.social && item.social.length ? item.social : prev.social,
    birthYear: item.birthYear ?? prev.birthYear,
    joinYear: item.joinYear ?? prev.joinYear,
    group: item.group || prev.group,
    displayOrder: item.displayOrder ?? prev.displayOrder,
  };
}

function sortByDisplayOrder(a: Member, b: Member) {
  const ao = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
  const bo = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
  if (ao !== bo) return ao - bo;
  return a.name.localeCompare(b.name);
}

/**
 * Merge seed roster with admin/R2 updates.
 * For known seed ids, seed name/designation/group/memorial/status win so a
 * stale R2 `community/members.json` cannot show outdated titles. Remote may
 * still enrich photos, DOBs, achievements, and add new members.
 * IDs in `members-removed.json` are never reintroduced from R2.
 */
export function mergeMemberRosters(
  seed: Member[],
  remote: Member[],
  opts?: { includeArchived?: boolean },
): Member[] {
  const includeArchived = Boolean(opts?.includeArchived);
  const remoteSafe = remote.filter((m) => !REMOVED_MEMBER_IDS.has(m.id));
  if (!remoteSafe.length) {
    const base = includeArchived ? seed : seed.filter((m) => !m.archived);
    return [...base].sort(sortByDisplayOrder);
  }

  const seedById = new Map(seed.map((m) => [m.id, m]));
  const map = new Map<string, Member>();
  for (const item of seed) map.set(item.id, item);

  for (const item of remoteSafe) {
    const seedItem = seedById.get(item.id);
    const merged = mergeOne(map.get(item.id), item);
    if (!seedItem) {
      map.set(item.id, merged);
      continue;
    }
    map.set(item.id, {
      ...merged,
      name: seedItem.name?.trim() || merged.name,
      designation: seedItem.designation?.trim() || merged.designation,
      group: seedItem.group || merged.group,
      memorial: seedItem.memorial ?? merged.memorial,
      status: seedItem.status || merged.status,
      photo: preferPhoto(merged.photo, seedItem.photo),
      dob: merged.dob || seedItem.dob,
    });
  }

  const seen = new Set<string>();
  const out: Member[] = [];
  for (const item of seed) {
    if (REMOVED_MEMBER_IDS.has(item.id)) continue;
    const merged = map.get(item.id);
    if (!merged) continue;
    if (!includeArchived && merged.archived) continue;
    out.push(merged);
    seen.add(item.id);
  }
  for (const item of remoteSafe) {
    if (seen.has(item.id)) continue;
    if (REMOVED_MEMBER_IDS.has(item.id)) continue;
    const merged = map.get(item.id);
    if (!merged) continue;
    if (!includeArchived && merged.archived) continue;
    out.push(merged);
  }
  return out.sort(sortByDisplayOrder);
}

/** Diff two member snapshots for audit logging. */
export function diffMemberFields(
  before: Member | null | undefined,
  after: Member,
): { fields: string[]; beforeSnap: Partial<Member>; afterSnap: Partial<Member> } {
  const keys: (keyof Member)[] = [
    "name",
    "nickname",
    "photo",
    "dob",
    "group",
    "designation",
    "profession",
    "company",
    "bio",
    "phone",
    "email",
    "bloodGroup",
    "memorial",
    "status",
    "archived",
    "achievements",
    "social",
    "birthYear",
    "joinYear",
    "displayOrder",
  ];
  const fields: string[] = [];
  const beforeSnap: Partial<Member> = {};
  const afterSnap: Partial<Member> = {};
  for (const key of keys) {
    const a = before?.[key];
    const b = after[key];
    const same = JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
    if (!same) {
      fields.push(key);
      (beforeSnap as Record<string, unknown>)[key] = a ?? null;
      (afterSnap as Record<string, unknown>)[key] = b ?? null;
    }
  }
  return { fields, beforeSnap, afterSnap };
}
