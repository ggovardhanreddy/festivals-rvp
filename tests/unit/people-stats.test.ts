import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  rosterStats,
  treeStats,
  villagePeopleStats,
  publishedMembers,
} from "@/lib/people-stats";
import {
  memberDisplayName,
  validateMembers,
  memberErrors,
} from "@/lib/member-validation";
import { translate } from "@/lib/i18n";
import { allPeople } from "@/lib/family-trees";
import type { Member } from "@/lib/types";

const member = (over: Partial<Member> & { id: string }): Member =>
  ({
    name: `Name ${over.id}`,
    photo: null,
    dob: null,
    group: "core",
    ...over,
  }) as Member;

describe("member statistics are derived, never fixed", () => {
  it("counts a member the moment they are added", () => {
    const before = rosterStats([member({ id: "a" }), member({ id: "b" })]);
    const after = rosterStats([
      member({ id: "a" }),
      member({ id: "b" }),
      member({ id: "c" }),
    ]);
    expect(before.total).toBe(2);
    expect(after.total).toBe(3);
  });

  it("excludes archived members from every figure", () => {
    const stats = rosterStats([
      member({ id: "a", group: "legacy" }),
      member({ id: "b", group: "legacy", archived: true }),
    ]);
    expect(stats.total).toBe(1);
    expect(stats.byGroup.legacy).toBe(1);
  });

  it("group counts always sum to the total", () => {
    const stats = rosterStats([
      member({ id: "a", group: "legacy" }),
      member({ id: "b", group: "core" }),
      member({ id: "c", group: "nextgen" }),
      member({ id: "d", group: "core" }),
    ]);
    const sum =
      stats.byGroup.legacy + stats.byGroup.core + stats.byGroup.nextgen;
    expect(sum).toBe(stats.total);
  });

  it("counts an unknown group as core rather than losing the person", () => {
    // Losing them would make the group counts stop summing to the total, which
    // is precisely the kind of silent drift this phase is closing.
    const stats = rosterStats([member({ id: "a", group: "mystery" as never })]);
    expect(stats.total).toBe(1);
    expect(stats.byGroup.core).toBe(1);
  });

  it("lists exactly the members it counts", () => {
    const roster = [
      member({ id: "a" }),
      member({ id: "b", archived: true }),
      member({ id: "c" }),
    ];
    // The grid used a bare !archived filter while its own total used
    // publishedMembers, so the page could print more cards than it claimed.
    expect(publishedMembers(roster)).toHaveLength(rosterStats(roster).total);
  });

  it("keeps the roster and the family tree as separate populations", () => {
    const stats = villagePeopleStats(
      [member({ id: "a" }), member({ id: "b" })],
      allPeople(),
    );
    expect(stats.roster.total).toBe(2);
    expect(stats.tree.people).toBeGreaterThan(stats.roster.total);
    expect(stats.tree.adapaduchulu).toBeGreaterThan(0);
    expect(stats.tree.adapaduchulu).toBeLessThanOrEqual(stats.tree.people);
  });

  it("counts adapaduchulu from the tree, not the roster", () => {
    const tree = treeStats(allPeople());
    expect(tree.adapaduchulu).toBe(
      allPeople().filter((p) => p.adapaduchu).length,
    );
  });
});

describe("the same numbers reach both languages", () => {
  it("has every people count string in English and Telugu", () => {
    for (const key of [
      "people.rosterCount",
      "people.rosterCountOne",
      "people.treeCount",
      "people.adapaduchuCount",
      "people.countsNote",
    ]) {
      const en = translate("en", key);
      const te = translate("te", key);
      expect(en, `${key} missing in en`).not.toBe(key);
      expect(te, `${key} missing in te`).not.toBe(key);
      expect(te, `${key} is not translated`).not.toBe(en);
    }
  });

  it("interpolates the same figure into both languages", () => {
    const en = translate("en", "people.rosterCount", undefined, { count: 39 });
    const te = translate("te", "people.rosterCount", undefined, { count: 39 });
    expect(en).toContain("39");
    expect(te).toContain("39");
  });

  it("shows a Telugu name only when one exists, never hiding anyone", () => {
    const withTe = { name: "G Ramesh", nameTe: "జి రమేష్" };
    const without = { name: "G Ramesh" };
    expect(memberDisplayName(withTe, "te")).toBe("జి రమేష్");
    expect(memberDisplayName(withTe, "en")).toBe("G Ramesh");
    expect(memberDisplayName(without, "te")).toBe("G Ramesh");
  });
});

describe("member record validation", () => {
  it("rejects a duplicate id, which would silently replace someone", () => {
    const issues = memberErrors([member({ id: "a" }), member({ id: "a" })]);
    expect(issues.some((i) => i.field === "id")).toBe(true);
  });

  it("rejects a record with no id or no name", () => {
    expect(memberErrors([member({ id: "" })]).length).toBeGreaterThan(0);
    expect(memberErrors([member({ id: "a", name: "" })]).length).toBeGreaterThan(0);
  });

  it("warns about an unknown group instead of failing the build", () => {
    const issues = validateMembers([member({ id: "a", group: "roots" as never })]);
    const group = issues.find((i) => i.field === "group");
    expect(group?.level).toBe("warning");
  });

  it("warns when a record carries a private field", () => {
    const issues = validateMembers([
      member({ id: "a", phone: "9999999999" } as Partial<Member> & { id: string }),
    ]);
    expect(issues.some((i) => i.field === "phone")).toBe(true);
  });

  it("passes the committed roster with no errors", () => {
    const roster = JSON.parse(
      readFileSync(join(process.cwd(), "content/data/members.json"), "utf8"),
    ) as Member[];
    expect(memberErrors(roster)).toEqual([]);
  });
});

describe("private member fields never reach the public API", () => {
  it("redacts phone, email, blood group and address for non-admins", () => {
    const api = readFileSync(
      join(process.cwd(), "functions/api/community/[[route]].ts"),
      "utf8",
    );
    const block = api.slice(
      api.indexOf("PUBLIC_REDACTED_FIELDS"),
      api.indexOf("function redactForPublic"),
    );
    for (const field of ["phone", "email", "bloodGroup", "address"]) {
      expect(block, `${field} not redacted`).toContain(`"${field}"`);
    }
    expect(api).toContain("if (!admin) items = redactForPublic(collection, items)");
  });

  it("keeps the committed roster free of private fields", () => {
    const roster = JSON.parse(
      readFileSync(join(process.cwd(), "content/data/members.json"), "utf8"),
    ) as Record<string, unknown>[];
    for (const field of ["phone", "email", "bloodGroup", "address"]) {
      expect(roster.filter((m) => m[field])).toEqual([]);
    }
  });
});
