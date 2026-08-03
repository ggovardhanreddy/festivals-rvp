"use client";

import { useEffect, useState } from "react";
import { withBase } from "@/lib/base";
import { DEFAULT_SITE_SETTINGS } from "@/lib/community";
import type { SiteSettings } from "@/lib/types";

/**
 * Soft media protection: no drag-to-save, no context menu, optional watermark.
 * Not a guarantee against screenshots or determined downloads.
 */
export function ProtectedMedia({
  src,
  alt,
  className = "",
  watermark,
}: {
  src: string;
  alt: string;
  className?: string;
  watermark?: boolean;
}) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(withBase("/api/community/site-settings"), {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { settings?: SiteSettings };
        if (!cancelled && data.settings) {
          setSettings({ ...DEFAULT_SITE_SETTINGS, ...data.settings });
        }
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const showMark = watermark ?? settings.watermarkEnabled;

  return (
    <div
      className={`protected-media ${className}`.trim()}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <img src={src} alt={alt} draggable={false} loading="lazy" />
      {showMark ? (
        <span className="protected-media-mark" aria-hidden>
          {settings.watermarkText || "Reddivaripalli Village"}
        </span>
      ) : null}
    </div>
  );
}
