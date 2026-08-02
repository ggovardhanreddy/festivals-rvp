"use client";

import { MembersGrid } from "@/components/members/MembersGrid";
import type { Member } from "@/lib/types";
import membersData from "@/content/data/members.json";

/** Home/about members section — JSON-driven roster with photo placeholders. */
export function YouthPortrait({ members }: { members?: Member[] }) {
  const list = (members || (membersData as Member[])) as Member[];
  return <MembersGrid members={list} />;
}
