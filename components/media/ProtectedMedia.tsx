"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { withBase } from "@/lib/base";
import { DEFAULT_SITE_SETTINGS } from "@/lib/community";
import type { SiteSettings, WatermarkPosition } from "@/lib/types";

let settingsCache: SiteSettings | null = null;
let settingsLoad: Promise<SiteSettings> | null = null;

function loadSiteSettings(): Promise<SiteSettings> {
  if (settingsCache) return Promise.resolve(settingsCache);
  if (settingsLoad) return settingsLoad;
  settingsLoad = fetch(withBase("/api/community/site-settings"), {
    cache: "no-store",
  })
    .then(async (res) => {
      if (!res.ok) return DEFAULT_SITE_SETTINGS;
      const data = (await res.json()) as { settings?: SiteSettings };
      settingsCache = { ...DEFAULT_SITE_SETTINGS, ...data.settings };
      return settingsCache;
    })
    .catch(() => DEFAULT_SITE_SETTINGS);
  return settingsLoad;
}

/**
 * Soft media protection: no drag-to-save, no context menu, optional watermark.
 * This is deterrence, not a guarantee against screenshots or determined copies.
 */
export function ProtectedMedia({
  src,
  alt,
  className = "",
  watermark,
  children,
  as: Tag = "div",
}: {
  src?: string;
  alt?: string;
  className?: string;
  watermark?: boolean;
  children?: ReactNode;
  /**
   * The wrapper element. Defaults to a div.
   *
   * Pass "span" wherever this sits inside phrasing content -- a button, a
   * span, a label. A div in there is invalid nesting: the browser's parser
   * rearranges it, so the DOM stops matching what React rendered on the
   * server and hydration fails with error #418, regenerating the tree. The
   * family tree hit exactly this, but only on nodes that had a photograph.
   */
  as?: "div" | "span";
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    void loadSiteSettings().then((next) => {
      if (!cancelled) setSettings(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const block = useCallback((event: MouseEvent | DragEvent) => {
    event.preventDefault();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onCopy = (event: ClipboardEvent) => {
      if (root.contains(event.target as Node)) event.preventDefault();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "PrintScreen") event.preventDefault();
    };

    document.addEventListener("copy", onCopy);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("copy", onCopy);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const showMark = watermark ?? settings.watermarkEnabled;
  const position: WatermarkPosition =
    settings.watermarkPosition || "bottom-right";
  const opacity =
    typeof settings.watermarkOpacity === "number"
      ? Math.min(1, Math.max(0.08, settings.watermarkOpacity))
      : 0.35;

  return (
    <Tag
      ref={rootRef}
      className={`protected-media ${className}`.trim()}
      onContextMenu={block}
      onDragStart={block}
    >
      {children ?? (
        <img src={src} alt={alt || ""} draggable={false} loading="lazy" />
      )}
      {showMark ? (
        <span
          className="protected-media-mark"
          data-position={position}
          style={{ opacity }}
          aria-hidden
        >
          {settings.watermarkText || "Reddivaripalli.com"}
        </span>
      ) : null}
    </Tag>
  );
}
