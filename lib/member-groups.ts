import type { Member, MemberGroup } from "./types";
import { dobMonthDay } from "./dates";

/** Map legacy Roots/Tree/Stems values still present in older data. */
export function normalizeStoredGroup(raw: string | undefined): MemberGroup {
  switch (raw) {
    case "legacy":
    case "core":
    case "nextgen":
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

/** Effective category — age wins when computable, else stored manual group. */
export function resolveMemberGroup(
  member: Member,
  from = new Date(),
): MemberGroup {
  const age = memberAge(member, from);
  if (age != null) return groupFromAge(age);
  return normalizeStoredGroup(member.group);
}

export const MEMBER_GROUP_LABELS: Record<MemberGroup, string> = {
  legacy: "Legacy Circle",
  core: "Core Members",
  nextgen: "NextGen",
};

export const MEMBER_GROUP_DESCRIPTIONS: Record<MemberGroup, string> = {
  legacy:
    "The respected elders and senior members whose experience, wisdom, and guidance form the foundation of our community.",
  core: "The active members who contribute to the growth, development, and day-to-day activities of our community.",
  nextgen:
    "The younger generation who will shape the future of our community with fresh ideas, innovation, and energy.",
};

export const MEMBER_GROUP_ORDER: MemberGroup[] = [
  "legacy",
  "core",
  "nextgen",
];

export const MEMBER_GROUP_AGE_HINT: Record<MemberGroup, string> = {
  legacy: "40 years and above",
  core: "28 to 39 years",
  nextgen: "Below 28 years",
};
