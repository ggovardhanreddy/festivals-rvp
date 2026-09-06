"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PeopleNav } from "@/components/people/PeopleNav";
import { PersonCard } from "./PersonCard";
import { searchPeople } from "@/lib/family-trees";
import { useFamilyTreeOverlay } from "@/lib/family-trees/overlay";
import {
  applyFamilyAssignments,
  familyHref,
  generationCount,
  loadVillageFamilies,
  peopleForFamily,
  publishedFamilies,
} from "@/lib/families/catalog";
import { useCommunityList } from "@/lib/use-community";
import { memberPhotoSrc } from "@/lib/member-image";
import type { FamilyPersonAssignment, Member, VillageFamily } from "@/lib/types";
import membersSeed from "@/content/data/members.json";
import { useUiLang } from "@/components/i18n/LanguageProvider";

const FAMILY_SEED = loadVillageFamilies();
const MEMBER_SEED = membersSeed as Member[];

function familyCountLabel(peopleCount: number, generations: number) {
  const people = peopleCount === 1 ? "1 Person" : `${peopleCount} People`;
  if (!generations) return people;
  const gens =
    generations === 1 ? "1 Generation" : `${generations} Generations`;
  return `${gens} · ${people}`;
}

function FamilyCard({
  family,
  peopleCount,
  generations,
}: {
  family: VillageFamily;
  peopleCount: number;
  generations: number;
}) {
  const { t } = useUiLang();
  const src = memberPhotoSrc(family.coverPhoto);
  return (
    <article className="family-card">
      <div className="family-card-photo">
        {src ? (
           
          <img src={src} alt={family.name} />
        ) : (
          <span aria-hidden>{family.name.charAt(0)}</span>
        )}
      </div>
      <div className="family-card-body">
        <h3>{family.name}</h3>
        {family.description ? <p>{family.description}</p> : null}
        <p className="muted">{familyCountLabel(peopleCount, generations)}</p>
        <Link className="btn" href={familyHref(family.slug)}>
          {t("fam.viewFamily")}
        </Link>
      </div>
    </article>
  );
}

export function FamiliesHub() {
  const { t } = useUiLang();
  const [query, setQuery] = useState("");
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

  const families = useMemo(
    () => publishedFamilies(remoteFamilies),
    [remoteFamilies],
  );
  // Stored records already carry the admin's chosen familyId; the legacy
  // assignment list applies only while the tree is still the build-time seed.
  const people = useMemo(
    () =>
      tree.stored
        ? tree.people
        : applyFamilyAssignments(tree.people, assignments, families),
    [assignments, families, tree.people, tree.stored],
  );
  const results = useMemo(() => searchPeople(query, people), [query, people]);
  const searching = query.trim().length > 0;

  function counts(family: VillageFamily) {
    const treePeople = peopleForFamily(people, family.id);
    const directory = members.filter((member) => member.familyId === family.id);
    const peopleCount = treePeople.length + directory.length;
    return {
      peopleCount,
      generations: generationCount(treePeople),
    };
  }

  return (
    <div className="families-hub">
      <PeopleNav />

      <div className="ft-toolbar">
        <label className="ft-search">
          <span className="sr-only">{t("fam.searchMembers")}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("fam.searchPlaceholder")}
          />
        </label>
      </div>

      {searching ? (
        <section className="section" aria-live="polite">
          <div className="section-head">
            <div>
              <p className="eyebrow">{t("fam.search")}</p>
              <h2>
                {results.length
                  ? `${results.length} ${results.length === 1 ? "person" : "people"}`
                  : "No matching names"}
              </h2>
            </div>
          </div>
          <ul className="ft-search-results">
            {results.map((person) => (
              <li key={person.id}>
                <PersonCard person={person} />
                <p className="muted">{person.familyBranch}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="section" id="list">
          <div className="section-head">
            <div>
              <p className="eyebrow">{t("fam.ourPeople")}</p>
              <h2>{t("fam.villageFamilies")}</h2>
              <p className="lede">
                Family branches of Reddivaripalli. Order is set by the
                administrator. Married daughters remain in their parental family
                as Adapaduchu (Married). Missing names are not invented.
              </p>
            </div>
          </div>
          <div className="ft-family-grid">
            {families.map((family) => {
              const { peopleCount, generations } = counts(family);
              return (
                <FamilyCard
                  key={family.id}
                  family={family}
                  peopleCount={peopleCount}
                  generations={generations}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
