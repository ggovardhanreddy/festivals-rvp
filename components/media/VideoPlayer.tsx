"use client";

import { withBase } from "@/lib/base";

export function VideoPlayer({
  src,
  poster,
  title,
  className = "",
}: {
  src: string;
  poster?: string;
  title: string;
  className?: string;
}) {
  return (
    <video
      className={`media-video ${className}`.trim()}
      controls
      playsInline
      preload="metadata"
      poster={poster ? withBase(poster) : undefined}
      aria-label={title}
    >
      <source src={withBase(src)} />
      Your browser cannot play this video.
    </video>
  );
}
