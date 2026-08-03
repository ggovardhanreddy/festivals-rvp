import type { Member, MemberGroup } from "./types";
import { resolveMemberGroup } from "./member-groups";

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
      return /doctor|surgeon|orthopedic|md\b|physician|veterinary/.test(d);
    case "government":
      return /government|vro|vigilance|post office|bank employee|headmaster|priest|indian army/.test(
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

/** Merge seed roster with admin/R2 updates without dropping designations or photos. */
export function mergeMemberRosters(seed: Member[], remote: Member[]): Member[] {
  if (!remote.length) return seed.filter((m) => !m.archived);

  const map = new Map<string, Member>();
  for (const item of seed) map.set(item.id, item);

  for (const item of remote) {
    const prev = map.get(item.id);
    if (!prev) {
      map.set(item.id, item);
      continue;
    }
    map.set(item.id, {
      ...prev,
      ...item,
      name: item.name?.trim() || prev.name,
      photo: item.photo || prev.photo,
      dob: item.dob || prev.dob,
      designation: item.designation?.trim() || prev.designation,
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
    });
  }

  const seen = new Set<string>();
  const out: Member[] = [];
  for (const item of seed) {
    const merged = map.get(item.id);
    if (merged && !merged.archived) {
      out.push(merged);
      seen.add(item.id);
    }
  }
  for (const item of remote) {
    if (seen.has(item.id)) continue;
    const merged = map.get(item.id);
    if (merged && !merged.archived) out.push(merged);
  }
  return out;
}
