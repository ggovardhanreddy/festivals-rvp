"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { withBase } from "@/lib/base";
import type { Announcement, SiteEvent } from "@/lib/types";

type LiveCalendarCtx = {
  events: SiteEvent[];
  announcements: Announcement[];
  loading: boolean;
  refresh: (opts?: { silent?: boolean }) => Promise<void>;
};

const LiveCalendarContext = createContext<LiveCalendarCtx | null>(null);

const FETCH_MS = 8000;
const POLL_MS = 60_000;

function mergeById<T extends { id?: string }>(seed: T[], remote: T[]): T[] {
  if (!remote.length) return seed;
  const map = new Map<string, T>();
  for (const item of seed) {
    if (item.id) map.set(item.id, item);
  }
  for (const item of remote) {
    if (item.id) map.set(item.id, item);
    else map.set(`anon-${map.size}`, item);
  }
  return [...map.values()];
}

async function fetchItems<T>(collection: string, signal?: AbortSignal): Promise<T[]> {
  const res = await fetch(withBase(`/api/community/${collection}`), {
    credentials: "include",
    cache: "no-store",
    signal,
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { items?: T[] };
  return Array.isArray(data.items) ? data.items : [];
}

export function LiveCalendarProvider({
  seedEvents,
  seedAnnouncements,
  children,
}: {
  seedEvents: SiteEvent[];
  seedAnnouncements: Announcement[];
  children: ReactNode;
}) {
  const [events, setEvents] = useState<SiteEvent[]>(seedEvents);
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(seedAnnouncements);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = Boolean(opts?.silent);
    if (!silent) setLoading(true);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), FETCH_MS);
    try {
      const [remoteEvents, remoteAnnouncements] = await Promise.all([
        fetchItems<SiteEvent>("events", controller.signal),
        fetchItems<Announcement>("announcements", controller.signal),
      ]);
      setEvents(mergeById(seedEvents, remoteEvents));
      setAnnouncements(mergeById(seedAnnouncements, remoteAnnouncements));
    } catch {
      if (!silent) {
        setEvents(seedEvents);
        setAnnouncements(seedAnnouncements);
      }
    } finally {
      window.clearTimeout(timer);
      if (!silent) setLoading(false);
    }
  }, [seedEvents, seedAnnouncements]);

  useEffect(() => {
    void refresh();

    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh({ silent: true });
    };
    const onOnline = () => void refresh({ silent: true });
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh({ silent: true });
    }, POLL_MS);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
      window.clearInterval(interval);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({ events, announcements, loading, refresh }),
    [events, announcements, loading, refresh],
  );

  return (
    <LiveCalendarContext.Provider value={value}>
      {children}
    </LiveCalendarContext.Provider>
  );
}

export function useLiveCalendar() {
  const ctx = useContext(LiveCalendarContext);
  if (!ctx) {
    throw new Error("useLiveCalendar must be used within LiveCalendarProvider");
  }
  return ctx;
}

/** Safe hook when provider may be absent — falls back to seeds. */
export function useLiveEvents(seed: SiteEvent[]): SiteEvent[] {
  const ctx = useContext(LiveCalendarContext);
  return ctx?.events ?? seed;
}

export function useLiveAnnouncements(seed: Announcement[]): Announcement[] {
  const ctx = useContext(LiveCalendarContext);
  return ctx?.announcements ?? seed;
}
