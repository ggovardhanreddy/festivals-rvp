"use client";

import { useEffect, useState } from "react";
import { useMusic } from "./MusicProvider";

/** Minimal bottom music control — Play / Mute only. */
export function GlassMusicPlayer() {
  const { playing, muted, needsGesture, play, stop, toggleMute } = useMusic();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="music-mini" role="region" aria-label="Background music">
      {needsGesture || !playing ? (
        <button
          type="button"
          className="music-mini-btn magnetic"
          onClick={play}
          aria-label="Play music"
        >
          Play
        </button>
      ) : (
        <button
          type="button"
          className="music-mini-btn stop magnetic"
          onClick={stop}
          aria-label="Stop music"
        >
          Stop
        </button>
      )}
      <button
        type="button"
        className="music-mini-btn ghost magnetic"
        onClick={toggleMute}
        aria-pressed={muted}
        aria-label={muted ? "Unmute music" : "Mute music"}
      >
        {muted ? "Unmute" : "Mute"}
      </button>
    </div>
  );
}
