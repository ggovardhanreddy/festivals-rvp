/**
 * Every change to the tree, as a pure function.
 *
 * The editor never mutates its dataset in place. Each operation takes a
 * dataset and returns a new one plus the audit entries the change produced,
 * which is what makes §13's undo/redo and §15's history trivial rather than
 * bolted on: undo is "use the previous dataset", and the audit trail is a
 * by-product of the same call the UI already makes.
 *
 * Two invariants hold after every operation:
 *
 *  - Relationships are stored in BOTH directions (parent+child), so no walk
 *    ever has to infer the other side.
 *  - Generations are recomputed from the edges, so a child added anywhere
 *    lands at the right depth without anyone setting a number by hand.
 *
 * Client-safe.
 */
import {
  inverseType,
  personIdFrom,
  relationshipId,
  type AuditLog,
  type CustomField,
  type Family,
  type Media,
  type FamilyTreeDataset,
  type Person,
  type Relationship,
  type RelationshipType,
  type VerificationStatus,
} from "./entities";

export type MutationResult = {
  dataset: FamilyTreeDataset;
  audit: AuditLog[];
};

let auditCounter = 0;

function auditEntry(
  actor: string,
  entry: Omit<AuditLog, "id" | "at" | "actor">,
): AuditLog {
  auditCounter += 1;
  return {
    id: `audit-${Date.now()}-${auditCounter}`,
    at: new Date().toISOString(),
    actor,
    ...entry,
  };
}

function clone(dataset: FamilyTreeDataset): FamilyTreeDataset {
  return {
    families: [...dataset.families],
    people: [...dataset.people],
    relationships: [...dataset.relationships],
    media: [...dataset.media],
    audit: [...dataset.audit],
  };
}

/**
 * Recompute every person's generation from the parent edges.
 *
 * Breadth-first from the people who have no parent inside their own family.
 * Spouses are levelled to their partner afterwards so a couple always sits on
 * one row — the thing that makes a genealogy chart readable.
 *
 * Runs after every structural change. It is cheap at village scale and it
 * removes a whole class of bug: a hand-maintained generation number that
 * silently disagrees with the relationships.
 */
export function recomputeGenerations(dataset: FamilyTreeDataset): Person[] {
  const byId = new Map(dataset.people.map((p) => [p.id, { ...p }]));
  const childrenOf = new Map<string, string[]>();
  const parentsOf = new Map<string, string[]>();
  const spousesOf = new Map<string, string[]>();

  for (const rel of dataset.relationships) {
    if (rel.relationshipType === "child") {
      childrenOf.set(rel.fromPersonId, [
        ...(childrenOf.get(rel.fromPersonId) ?? []),
        rel.toPersonId,
      ]);
    } else if (rel.relationshipType === "parent") {
      parentsOf.set(rel.fromPersonId, [
        ...(parentsOf.get(rel.fromPersonId) ?? []),
        rel.toPersonId,
      ]);
    } else {
      spousesOf.set(rel.fromPersonId, [
        ...(spousesOf.get(rel.fromPersonId) ?? []),
        rel.toPersonId,
      ]);
    }
  }

  // Roots: nobody in the same family is their parent. A parent in ANOTHER
  // family does not pull a person down a generation in this branch, which is
  // what keeps §19's separation intact when a deliberate cross-family
  // marriage exists.
  const roots: string[] = [];
  for (const person of byId.values()) {
    const parents = (parentsOf.get(person.id) ?? [])
      .map((id) => byId.get(id))
      .filter((p): p is Person => Boolean(p) && p!.familyId === person.familyId);
    if (parents.length === 0) roots.push(person.id);
    person.generation = 0;
  }

  const queue: string[] = [];
  for (const id of roots) {
    const person = byId.get(id);
    if (person) {
      person.generation = 1;
      queue.push(id);
    }
  }

  let guard = 0;
  while (queue.length && guard < 100000) {
    guard += 1;
    const id = queue.shift()!;
    const person = byId.get(id);
    if (!person) continue;
    for (const childId of childrenOf.get(id) ?? []) {
      const child = byId.get(childId);
      if (!child || child.familyId !== person.familyId) continue;
      const next = person.generation + 1;
      if (next > child.generation) {
        child.generation = next;
        queue.push(childId);
      }
    }
  }

  // Level spouses onto their partner's row.
  for (const person of byId.values()) {
    if (person.generation > 0) continue;
    for (const spouseId of spousesOf.get(person.id) ?? []) {
      const partner = byId.get(spouseId);
      if (partner && partner.generation > 0) {
        person.generation = partner.generation;
        break;
      }
    }
    if (person.generation === 0) person.generation = 1;
  }
  // A married-in spouse can still sit a row above their partner if they were
  // reached as a root; pull the pair together on the deeper of the two.
  for (const person of byId.values()) {
    for (const spouseId of spousesOf.get(person.id) ?? []) {
      const partner = byId.get(spouseId);
      if (!partner) continue;
      const deepest = Math.max(person.generation, partner.generation);
      person.generation = deepest;
      partner.generation = deepest;
    }
  }

  return [...byId.values()];
}

function withRecomputed(dataset: FamilyTreeDataset): FamilyTreeDataset {
  return { ...dataset, people: recomputeGenerations(dataset) };
}

/** ------------------------------------------------------------- people */

export function addPerson(
  dataset: FamilyTreeDataset,
  actor: string,
  input: Partial<Person> & { fullName: string; familyId: string },
): MutationResult & { personId: string } {
  const next = clone(dataset);
  const existingIds = new Set(next.people.map((p) => p.id));
  const id = input.id && !existingIds.has(input.id)
    ? input.id
    : personIdFrom(input.fullName, existingIds);
  const now = new Date().toISOString();
  const family = next.families.find((f) => f.id === input.familyId);

  const person: Person = {
    id,
    fullName: input.fullName.trim(),
    familyId: input.familyId,
    familyBranch: family?.name,
    photo: input.photo ?? null,
    gender: input.gender ?? "unspecified",
    status: input.status ?? null,
    occupation: input.occupation ?? null,
    location: input.location ?? null,
    generation: input.generation ?? 1,
    adapaduchu: Boolean(input.adapaduchu),
    deceased: Boolean(input.deceased),
    married: Boolean(input.married || input.adapaduchu),
    notes: input.notes ?? null,
    privateNotes: input.privateNotes ?? null,
    // §12: a new person is not silently asserted to be verified.
    verificationStatus: input.verificationStatus ?? "needs-verification",
    customFields: input.customFields ?? [],
    mediaIds: input.mediaIds ?? [],
    createdAt: now,
    updatedAt: now,
  };
  next.people.push(person);

  const audit = [
    auditEntry(actor, {
      action: "create",
      entity: "person",
      entityId: id,
      newValue: person.fullName,
      summary: `Added ${person.fullName} to ${family?.name ?? input.familyId}`,
    }),
  ];
  return { dataset: withRecomputed(next), audit, personId: id };
}

export function updatePerson(
  dataset: FamilyTreeDataset,
  actor: string,
  personId: string,
  changes: Partial<Person>,
): MutationResult {
  const next = clone(dataset);
  const index = next.people.findIndex((p) => p.id === personId);
  if (index === -1) return { dataset, audit: [] };
  const before = next.people[index]!;
  const audit: AuditLog[] = [];

  // §15: one audit row per changed field, carrying the previous value. A
  // single "person updated" row would not let anyone answer "who changed her
  // occupation, and to what".
  for (const [key, value] of Object.entries(changes) as [keyof Person, unknown][]) {
    if (key === "id" || key === "createdAt" || key === "updatedAt") continue;
    const previous = before[key];
    if (JSON.stringify(previous) === JSON.stringify(value)) continue;
    audit.push(
      auditEntry(actor, {
        action: "update",
        entity: "person",
        entityId: personId,
        field: String(key),
        previousValue: previous ?? null,
        newValue: (value as unknown) ?? null,
        summary: `${before.fullName}: ${String(key)} changed`,
      }),
    );
  }
  if (audit.length === 0) return { dataset, audit: [] };

  const family = changes.familyId
    ? next.families.find((f) => f.id === changes.familyId)
    : undefined;
  next.people[index] = {
    ...before,
    ...changes,
    id: before.id,
    familyBranch: family?.name ?? before.familyBranch,
    married: Boolean(
      (changes.married ?? before.married) || (changes.adapaduchu ?? before.adapaduchu),
    ),
    updatedAt: new Date().toISOString(),
  };
  return { dataset: withRecomputed(next), audit };
}

/**
 * Delete a person, and every relationship that touched them.
 *
 * §15 says not to destroy old relationship data immediately, so the removed
 * edges are recorded in the audit entry's previousValue — the row is gone from
 * the live dataset but what it said survives in the history, which is what
 * makes a mistaken delete recoverable.
 */
export function deletePerson(
  dataset: FamilyTreeDataset,
  actor: string,
  personId: string,
): MutationResult {
  const next = clone(dataset);
  const person = next.people.find((p) => p.id === personId);
  if (!person) return { dataset, audit: [] };

  const touched = next.relationships.filter(
    (r) => r.fromPersonId === personId || r.toPersonId === personId,
  );
  next.people = next.people.filter((p) => p.id !== personId);
  next.relationships = next.relationships.filter(
    (r) => r.fromPersonId !== personId && r.toPersonId !== personId,
  );

  const audit = [
    auditEntry(actor, {
      action: "delete",
      entity: "person",
      entityId: personId,
      previousValue: { person, relationships: touched },
      summary: `Deleted ${person.fullName} and ${touched.length} relationship(s)`,
    }),
  ];
  return { dataset: withRecomputed(next), audit };
}

/** ------------------------------------------------------ relationships */

/**
 * Create a relationship and its inverse.
 *
 * `verificationStatus` defaults to needs-verification: §12 says not to
 * silently create uncertain relationships, and a relationship someone has just
 * drawn is exactly the thing a second pair of eyes should confirm.
 */
export function addRelationship(
  dataset: FamilyTreeDataset,
  actor: string,
  fromPersonId: string,
  toPersonId: string,
  relationshipType: RelationshipType,
  options: { verificationStatus?: VerificationStatus; metadata?: Relationship["metadata"] } = {},
): MutationResult {
  if (fromPersonId === toPersonId) return { dataset, audit: [] };
  const next = clone(dataset);
  const from = next.people.find((p) => p.id === fromPersonId);
  const to = next.people.find((p) => p.id === toPersonId);
  if (!from || !to) return { dataset, audit: [] };

  const status = options.verificationStatus ?? "needs-verification";
  const crossFamily = from.familyId !== to.familyId;
  const inverse = inverseType(relationshipType);

  const rows: Relationship[] = [
    {
      id: relationshipId(relationshipType, fromPersonId, toPersonId),
      fromPersonId,
      toPersonId,
      relationshipType,
      verificationStatus: status,
      metadata: options.metadata,
      crossFamily: crossFamily || undefined,
      createdAt: new Date().toISOString(),
    },
    {
      id: relationshipId(inverse, toPersonId, fromPersonId),
      fromPersonId: toPersonId,
      toPersonId: fromPersonId,
      relationshipType: inverse,
      verificationStatus: status,
      metadata: options.metadata,
      crossFamily: crossFamily || undefined,
      createdAt: new Date().toISOString(),
    },
  ];

  let added = 0;
  for (const row of rows) {
    if (next.relationships.some((r) => r.id === row.id)) continue;
    next.relationships.push(row);
    added += 1;
  }
  if (added === 0) return { dataset, audit: [] };

  const audit = [
    auditEntry(actor, {
      action: "create",
      entity: "relationship",
      entityId: rows[0]!.id,
      newValue: { relationshipType, from: from.fullName, to: to.fullName, crossFamily },
      summary: crossFamily
        ? `Linked ${from.fullName} → ${to.fullName} as ${relationshipType} ACROSS families (${from.familyBranch ?? from.familyId} → ${to.familyBranch ?? to.familyId})`
        : `Linked ${from.fullName} → ${to.fullName} as ${relationshipType}`,
    }),
  ];
  return { dataset: withRecomputed(next), audit };
}

/** Remove a relationship and its inverse. */
export function removeRelationship(
  dataset: FamilyTreeDataset,
  actor: string,
  fromPersonId: string,
  toPersonId: string,
  relationshipType: RelationshipType,
): MutationResult {
  const next = clone(dataset);
  const inverse = inverseType(relationshipType);
  const ids = new Set([
    relationshipId(relationshipType, fromPersonId, toPersonId),
    relationshipId(inverse, toPersonId, fromPersonId),
  ]);
  const removed = next.relationships.filter((r) => ids.has(r.id));
  if (removed.length === 0) return { dataset, audit: [] };
  next.relationships = next.relationships.filter((r) => !ids.has(r.id));

  const from = next.people.find((p) => p.id === fromPersonId);
  const to = next.people.find((p) => p.id === toPersonId);
  const audit = [
    auditEntry(actor, {
      action: "delete",
      entity: "relationship",
      entityId: [...ids][0]!,
      previousValue: removed,
      summary: `Removed ${relationshipType} link ${from?.fullName ?? fromPersonId} → ${to?.fullName ?? toPersonId}`,
    }),
  ];
  return { dataset: withRecomputed(next), audit };
}

export function setRelationshipVerification(
  dataset: FamilyTreeDataset,
  actor: string,
  relationshipIds: string[],
  status: VerificationStatus,
): MutationResult {
  const next = clone(dataset);
  const audit: AuditLog[] = [];
  next.relationships = next.relationships.map((rel) => {
    if (!relationshipIds.includes(rel.id) || rel.verificationStatus === status) return rel;
    audit.push(
      auditEntry(actor, {
        action: "update",
        entity: "relationship",
        entityId: rel.id,
        field: "verificationStatus",
        previousValue: rel.verificationStatus,
        newValue: status,
        summary: `Relationship ${rel.id} marked ${status}`,
      }),
    );
    return { ...rel, verificationStatus: status, updatedAt: new Date().toISOString() };
  });
  return { dataset: next, audit };
}

/**
 * §4: move a person to the correct family branch.
 *
 * Their relationships are kept — moving someone is a correction of which
 * branch they belong to, not a statement that their parents are wrong — but
 * every edge that now crosses a family boundary is marked, so the review queue
 * shows exactly what the move implied.
 */
export function movePersonToFamily(
  dataset: FamilyTreeDataset,
  actor: string,
  personId: string,
  familyId: string,
  options: { withDescendants?: boolean } = {},
): MutationResult {
  const next = clone(dataset);
  const person = next.people.find((p) => p.id === personId);
  const family = next.families.find((f) => f.id === familyId);
  if (!person || !family || person.familyId === familyId) return { dataset, audit: [] };

  const moving = new Set<string>([personId]);
  if (options.withDescendants) {
    const childrenOf = new Map<string, string[]>();
    for (const rel of next.relationships) {
      if (rel.relationshipType !== "child") continue;
      childrenOf.set(rel.fromPersonId, [
        ...(childrenOf.get(rel.fromPersonId) ?? []),
        rel.toPersonId,
      ]);
    }
    const queue = [personId];
    let guard = 0;
    while (queue.length && guard < 10000) {
      guard += 1;
      const id = queue.shift()!;
      for (const childId of childrenOf.get(id) ?? []) {
        if (moving.has(childId)) continue;
        moving.add(childId);
        queue.push(childId);
      }
    }
  }

  const audit: AuditLog[] = [];
  next.people = next.people.map((p) => {
    if (!moving.has(p.id)) return p;
    audit.push(
      auditEntry(actor, {
        action: "update",
        entity: "person",
        entityId: p.id,
        field: "familyId",
        previousValue: p.familyId,
        newValue: familyId,
        summary: `Moved ${p.fullName} to ${family.name}`,
      }),
    );
    return { ...p, familyId, familyBranch: family.name, updatedAt: new Date().toISOString() };
  });

  const byId = new Map(next.people.map((p) => [p.id, p]));
  next.relationships = next.relationships.map((rel) => {
    const a = byId.get(rel.fromPersonId);
    const b = byId.get(rel.toPersonId);
    const cross = Boolean(a && b && a.familyId !== b.familyId);
    if (Boolean(rel.crossFamily) === cross) return rel;
    return { ...rel, crossFamily: cross || undefined };
  });

  return { dataset: withRecomputed(next), audit };
}

/** ----------------------------------------------------------- families */

export function updateFamily(
  dataset: FamilyTreeDataset,
  actor: string,
  familyId: string,
  changes: Partial<Family>,
): MutationResult {
  const next = clone(dataset);
  const index = next.families.findIndex((f) => f.id === familyId);
  if (index === -1) return { dataset, audit: [] };
  const before = next.families[index]!;
  const audit: AuditLog[] = [];

  for (const [key, value] of Object.entries(changes) as [keyof Family, unknown][]) {
    if (key === "id" || key === "createdAt" || key === "updatedAt") continue;
    if (JSON.stringify(before[key]) === JSON.stringify(value)) continue;
    audit.push(
      auditEntry(actor, {
        action: "update",
        entity: "family",
        entityId: familyId,
        field: String(key),
        previousValue: before[key] ?? null,
        newValue: (value as unknown) ?? null,
        summary: `${before.name}: ${String(key)} changed`,
      }),
    );
  }
  if (audit.length === 0) return { dataset, audit: [] };

  next.families[index] = {
    ...before,
    ...changes,
    id: before.id,
    updatedAt: new Date().toISOString(),
  };
  if (changes.name) {
    next.people = next.people.map((p) =>
      p.familyId === familyId ? { ...p, familyBranch: changes.name! } : p,
    );
  }
  return { dataset: next, audit };
}

export function addFamily(
  dataset: FamilyTreeDataset,
  actor: string,
  input: { name: string; slug?: string; description?: string | null },
): MutationResult & { familyId: string } {
  const next = clone(dataset);
  const slug =
    input.slug?.trim() ||
    input.name
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "");
  const id = input.name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const now = new Date().toISOString();
  const family: Family = {
    id,
    name: input.name.trim(),
    slug,
    description: input.description ?? null,
    history: null,
    coverPhoto: null,
    displayOrder: next.families.length + 1,
    // §14/§9: a new family starts unpublished so it cannot appear publicly
    // before anyone has put people in it.
    isPublished: false,
    createdAt: now,
    updatedAt: now,
  };
  next.families.push(family);
  return {
    dataset: next,
    audit: [
      auditEntry(actor, {
        action: "create",
        entity: "family",
        entityId: id,
        newValue: family.name,
        summary: `Created family ${family.name} (unpublished)`,
      }),
    ],
    familyId: id,
  };
}

/**
 * Delete a family. Refuses while it still has people.
 *
 * §"Do not delete existing family or person records merely to implement this
 * editor" — and more practically, a family delete that silently orphaned
 * thirty people would be the worst button on the page.
 */
export function deleteFamily(
  dataset: FamilyTreeDataset,
  actor: string,
  familyId: string,
): MutationResult & { refused?: string } {
  const members = dataset.people.filter((p) => p.familyId === familyId);
  if (members.length > 0) {
    return {
      dataset,
      audit: [],
      refused: `${members.length} people are still in this family. Move them to another family first.`,
    };
  }
  const next = clone(dataset);
  const family = next.families.find((f) => f.id === familyId);
  if (!family) return { dataset, audit: [] };
  next.families = next.families.filter((f) => f.id !== familyId);
  return {
    dataset: next,
    audit: [
      auditEntry(actor, {
        action: "delete",
        entity: "family",
        entityId: familyId,
        previousValue: family,
        summary: `Deleted empty family ${family.name}`,
      }),
    ],
  };
}

export function reorderFamilies(
  dataset: FamilyTreeDataset,
  actor: string,
  orderedIds: string[],
): MutationResult {
  const next = clone(dataset);
  const audit: AuditLog[] = [];
  next.families = next.families.map((family) => {
    const position = orderedIds.indexOf(family.id);
    const order = position === -1 ? family.displayOrder : position + 1;
    if (order === family.displayOrder) return family;
    audit.push(
      auditEntry(actor, {
        action: "update",
        entity: "family",
        entityId: family.id,
        field: "displayOrder",
        previousValue: family.displayOrder,
        newValue: order,
        summary: `${family.name} moved to position ${order}`,
      }),
    );
    return { ...family, displayOrder: order, updatedAt: new Date().toISOString() };
  });
  return { dataset: next, audit };
}

/** ------------------------------------------------------ custom fields */

export function setCustomFields(
  dataset: FamilyTreeDataset,
  actor: string,
  target: { personId?: string; familyId?: string },
  fields: CustomField[],
): MutationResult {
  const next = clone(dataset);
  if (target.personId) {
    const index = next.people.findIndex((p) => p.id === target.personId);
    if (index === -1) return { dataset, audit: [] };
    const before = next.people[index]!;
    next.people[index] = { ...before, customFields: fields, updatedAt: new Date().toISOString() };
    return {
      dataset: next,
      audit: [
        auditEntry(actor, {
          action: "update",
          entity: "custom-field",
          entityId: before.id,
          previousValue: before.customFields ?? [],
          newValue: fields,
          summary: `${before.fullName}: additional information updated`,
        }),
      ],
    };
  }
  if (target.familyId) {
    const index = next.families.findIndex((f) => f.id === target.familyId);
    if (index === -1) return { dataset, audit: [] };
    const before = next.families[index]!;
    next.families[index] = { ...before, customFields: fields, updatedAt: new Date().toISOString() };
    return {
      dataset: next,
      audit: [
        auditEntry(actor, {
          action: "update",
          entity: "custom-field",
          entityId: before.id,
          previousValue: before.customFields ?? [],
          newValue: fields,
          summary: `${before.name}: additional information updated`,
        }),
      ],
    };
  }
  return { dataset, audit: [] };
}

/** -------------------------------------------------------------- media */

export function assignMedia(
  dataset: FamilyTreeDataset,
  actor: string,
  media: Omit<Media, "id" | "createdAt"> & { id?: string },
): MutationResult & { mediaId: string } {
  const next = clone(dataset);
  const id = media.id ?? `media-${Date.now()}-${next.media.length + 1}`;
  const row: Media = {
    ...media,
    id,
    uploadedBy: actor,
    createdAt: new Date().toISOString(),
  };
  next.media.push(row);
  if (media.personId) {
    next.people = next.people.map((p) =>
      p.id === media.personId
        ? { ...p, mediaIds: [...new Set([...(p.mediaIds ?? []), id])] }
        : p,
    );
  }
  return {
    dataset: next,
    audit: [
      auditEntry(actor, {
        action: "create",
        entity: "media",
        entityId: id,
        newValue: { url: row.url, isPublic: row.isPublic, personId: row.personId ?? null },
        summary: `Assigned media to ${media.personId ?? media.familyId ?? "library"}`,
      }),
    ],
    mediaId: id,
  };
}

export function removeMedia(
  dataset: FamilyTreeDataset,
  actor: string,
  mediaId: string,
): MutationResult {
  const next = clone(dataset);
  const row = next.media.find((m) => m.id === mediaId);
  if (!row) return { dataset, audit: [] };
  next.media = next.media.filter((m) => m.id !== mediaId);
  next.people = next.people.map((p) =>
    (p.mediaIds ?? []).includes(mediaId)
      ? { ...p, mediaIds: (p.mediaIds ?? []).filter((id) => id !== mediaId) }
      : p,
  );
  return {
    dataset: next,
    audit: [
      auditEntry(actor, {
        action: "delete",
        entity: "media",
        entityId: mediaId,
        previousValue: row,
        summary: `Removed media ${mediaId}`,
      }),
    ],
  };
}
