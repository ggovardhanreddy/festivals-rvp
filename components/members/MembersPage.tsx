"use client";

import { useMemo } from "react";
import { useCommunityList } from "@/lib/use-community";
import type { Member } from "@/lib/types";
import { mergeMemberRosters } from "@/lib/member-stats";
import { MembersGrid } from "./MembersGrid";
import { SITE_NAME } from "@/lib/site";

/**
 * Members page — seed roster + admin R2 updates (photos, designations, memorials).
 */
export function MembersPage({ seed }: { seed: Member[] }) {
  const { raw } = useCommunityList<Member>("members", seed);
  const members = useMemo(() => mergeMemberRosters(seed, raw), [seed, raw]);

  return (
    <MembersGrid
      members={members}
      eyebrow="Community"
      title="Our circles"
      lede={`Legacy Circle, Core Members, and Next Generation — the people who keep ${SITE_NAME} and Reddivaripalli celebrations alive.`}
    />
  );
}
