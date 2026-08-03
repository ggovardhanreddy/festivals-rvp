"use client";

import { useState, type ImgHTMLAttributes } from "react";
import { useMediaUrl } from "@/lib/use-media-url";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  fallback?: string | null;
};

/**
 * Resolves public R2 URLs and signed private Fun Fest / document URLs.
 * Prefer this over raw `withBase(src)` for any album/cover/media image.
 */
export function MediaImage({
  src,
  fallback = null,
  alt = "",
  onError,
  className,
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

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      decoding="async"
      onError={(event) => {
        if (!useFallback && fallback && fallback !== src) {
          setUseFallback(true);
          return;
        }
        setBroken(true);
        onError?.(event);
      }}
      {...rest}
    />
  );
}
