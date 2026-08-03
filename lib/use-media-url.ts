"use client";

import { useEffect, useState } from "react";
import { withBase } from "./base";
import {
  isPrivateMediaPath,
  pathToR2Key,
  resolveMediaUrl,
} from "./media-url";

const signCache = new Map<string, { url: string; exp: number }>();

async function fetchSignedUrl(path: string): Promise<string> {
  const key = pathToR2Key(path);
  const cached = signCache.get(key);
  if (cached && cached.exp > Date.now() + 60_000) return cached.url;

  const res = await fetch(
    withBase(`/api/media/sign?key=${encodeURIComponent(key)}`),
    { credentials: "include", cache: "no-store" },
  );
  if (!res.ok) {
    const err = new Error(
      res.status === 401
        ? "Sign in to view private media."
        : `Could not sign media URL (${res.status})`,
    ) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  const data = (await res.json()) as { url?: string; exp?: number };
  if (!data.url) throw new Error("Signed URL missing from response.");
  // Prefer same-origin relative signed paths so SW / basePath stay correct
  const signed =
    data.url.startsWith("http") && typeof window !== "undefined"
      ? (() => {
          try {
            const u = new URL(data.url);
            if (u.origin === window.location.origin) {
              return `${u.pathname}${u.search}`;
            }
          } catch {
            /* keep absolute */
          }
          return data.url;
        })()
      : data.url;
  signCache.set(key, {
    url: signed,
    exp: data.exp || Date.now() + 15 * 60_000,
  });
  return signed;
}

/** Resolve any media path (public R2 or signed private) for img/video/audio. */
export async function resolveMediaPath(
  path: string | undefined | null,
): Promise<string> {
  const raw = path || "";
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (!isPrivateMediaPath(raw)) {
    return withBase(resolveMediaUrl(raw));
  }
  try {
    return await fetchSignedUrl(raw);
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 401) throw err;
    // Local next / missing Functions — fall back to site path
    return withBase(raw);
  }
}

export function prefetchMedia(path: string | undefined | null) {
  if (typeof window === "undefined" || !path) return;
  void resolveMediaPath(path)
    .then((url) => {
      if (!url) return;
      const img = new Image();
      img.decoding = "async";
      img.src = url;
    })
    .catch(() => {
      /* ignore prefetch failures */
    });
}

/**
 * Resolve a media path for display. Public R2 URLs are sync;
 * private Fun Fest / documents always fetch a short-lived signed URL
 * (independent of NEXT_PUBLIC_R2_PUBLIC_URL — strip-local removes local files).
 */
export function useMediaUrl(path: string | undefined | null): {
  url: string;
  loading: boolean;
  error: string | null;
} {
  const raw = path || "";
  const needsSign = Boolean(raw) && isPrivateMediaPath(raw);
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
    void resolveMediaPath(raw)
      .then((signed) => {
        if (!cancelled) {
          setUrl(signed);
          setLoading(false);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load media",
          );
          setUrl("");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [raw, needsSign, publicUrl]);

  return { url, loading, error };
}
