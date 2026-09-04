"use client";

import type { DirectoryEntry, Member } from "@/lib/types";
import { MemberEditProvider } from "@/components/members/MemberEditProvider";
import { PeopleHub } from "@/components/people/PeopleHub";

/**
 * Unified People section — elders, families, professionals, notable people,
 * contributors and birthdays. Private contact details stay off the public page.
 */
export function MembersPage({
  seed,
  directory = [],
}: {
  seed: Member[];
  directory?: DirectoryEntry[];
}) {
  return (
    <MemberEditProvider seed={seed}>
      <PeopleHub members={seed} directory={directory} />
    </MemberEditProvider>
  );
}
