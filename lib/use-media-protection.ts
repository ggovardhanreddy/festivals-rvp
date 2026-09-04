"use client";

import { useMemo } from "react";
import { useCommunityList } from "@/lib/use-community";
import {
  filterPublicMedia,
  shouldWatermarkMedia,
} from "@/lib/media-protection";
import type { Media, MediaProtection } from "@/lib/types";

export function useMediaProtection() {
  const { items: rules, loading } = useCommunityList<MediaProtection>(
    "media-protection",
    [],
  );

  const byId = useMemo(() => {
    const map = new Map<string, MediaProtection>();
    for (const rule of rules) map.set(rule.id, rule);
    return map;
  }, [rules]);

  return {
    rules,
    loading,
    isPublic: (media: Pick<Media, "id" | "file" | "visibility">) =>
      filterPublicMedia([media], rules).length > 0,
    watermark: (media: Pick<Media, "id" | "file" | "watermark">) =>
      shouldWatermarkMedia(media, rules),
    filter: <T extends Pick<Media, "id" | "file" | "visibility">>(items: T[]) =>
      filterPublicMedia(items, rules),
    byId,
  };
}
