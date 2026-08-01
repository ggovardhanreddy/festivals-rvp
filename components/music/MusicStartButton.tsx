"use client";

import { useMusicOptional } from "./MusicProvider";

/** Landing / inline CTA that starts the global cinematic music. */
export function MusicStartButton({ className = "" }: { className?: string }) {
  const music = useMusicOptional();
  if (!music) return null;

  return (
    <button
      type="button"
      className={`audio-toggle ${className}`.trim()}
      aria-pressed={music.playing}
      aria-label={
        music.playing
          ? "Pause village background music"
          : "Play village background music"
      }
      onClick={() => music.toggle()}
    >
      {music.playing ? "Pause music" : "Play music"}
    </button>
  );
}
