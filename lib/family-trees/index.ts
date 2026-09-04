import type { Family, Person, Relationship, VerificationStatus } from "./types";
import { publicFamilyTreeDataset } from "./store";
export { layoutFamilyTree, relationshipsAmong } from "./layout";
export type { FamilyTreeLayout, LaidOutEdge, LaidOutPerson } from "./layout";
import {
  familyHref as catalogFamilyHref,
  findVillageFamily,
  loadVillageFamilies,
  personFamilyHref,
} from "@/lib/families/catalog";

/**
 * The public tree's data.
 *
 * §16: "The visual tree must NEVER be hard-coded." It reads
 * content/data/family-people.json and family-relationships.json now, written
 * by the admin editor. The store falls back to flattening seed.ts only while
 * those files are empty, so the migration could land without a blank moment.
 *
 * Relationships are adapted back to this module's older field names
 * (personId/relatedPersonId) so every existing consumer — the layout engine,
 * the person pages, search — keeps working unchanged. The stored shape is
 * §16's fromPersonId/toPersonId.
 */
const STORE = publicFamilyTreeDataset();
const DATA: { families: Family[]; people: Person[]; relationships: Relationship[] } = {
  families: STORE.families.map((family) => ({
    id: family.id,
    name: family.name,
    rootPersonIds: family.rootPersonIds ?? [],
  })),
  people: STORE.people as unknown as Person[],
  relationships: STORE.relationships.map((rel) => ({
    id: rel.id,
    personId: rel.fromPersonId,
    relatedPersonId: rel.toPersonId,
    relationshipType: rel.relationshipType,
    verificationStatus: rel.verificationStatus,
  })),
};
const CATALOG = loadVillageFamilies();

export function loadFamilyTrees() {
  return DATA;
}

export function allFamilies(): Family[] {
  return DATA.families;
}

export function allPeople(): Person[] {
  return DATA.people;
}

export function relationshipRecords(): Relationship[] {
  return DATA.relationships;
}

export function allRelationships(): Relationship[] {
  return DATA.relationships;
}

export function findFamily(id: string): Family | undefined {
  const village = findVillageFamily(id, CATALOG);
  const familyId = village?.id ?? id;
  return DATA.families.find((family) => family.id === familyId);
}

export function findPerson(id: string): Person | undefined {
  return DATA.people.find((person) => person.id === id);
}

export function peopleInFamily(familyId: string): Person[] {
  const village = findVillageFamily(familyId, CATALOG);
  const id = village?.id ?? familyId;
  return DATA.people.filter((person) => person.familyId === id);
}

export function related(
  personId: string,
  type: Relationship["relationshipType"],
): Person[] {
  const ids = DATA.relationships
    .filter((rel) => rel.personId === personId && rel.relationshipType === type)
    .map((rel) => rel.relatedPersonId);
  return ids
    .map((id) => findPerson(id))
    .filter((person): person is Person => Boolean(person));
}

export function parentsOf(personId: string): Person[] {
  return related(personId, "parent");
}

export function spousesOf(personId: string): Person[] {
  return related(personId, "spouse");
}

export function childrenOf(personId: string): Person[] {
  return related(personId, "child");
}

export function personHref(person: Person): string {
  return personFamilyHref(person, CATALOG);
}

export function familyHref(familyId: string): string {
  return catalogFamilyHref(familyId, CATALOG);
}

function adapaduchuLabel(person: Person): string | null {
  if (person.adapaduchu && person.deceased) {
    return "Adapaduchu (Married, Deceased)";
  }
  if (person.adapaduchu) return "Adapaduchu (Married)";
  return null;
}

export function displayStatus(person: Person): string[] {
  const labels: string[] = [];
  const adapaduchu = adapaduchuLabel(person);
  if (adapaduchu) labels.push(adapaduchu);
  else {
    if (person.deceased) labels.push("Deceased");
    else if (person.married) labels.push("Married");
  }
  if (person.occupation) labels.push(person.occupation);
  if (person.location) labels.push(person.location);
  if (person.verificationStatus === "needs-verification") {
    labels.push("Needs Verification");
  } else if (person.verificationStatus === "incomplete") {
    labels.push("Information not yet provided");
  } else if (!labels.length) {
    labels.push("Information not yet provided");
  }
  return labels;
}

/** Compact labels for genealogy nodes: name already shown; status only. */
export function treeNodeStatus(person: Person, ambiguous = false): string[] {
  const labels: string[] = [];
  const adapaduchu = adapaduchuLabel(person);
  if (adapaduchu) labels.push(adapaduchu);
  else if (person.deceased) labels.push("Deceased");
  else if (person.married) labels.push("Married");
  if (ambiguous || person.verificationStatus === "needs-verification") {
    labels.push("Needs Verification");
  } else if (person.verificationStatus === "incomplete") {
    labels.push("Information not yet provided");
  }
  return labels;
}

export function applyPersonPhotos(
  people: Person[],
  photosById: Record<string, string | null | undefined>,
): Person[] {
  return people.map((person) => {
    const photo = person.photo ?? photosById[person.id] ?? null;
    if (photo === person.photo) return person;
    return { ...person, photo };
  });
}

export function verificationLabel(status: VerificationStatus): string {
  if (status === "needs-verification") return "Needs Verification";
  if (status === "incomplete") return "Information not yet provided";
  return "Verified";
}

export function adapaduchulu(people: Person[] = DATA.people): Person[] {
  return people
    .filter((person) => person.adapaduchu)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export function searchPeople(
  query: string,
  people: Person[] = DATA.people,
): Person[] {
  const q = query.trim().toLowerCase();
  if (!q) return people;
  return people.filter((person) => {
    if (person.fullName.toLowerCase().includes(q)) return true;
    if (person.familyBranch.toLowerCase().includes(q)) return true;
    const parents = parentsOf(person.id).some((p) =>
      p.fullName.toLowerCase().includes(q),
    );
    if (parents) return true;
    return spousesOf(person.id).some((p) => p.fullName.toLowerCase().includes(q));
  });
}

export function bloodChildren(personId: string): Person[] {
  return childrenOf(personId);
}

export function treeRoots(family: Family): Person[] {
  return family.rootPersonIds
    .map((id) => findPerson(id))
    .filter((person): person is Person => Boolean(person));
}

export function familyPersonParams(): { familyId: string; personId: string }[] {
  return DATA.people.map((person) => ({
    familyId: person.familyId,
    personId: person.id,
  }));
}

export function familyStats(familyId: string, people: Person[] = DATA.people) {
  const village = findVillageFamily(familyId, CATALOG);
  const id = village?.id ?? familyId;
  const members = people.filter((person) => person.familyId === id);
  const generations = members.reduce(
    (max, person) => Math.max(max, person.generation || 0),
    0,
  );
  return {
    people: members.length,
    generations,
  };
}

export function reddivaripalliConnection(person: Person): string {
  if (person.adapaduchu) {
    return "Member of the original parental family";
  }
  return `Member of ${person.familyBranch}`;
}
