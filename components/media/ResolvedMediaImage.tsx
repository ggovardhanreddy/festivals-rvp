"use client";

import { useState, type ImgHTMLAttributes } from "react";
import { useMediaUrl } from "@/lib/use-media-url";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  /** Shown while signing / loading */
  skeletonClassName?: string;
};

/**
 * Image that resolves public R2 and signed private Fun Fest URLs.
 * Renders a friendly placeholder instead of a broken <img> icon.
 */
export function ResolvedMediaImage({
  src,
  alt = "",
  className,
  skeletonClassName,
  onError,
  ...rest
}: Props) {
  const { url, loading, error } = useMediaUrl(src);
  const [broken, setBroken] = useState(false);

  if (loading && !url) {
    return (
      <div
        className={skeletonClassName || className || "media-image-skeleton"}
        aria-hidden
      />
    );
  }

  if (error || !url || broken) {
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

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      decoding="async"
      onError={(event) => {
        setBroken(true);
        onError?.(event);
      }}
      {...rest}
    />
  );
}
