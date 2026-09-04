"use client";

import { useState, type ImgHTMLAttributes } from "react";
import { useMediaUrl } from "@/lib/use-media-url";
import { ProtectedMedia } from "./ProtectedMedia";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  fallback?: string | null;
  /** Wrap with drag/context-menu/watermark protection. Default true. */
  protect?: boolean;
  watermark?: boolean;
};

/**
 * Resolves public R2 URLs and signed private Fun Fest / document URLs.
 * Public photographs go through protected delivery (no drag, no save-as menu).
 */
export function MediaImage({
  src,
  fallback = null,
  alt = "",
  onError,
  className,
  protect = true,
  watermark,
  ...rest
}: Props) {
  const [useFallback, setUseFallback] = useState(false);
  const [broken, setBroken] = useState(false);
  const active = useFallback && fallback ? fallback : src;
  const { url, loading, error } = useMediaUrl(active);

  if (!url) {
    if (loading) {
      return (
        <div
          className={`media-image-skeleton${className ? ` ${className}` : ""}`}
          aria-hidden
        />
      );
    }
    return (
      <div
        className={`media-image-empty${className ? ` ${className}` : ""}`}
        role="img"
        aria-label={error || alt || "Media unavailable"}
      >
        <span className="media-image-empty-label">
          {error?.includes("Sign in") ? "Sign in to view" : "Photo unavailable"}
        </span>
      </div>
    );
  }

  if (broken) {
    return (
      <div
        className={`media-image-empty${className ? ` ${className}` : ""}`}
        role="img"
        aria-label={alt || "Media unavailable"}
      >
        <span className="media-image-empty-label">Photo unavailable</span>
      </div>
    );
  }

  const img = (
    <img
      alt={alt}
      className={protect ? undefined : className}
      decoding="async"
      {...rest}
      src={url}
      draggable={false}
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
      onError={(event) => {
        if (!useFallback && fallback && fallback !== src) {
          setUseFallback(true);
          return;
        }
        setBroken(true);
        onError?.(event);
      }}
    />
  );

  if (!protect) return img;

  return (
    <ProtectedMedia className={className} watermark={watermark}>
      {img}
    </ProtectedMedia>
  );
}
