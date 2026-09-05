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

/**
 * How a card label is rendered in the reader's language.
 *
 * Every label function below takes one of these, and defaults to returning the
 * English fallback. That keeps the existing call sites working untouched while
 * a component that has a translator can pass one -- which matters because these
 * few functions produce most of the visible text on a family page: a status
 * word repeated across 266 person cards.
 */
export type LabelTranslator = (key: string, fallback: string) => string;

const EN: LabelTranslator = (_key, fallback) => fallback;

function adapaduchuLabel(person: Person, t: LabelTranslator = EN): string | null {
  if (person.adapaduchu && person.deceased) {
    return t("person.adapaduchuDeceased", "Adapaduchu (Married, Deceased)");
  }
  if (person.adapaduchu) return t("person.adapaduchu", "Adapaduchu (Married)");
  return null;
}

export function displayStatus(person: Person, t: LabelTranslator = EN): string[] {
  const labels: string[] = [];
  const adapaduchu = adapaduchuLabel(person, t);
  if (adapaduchu) labels.push(adapaduchu);
  else {
    if (person.deceased) labels.push(t("person.deceased", "Deceased"));
    else if (person.married) labels.push(t("person.married", "Married"));
  }
  // Occupation and location are the person's own words; they are not
  // translated, only shown.
  if (person.occupation) labels.push(person.occupation);
  if (person.location) labels.push(person.location);
  if (person.verificationStatus === "needs-verification") {
    labels.push(t("person.needsVerification", "Needs Verification"));
  } else if (person.verificationStatus === "incomplete") {
    labels.push(t("person.infoNotProvided", "Information not yet provided"));
  } else if (!labels.length) {
    labels.push(t("person.infoNotProvided", "Information not yet provided"));
  }
  return labels;
}

/**
 * Card labels for a genealogy node: status first, then occupation.
 *
 * The name is rendered separately, so this is everything under it. Occupation
 * belongs on the card because a person is easier to recognise as "Married /
 * Employee" than by name alone, and a tree of similar names is exactly where
 * that matters.
 */
export function treeNodeStatus(
  person: Person,
  ambiguous = false,
  t: LabelTranslator = EN,
): string[] {
  const labels: string[] = [];
  const adapaduchu = adapaduchuLabel(person, t);
  if (adapaduchu) labels.push(adapaduchu);
  else if (person.deceased) labels.push(t("person.deceased", "Deceased"));
  else if (person.married) labels.push(t("person.married", "Married"));
  if (person.occupation) labels.push(person.occupation);
  if (ambiguous || person.verificationStatus === "needs-verification") {
    labels.push(t("person.needsVerification", "Needs Verification"));
  } else if (person.verificationStatus === "incomplete" && !labels.length) {
    labels.push(t("person.infoNotProvided", "Information not yet provided"));
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

export function verificationLabel(
  status: VerificationStatus,
  t: LabelTranslator = EN,
): string {
  if (status === "needs-verification") {
    return t("person.needsVerification", "Needs Verification");
  }
  if (status === "incomplete") {
    return t("person.infoNotProvided", "Information not yet provided");
  }
  return t("person.verified", "Verified");
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

export function reddivaripalliConnection(
  person: Person,
  t: LabelTranslator = EN,
): string {
  if (person.adapaduchu) {
    return t("person.memberOfParental", "Member of the original parental family");
  }
  return t("person.memberOf", `Member of ${person.familyBranch}`).replace(
    "{branch}",
    person.familyBranch,
  );
}
