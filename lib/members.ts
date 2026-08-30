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
import { daysUntilNextBirthday } from "./member-birthdays";
import removedMemberIds from "@/content/data/members-removed.json";
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

const REMOVED_MEMBER_IDS = new Set<string>(removedMemberIds as string[]);

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

/**
 * Live counts per group.
 *
 * Archived members and ids retired in members-removed.json are excluded, so
 * this matches exactly what the Members page lists — the homepage can never
 * advertise a total the People page does not show.
 */
export function countByGroup(): Record<MemberGroup, number> {
  const counts: Record<MemberGroup, number> = {
    legacy: 0,
    core: 0,
    nextgen: 0,
  };
  for (const member of activeMembers()) {
    counts[resolveMemberGroup(member)] += 1;
  }
  return counts;
}

/** Members the site actually publishes: not archived, not retired. */
export function activeMembers(): Member[] {
  return loadMembers().filter(
    (m) => !m.archived && !REMOVED_MEMBER_IDS.has(m.id),
  );
}

export function todaysBirthdays(date = new Date()): Member[] {
  const key = monthDay(date);
  return activeMembers().filter((m) => {
    if (!m.dob) return false;
    if (/^\d{4}-\d{2}-\d{2}/.test(m.dob)) {
      return m.dob.slice(5, 10) === key;
    }
    return m.dob === key;
  });
}

export function upcomingBirthdays(withinDays = 30, date = new Date()): Member[] {
  return activeMembers()
    .filter((m) => m.dob)
    .map((member) => ({
      member,
      days: daysUntilNextBirthday(member.dob!, date),
    }))
    .filter((x) => Number.isFinite(x.days) && x.days >= 0 && x.days <= withinDays)
    .sort((a, b) => a.days - b.days)
    .map((x) => x.member);
}
