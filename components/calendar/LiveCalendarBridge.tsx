"use client";

import type { ReactNode } from "react";
import {
  LiveCalendarProvider,
  useLiveCalendar,
} from "@/lib/live-calendar";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import type { Announcement, Development, Member, SiteEvent } from "@/lib/types";

function NotificationWithLive({
  members,
  developments,
  children,
}: {
  members: Member[];
  developments: Development[];
  children: ReactNode;
}) {
  const { events, announcements } = useLiveCalendar();
  return (
    <NotificationProvider
      members={members}
      events={events}
      announcements={announcements}
      developments={developments}
    >
      {children}
    </NotificationProvider>
  );
}

/** Fetches R2 events/announcements and feeds NotificationProvider + descendants. */
export function LiveCalendarBridge({
  members,
  seedEvents,
  seedAnnouncements,
  developments,
  children,
}: {
  members: Member[];
  seedEvents: SiteEvent[];
  seedAnnouncements: Announcement[];
  developments: Development[];
  children: ReactNode;
}) {
  return (
    <LiveCalendarProvider
      seedEvents={seedEvents}
      seedAnnouncements={seedAnnouncements}
    >
      <NotificationWithLive members={members} developments={developments}>
        {children}
      </NotificationWithLive>
    </LiveCalendarProvider>
  );
}
