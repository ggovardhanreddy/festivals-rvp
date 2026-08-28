"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import type { MediaWithAlbum, Member, SiteEvent } from "@/lib/types";
import type { TimelineEntry } from "@/lib/timeline";
import { dobMonthDay, monthDay } from "@/lib/dates";
import { mergeMemberRosters } from "@/lib/member-stats";
import { useCommunityList } from "@/lib/use-community";
import { HOME_QUICK_LINKS } from "@/lib/site";
import { withBase } from "@/lib/base";
import { isMobileShell } from "@/lib/mobile-shell";
import { Reveal } from "@/components/Reveal";
import { StatsOverview } from "./StatsOverview";
import { AboutTeaser } from "./AboutTeaser";
import { HomeGallery } from "./HomeGallery";
import { UpcomingEventsStrip } from "./UpcomingEventsStrip";
import { FestivalCalendar } from "./FestivalCalendar";
import { CultureTraditions } from "./CultureTraditions";
import { TodayBirthdays } from "./TodayBirthdays";
import { UpcomingBirthdays } from "./UpcomingBirthdays";
import { LocationHomeNote } from "@/components/location/LocationHomeNote";

/** Soft-nav can leave Members blank/404 on installed PWA — always hard navigate. */
function onMobileHardNav(event: MouseEvent<HTMLAnchorElement>, href: string) {
  const mustHard =
    isMobileShell() ||
    href === "/members/" ||
    href.startsWith("/members/");
  if (!mustHard) return;
  event.preventDefault();
  window.location.assign(withBase(href));
}

export function HomeBelowFold({
  galleryItems,
  yearList,
  members: seedMembers,
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
  const { raw } = useCommunityList<Member>("members", seedMembers);
  const members = useMemo(
    () => mergeMemberRosters(seedMembers, raw),
    [seedMembers, raw],
  );
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

      {/* Primary story: About → Statistics → Events → Gallery */}
      <AboutTeaser />

      <StatsOverview stats={stats} />

      <Reveal>
        <UpcomingEventsStrip events={upcomingEvents} liveSlugs={liveSlugs} />
      </Reveal>

      <HomeGallery items={galleryItems} years={yearList} />

      <Reveal>
        <TodayBirthdays members={todayMembers} />
      </Reveal>

      <Reveal>
        <UpcomingBirthdays members={members} />
      </Reveal>

      <FestivalCalendar festivals={festivals} liveSlugs={liveSlugs} />

      <CultureTraditions />

      <Reveal className="section" id="quick-actions">
        <div className="section-head">
          <div>
            <p className="eyebrow">Explore</p>
            <h2>Quick actions</h2>
            <p className="lede">
              People, events, birthdays, and village updates — one tap away.
            </p>
          </div>
        </div>
        <div className="btn-row home-quick-actions">
          {HOME_QUICK_LINKS.map((item, index) => (
            <Link
              key={item.href}
              className={index === 0 ? "btn" : "btn ghost"}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal className="section" id="members-teaser">
        <div className="members-teaser-card">
          <div>
            <p className="eyebrow">Community</p>
            <h2>Members & Directory</h2>
            <p className="lede">
              Meet RVP Youth as Legacy Circle, Core Members, and NextGen — then
              find households in the village directory.
            </p>
          </div>
          <div className="btn-row">
            <Link
              className="btn"
              href="/members/"
              onClick={(event) => onMobileHardNav(event, "/members/")}
            >
              View members
            </Link>
            <Link
              className="btn ghost"
              href="/directory/"
              onClick={(event) => onMobileHardNav(event, "/directory/")}
            >
              Directory
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
