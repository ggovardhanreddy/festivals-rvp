"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PeopleNav } from "@/components/people/PeopleNav";
import { FamilyTreeView } from "./FamilyTreeView";
import {
  allPeople,
  applyPersonPhotos,
  findFamily,
  relationshipRecords,
} from "@/lib/family-trees";
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

  const family = findVillageFamily(familyId, remoteFamilies);
  const people = useMemo(() => {
    const assigned = applyFamilyAssignments(
      allPeople(),
      assignments,
      remoteFamilies,
    );
    const photosById: Record<string, string | null | undefined> = {};
    for (const member of members) {
      if (member.photo) photosById[member.id] = member.photo;
    }
    return applyPersonPhotos(assigned, photosById);
  }, [assignments, members, remoteFamilies]);

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
        relationships={relationshipRecords()}
        focusId={focusId}
      />
    </div>
  );
}
