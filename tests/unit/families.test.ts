import { describe, expect, it } from "vitest";
import {
  familyHref,
  findVillageFamily,
  generationCount,
  loadVillageFamilies,
  publishedFamilies,
  sortFamilies,
} from "@/lib/families/catalog";
import {
  allFamilies,
  allPeople,
  familyHref as treeFamilyHref,
  familyStats,
  findPerson,
  peopleInFamily,
} from "@/lib/family-trees";

describe("village families catalog", () => {
  it("lists the 14 family branches in displayOrder", () => {
    const families = loadVillageFamilies();
    expect(families.map((family) => family.name)).toEqual([
      "Gundluru Konda Reddy Family",
      "Gundluru Venkata Subba Reddy Family",
      "Kunchapu Family",
      "Marimeni Family",
      "Devapatla Family",
      "Marimeni Nadupanna Family",
      "Kommepalli Family",
      "Kudum Family",
      "Jagadam Family",
      "Jagili Family",
      "Usirikayala Family",
      "Chinthamani Family",
      "Yerragolla Family",
      "Gounipalli Family",
    ]);
    expect(families.every((family, index) => family.displayOrder === index + 1)).toBe(
      true,
    );
  });

  it("puts Gundluru Konda Reddy before Gundluru Venkata Subba Reddy", () => {
    const families = publishedFamilies(loadVillageFamilies());
    expect(families[0]?.id).toBe("GUNDLURU_KONDA_REDDY");
    expect(families[1]?.id).toBe("GUNDLURU_VENKATA_SUBBA_REDDY");
  });

  it("does not merge similar family names", () => {
    const families = loadVillageFamilies();
    expect(findVillageFamily("GUNDLURU_KONDA_REDDY", families)?.id).not.toBe(
      findVillageFamily("GUNDLURU_VENKATA_SUBBA_REDDY", families)?.id,
    );
    expect(findVillageFamily("JAGADAM", families)?.id).not.toBe(
      findVillageFamily("JAGILI", families)?.id,
    );
    expect(findVillageFamily("MARIMENI", families)?.id).not.toBe(
      findVillageFamily("MARIMENI_NADUPANNA", families)?.id,
    );
  });

  it("sorts by displayOrder, not alphabetically", () => {
    const shuffled = sortFamilies(
      [...loadVillageFamilies()].sort((a, b) => a.name.localeCompare(b.name)),
    );
    expect(shuffled[0]?.name).toBe("Gundluru Konda Reddy Family");
    expect(shuffled.map((family) => family.name)[2]).toBe("Kunchapu Family");
  });

  it("uses slugs in family URLs", () => {
    expect(familyHref("GUNDLURU_KONDA_REDDY")).toBe(
      "/families/gundluru-konda-reddy/",
    );
    expect(treeFamilyHref("GUNDLURU_VENKATA_SUBBA_REDDY")).toBe(
      "/families/gundluru-venkata-subba-reddy/",
    );
    expect(familyHref("g-koda-reddy")).toBe("/families/gundluru-konda-reddy/");
  });

  it("does not expose caste categories on family records", () => {
    for (const family of loadVillageFamilies()) {
      expect(family).not.toHaveProperty("category");
      expect(family).not.toHaveProperty("familyPhoto");
      expect(family.name).not.toMatch(/caste/i);
      expect(family.description).not.toMatch(/Reddy Families|Other Families/i);
    }
  });
});

describe("family membership is explicit", () => {
  it("counts people from familyId, not surname", () => {
    const koda = peopleInFamily("GUNDLURU_KONDA_REDDY");
    const subba = peopleInFamily("GUNDLURU_VENKATA_SUBBA_REDDY");
    expect(koda.length).toBeGreaterThan(0);
    expect(subba.length).toBeGreaterThan(0);
    expect(koda.some((person) => person.familyId === "GUNDLURU_VENKATA_SUBBA_REDDY")).toBe(
      false,
    );
    expect(familyStats("GUNDLURU_KONDA_REDDY").people).toBe(koda.length);
    expect(familyStats("GUNDLURU_VENKATA_SUBBA_REDDY").people).toBe(subba.length);
  });

  it("keeps assigned family branches until an admin reassigns people", () => {
    expect(peopleInFamily("KOMMEPALLI").some((person) => person.id === "k-pedda-bal-reddy")).toBe(
      true,
    );
    expect(peopleInFamily("KUDUM").some((person) => person.id === "k-ramanjulu")).toBe(true);
    expect(peopleInFamily("JAGILI").some((person) => person.id === "j-chinnareddenna")).toBe(
      true,
    );
    expect(peopleInFamily("JAGADAM").some((person) => person.id === "j-chinnareddenna")).toBe(
      false,
    );
    expect(peopleInFamily("KUNCHAPU").some((person) => person.id === "k-pedda-bal-reddy")).toBe(
      false,
    );
    expect(generationCount([])).toBe(0);
  });

  it("keeps Govardhan on the family branch recorded in the genealogy seed", () => {
    const govardhan = findPerson("g-govardhan-reddy")!;
    expect(govardhan.familyId).toBe("GUNDLURU_KONDA_REDDY");
    expect(
      peopleInFamily("GUNDLURU_VENKATA_SUBBA_REDDY").some(
        (person) => person.id === "g-govardhan-reddy",
      ),
    ).toBe(false);
  });

  it("keeps tree families keyed by the same familyId as the catalog", () => {
    const ids = new Set(allFamilies().map((family) => family.id));
    expect(ids.has("GUNDLURU_KONDA_REDDY")).toBe(true);
    expect(ids.has("GUNDLURU_VENKATA_SUBBA_REDDY")).toBe(true);
    expect(ids.has("DEVAPATLA")).toBe(true);
    expect(ids.has("JAGADAM")).toBe(true);
    expect(ids.has("GOUNIPALLI")).toBe(true);
    expect(ids.has("g-koda-reddy")).toBe(false);
  });
});
