/**
 * Loading the tree from data rather than from code.
 *
 * §16: "The visual tree must NEVER be hard-coded." Until now it was —
 * lib/family-trees/seed.ts held every person as a TypeScript literal. This
 * module reads the six entities from content/data/*.json instead, and falls
 * back to flattening the seed only while those files are still empty, so the
 * migration can land without a moment where the public tree is blank.
 *
 * Once content/data/family-people.json is populated, seed.ts is dead weight
 * and can be deleted. It is kept until then on purpose: §"Do not delete
 * existing family or person records merely to implement this editor."
 *
 * The JSON is imported statically rather than read with node:fs, because this
 * module is reached from client components too (FamilyTreePage). A static
 * import is also the right thing for `output: "export"` — the data is baked
 * into the bundle at build time, and there is no filesystem at runtime.
 */
import peopleStore from "@/content/data/family-people.json";
import relationshipStore from "@/content/data/family-relationships.json";
import mediaStore from "@/content/data/family-media.json";
import {
  inverseType,
  relationshipId,
  type Family,
  type FamilyTreeDataset,
  type Media,
  type Person,
  type Relationship,
} from "./entities";
import { flattenFamilies } from "./flatten";
import { FAMILY_SEEDS } from "./seed";
import { loadVillageFamilies } from "@/lib/families/catalog";
import { deriveRoots } from "./roots";

export { deriveRoots };

/**
 * Pull the array out of a `{ version, updatedAt, <key>: [...] }` store file,
 * tolerating a bare array in case a file was hand-edited into that shape.
 */
function storeArray<T>(raw: unknown, key: string): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object") {
    const value = (raw as Record<string, unknown>)[key];
    if (Array.isArray(value)) return value as T[];
  }
  return [];
}

/**
 * Accept both relationship shapes.
 *
 * §16 specifies fromPersonId/toPersonId and that is what is written from now
 * on, but the seed and anything written before this change used
 * personId/relatedPersonId. Reading both means the migration cannot silently
 * drop an edge, which would quietly detach someone from their family.
 */
function normalizeRelationship(raw: Record<string, unknown>): Relationship | null {
  const from = (raw.fromPersonId ?? raw.personId) as string | undefined;
  const to = (raw.toPersonId ?? raw.relatedPersonId) as string | undefined;
  const type = raw.relationshipType as Relationship["relationshipType"] | undefined;
  if (!from || !to || !type) return null;
  return {
    id: (raw.id as string) || relationshipId(type, from, to),
    fromPersonId: from,
    toPersonId: to,
    relationshipType: type,
    verificationStatus:
      (raw.verificationStatus as Relationship["verificationStatus"]) ?? "needs-verification",
    metadata: (raw.metadata as Relationship["metadata"]) ?? undefined,
    crossFamily: raw.crossFamily === true ? true : undefined,
    createdAt: raw.createdAt as string | undefined,
    updatedAt: raw.updatedAt as string | undefined,
  };
}

/** Make sure every edge has its inverse. A one-way edge breaks tree walks. */
function withInverses(relationships: Relationship[]): Relationship[] {
  const byId = new Map(relationships.map((r) => [r.id, r]));
  for (const rel of relationships) {
    const inverse = inverseType(rel.relationshipType);
    const id = relationshipId(inverse, rel.toPersonId, rel.fromPersonId);
    if (byId.has(id)) continue;
    byId.set(id, {
      id,
      fromPersonId: rel.toPersonId,
      toPersonId: rel.fromPersonId,
      relationshipType: inverse,
      verificationStatus: rel.verificationStatus,
      metadata: rel.metadata,
      crossFamily: rel.crossFamily,
      createdAt: rel.createdAt,
    });
  }
  return [...byId.values()];
}

/**
 * The seed, converted to entities.
 *
 * Used only when the JSON store is empty. Everything the seed did not carry
 * gets a conservative default — notably verificationStatus, which stays
 * whatever the seed said rather than being upgraded to "verified" (§12).
 */
function datasetFromSeed(families: Family[]): FamilyTreeDataset {
  const flat = flattenFamilies(FAMILY_SEEDS);
  const familyById = new Map(families.map((f) => [f.id, f]));
  const rootsByFamily = new Map(flat.families.map((f) => [f.id, f.rootPersonIds]));

  const people: Person[] = flat.people.map((p) => ({
    id: p.id,
    fullName: p.fullName,
    familyId: p.familyId,
    familyBranch: familyById.get(p.familyId)?.name ?? p.familyBranch,
    photo: p.photo ?? null,
    gender: "unspecified",
    status: null,
    occupation: p.occupation ?? null,
    location: p.location ?? null,
    generation: p.generation || 1,
    adapaduchu: Boolean(p.adapaduchu),
    deceased: Boolean(p.deceased),
    married: Boolean(p.married),
    notes: p.notes ?? null,
    verificationStatus: p.verificationStatus,
    customFields: [],
    mediaIds: [],
  }));

  const relationships = withInverses(
    flat.relationships
      .map((r) =>
        normalizeRelationship(r as unknown as Record<string, unknown>),
      )
      .filter((r): r is Relationship => Boolean(r)),
  );

  return {
    families: families.map((f) => ({
      ...f,
      rootPersonIds: f.rootPersonIds ?? rootsByFamily.get(f.id) ?? [],
    })),
    people,
    relationships,
    media: [],
    audit: [],
  };
}

/**
 * Roots for a family: people with no parent inside that same family.
 *
 * Derived rather than stored, so adding a parent above someone automatically
 * changes who the root is. A stored root list is a second source of truth that
 * goes stale the first time the tree is corrected.
 */
export function loadFamilyTreeDataset(): FamilyTreeDataset {
  const families = loadVillageFamilies() as unknown as Family[];
  const people = storeArray<Person>(peopleStore, "people");
  const rawRels = storeArray<Record<string, unknown>>(
    relationshipStore,
    "relationships",
  );

  if (people.length === 0) {
    // Nothing migrated yet — render from the seed so the public tree keeps
    // working, and let scripts/migrate-family-trees.ts do the move.
    const seeded = datasetFromSeed(families);
    return {
      ...seeded,
      families: seeded.families.map((f) => ({
        ...f,
        rootPersonIds: f.rootPersonIds?.length
          ? f.rootPersonIds
          : deriveRoots(seeded, f.id),
      })),
    };
  }

  const relationships = withInverses(
    rawRels.map(normalizeRelationship).filter((r): r is Relationship => Boolean(r)),
  );
  const media = storeArray<Media>(mediaStore, "media");

  const dataset: FamilyTreeDataset = {
    families,
    people: people.map((p) => ({
      ...p,
      familyBranch: families.find((f) => f.id === p.familyId)?.name ?? p.familyBranch,
    })),
    relationships,
    media,
    // §17: the audit log is never bundled. A static import of
    // family-audit.json would put the whole change history into a public
    // _next/static chunk, whether or not anything reads it — the bundler
    // keeps the JSON, and stripping the value at runtime comes too late.
    // The log lives in R2 and is read through the admin-authenticated API.
    audit: [],
  };
  return {
    ...dataset,
    families: dataset.families.map((f) => ({
      ...f,
      rootPersonIds: f.rootPersonIds?.length ? f.rootPersonIds : deriveRoots(dataset, f.id),
    })),
  };
}

/** True once the tree is served from JSON rather than from seed.ts. */
export function isMigrated(): boolean {
  return storeArray<Person>(peopleStore, "people").length > 0;
}

/**
 * The dataset as it may be handed to the admin page.
 *
 * The site is a static export, so every server prop on the admin page is baked
 * into /admin/index.html — a file that is served to anyone who asks for it,
 * logged in or not. §17 forbids the public site from exposing audit history,
 * so the audit log is stripped here and fetched at save time over the
 * admin-authenticated API instead (lib/family-trees/audit-client.ts).
 *
 * People, relationships, families and media stay: they are the public tree,
 * already rendered on /families/. Only the change history is withheld.
 */
export function loadAdminFamilyTreeDataset(): FamilyTreeDataset {
  return { ...loadFamilyTreeDataset(), audit: [] };
}

/**
 * The dataset with everything §17 withholds from the public site removed.
 *
 * Static export means "not rendered" is not the same as "not exposed": React
 * serialises the props of every client component into the page's flight
 * payload, so a field that is merely never displayed still ships inside the
 * public HTML and can be read with view-source. Anything admin-only has to be
 * removed from the data, not just left out of the JSX.
 *
 * Removed here: the audit log, and each person's privateNotes. Kept: people,
 * relationships, families and media — that is the public tree.
 */
export function publicFamilyTreeDataset(): FamilyTreeDataset {
  const dataset = loadFamilyTreeDataset();
  return {
    ...dataset,
    audit: [],
    people: dataset.people.map((person) => {
      const { privateNotes: _private, ...publicFields } = person;
      return publicFields as Person;
    }),
  };
}
