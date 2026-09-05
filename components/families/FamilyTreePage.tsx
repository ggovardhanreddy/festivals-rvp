"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PeopleNav } from "@/components/people/PeopleNav";
import { FamilyTreeView } from "./FamilyTreeView";
import { applyPersonPhotos } from "@/lib/family-trees";
import { useFamilyTreeOverlay } from "@/lib/family-trees/overlay";
import { splitIntoBranches } from "@/lib/family-trees/branches";
import { useUiLang } from "@/components/i18n/LanguageProvider";
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
  const { t } = useUiLang();
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

  const treePeople = peopleForFamily(people, family.id);
  // One page can hold several unrelated families that merely share a surname.
  // Drawing them on a single canvas is what made "Devapatla" look like one
  // family, so each independent branch gets its own tree and its own heading.
  const branches = splitIntoBranches(treePeople, tree.relationships);

  return (
    <div className="family-tree-page">
      <PeopleNav />
      <nav className="ft-breadcrumb" aria-label="Breadcrumb">
        <Link href="/people/">People</Link>
        <span aria-hidden>/</span>
        <Link href="/families/">{t("tree.villageFamilies")}</Link>
        <span aria-hidden>/</span>
        <span>{family.name}</span>
      </nav>

      <header className="ft-page-head">
        <h1>{family.name}</h1>
      </header>

      {branches.length > 1 ? (
        <p className="ft-branch-note">{t("tree.separateNote", undefined, { count: branches.length })}</p>
      ) : null}

      {branches.map((branch) => (
        <section className="ft-branch" key={branch.id}>
          <header className="ft-branch-head">
            <h2>{branch.title}</h2>
            <p className="muted">
              {branch.generations === 1
                ? t("tree.branchSizeOne", undefined, { people: branch.people.length })
                : t("tree.branchSize", undefined, {
                    people: branch.people.length,
                    generations: branch.generations,
                  })}
            </p>
          </header>
          <FamilyTreeView
            family={{
              id: branch.id,
              name: branch.title,
              rootPersonIds: branch.rootPersonIds,
            }}
            people={branch.people}
            relationships={branch.relationships}
            focusId={focusId}
            unpublishedIds={tree.unpublishedIds}
          />
        </section>
      ))}
    </div>
  );
}
