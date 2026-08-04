/**
 * Members single source of truth (Git seed):
 *   content/data/members.json
 *
 * Runtime overlay: R2 `community/members.json` via /api/community/members,
 * merged with the seed (see mergeMemberRosters). Fun Fest auth hashes are
 * generated from this seed on every prepare:site (scripts/generate-member-auth.ts).
 */
import fs from "node:fs";
import path from "node:path";
import type { Member, MemberGroup } from "./types";
import { monthDay } from "./dates";
import { resolveMediaUrl } from "./media-url";
import {
  normalizeStoredGroup,
  resolveMemberGroup,
} from "./member-groups";

export { monthDay } from "./dates";
export {
  memberAge,
  groupFromAge,
  resolveMemberGroup,
  normalizeStoredGroup,
  MEMBER_GROUP_LABELS,
  MEMBER_GROUP_DESCRIPTIONS,
  MEMBER_GROUP_ORDER,
  MEMBER_GROUP_AGE_HINT,
} from "./member-groups";

/** Canonical Git path for the members roster seed. */
export const MEMBERS_SEED_PATH = "content/data/members.json";

const DATA_PATH = path.join(process.cwd(), MEMBERS_SEED_PATH);

let cache: Member[] | null = null;

function readMembers(): Member[] {
  if (!fs.existsSync(DATA_PATH)) return [];
  const raw = JSON.parse(fs.readFileSync(DATA_PATH, "utf8")) as Array<
    Member & { group?: string }
  >;
  return raw.map((m) => ({
    ...m,
    photo: m.photo ? resolveMediaUrl(m.photo) : null,
    dob: m.dob || null,
    birthYear: m.birthYear ?? null,
    joinYear: m.joinYear ?? null,
    group: normalizeStoredGroup(m.group),
    memorial: Boolean(m.memorial),
    archived: Boolean(m.archived),
    achievements: m.achievements || undefined,
    social: m.social || undefined,
    status: m.status || undefined,
    designation: m.designation || undefined,
  }));
}

export function loadMembers(): Member[] {
  // Always re-read in development so members.json edits show up without restart.
  if (process.env.NODE_ENV !== "production") {
    return readMembers();
  }
  if (cache) return cache;
  cache = readMembers();
  return cache;
}

export function membersByGroup(group?: MemberGroup): Member[] {
  const all = loadMembers();
  if (!group) return all;
  return all.filter((m) => resolveMemberGroup(m) === group);
}

export function countByGroup(): Record<MemberGroup, number> {
  const counts: Record<MemberGroup, number> = {
    legacy: 0,
    core: 0,
    nextgen: 0,
    former: 0,
  };
  for (const member of loadMembers()) {
    counts[resolveMemberGroup(member)] += 1;
  }
  return counts;
}

export function todaysBirthdays(date = new Date()): Member[] {
  const key = monthDay(date);
  return loadMembers().filter((m) => {
    if (!m.dob) return false;
    if (/^\d{4}-\d{2}-\d{2}/.test(m.dob)) {
      return m.dob.slice(5, 10) === key;
    }
    return m.dob === key;
  });
}

export function upcomingBirthdays(withinDays = 30, date = new Date()): Member[] {
  const members = loadMembers().filter((m) => m.dob);
  const out: { member: Member; days: number }[] = [];
  for (const member of members) {
    if (!member.dob) continue;
    let mm: number;
    let dd: number;
    if (/^\d{4}-\d{2}-\d{2}/.test(member.dob)) {
      mm = Number(member.dob.slice(5, 7));
      dd = Number(member.dob.slice(8, 10));
    } else {
      [mm, dd] = member.dob.split("-").map(Number);
    }
    const next = new Date(date.getFullYear(), (mm || 1) - 1, dd || 1);
    if (next < new Date(date.getFullYear(), date.getMonth(), date.getDate())) {
      next.setFullYear(next.getFullYear() + 1);
    }
    const days = Math.round(
      (next.getTime() -
        new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) /
        86400000,
    );
    if (days >= 0 && days <= withinDays) out.push({ member, days });
  }
  return out.sort((a, b) => a.days - b.days).map((x) => x.member);
}
