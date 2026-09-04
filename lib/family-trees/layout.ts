import type { Person, Relationship } from "./types";

export const TREE_NODE_WIDTH = 178;
export const TREE_NODE_HEIGHT = 112;
export const TREE_SPOUSE_GAP = 22;
export const TREE_SIBLING_GAP = 36;
export const TREE_GENERATION_GAP = 92;
export const TREE_FOREST_GAP = 56;
export const TREE_PAD = 36;

export type LaidOutPerson = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  ambiguous: boolean;
};

export type LaidOutEdge = {
  id: string;
  kind: "spouse" | "descent";
  d: string;
};

export type FamilyTreeLayout = {
  nodes: LaidOutPerson[];
  edges: LaidOutEdge[];
  width: number;
  height: number;
};

type RelIndex = {
  children: Map<string, string[]>;
  parents: Map<string, string[]>;
  spouses: Map<string, string[]>;
};

type Unit = {
  members: Person[];
  childUnits: Unit[];
  ambiguousIds: string[];
};

function addId(map: Map<string, string[]>, from: string, to: string) {
  const list = map.get(from);
  if (list) {
    if (!list.includes(to)) list.push(to);
    return;
  }
  map.set(from, [to]);
}

export function relationshipsAmong(
  people: Person[],
  relationships: Relationship[],
): Relationship[] {
  const ids = new Set(people.map((person) => person.id));
  return relationships.filter(
    (rel) => ids.has(rel.personId) && ids.has(rel.relatedPersonId),
  );
}

function indexRelationships(relationships: Relationship[]): RelIndex {
  const children = new Map<string, string[]>();
  const parents = new Map<string, string[]>();
  const spouses = new Map<string, string[]>();
  for (const rel of relationships) {
    if (rel.relationshipType === "spouse") {
      addId(spouses, rel.personId, rel.relatedPersonId);
      addId(spouses, rel.relatedPersonId, rel.personId);
      continue;
    }
    if (rel.relationshipType === "child") {
      addId(children, rel.personId, rel.relatedPersonId);
      addId(parents, rel.relatedPersonId, rel.personId);
      continue;
    }
    if (rel.relationshipType === "parent") {
      addId(parents, rel.personId, rel.relatedPersonId);
      addId(children, rel.relatedPersonId, rel.personId);
    }
  }
  return { children, parents, spouses };
}

function childIsAmbiguous(
  childId: string,
  unitMemberIds: Set<string>,
  rels: RelIndex,
  peopleById: Map<string, Person>,
): boolean {
  const parentIds = (rels.parents.get(childId) ?? []).filter((id) =>
    peopleById.has(id),
  );
  if (parentIds.length > 2) return true;
  if (parentIds.length === 2) {
    const [a, b] = parentIds;
    const married = (rels.spouses.get(a) ?? []).includes(b);
    if (!married) return true;
  }
  if (
    parentIds.length > 0 &&
    parentIds.some((id) => !unitMemberIds.has(id)) &&
    parentIds.some((id) => unitMemberIds.has(id))
  ) {
    return true;
  }
  return false;
}

function buildUnit(
  personId: string,
  peopleById: Map<string, Person>,
  rels: RelIndex,
  placed: Set<string>,
): Unit | null {
  const person = peopleById.get(personId);
  if (!person || placed.has(personId)) return null;
  placed.add(personId);

  const spouseIds = (rels.spouses.get(personId) ?? []).filter(
    (id) => peopleById.has(id) && !placed.has(id),
  );
  for (const id of spouseIds) placed.add(id);

  const members = [
    person,
    ...spouseIds
      .map((id) => peopleById.get(id))
      .filter((spouse): spouse is Person => Boolean(spouse)),
  ];
  const memberIds = new Set(members.map((member) => member.id));

  const childIds: string[] = [];
  for (const member of members) {
    for (const childId of rels.children.get(member.id) ?? []) {
      if (!peopleById.has(childId)) continue;
      if (memberIds.has(childId)) continue;
      if (childIds.includes(childId)) continue;
      childIds.push(childId);
    }
  }

  const ambiguousIds: string[] = [];
  const childUnits: Unit[] = [];
  for (const childId of childIds) {
    if (childIsAmbiguous(childId, memberIds, rels, peopleById)) {
      ambiguousIds.push(childId);
    }
    const child = buildUnit(childId, peopleById, rels, placed);
    if (child) childUnits.push(child);
  }

  return { members, childUnits, ambiguousIds };
}

type Measured = {
  unit: Unit;
  membersWidth: number;
  children: Measured[];
  childrenWidth: number;
  width: number;
};

function membersWidthOf(count: number): number {
  if (count <= 0) return TREE_NODE_WIDTH;
  return count * TREE_NODE_WIDTH + Math.max(0, count - 1) * TREE_SPOUSE_GAP;
}

function measure(unit: Unit): Measured {
  const membersWidth = membersWidthOf(unit.members.length);
  const children = unit.childUnits.map(measure);
  const childrenWidth = children.reduce((sum, child, index) => {
    return sum + child.width + (index > 0 ? TREE_SIBLING_GAP : 0);
  }, 0);
  return {
    unit,
    membersWidth,
    children,
    childrenWidth,
    width: Math.max(membersWidth, childrenWidth, TREE_NODE_WIDTH),
  };
}

function centerX(x: number, width = TREE_NODE_WIDTH): number {
  return x + width / 2;
}

function place(
  measured: Measured,
  left: number,
  y: number,
  ambiguous: Set<string>,
  nodes: LaidOutPerson[],
  edges: LaidOutEdge[],
) {
  for (const id of measured.unit.ambiguousIds) ambiguous.add(id);

  const membersLeft = left + (measured.width - measured.membersWidth) / 2;
  const memberBoxes: LaidOutPerson[] = measured.unit.members.map(
    (person, index) => ({
      id: person.id,
      x: membersLeft + index * (TREE_NODE_WIDTH + TREE_SPOUSE_GAP),
      y,
      width: TREE_NODE_WIDTH,
      height: TREE_NODE_HEIGHT,
      ambiguous: ambiguous.has(person.id),
    }),
  );
  nodes.push(...memberBoxes);

  for (let i = 0; i < memberBoxes.length - 1; i += 1) {
    const a = memberBoxes[i]!;
    const b = memberBoxes[i + 1]!;
    const cy = y + TREE_NODE_HEIGHT / 2;
    const x1 = a.x + a.width;
    const x2 = b.x;
    const mid = (x1 + x2) / 2;
    edges.push({
      id: `spouse:${a.id}:${b.id}`,
      kind: "spouse",
      d: `M ${x1} ${cy} L ${x2} ${cy} M ${mid} ${cy - 7} L ${mid} ${cy + 7}`,
    });
  }

  if (!measured.children.length) return;

  const childTop = y + TREE_NODE_HEIGHT + TREE_GENERATION_GAP;
  let childLeft = left + (measured.width - measured.childrenWidth) / 2;
  const childAnchors: { x: number; y: number }[] = [];

  for (const child of measured.children) {
    const before = nodes.length;
    place(child, childLeft, childTop, ambiguous, nodes, edges);
    const placedMembers = nodes.slice(before, before + child.unit.members.length);
    if (placedMembers.length) {
      const first = placedMembers[0]!;
      const last = placedMembers[placedMembers.length - 1]!;
      childAnchors.push({
        x: (centerX(first.x) + centerX(last.x)) / 2,
        y: childTop,
      });
    }
    childLeft += child.width + TREE_SIBLING_GAP;
  }

  const firstParent = memberBoxes[0]!;
  const lastParent = memberBoxes[memberBoxes.length - 1]!;
  const parentX = (centerX(firstParent.x) + centerX(lastParent.x)) / 2;
  const parentBottom = y + TREE_NODE_HEIGHT;
  if (!childAnchors.length) return;

  const barY = parentBottom + TREE_GENERATION_GAP / 2;
  const xs = [parentX, ...childAnchors.map((anchor) => anchor.x)];
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const parts = [
    `M ${parentX} ${parentBottom} L ${parentX} ${barY}`,
    `M ${minX} ${barY} L ${maxX} ${barY}`,
    ...childAnchors.map(
      (anchor) => `M ${anchor.x} ${barY} L ${anchor.x} ${anchor.y}`,
    ),
  ];
  edges.push({
    id: `descent:${measured.unit.members.map((m) => m.id).join("+")}`,
    kind: "descent",
    d: parts.join(" "),
  });
}

export function layoutFamilyTree(args: {
  people: Person[];
  relationships: Relationship[];
  rootPersonIds: string[];
}): FamilyTreeLayout {
  const peopleById = new Map(args.people.map((person) => [person.id, person]));
  const rels = indexRelationships(
    relationshipsAmong(args.people, args.relationships),
  );
  const placed = new Set<string>();
  const roots: Unit[] = [];

  for (const id of args.rootPersonIds) {
    const unit = buildUnit(id, peopleById, rels, placed);
    if (unit) roots.push(unit);
  }
  for (const person of args.people) {
    if (placed.has(person.id)) continue;
    const unit = buildUnit(person.id, peopleById, rels, placed);
    if (unit) roots.push(unit);
  }

  if (!roots.length) {
    return { nodes: [], edges: [], width: TREE_PAD * 2, height: TREE_PAD * 2 };
  }

  const measured = roots.map(measure);
  const forestWidth = measured.reduce((sum, tree, index) => {
    return sum + tree.width + (index > 0 ? TREE_FOREST_GAP : 0);
  }, 0);

  const nodes: LaidOutPerson[] = [];
  const edges: LaidOutEdge[] = [];
  const ambiguous = new Set<string>();
  let left = TREE_PAD;
  const top = TREE_PAD;
  for (const tree of measured) {
    place(tree, left, top, ambiguous, nodes, edges);
    left += tree.width + TREE_FOREST_GAP;
  }

  for (const node of nodes) {
    node.ambiguous = ambiguous.has(node.id);
  }

  const maxX = nodes.reduce(
    (max, node) => Math.max(max, node.x + node.width),
    forestWidth + TREE_PAD,
  );
  const maxY = nodes.reduce(
    (max, node) => Math.max(max, node.y + node.height),
    TREE_NODE_HEIGHT + TREE_PAD,
  );

  return {
    nodes,
    edges,
    width: Math.ceil(maxX + TREE_PAD),
    height: Math.ceil(maxY + TREE_PAD),
  };
}
