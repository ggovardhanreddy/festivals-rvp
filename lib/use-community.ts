"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { withBase } from "@/lib/base";
import type { CommunityCollection } from "@/lib/community";

type StorePayload<T> = {
  items?: T[];
  settings?: T;
  hits?: T[];
  source?: string;
};

const FETCH_MS = 8000;
/** Silent content sync interval for installed PWA / mobile browsers. */
const POLL_MS = 60_000;

async function fetchCollection<T>(
  collection: CommunityCollection,
  admin = false,
  signal?: AbortSignal,
): Promise<T[]> {
  const qs = admin ? "?admin=1" : "";
  const res = await fetch(withBase(`/api/community/${collection}${qs}`), {
    credentials: "include",
    cache: "no-store",
    signal,
  });
  if (!res.ok) return [];
  const data = (await res.json()) as StorePayload<T>;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.hits)) return data.hits;
  return [];
}

function mergeById<T>(seed: T[], remote: T[]): T[] {
  if (!remote.length) return seed;
  const map = new Map<string, T>();
  for (const item of seed) {
    const id = (item as { id?: string }).id;
    if (id) map.set(id, item);
  }
  for (const item of remote) {
    const id = (item as { id?: string }).id;
    if (id) map.set(id, item);
    else map.set(`anon-${map.size}`, item);
  }
  return [...map.values()];
}

export function useCommunityList<T>(
  collection: CommunityCollection,
  seed: T[],
  opts?: { admin?: boolean; approvedOnly?: boolean },
) {
  const seedRef = useRef(seed);
  seedRef.current = seed;
  const [raw, setRaw] = useState<T[]>(seed);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const admin = Boolean(opts?.admin);

  const refresh = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = Boolean(opts?.silent);
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), FETCH_MS);
    try {
      const remote = await fetchCollection<T>(
        collection,
        admin,
        controller.signal,
      );
      // Never wipe a seed roster if the API returns empty / times out.
      setRaw(mergeById(seedRef.current, remote));
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        setError(err instanceof Error ? err.message : "Failed to load");
      }
      if (!silent) setRaw(seedRef.current);
    } finally {
      window.clearTimeout(timer);
      if (!silent) setLoading(false);
    }
  }, [collection, admin]);

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

  const items = useMemo(() => {
    if (!opts?.approvedOnly) return raw;
    return raw.filter((item) => {
      const status = (item as { status?: string }).status;
      return !status || status === "approved";
    });
  }, [raw, opts?.approvedOnly]);

  const saveAll = useCallback(
    async (next: T[]) => {
      const res = await fetch(withBase(`/api/community/${collection}`), {
        method: "PUT",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: next }),
      });
      const data = (await res.json()) as { error?: string; items?: T[] };
      if (!res.ok) throw new Error(data.error || "Save failed");
      setRaw(data.items || next);
      return data.items || next;
    },
    [collection],
  );

  const submitItem = useCallback(
    async (item: T) => {
      try {
        const res = await fetch(withBase(`/api/community/${collection}`), {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ item }),
        });
        const data = (await res.json()) as { error?: string; items?: T[] };
        if (!res.ok) throw new Error(data.error || "Submit failed");
        if (data.items) setRaw(data.items);
        return data;
      } catch (err) {
        // Device-local fallback when R2/API is unavailable
        const key = `rvp-community-${collection}`;
        const existing = (() => {
          try {
            return JSON.parse(localStorage.getItem(key) || "[]") as T[];
          } catch {
            return [] as T[];
          }
        })();
        const next = [...existing, item];
        localStorage.setItem(key, JSON.stringify(next));
        setRaw((prev) => mergeById(prev, [item]));
        return { items: next, fallback: true, error: err instanceof Error ? err.message : "fallback" };
      }
    },
    [collection],
  );

  return { items, raw, setItems: setRaw, loading, error, refresh, saveAll, submitItem };
}

export async function trackAnalyticsHit(input: {
  path: string;
  kind?: "pageview" | "notif-click" | "search" | "upload" | "error";
  meta?: string;
}) {
  try {
    const ua = navigator.userAgent;
    const device = /Mobi|Android/i.test(ua)
      ? "mobile"
      : /Tablet|iPad/i.test(ua)
        ? "tablet"
        : "desktop";
    let browser = "other";
    if (ua.includes("Edg/")) browser = "edge";
    else if (ua.includes("Chrome/")) browser = "chrome";
    else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "safari";
    else if (ua.includes("Firefox/")) browser = "firefox";

    await fetch(withBase("/api/community/analytics"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        hit: {
          path: input.path,
          ts: Date.now(),
          device,
          browser,
          referrer: document.referrer || "",
          kind: input.kind || "pageview",
          meta: input.meta,
        },
      }),
      keepalive: true,
    });
  } catch {
    /* analytics must never break UX */
  }
}
