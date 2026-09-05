/**
 * Splitting a family page into genuinely independent trees.
 *
 * A page like "Devapatla" currently holds ten unrelated roots. The layout
 * engine draws them as one forest -- side by side on a single canvas, under a
 * single heading -- and the result reads as one family, which is exactly the
 * merging the records forbid: Devapatla Harinatha and Devapatla Raja Reddy are
 * separate families that happen to share a surname.
 *
 * Nothing here infers anything. A branch is a connected component of the
 * relationship graph: two people are in the same branch only because an
 * explicit parent, child or spouse row connects them. Surname, initial,
 * location and occupation are never consulted, so two families cannot be
 * joined by resembling each other -- only by a relationship someone recorded.
 */
import type { Person, Relationship } from "./types";

export type TreeBranch = {
  /** Stable across renders: the lowest member id in the branch. */
  id: string;
  people: Person[];
  relationships: Relationship[];
  /** People with no parent inside this branch. */
  rootPersonIds: string[];
  /** "Harinatha + Reddemma" -- derived from the root couple, never invented. */
  title: string;
  generations: number;
};

/** A placeholder stands in for a name the source did not supply (§14). */
export function isPlaceholderName(name: string): boolean {
  return /\[[^\]]*]/.test(name) || !name.trim();
}

/** What to print on a card. Never invents a name for an unnamed person. */
export function personDisplayName(person: Pick<Person, "fullName">): string {
  return isPlaceholderName(person.fullName)
    ? "Name Not Available"
    : person.fullName;
}

export function splitIntoBranches(
  people: Person[],
  relationships: Relationship[],
): TreeBranch[] {
  const byId = new Map(people.map((person) => [person.id, person]));
  const within = relationships.filter(
    (rel) => byId.has(rel.personId) && byId.has(rel.relatedPersonId),
  );

  // Undirected adjacency: a relationship of any kind keeps two people together.
  const adjacency = new Map<string, Set<string>>();
  const link = (a: string, b: string) => {
    const set = adjacency.get(a) ?? new Set<string>();
    set.add(b);
    adjacency.set(a, set);
  };
  for (const rel of within) {
    link(rel.personId, rel.relatedPersonId);
    link(rel.relatedPersonId, rel.personId);
  }

  const seen = new Set<string>();
  const branches: TreeBranch[] = [];

  for (const person of people) {
    if (seen.has(person.id)) continue;
    const memberIds: string[] = [];
    const stack = [person.id];
    while (stack.length) {
      const id = stack.pop()!;
      if (seen.has(id)) continue;
      seen.add(id);
      memberIds.push(id);
      for (const next of adjacency.get(id) ?? []) {
        if (!seen.has(next)) stack.push(next);
      }
    }

    const ids = new Set(memberIds);
    const members = memberIds
      .map((id) => byId.get(id)!)
      .sort((a, b) => a.generation - b.generation || a.fullName.localeCompare(b.fullName));
    const branchRels = within.filter(
      (rel) => ids.has(rel.personId) && ids.has(rel.relatedPersonId),
    );

    // A root has no parent inside this branch. Derived, never stored: adding a
    // parent above someone must move the root down by itself.
    const hasParentHere = new Set<string>();
    const spousesOf = new Map<string, string[]>();
    for (const rel of branchRels) {
      if (rel.relationshipType === "parent") hasParentHere.add(rel.personId);
      if (rel.relationshipType === "child") hasParentHere.add(rel.relatedPersonId);
      if (rel.relationshipType === "spouse") {
        const list = spousesOf.get(rel.personId) ?? [];
        if (!list.includes(rel.relatedPersonId)) list.push(rel.relatedPersonId);
        spousesOf.set(rel.personId, list);
      }
    }
    const rootPersonIds = members
      .filter((member) => {
        if (hasParentHere.has(member.id)) return false;
        // Someone who married into the branch has no parents here, but they
        // are not a second root -- they belong beside their spouse in the
        // descent line, not at the head of a tree of their own.
        const partners = spousesOf.get(member.id) ?? [];
        return !partners.some((id) => hasParentHere.has(id));
      })
      .map((member) => member.id);

    branches.push({
      id: [...memberIds].sort()[0]!,
      people: members,
      relationships: branchRels,
      rootPersonIds,
      title: branchTitle(members, rootPersonIds, branchRels),
      generations: new Set(members.map((m) => m.generation)).size,
    });
  }

  // Biggest first: the main line of a family is the one a visitor came for.
  return branches.sort(
    (a, b) => b.people.length - a.people.length || a.title.localeCompare(b.title),
  );
}

/**
 * A branch heading taken from its root couple.
 *
 * Derived from the data rather than assigned, so it cannot contradict the
 * records. Once the numbered records are supplied, the real family name
 * replaces this.
 */
function branchTitle(
  members: Person[],
  rootPersonIds: string[],
  relationships: Relationship[],
): string {
  const byId = new Map(members.map((person) => [person.id, person]));
  const hasChildren = new Set(
    relationships
      .filter((rel) => rel.relationshipType === "child")
      .map((rel) => rel.personId),
  );
  const named = rootPersonIds
    .map((id) => byId.get(id))
    .filter((person): person is Person => Boolean(person))
    .filter((person) => !isPlaceholderName(person.fullName))
    // Lead with whoever carries the line onward, so the heading names the
    // person the branch actually descends from rather than a spouse who
    // happens to sort first.
    .sort((a, b) => Number(hasChildren.has(b.id)) - Number(hasChildren.has(a.id)));

  const head = named[0] ?? members.find((m) => !isPlaceholderName(m.fullName));
  if (!head) return "Family branch";

  const spouseId = relationships.find(
    (rel) => rel.relationshipType === "spouse" && rel.personId === head.id,
  )?.relatedPersonId;
  const spouse = spouseId ? byId.get(spouseId) : undefined;

  if (spouse && !isPlaceholderName(spouse.fullName)) {
    return `${head.fullName} + ${spouse.fullName}`;
  }
  return head.fullName;
}
