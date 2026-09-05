/**
 * What makes a member record usable.
 *
 * Bad records do not announce themselves: a member with no id silently drops
 * out of a merge, a duplicate id silently overwrites someone, and an unknown
 * group quietly lands in "core" and moves a count nobody meant to move. This
 * runs in the build gate so those are caught before they ship rather than
 * noticed later as a number that looks wrong.
 *
 * It reports problems; it never edits data. Repairing a record is the admin's
 * decision, not the validator's.
 */
import type { Member, MemberGroup } from "./types";

export type MemberIssue = {
  level: "error" | "warning";
  memberId: string;
  field: string;
  message: string;
};

const GROUPS: MemberGroup[] = ["legacy", "core", "nextgen"];

/** Fields that must never be published. See PUBLIC_REDACTED_FIELDS in the API. */
export const PRIVATE_MEMBER_FIELDS = ["phone", "email", "bloodGroup", "address"] as const;

export function validateMembers(members: Member[]): MemberIssue[] {
  const issues: MemberIssue[] = [];
  const seen = new Map<string, number>();

  members.forEach((member, index) => {
    const at = member.id || `row ${index + 1}`;

    if (!member.id || !member.id.trim()) {
      issues.push({
        level: "error",
        memberId: at,
        field: "id",
        message: "Member has no id. It would be dropped by any merge.",
      });
    } else {
      seen.set(member.id, (seen.get(member.id) ?? 0) + 1);
      if (!/^[a-z0-9][a-z0-9-]*$/.test(member.id)) {
        issues.push({
          level: "warning",
          memberId: at,
          field: "id",
          message: `Id "${member.id}" is not a lowercase slug; it will not round-trip through a URL cleanly.`,
        });
      }
    }

    if (!member.name || !member.name.trim()) {
      issues.push({
        level: "error",
        memberId: at,
        field: "name",
        message: "Member has no name.",
      });
    }

    if (member.group && !GROUPS.includes(member.group as MemberGroup)) {
      issues.push({
        level: "warning",
        memberId: at,
        field: "group",
        // Silently becoming "core" is what makes a group count drift.
        message: `Unknown group "${member.group}". It will be counted as "core".`,
      });
    }

    if (member.dob && !/^(\d{4}-)?\d{2}-\d{2}$/.test(member.dob)) {
      issues.push({
        level: "warning",
        memberId: at,
        field: "dob",
        message: `Date of birth "${member.dob}" is not MM-DD or YYYY-MM-DD; no birthday will be shown.`,
      });
    }

    if (member.birthYear != null) {
      const year = Number(member.birthYear);
      const thisYear = new Date().getFullYear();
      if (!Number.isInteger(year) || year < 1900 || year > thisYear) {
        issues.push({
          level: "warning",
          memberId: at,
          field: "birthYear",
          message: `Birth year ${member.birthYear} is outside 1900-${thisYear}.`,
        });
      }
    }

    for (const field of PRIVATE_MEMBER_FIELDS) {
      if ((member as Record<string, unknown>)[field]) {
        issues.push({
          level: "warning",
          memberId: at,
          field,
          message: `Contains ${field}, which is withheld from the public API. Keep it only if the admin needs it.`,
        });
      }
    }
  });

  for (const [id, count] of seen) {
    if (count > 1) {
      issues.push({
        level: "error",
        memberId: id,
        field: "id",
        message: `Id appears ${count} times. One record silently replaces the other.`,
      });
    }
  }

  return issues;
}

export function memberErrors(members: Member[]): MemberIssue[] {
  return validateMembers(members).filter((issue) => issue.level === "error");
}

/**
 * The name to show for a member in a given language.
 *
 * Falls back to English rather than hiding anyone: one roster serves both
 * sites, so a missing translation must never change who appears.
 */
export function memberDisplayName(
  member: Pick<Member, "name" | "nameTe">,
  locale: string,
): string {
  if (locale === "te" && member.nameTe && member.nameTe.trim()) {
    return member.nameTe.trim();
  }
  return member.name;
}
