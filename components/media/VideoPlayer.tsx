"use client";

import { useEffect, useRef, useState } from "react";
import { withBase } from "@/lib/base";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

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
  const ref = useRef<HTMLVideoElement>(null);
  const [speed, setSpeed] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pipSupported, setPipSupported] = useState(false);

  useEffect(() => {
    setPipSupported(
      typeof document !== "undefined" && "pictureInPictureEnabled" in document,
    );
  }, []);
  const mime = src.toLowerCase().endsWith(".webm")
    ? "video/webm"
    : src.toLowerCase().endsWith(".ogv")
      ? "video/ogg"
      : "video/mp4";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.playbackRate = speed;
  }, [speed]);

  return (
    <div className={`media-video-wrap ${className}`.trim()}>
      <video
        ref={ref}
        className="media-video"
        controls
        playsInline
        preload="metadata"
        poster={poster ? withBase(poster) : undefined}
        aria-label={title}
        controlsList="nodownload"
        onError={() =>
          setError("This video could not be played in your browser.")
        }
        onLoadedData={() => setError(null)}
      >
        <source src={withBase(src)} type={mime} />
        Your browser cannot play this video.
      </video>
      {error ? <p className="media-error muted">{error}</p> : null}
      <div className="media-video-toolbar">
        <label className="media-speed">
          <span className="eyebrow">Speed</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            aria-label="Playback speed"
          >
            {SPEEDS.map((s) => (
              <option key={s} value={s}>
                {s}×
              </option>
            ))}
          </select>
        </label>
        {pipSupported ? (
          <button
            type="button"
            className="btn ghost"
            onClick={async () => {
              const el = ref.current;
              if (!el) return;
              try {
                if (document.pictureInPictureElement) {
                  await document.exitPictureInPicture();
                } else {
                  await el.requestPictureInPicture();
                }
              } catch {
                /* unsupported source */
              }
            }}
          >
            PiP
          </button>
        ) : null}
      </div>
    </div>
  );
}
