/**
 * Every people number on the site, derived in one place.
 *
 * The site counts two different populations and used to describe both with the
 * same words. The homepage said "39 people in the village directory" while the
 * People page said "39 people in the directory - 266 family members", so a
 * reader met 39 and 266 with no way to tell what either referred to. They are
 * not the same thing and never were:
 *
 *   roster  - content/data/members.json, the community member list. People who
 *             have a profile, a photograph and a group. 39 today.
 *   tree    - content/data/family-people.json, everyone recorded in the family
 *             trees, including those long deceased. 266 today.
 *
 * Both are real; neither is "the" village count. So this module returns them as
 * separately named figures and every surface reads from here. Nothing counts
 * people by filtering a list inline any more -- that is how the two halves of
 * one page came to disagree.
 *
 * Nothing is hard-coded. Add a member and every number moves on the next
 * render, in both languages.
 */
import type { Member, MemberGroup } from "./types";
import type { Person } from "./family-trees/types";
import { computeMemberStats, publishedMembers } from "./member-stats";

export type RosterStats = {
  /** Published members: not archived, not retired. */
  total: number;
  byGroup: Record<MemberGroup, number>;
};

export type TreeStats = {
  /** Everyone recorded in the family trees. */
  people: number;
  /** Married daughters who remain on their parental tree. */
  adapaduchulu: number;
};

export type VillagePeopleStats = {
  roster: RosterStats;
  tree: TreeStats;
};

/**
 * The roster half.
 *
 * Delegates to computeMemberStats so the definition of "published" lives in
 * exactly one place: not archived, and not listed in members-removed.json.
 */
export function rosterStats(members: Member[]): RosterStats {
  const { total, byGroup } = computeMemberStats(members);
  return { total, byGroup };
}

/** The family-tree half. Counted from the tree records, never from the roster. */
export function treeStats(people: Person[]): TreeStats {
  return {
    people: people.length,
    adapaduchulu: people.filter((person) => person.adapaduchu).length,
  };
}

export function villagePeopleStats(
  members: Member[],
  treePeople: Person[],
): VillagePeopleStats {
  return { roster: rosterStats(members), tree: treeStats(treePeople) };
}

/**
 * The roster as it should be listed.
 *
 * Re-exported so a component never has to remember which filter makes a member
 * publishable. Listing and counting must use the same call, or a page shows a
 * number that disagrees with the cards printed underneath it -- which is
 * exactly what the members grid did.
 */
export { publishedMembers };
