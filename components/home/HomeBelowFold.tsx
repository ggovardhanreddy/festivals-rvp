"use client";

import { type ReactNode } from "react";
import type { Announcement, MediaWithAlbum, SiteEvent } from "@/lib/types";
import { Reveal } from "@/components/Reveal";
import { VillageUpdate } from "./VillageUpdate";
import { HomeUpcomingEvents } from "./HomeUpcomingEvents";
import { LatestMemories } from "./LatestMemories";

/**
 * Everything below the hero, in village-first order:
 * introduction → history → upcoming festivals → temples → people →
 * development → gallery → memories → contact.
 */
export function HomeBelowFold({
  villageIntro,
  temples,
  people,
  progress,
  stories,
  contact,
  announcements,
  upcomingEvents,
  memories,
  liveSlugs = [],
}: {
  villageIntro: ReactNode;
  temples: ReactNode;
  people: ReactNode;
  progress: ReactNode;
  stories: ReactNode;
  contact: ReactNode;
  announcements: Announcement[];
  upcomingEvents: SiteEvent[];
  memories: MediaWithAlbum[];
  liveSlugs?: string[];
}) {
  return (
    <div className="home">
      <VillageUpdate seed={announcements} />

      <Reveal id="overview">{villageIntro}</Reveal>

      <Reveal id="events">
        <HomeUpcomingEvents events={upcomingEvents} liveSlugs={liveSlugs} />
      </Reveal>

      <Reveal>{temples}</Reveal>
      <Reveal>{people}</Reveal>
      <Reveal>{progress}</Reveal>
      <Reveal>
        <LatestMemories items={memories} />
      </Reveal>
      <Reveal>{stories}</Reveal>
      <Reveal>{contact}</Reveal>
    </div>
  );
}
