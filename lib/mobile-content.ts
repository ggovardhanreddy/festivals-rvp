import type { Announcement, Development, Member, SiteEvent } from "@/lib/types";

export type PublicVillageContent = {
  members: Member[];
  events: SiteEvent[];
  announcements: Announcement[];
  developments: Development[];
  fetchedAt: string;
};

export async function fetchPublicVillageContent(
  baseUrl: string,
): Promise<PublicVillageContent> {
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/public/content`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Content API failed (${res.status})`);
  return (await res.json()) as PublicVillageContent;
}
