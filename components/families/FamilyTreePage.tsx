"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PeopleNav } from "@/components/people/PeopleNav";
import { FamilyTreeView } from "./FamilyTreeView";
import { applyPersonPhotos, findFamily } from "@/lib/family-trees";
import { useFamilyTreeOverlay } from "@/lib/family-trees/overlay";
import {
  applyFamilyAssignments,
  findVillageFamily,
  loadVillageFamilies,
  peopleForFamily,
} from "@/lib/families/catalog";
import { useCommunityList } from "@/lib/use-community";
import type { FamilyPersonAssignment, Member, VillageFamily } from "@/lib/types";
import membersSeed from "@/content/data/members.json";

const FAMILY_SEED = loadVillageFamilies();
const MEMBER_SEED = membersSeed as Member[];

export function FamilyTreePage({
  familyId,
  focusId,
}: {
  familyId: string;
  focusId?: string;
}) {
  const { items: remoteFamilies } = useCommunityList<VillageFamily>(
    "families",
    FAMILY_SEED,
    { replaceSeedWhenRemote: true },
  );
  const { items: assignments } = useCommunityList<FamilyPersonAssignment>(
    "family-people",
    [],
  );
  const { items: members } = useCommunityList<Member>("members", MEMBER_SEED);
  const tree = useFamilyTreeOverlay();

  const family = findVillageFamily(familyId, remoteFamilies);
  const people = useMemo(() => {
    // The legacy assignment list is applied only to the build-time seed. Once
    // the editor has stored person records, each one already carries the
    // familyId the admin chose, and re-applying an older assignment on top
    // would drag the person back to where they used to be.
    const base = tree.stored
      ? tree.people
      : applyFamilyAssignments(tree.people, assignments, remoteFamilies);
    const photosById: Record<string, string | null | undefined> = {};
    for (const member of members) {
      if (member.photo) photosById[member.id] = member.photo;
    }
    return applyPersonPhotos(base, photosById);
  }, [assignments, members, remoteFamilies, tree.people, tree.stored]);

  if (!family || !family.isPublished) return null;

  const treeFamily = findFamily(family.id) ?? {
    id: family.id,
    name: family.name,
    rootPersonIds: [],
  };
  const treePeople = peopleForFamily(people, family.id);

  return (
    <div className="family-tree-page">
      <PeopleNav />
      <nav className="ft-breadcrumb" aria-label="Breadcrumb">
        <Link href="/people/">People</Link>
        <span aria-hidden>/</span>
        <Link href="/families/">Village Families</Link>
        <span aria-hidden>/</span>
        <span>{family.name}</span>
      </nav>

      <header className="ft-page-head">
        <h1>{family.name}</h1>
      </header>

      <FamilyTreeView
        family={treeFamily}
        people={treePeople}
        relationships={tree.relationships}
        focusId={focusId}
        unpublishedIds={tree.unpublishedIds}
      />
    </div>
  );
}
