import familiesSeed from "@/content/data/families.json";
import type { FamilyPersonAssignment, VillageFamily } from "@/lib/types";
import type { Person } from "@/lib/family-trees/types";

/** Previous tree URLs and IDs → current family slugs. */
export const LEGACY_FAMILY_SLUGS: Record<string, string> = {
  "g-koda-reddy": "gundluru-konda-reddy",
  "g-subbareddy": "gundluru-venkata-subba-reddy",
  "gundluru-koda-reddy": "gundluru-konda-reddy",
  "gundluru-subba-reddy": "gundluru-venkata-subba-reddy",
  GUNDLURU_KODA_REDDY: "gundluru-konda-reddy",
  GUNDLURU_SUBBA_REDDY: "gundluru-venkata-subba-reddy",
  "k-family": "kunchapu",
  "m-family": "marimeni",
  "d-family": "devapatla",
  "d-raja-reddy": "devapatla",
  "d-venkataswami-reddy": "devapatla",
  "d-chenna-reddy": "devapatla",
  "d-rammohan-reddy": "devapatla",
  "m-nadupanna": "marimeni-nadupanna",
  "j-family": "jagadam",
  "u-family": "usirikayala",
  "c-family": "chinthamani",
  "y-family": "yerragolla",
};

export function loadVillageFamilies(): VillageFamily[] {
  return sortFamilies(familiesSeed as VillageFamily[]);
}

export function sortFamilies(families: VillageFamily[]): VillageFamily[] {
  return [...families].sort((a, b) => a.displayOrder - b.displayOrder);
}

export function publishedFamilies(families: VillageFamily[]): VillageFamily[] {
  return sortFamilies(families.filter((family) => family.isPublished));
}

export function findVillageFamily(
  slugOrId: string,
  families: VillageFamily[] = loadVillageFamilies(),
): VillageFamily | undefined {
  const legacySlug = LEGACY_FAMILY_SLUGS[slugOrId];
  return families.find(
    (family) =>
      family.slug === slugOrId ||
      family.id === slugOrId ||
      (legacySlug != null && family.slug === legacySlug),
  );
}

export function familyHref(idOrSlug: string, families?: VillageFamily[]): string {
  const family = findVillageFamily(idOrSlug, families ?? loadVillageFamilies());
  const slug = family?.slug ?? LEGACY_FAMILY_SLUGS[idOrSlug] ?? idOrSlug;
  return `/families/${slug}/`;
}

export function personFamilyHref(
  person: Pick<Person, "id" | "familyId">,
  families?: VillageFamily[],
): string {
  return `${familyHref(person.familyId, families)}${person.id}/`;
}

export function slugifyFamilyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/family$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function applyFamilyAssignments(
  people: Person[],
  assignments: FamilyPersonAssignment[],
  families: VillageFamily[],
): Person[] {
  const byId = new Map(assignments.map((item) => [item.id, item.familyId]));
  const familyById = new Map(families.map((family) => [family.id, family]));
  return people.map((person) => {
    const familyId = byId.get(person.id) ?? person.familyId;
    const family = familyById.get(familyId);
    if (familyId === person.familyId && (!family || family.name === person.familyBranch)) {
      return person;
    }
    return {
      ...person,
      familyId,
      familyBranch: family?.name ?? person.familyBranch,
    };
  });
}

export function peopleForFamily(people: Person[], familyId: string): Person[] {
  return people.filter((person) => person.familyId === familyId);
}

export function generationCount(people: Person[]): number {
  if (!people.length) return 0;
  return people.reduce((max, person) => Math.max(max, person.generation || 0), 0);
}
