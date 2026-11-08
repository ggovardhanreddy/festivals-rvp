import { useEffect, useState } from "react";
import { SEED_CONTENT } from "@/src/seed-content";

export type MobileContent = {
  members: Array<{ id: string; name: string; role?: string }>;
  events: Array<{
    id: string;
    title: string;
    titleTe?: string;
    date: string;
    image?: string;
    description?: string;
    slug?: string;
  }>;
  announcements: Array<{ id: string; title: string; body?: string; date?: string }>;
  developments: Array<{ id: string; title: string; summary?: string }>;
};

const FALLBACK_BASE = "https://www.reddivaripalli.com";
let memoryCache: MobileContent | null = null;

export async function loadContent(base = FALLBACK_BASE): Promise<MobileContent> {
  const res = await fetch(`${base}/api/public/content`, { cache: "no-store" });
  if (!res.ok) throw new Error("Unable to fetch village content");
  const payload = (await res.json()) as MobileContent;
  memoryCache = payload;
  return payload;
}

export function useVillageContent() {
  const [data, setData] = useState<MobileContent>(memoryCache || SEED_CONTENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    loadContent()
      .then((payload) => {
        if (!mounted) return;
        setData(payload);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed");
        if (memoryCache) setData(memoryCache);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error, refresh: () => loadContent().then(setData) };
}
