import type { Member, MemberGroup } from "./types";
import { dobMonthDay } from "./dates";

/** Map legacy Roots/Tree/Stems values still present in older data. */
export function normalizeStoredGroup(raw: string | undefined): MemberGroup {
  switch (raw) {
    case "legacy":
    case "core":
    case "nextgen":
    case "former":
      return raw;
    case "roots":
    case "root":
      return "legacy";
    case "tree":
    case "trees":
      return "core";
    case "stems":
    case "stem":
      return "nextgen";
    default:
      return "core";
  }
}

export function memberAge(member: Member, from = new Date()): number | null {
  if (
    member.birthYear &&
    member.birthYear >= 1900 &&
    member.birthYear <= from.getFullYear()
  ) {
    let age = from.getFullYear() - member.birthYear;
    const md = dobMonthDay(member.dob);
    if (md) {
      const [mm, dd] = md.split("-").map(Number);
      const hadBirthday =
        from.getMonth() + 1 > (mm || 1) ||
        (from.getMonth() + 1 === (mm || 1) && from.getDate() >= (dd || 1));
      if (!hadBirthday) age -= 1;
    }
    return Math.max(0, age);
  }

  if (member.dob && /^\d{4}-\d{2}-\d{2}/.test(member.dob)) {
    const born = new Date(`${member.dob.slice(0, 10)}T12:00:00`);
    if (Number.isNaN(born.getTime())) return null;
    let age = from.getFullYear() - born.getFullYear();
    const hadBirthday =
      from.getMonth() > born.getMonth() ||
      (from.getMonth() === born.getMonth() && from.getDate() >= born.getDate());
    if (!hadBirthday) age -= 1;
    return Math.max(0, age);
  }

  return null;
}

export function groupFromAge(age: number): MemberGroup {
  if (age >= 40) return "legacy";
  if (age >= 28) return "core";
  return "nextgen";
}

/** Effective category from members.json (manual community list). */
export function resolveMemberGroup(member: Member): MemberGroup {
  return normalizeStoredGroup(member.group);
}

export const MEMBER_GROUP_LABELS: Record<MemberGroup, string> = {
  legacy: "Legacy Circle",
  core: "Core Members",
  nextgen: "Next Generation",
  former: "Former Members",
};

export const MEMBER_GROUP_DESCRIPTIONS: Record<MemberGroup, string> = {
  legacy:
    "The Legacy Circle honors the senior members who have significantly contributed to the growth, unity, traditions, and development of Reddivaripalli Village. Their experience and lifelong service continue to inspire future generations.",
  core: "The Core Members are the active contributors leading community initiatives, organizing festivals, supporting village development, and preserving the traditions of Reddivaripalli.",
  nextgen:
    "The Next Generation represents the future of Reddivaripalli—young professionals, entrepreneurs, public servants, and innovators who will carry forward the village's legacy with dedication and fresh ideas.",
  former:
    "Former Members are remembered as part of the village family — listed with respect, without active directory photos.",
};

export const MEMBER_GROUP_ORDER: MemberGroup[] = [
  "legacy",
  "core",
  "nextgen",
  "former",
];

/** Short label for badges (no age bands). */
export const MEMBER_GROUP_AGE_HINT: Record<MemberGroup, string> = {
  legacy: "Senior stewards",
  core: "Active leaders",
  nextgen: "Rising generation",
  former: "Remembered with respect",
};

export function memberInitials(name: string): string {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function isMemorial(member: Member): boolean {
  return Boolean(
    member.memorial ||
      /loving memory|forever remembered/i.test(member.status || ""),
  );
}
