"use client";

import type { Member } from "@/lib/types";
import { SITE_NAME } from "@/lib/site";
import { MemberEditProvider } from "./MemberEditProvider";
import { MembersGrid } from "./MembersGrid";

/**
 * Members page — seed roster + admin R2 updates (photos, designations, memorials).
 * Super Admin Edit Mode enables inline editing without visiting /admin/.
 */
export function MembersPage({ seed }: { seed: Member[] }) {
  return (
    <MemberEditProvider seed={seed}>
      <MembersGrid
        members={seed}
        eyebrow="Community"
        title="Our circles"
        lede={`Legacy Circle, Core Members, and Next Generation — the people who keep ${SITE_NAME} and Reddivaripalli celebrations alive.`}
      />
    </MemberEditProvider>
  );
}
