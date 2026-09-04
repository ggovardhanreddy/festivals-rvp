import type {
  Family,
  FamilyTreeDataset,
  Person,
  Relationship,
  SeedFamily,
  SeedPerson,
  VerificationStatus,
} from "./types";

function statusOf(node: SeedPerson): VerificationStatus {
  if (node.verificationStatus) return node.verificationStatus;
  if (node.informationNotYetProvided) return "incomplete";
  return "verified";
}

function addPerson(
  people: Map<string, Person>,
  family: SeedFamily,
  node: SeedPerson,
): Person {
  const existing = people.get(node.id);
  if (existing) return existing;
  const person: Person = {
    id: node.id,
    fullName: node.fullName,
    familyId: family.id,
    familyBranch: family.name,
    occupation: node.occupation ?? null,
    location: node.location ?? null,
    adapaduchu: Boolean(node.adapaduchu),
    deceased: Boolean(node.deceased),
    married: Boolean(node.married || node.adapaduchu || node.spouses?.length),
    verificationStatus: statusOf(node),
    notes: node.notes ?? (node.informationNotYetProvided
      ? "Information not yet provided"
      : null),
    photo: null,
    generation: 1,
  };
  people.set(person.id, person);
  return person;
}

function relId(
  type: Relationship["relationshipType"],
  a: string,
  b: string,
): string {
  return `${type}:${a}:${b}`;
}

function addRel(
  rels: Map<string, Relationship>,
  personId: string,
  relatedPersonId: string,
  relationshipType: Relationship["relationshipType"],
  verificationStatus: VerificationStatus,
) {
  const id = relId(relationshipType, personId, relatedPersonId);
  if (rels.has(id)) return;
  rels.set(id, {
    id,
    personId,
    relatedPersonId,
    relationshipType,
    verificationStatus,
  });
}

function walk(
  family: SeedFamily,
  node: SeedPerson,
  parentIds: string[],
  people: Map<string, Person>,
  rels: Map<string, Relationship>,
) {
  const person = addPerson(people, family, node);
  const spouseIds: string[] = [];

  for (const spouse of node.spouses ?? []) {
    const partner = addPerson(people, family, spouse);
    spouseIds.push(partner.id);
    const v =
      spouse.verificationStatus === "needs-verification" ||
      person.verificationStatus === "needs-verification"
        ? "needs-verification"
        : statusOf(spouse);
    addRel(rels, person.id, partner.id, "spouse", v);
    addRel(rels, partner.id, person.id, "spouse", v);
  }

  for (const parentId of parentIds) {
    addRel(rels, parentId, person.id, "child", person.verificationStatus);
    addRel(rels, person.id, parentId, "parent", person.verificationStatus);
  }

  const childParents = [person.id, ...spouseIds];
  for (const child of node.children ?? []) {
    walk(family, child, childParents, people, rels);
  }
}

function assignGenerations(
  people: Map<string, Person>,
  rels: Relationship[],
  rootIds: string[],
) {
  const childrenOf = new Map<string, string[]>();
  for (const rel of rels) {
    if (rel.relationshipType !== "child") continue;
    const list = childrenOf.get(rel.personId) ?? [];
    list.push(rel.relatedPersonId);
    childrenOf.set(rel.personId, list);
  }

  const queue = [...rootIds];
  const seen = new Set<string>();
  for (const id of rootIds) {
    const person = people.get(id);
    if (person) person.generation = 1;
  }
  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const parent = people.get(id);
    const gen = parent?.generation ?? 1;
    for (const childId of childrenOf.get(id) ?? []) {
      const child = people.get(childId);
      if (!child) continue;
      child.generation = Math.max(child.generation, gen + 1);
      queue.push(childId);
    }
  }

  for (const person of people.values()) {
    if (seen.has(person.id)) continue;
    const spouseRel = rels.find(
      (r) => r.relationshipType === "spouse" && r.personId === person.id,
    );
    const partner = spouseRel
      ? people.get(spouseRel.relatedPersonId)
      : undefined;
    if (partner) person.generation = partner.generation;
  }
}

export function flattenFamilies(seeds: SeedFamily[]): FamilyTreeDataset {
  const people = new Map<string, Person>();
  const rels = new Map<string, Relationship>();
  const families: Family[] = [];

  for (const seed of seeds) {
    for (const root of seed.roots) {
      walk(seed, root, [], people, rels);
    }
    const rootPersonIds = seed.roots.map((root) => root.id);
    const existing = families.find((family) => family.id === seed.id);
    if (existing) {
      existing.rootPersonIds.push(...rootPersonIds);
    } else {
      families.push({
        id: seed.id,
        name: seed.name,
        rootPersonIds,
      });
    }
    assignGenerations(people, [...rels.values()], rootPersonIds);
  }

  return {
    families,
    people: [...people.values()],
    relationships: [...rels.values()],
  };
}
