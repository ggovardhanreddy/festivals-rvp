import { useEffect, useState } from "react";

export type MobileContent = {
  members: Array<{ id: string; name: string; role?: string }>;
  events: Array<{ id: string; title: string; titleTe?: string; date: string }>;
  announcements: Array<{ id: string; title: string; body?: string; date?: string }>;
  developments: Array<{ id: string; title: string; summary?: string }>;
};

const FALLBACK_BASE = "https://www.reddivaripalli.com";

export async function loadContent(base = FALLBACK_BASE): Promise<MobileContent> {
  const res = await fetch(`${base}/api/public/content`, { cache: "no-store" });
  if (!res.ok) throw new Error("Unable to fetch village content");
  return (await res.json()) as MobileContent;
}

export function useVillageContent() {
  const [data, setData] = useState<MobileContent | null>(null);
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
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}
