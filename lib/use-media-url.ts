"use client";

import { useEffect, useState } from "react";
import { withBase } from "./base";
import {
  isPrivateMediaPath,
  pathToR2Key,
  r2Enabled,
  resolveMediaUrl,
} from "./media-url";

const signCache = new Map<string, { url: string; exp: number }>();

async function fetchSignedUrl(path: string): Promise<string> {
  const key = pathToR2Key(path);
  const cached = signCache.get(key);
  if (cached && cached.exp > Date.now() + 60_000) return cached.url;

  const res = await fetch(
    withBase(`/api/media/sign?key=${encodeURIComponent(key)}`),
    { credentials: "include" },
  );
  if (!res.ok) {
    throw new Error(
      res.status === 401
        ? "Sign in to view private media."
        : `Could not sign media URL (${res.status})`,
    );
  }
  const data = (await res.json()) as { url?: string; exp?: number };
  if (!data.url) throw new Error("Signed URL missing from response.");
  signCache.set(key, { url: data.url, exp: data.exp || Date.now() + 15 * 60_000 });
  return data.url;
}

/**
 * Resolve a media path for display. Public R2 URLs are sync;
 * private Fun Fest / documents fetch a short-lived signed URL.
 */
export function useMediaUrl(path: string | undefined | null): {
  url: string;
  loading: boolean;
  error: string | null;
} {
  const raw = path || "";
  const needsSign = Boolean(raw) && r2Enabled() && isPrivateMediaPath(raw);
  const publicUrl = raw
    ? /^https?:\/\//i.test(raw)
      ? raw
      : withBase(resolveMediaUrl(raw))
    : "";

  const [url, setUrl] = useState(needsSign ? "" : publicUrl);
  const [loading, setLoading] = useState(needsSign);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!raw) {
      setUrl("");
      setLoading(false);
      setError(null);
      return;
    }
    if (!needsSign) {
      setUrl(publicUrl);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetchSignedUrl(raw)
      .then((signed) => {
        if (!cancelled) {
          setUrl(signed);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load media");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [raw, needsSign, publicUrl]);

  return { url, loading, error };
}
