import { describe, expect, it } from "vitest";
import {
  isPlaceholderName,
  personDisplayName,
  splitIntoBranches,
} from "@/lib/family-trees/branches";
import { allPeople, relationshipRecords } from "@/lib/family-trees";
import type { Person, Relationship } from "@/lib/family-trees/types";

function person(id: string, fullName: string, generation = 1): Person {
  return {
    id,
    fullName,
    familyId: "F",
    familyBranch: "F",
    photo: null,
    occupation: null,
    location: null,
    generation,
    adapaduchu: false,
    deceased: false,
    married: false,
    notes: null,
    verificationStatus: "verified",
  } as Person;
}
const rel = (
  id: string,
  a: string,
  b: string,
  t: Relationship["relationshipType"],
): Relationship => ({
  id,
  personId: a,
  relatedPersonId: b,
  relationshipType: t,
  verificationStatus: "verified",
});

/**
 * The separation rule, which is the whole point of splitting a page into
 * branches: two people share a tree only because a recorded relationship
 * connects them -- never because their names resemble each other.
 */
describe("branch separation", () => {
  it("keeps same-surname families apart when nothing connects them", () => {
    const people = [
      person("d-harinatha", "D Harinatha"),
      person("d-reddemma", "D Reddemma"),
      person("d-raja", "D Raja Reddy"),
      person("d-savithramma", "D Savithramma"),
    ];
    const rels = [
      rel("r1", "d-harinatha", "d-reddemma", "spouse"),
      rel("r2", "d-reddemma", "d-harinatha", "spouse"),
      rel("r3", "d-raja", "d-savithramma", "spouse"),
      rel("r4", "d-savithramma", "d-raja", "spouse"),
    ];
    const branches = splitIntoBranches(people, rels);
    expect(branches).toHaveLength(2);
    const ids = branches.map((b) => b.people.map((p) => p.id).sort());
    expect(ids).toContainEqual(["d-harinatha", "d-reddemma"]);
    expect(ids).toContainEqual(["d-raja", "d-savithramma"]);
  });

  it("does not merge two identically named people in unconnected branches", () => {
    const people = [
      person("a-1", "Shanthamma"),
      person("a-2", "Krishna Reddy"),
      person("b-1", "Shanthamma"),
      person("b-2", "Ravi Kumar Reddy"),
    ];
    const rels = [
      rel("r1", "a-2", "a-1", "spouse"),
      rel("r2", "a-1", "a-2", "spouse"),
      rel("r3", "b-2", "b-1", "spouse"),
      rel("r4", "b-1", "b-2", "spouse"),
    ];
    expect(splitIntoBranches(people, rels)).toHaveLength(2);
  });

  it("joins people only through an explicit relationship", () => {
    const people = [person("p1", "Konda Reddy"), person("p2", "Narayana Reddy", 2)];
    expect(splitIntoBranches(people, [])).toHaveLength(2);
    const joined = splitIntoBranches(people, [
      rel("r1", "p1", "p2", "child"),
      rel("r2", "p2", "p1", "parent"),
    ]);
    expect(joined).toHaveLength(1);
    expect(joined[0]!.rootPersonIds).toEqual(["p1"]);
  });

  it("does not treat a married-in spouse as a second root", () => {
    const people = [
      person("root", "Narayana Reddy"),
      person("son", "Krishna Reddy", 2),
      person("wife", "Shanthamma", 2),
    ];
    const branches = splitIntoBranches(people, [
      rel("r1", "root", "son", "child"),
      rel("r2", "son", "root", "parent"),
      rel("r3", "son", "wife", "spouse"),
      rel("r4", "wife", "son", "spouse"),
    ]);
    expect(branches).toHaveLength(1);
    // Shanthamma has no parents here, but she heads no tree of her own.
    expect(branches[0]!.rootPersonIds).toEqual(["root"]);
  });

  it("names a branch after its root couple, never inventing one", () => {
    const people = [person("h", "D Harinatha"), person("r", "D Reddemma")];
    const branches = splitIntoBranches(people, [
      rel("r1", "h", "r", "spouse"),
      rel("r2", "r", "h", "spouse"),
    ]);
    expect(branches[0]!.title).toContain("D Harinatha");
    expect(branches[0]!.title).toContain("+");
  });

  it("never invents a name for an unnamed person", () => {
    expect(isPlaceholderName("D [Name]")).toBe(true);
    expect(isPlaceholderName("D Harinatha")).toBe(false);
    expect(personDisplayName({ fullName: "D [Name]" })).toBe("Name Not Available");
    expect(personDisplayName({ fullName: "D Harinatha" })).toBe("D Harinatha");
  });
});

/** The live data, which is what the village actually sees. */
describe("branch separation over the real tree", () => {
  const people = allPeople();
  const rels = relationshipRecords();

  it("splits every surname page into its independent families", () => {
    const byFamily = new Map<string, typeof people>();
    for (const p of people) {
      byFamily.set(p.familyId, [...(byFamily.get(p.familyId) ?? []), p]);
    }
    let total = 0;
    for (const [, members] of byFamily) {
      total += splitIntoBranches(members, rels).length;
    }
    // 14 surname pages currently carry far more than 14 real families.
    expect(total).toBeGreaterThan(byFamily.size);
  });

  it("puts Harinatha and Raja Reddy in different trees", () => {
    const devapatla = people.filter((p) => p.familyId === "DEVAPATLA");
    const branches = splitIntoBranches(devapatla, rels);
    const of = (id: string) => branches.findIndex((b) => b.people.some((p) => p.id === id));
    const harinatha = people.find((p) => p.fullName === "D Harinatha");
    const raja = people.find((p) => p.fullName === "D Raja Reddy");
    expect(harinatha && raja).toBeTruthy();
    expect(of(harinatha!.id)).toBeGreaterThanOrEqual(0);
    expect(of(harinatha!.id)).not.toBe(of(raja!.id));
  });

  it("gives every branch at least one root", () => {
    for (const [, members] of new Map(
      people.map((p) => [p.familyId, people.filter((x) => x.familyId === p.familyId)]),
    )) {
      for (const branch of splitIntoBranches(members, rels)) {
        expect(branch.rootPersonIds.length).toBeGreaterThan(0);
      }
    }
  });
});
