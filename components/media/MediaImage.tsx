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
  ...rest
}: Props) {
  const [useFallback, setUseFallback] = useState(false);
  const active = useFallback && fallback ? fallback : src;
  const { url, loading, error } = useMediaUrl(active);

  if (!url) {
    if (loading) {
      return <div className="media-image-skeleton" aria-hidden />;
    }
    if (error || !active) {
      return <div className="media-image-empty" aria-hidden />;
    }
    return null;
  }

  return (
    <img
      src={url}
      alt={alt}
      decoding="async"
      onError={(event) => {
        if (!useFallback && fallback && fallback !== src) {
          setUseFallback(true);
          return;
        }
        onError?.(event);
      }}
      {...rest}
    />
  );
}
