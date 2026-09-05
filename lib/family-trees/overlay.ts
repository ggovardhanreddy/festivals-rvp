"use client";

/**
 * The live family tree: build-time seed first, stored records on top.
 *
 * The site is a static export, so the tree that ships in the HTML is whatever
 * was in content/data/*.json at build time. That made the admin editor look
 * broken: a correction saved to R2 was never read back by anything, so the
 * page kept rendering the old copy and the edit appeared to vanish.
 *
 * This hook closes that loop using the same overlay the rest of the site
 * already uses for members, directory and events — seed renders instantly
 * (so crawlers and slow connections still get a complete tree), then the
 * stored records replace it when they arrive.
 *
 * `replaceSeedWhenRemote` is deliberate: the editor always writes the WHOLE
 * dataset, so stored rows are the complete truth. Merging by id instead would
 * resurrect anyone the admin deleted.
 */
import { useMemo, useRef } from "react";
import { useCommunityList } from "@/lib/use-community";
import { allPeople, relationshipRecords } from "@/lib/family-trees";
import type { Person, Relationship } from "@/lib/family-trees/types";
import type {
  FamilyTreeDataset,
  Person as StoredPerson,
} from "@/lib/family-trees/entities";

const PEOPLE_SEED = allPeople();
const RELATIONSHIP_SEED = relationshipRecords();

/**
 * Accept either relationship shape.
 *
 * §16 names the ends fromPersonId/toPersonId and that is what the editor
 * writes; this module's older consumers say personId/relatedPersonId. Reading
 * both means a stored edge is never silently dropped, which would quietly
 * detach someone from their family.
 */
function normalize(raw: Record<string, unknown>): Relationship | null {
  const from = (raw.fromPersonId ?? raw.personId) as string | undefined;
  const to = (raw.toPersonId ?? raw.relatedPersonId) as string | undefined;
  const type = raw.relationshipType as Relationship["relationshipType"] | undefined;
  if (!from || !to || !type) return null;
  return {
    id: (raw.id as string) || `${type}:${from}:${to}`,
    personId: from,
    relatedPersonId: to,
    relationshipType: type,
    verificationStatus:
      (raw.verificationStatus as Relationship["verificationStatus"]) ??
      "needs-verification",
  };
}

export type FamilyTreeOverlay = {
  people: Person[];
  relationships: Relationship[];
  /** True once stored person records replaced the build-time seed. */
  stored: boolean;
  /** Ids that exist only in stored data, so have no prerendered page yet. */
  unpublishedIds: Set<string>;
};

export function useFamilyTreeOverlay(opts?: { admin?: boolean }): FamilyTreeOverlay {
  const admin = Boolean(opts?.admin);

  const { items: people, remote: peopleStored } = useCommunityList<Person>(
    "family-tree-people",
    PEOPLE_SEED,
    { replaceSeedWhenRemote: true, admin },
  );
  const { items: rawRelationships } = useCommunityList<Record<string, unknown>>(
    "family-relationships",
    RELATIONSHIP_SEED as unknown as Record<string, unknown>[],
    { replaceSeedWhenRemote: true, admin },
  );

  const relationships = useMemo(() => {
    const out: Relationship[] = [];
    const seen = new Set<string>();
    for (const raw of rawRelationships) {
      const rel = normalize(raw);
      if (!rel || seen.has(rel.id)) continue;
      seen.add(rel.id);
      out.push(rel);
    }
    return out;
  }, [rawRelationships]);

  /**
   * A person added through the editor has no prerendered profile page until
   * the next deploy, because generateStaticParams ran at build time. Callers
   * use this to render them as plain nodes rather than links to a 404.
   */
  const unpublishedIds = useMemo(() => {
    if (!peopleStored) return new Set<string>();
    const built = new Set(PEOPLE_SEED.map((person) => person.id));
    return new Set(
      people.filter((person) => !built.has(person.id)).map((person) => person.id),
    );
  }, [people, peopleStored]);

  return { people, relationships, stored: peopleStored, unpublishedIds };
}

/** The build-time tree, for callers that need the seed on its own. */
export function familyTreeSeed() {
  return { people: PEOPLE_SEED, relationships: RELATIONSHIP_SEED };
}

/**
 * The stored dataset for the admin editor, resolved once.
 *
 * The editor holds the dataset as local state so Cancel and Undo mean
 * something, so it must be handed the stored records BEFORE it mounts —
 * otherwise the admin edits a build-time copy and their previous corrections
 * appear to have been lost.
 *
 * The value is frozen after the first settled load on purpose. useCommunityList
 * keeps polling in the background, and letting a later poll replace the
 * dataset would throw away whatever the admin had typed since.
 */
export function useStoredFamilyTreeDataset(seed: FamilyTreeDataset): {
  dataset: FamilyTreeDataset;
  ready: boolean;
} {
  const { items: people, loading: peopleLoading } = useCommunityList<StoredPerson>(
    "family-tree-people",
    seed.people as StoredPerson[],
    { replaceSeedWhenRemote: true, admin: true },
  );
  const { items: relationships, loading: relLoading } = useCommunityList<
    Record<string, unknown>
  >("family-relationships", seed.relationships as unknown as Record<string, unknown>[], {
    replaceSeedWhenRemote: true,
    admin: true,
  });

  const ready = !peopleLoading && !relLoading;
  const resolved = useRef<FamilyTreeDataset | null>(null);

  if (ready && !resolved.current) {
    resolved.current = {
      ...seed,
      people: people as FamilyTreeDataset["people"],
      relationships: relationships
        .map(normalizeStored)
        .filter((rel): rel is FamilyTreeDataset["relationships"][number] => Boolean(rel)),
    };
  }

  return { dataset: resolved.current ?? seed, ready };
}

/** Stored relationships keep §16's field names; the seed may use either. */
function normalizeStored(
  raw: Record<string, unknown>,
): FamilyTreeDataset["relationships"][number] | null {
  const from = (raw.fromPersonId ?? raw.personId) as string | undefined;
  const to = (raw.toPersonId ?? raw.relatedPersonId) as string | undefined;
  const type = raw.relationshipType as
    | FamilyTreeDataset["relationships"][number]["relationshipType"]
    | undefined;
  if (!from || !to || !type) return null;
  return {
    id: (raw.id as string) || `${type}:${from}:${to}`,
    fromPersonId: from,
    toPersonId: to,
    relationshipType: type,
    verificationStatus:
      (raw.verificationStatus as FamilyTreeDataset["relationships"][number]["verificationStatus"]) ??
      "needs-verification",
    metadata: raw.metadata as never,
    crossFamily: raw.crossFamily === true ? true : undefined,
    createdAt: raw.createdAt as string | undefined,
    updatedAt: raw.updatedAt as string | undefined,
  };
}

/**
 * One person and their immediate relatives, from the live tree.
 *
 * Relatives are read off the overlay's relationship rows rather than the
 * build-time module, so a parent or spouse the admin added shows up here
 * without waiting for a deploy — and so a person page never disagrees with
 * the tree the visitor just clicked through from.
 */
export function useFamilyTreePerson(personId: string) {
  const { people, relationships, stored } = useFamilyTreeOverlay();

  return useMemo(() => {
    const byId = new Map(people.map((person) => [person.id, person]));
    const person = byId.get(personId) ?? null;
    const relatives = (type: Relationship["relationshipType"]): Person[] =>
      relationships
        .filter((rel) => rel.personId === personId && rel.relationshipType === type)
        .map((rel) => byId.get(rel.relatedPersonId))
        .filter((candidate): candidate is Person => Boolean(candidate));

    return {
      person,
      parents: relatives("parent"),
      spouses: relatives("spouse"),
      children: relatives("child"),
      stored,
    };
  }, [people, relationships, personId, stored]);
}

/** Adapaduchulu from the live tree, sorted by name. */
export function useAdapaduchulu(): Person[] {
  const { people } = useFamilyTreeOverlay();
  return useMemo(
    () =>
      people
        .filter((person) => person.adapaduchu)
        .sort((a, b) => a.fullName.localeCompare(b.fullName)),
    [people],
  );
}
