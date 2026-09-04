import { describe, expect, it } from "vitest";
import { loadMembers } from "@/lib/members";
import {
  matchProfession,
  mergeMemberRosters,
} from "@/lib/member-stats";
import type { Member } from "@/lib/types";

function stub(partial: Partial<Member> & Pick<Member, "id" | "name">): Member {
  return {
    photo: null,
    dob: null,
    group: "legacy",
    ...partial,
  };
}

describe("members seed", () => {
  it("includes J Venkata Ramana Reddy and D Manohar", () => {
    const ids = new Set(loadMembers().map((m) => m.id));
    expect(ids.has("j-venkata-ramana-reddy")).toBe(true);
    expect(ids.has("d-manohar")).toBe(true);
  });
});

describe("profession matching for government service", () => {
  it("counts a retired DSP as government", () => {
    expect(
      matchProfession("Retired DSP – Government Service", "government"),
    ).toBe(true);
  });

  it("counts a state skill development MD as government", () => {
    expect(
      matchProfession(
        "Government Employee – Managing Director, State Skill Development Corporation",
        "government",
      ),
    ).toBe(true);
  });
});

describe("mergeMemberRosters", () => {
  it("keeps seed members that are not in the R2 overlay", () => {
    const seed = [
      stub({ id: "j-venkata-ramana-reddy", name: "J Venkata Ramana Reddy" }),
      stub({ id: "d-manohar", name: "D Manohar" }),
    ];
    const remote = [
      stub({
        id: "j-venkata-ramana-reddy",
        name: "J Venkata Ramana Reddy",
        designation: "stale",
      }),
    ];
    const merged = mergeMemberRosters(seed, remote);
    expect(merged.map((m) => m.id).sort()).toEqual(
      ["d-manohar", "j-venkata-ramana-reddy"].sort(),
    );
  });
});
