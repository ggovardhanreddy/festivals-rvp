"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { MediaWithAlbum, Member, SiteEvent } from "@/lib/types";
import type { TimelineEntry } from "@/lib/timeline";
import { dobMonthDay, monthDay } from "@/lib/dates";
import { Reveal } from "@/components/Reveal";
import { StatsOverview } from "./StatsOverview";
import { AboutTeaser } from "./AboutTeaser";
import { HomeGallery } from "./HomeGallery";
import { UpcomingEventsStrip } from "./UpcomingEventsStrip";
import { FestivalCalendar } from "./FestivalCalendar";
import { TodayBirthdays } from "./TodayBirthdays";
import { UpcomingBirthdays } from "./UpcomingBirthdays";
import { LocationHomeNote } from "@/components/location/LocationHomeNote";

export function HomeBelowFold({
  galleryItems,
  yearList,
  members,
  upcomingEvents,
  festivals,
  liveSlugs = [],
  stats,
}: {
  galleryItems: MediaWithAlbum[];
  yearList: string[];
  members: Member[];
  upcomingEvents: SiteEvent[];
  festivals: SiteEvent[];
  timeline?: TimelineEntry[];
  liveSlugs?: string[];
  stats: {
    value: number;
    label: string;
    icon: "legacy" | "core" | "nextgen" | "total";
  }[];
}) {
  const [todayMembers, setTodayMembers] = useState<Member[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const key = monthDay(new Date());
      setTodayMembers(
        members.filter((m) => dobMonthDay(m.dob) === key),
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, [members]);

  return (
    <div className="page home-redesign" id="home-start">
      <LocationHomeNote />

      <Reveal>
        <TodayBirthdays members={todayMembers} />
      </Reveal>

      <StatsOverview stats={stats} />
      <AboutTeaser />

      <Reveal>
        <UpcomingBirthdays members={members} />
      </Reveal>

      <Reveal>
        <UpcomingEventsStrip events={upcomingEvents} liveSlugs={liveSlugs} />
      </Reveal>

      <FestivalCalendar festivals={festivals} liveSlugs={liveSlugs} />

      <HomeGallery items={galleryItems} years={yearList} />

      <Reveal className="section" id="members-teaser">
        <div className="members-teaser-card">
          <div>
            <p className="eyebrow">Community</p>
            <h2>Members</h2>
            <p className="lede">
              The member directory is protected. Sign in with your first name to
              view profiles — missing photos show a placeholder until added.
            </p>
          </div>
          <Link className="btn" href="/login/?next=/members/">
            Member sign in
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
