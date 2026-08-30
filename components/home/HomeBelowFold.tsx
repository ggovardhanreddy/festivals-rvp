"use client";

import { useMemo, type ReactNode } from "react";
import type { Announcement, MediaWithAlbum, Member, SiteEvent } from "@/lib/types";
import { communityStats, mergeMemberRosters } from "@/lib/member-stats";
import { useCommunityList } from "@/lib/use-community";
import { Reveal } from "@/components/Reveal";
import { VillageUpdate } from "./VillageUpdate";
import { CommunityStats } from "./CommunityStats";
import { HomeUpcomingEvents } from "./HomeUpcomingEvents";
import { HomeBirthdays } from "./HomeBirthdays";
import { LatestMemories } from "./LatestMemories";

/**
 * Everything below the hero.
 *
 * This is the one place on the homepage that talks to the community API, and
 * it does so once: the merged roster feeds both the statistics and the
 * birthday list, instead of two components each fetching the same collection.
 *
 * `villageIntro` and `progress` arrive as already-rendered server nodes so
 * static copy and the developments list stay out of the client bundle.
 */
export function HomeBelowFold({
  villageIntro,
  progress,
  announcements,
  members: seedMembers,
  upcomingEvents,
  memories,
  liveSlugs = [],
}: {
  villageIntro: ReactNode;
  progress: ReactNode;
  announcements: Announcement[];
  members: Member[];
  upcomingEvents: SiteEvent[];
  memories: MediaWithAlbum[];
  liveSlugs?: string[];
}) {
  const { raw, loading } = useCommunityList<Member>("members", seedMembers);
  const members = useMemo(
    () => mergeMemberRosters(seedMembers, raw),
    [seedMembers, raw],
  );
  const stats = useMemo(() => communityStats(members), [members]);

  return (
    <div className="home">
      <VillageUpdate seed={announcements} />

      <Reveal className="home-columns" id="overview">
        {villageIntro}
        <CommunityStats stats={stats} loading={loading} />
      </Reveal>

      <Reveal className="home-columns" id="events">
        <HomeUpcomingEvents events={upcomingEvents} liveSlugs={liveSlugs} />
        <HomeBirthdays members={members} />
      </Reveal>

      <Reveal>
        <LatestMemories items={memories} />
      </Reveal>

      <Reveal>{progress}</Reveal>
    </div>
  );
}
