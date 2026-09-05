import { describe, expect, it } from "vitest";
import {
  adapaduchulu,
  allPeople,
  childrenOf,
  displayStatus,
  findFamily,
  findPerson,
  layoutFamilyTree,
  parentsOf,
  peopleInFamily,
  relationshipRecords,
  searchPeople,
  spousesOf,
  treeNodeStatus,
} from "@/lib/family-trees";

describe("family trees", () => {
  it("gives every person a unique id", () => {
    const ids = allPeople().map((person) => person.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps supplied names including unknown placeholders", () => {
    const names = allPeople().map((person) => person.fullName);
    expect(names).toContain("G Mishritha");
    expect(names).toContain("G Govardhan Reddy");
    expect(names).toContain("G [Name]");
    expect(names).toContain("M Nagarathna");
    expect(names).toContain("M Bhuvanseswari");
    expect(names).toContain("Y Naven Kumar");
    expect(names).toContain("J Venkatramana Reddy");
    expect(names).toContain("D Siva Shankar Reddy");
    expect(names).toContain("D Shiva Shankar Reddy");
  });

  it("does not expose internal - A markers", () => {
    for (const person of allPeople()) {
      expect(person.fullName).not.toMatch(/\s-\s*A\b/);
      expect(displayStatus(person).join(" ")).not.toMatch(/\s-\s*A\b/);
    }
  });

  it("keeps Adapaduchulu in their parental family", () => {
    const mishritha = findPerson("g-mishritha")!;
    expect(displayStatus(mishritha)).toContain("Adapaduchu (Married)");
    expect(parentsOf(mishritha.id).map((p) => p.fullName)).toContain(
      "G Santhabushan Reddy",
    );
    expect(mishritha.familyBranch).toBe("Gundluru Venkata Subba Reddy Family");
    expect(mishritha.familyId).toBe("GUNDLURU_VENKATA_SUBBA_REDDY");

    const nagarathna = findPerson("m-nagarathna")!;
    expect(displayStatus(nagarathna)).toContain("Adapaduchu (Married, Deceased)");
    expect(parentsOf(nagarathna.id).map((p) => p.fullName)).toContain("M Krishnaiah");
  });

  it("does not merge similar names", () => {
    const narendras = allPeople().filter((p) => p.fullName === "C Narendra Kumar");
    expect(narendras).toHaveLength(2);
    const shanthammas = allPeople().filter((p) => p.fullName === "Shanthamma");
    expect(shanthammas.length).toBeGreaterThanOrEqual(2);
    expect(findPerson("c-chennakrishnamma")?.fullName).toBe("C Chennakrishnamma");
    expect(findPerson("gounipalli-chenna-krishnamma")?.fullName).toBe(
      "Chenna Krishnamma",
    );
    expect(findPerson("c-chennakrishnamma")?.id).not.toBe(
      findPerson("gounipalli-chenna-krishnamma")?.id,
    );
  });

  it("keeps Gounipalli Ravanamma on her parental tree, married into Chinthamani", () => {
    const ravanamma = findPerson("ravanamma")!;
    expect(ravanamma.fullName).toBe("Gounipalli Ravanamma");
    expect(ravanamma.familyId).toBe("GOUNIPALLI");
    expect(displayStatus(ravanamma)).toContain("Adapaduchu (Married)");
    expect(spousesOf(ravanamma.id).map((p) => p.id)).toContain("c-ramanjulu");
    expect(findPerson("c-ramanjulu")!.familyId).toBe("CHINTHAMANI");
    expect(findPerson("gnanu")!.familyId).toBe("CHINTHAMANI");
    expect(parentsOf("gnanu").map((p) => p.id).sort()).toEqual(
      ["c-ramanjulu", "ravanamma"].sort(),
    );
    expect(findPerson("locksmith-krishna")!.fullName).toBe("Locksmith Krishna");
    expect(findPerson("locksmith-krishna")!.familyId).toBe("GOUNIPALLI");
  });

  it("finds Govardhan by partial search", () => {
    const hits = searchPeople("Govardhan");
    expect(hits.some((p) => p.fullName === "G Govardhan Reddy")).toBe(true);
  });

  it("lists Adapaduchulu with family links", () => {
    const list = adapaduchulu();
    expect(list.some((p) => p.fullName === "G Ramadevi")).toBe(true);
    expect(list.some((p) => p.fullName === "G Sujana")).toBe(true);
    expect(list.some((p) => p.fullName === "M Nagarathna")).toBe(true);
    expect(list.every((p) => p.adapaduchu)).toBe(true);
  });

  it("records Vijay Kumar Reddy as needing verification without inventing Hema", () => {
    const vijay = findPerson("g-vijay-kumar-reddy")!;
    expect(vijay.verificationStatus).toBe("needs-verification");
    expect(allPeople().some((p) => p.fullName === "Hema")).toBe(false);
    expect(childrenOf(vijay.id).map((p) => p.fullName)).toEqual([
      "G Pranay Kumar Reddy",
      "G Akshay Kumar Reddy",
    ]);
  });

  it("keeps M Chintal connected to P Ramana as spouse", () => {
    const chintal = findPerson("m-chintal")!;
    expect(chintal.adapaduchu).toBe(true);
    expect(spousesOf(chintal.id).map((p) => p.fullName)).toContain("P Ramana");
    expect(parentsOf(chintal.id).map((p) => p.fullName)).toContain("M Nadupanna");
    expect(chintal.familyId).toBe("MARIMENI_NADUPANNA");
  });

  it("keeps Gundluru Konda Reddy and Gundluru Venkata Subba Reddy as separate familyIds", () => {
    const konda = findPerson("g-koda-reddy")!;
    const subba = findPerson("g-subbareddy")!;
    expect(konda.fullName).toBe("G Konda Reddy");
    expect(konda.familyId).toBe("GUNDLURU_KONDA_REDDY");
    expect(subba.familyId).toBe("GUNDLURU_VENKATA_SUBBA_REDDY");
    expect(konda.familyId).not.toBe(subba.familyId);
  });

  it("does not place Jagadam people on Jagili", () => {
    const venkat = findPerson("j-venkatramana-reddy")!;
    expect(venkat.familyId).toBe("JAGADAM");
    expect(venkat.familyId).not.toBe("JAGILI");
    const chinna = findPerson("j-chinnareddenna")!;
    expect(chinna.familyId).toBe("JAGILI");
    expect(chinna.familyId).not.toBe("JAGADAM");
  });

  it("keeps similar Venkatramana names as separate people", () => {
    const g = findPerson("g-venkata-ramana-reddy")!;
    const j = findPerson("j-venkatramana-reddy")!;
    const d = findPerson("d-venkataramana-reddy")!;
    expect(g.familyId).toBe("GUNDLURU_KONDA_REDDY");
    expect(j.familyId).toBe("JAGADAM");
    expect(d.familyId).toBe("DEVAPATLA");
    expect(new Set([g.id, j.id, d.id]).size).toBe(3);
  });

  it("records an unnamed spouse for G Santhabushan Reddy without inventing a name", () => {
    const spouses = spousesOf("g-santhabushan-reddy");
    expect(spouses).toHaveLength(1);
    expect(spouses[0]!.fullName).toBe("G [Name]");
    expect(findPerson("g-padma")!.married).toBe(true);
  });

  it("does not merge Jagili Balaji with Kunchapu Balaji", () => {
    const k = findPerson("k-balaji")!;
    const j = findPerson("j-balaji")!;
    expect(k.familyId).toBe("KUNCHAPU");
    expect(j.familyId).toBe("JAGILI");
    expect(k.id).not.toBe(j.id);
  });
});

describe("visual family tree layout", () => {
  const subba = findFamily("GUNDLURU_VENKATA_SUBBA_REDDY")!;
  const layout = layoutFamilyTree({
    people: peopleInFamily(subba.id),
    relationships: relationshipRecords(),
    rootPersonIds: subba.rootPersonIds,
  });

  function box(id: string) {
    return layout.nodes.find((node) => node.id === id);
  }

  it("places spouses on the same row, connected horizontally", () => {
    const raghu = box("g-raghunatha-reddy")!;
    const padma = box("g-padma")!;
    expect(padma.y).toBe(raghu.y);
    expect(Math.abs(padma.x - raghu.x)).toBeGreaterThan(50);
    expect(
      layout.edges.some(
        (edge) =>
          edge.kind === "spouse" &&
          edge.id.includes("g-raghunatha-reddy") &&
          edge.id.includes("g-padma"),
      ),
    ).toBe(true);
  });

  it("places children below parents and siblings in a horizontal branch", () => {
    const parent = box("g-raghunatha-reddy")!;
    const kids = [
      "g-santhabushan-reddy",
      "g-ramesh-kumar-reddy",
      "g-uma-maheshwar-reddy",
    ].map((id) => box(id)!);
    expect(kids.every((child) => child.y > parent.y)).toBe(true);
    expect(kids.every((child) => child.y === kids[0]!.y)).toBe(true);
    const xs = kids.map((child) => child.x).sort((a, b) => a - b);
    expect(xs[1]).toBeGreaterThan(xs[0]!);
    expect(xs[2]).toBeGreaterThan(xs[1]!);
    expect(layout.edges.some((edge) => edge.kind === "descent")).toBe(true);
  });

  it("keeps Adapaduchulu on the parental tree", () => {
    const mishritha = box("g-mishritha")!;
    const parent = box("g-santhabushan-reddy")!;
    expect(mishritha.y).toBeGreaterThan(parent.y);
    expect(treeNodeStatus(findPerson("g-mishritha")!)).toContain(
      "Adapaduchu (Married)",
    );
    expect(treeNodeStatus(findPerson("m-nagarathna")!)).toContain(
      "Adapaduchu (Married, Deceased)",
    );
  });

  it("does not merge the two Gundluru families", () => {
    expect(box("g-subbareddy")).toBeTruthy();
    expect(box("g-koda-reddy")).toBeUndefined();
    const konda = findFamily("GUNDLURU_KONDA_REDDY")!;
    const kondaLayout = layoutFamilyTree({
      people: peopleInFamily(konda.id),
      relationships: relationshipRecords(),
      rootPersonIds: konda.rootPersonIds,
    });
    expect(kondaLayout.nodes.some((node) => node.id === "g-koda-reddy")).toBe(
      true,
    );
    expect(kondaLayout.nodes.some((node) => node.id === "g-subbareddy")).toBe(
      false,
    );
  });

  it("marks incomplete and unverified people without inventing relatives", () => {
    expect(treeNodeStatus(findPerson("g-vijay-kumar-reddy")!)).toContain(
      "Needs Verification",
    );
    expect(allPeople().some((person) => person.fullName === "Hema")).toBe(false);
    const konda = findPerson("g-koda-reddy")!;
    expect(konda.verificationStatus).toBe("incomplete");
    expect(displayStatus(konda)).toContain("Information not yet provided");
  });

  it("returns an empty layout when a family has no relationship records", () => {
    const empty = layoutFamilyTree({
      people: [],
      relationships: relationshipRecords(),
      rootPersonIds: [],
    });
    expect(empty.nodes).toEqual([]);
  });
});
