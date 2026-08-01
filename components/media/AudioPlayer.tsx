"use client";

import { useEffect, useRef, useState } from "react";
import { withBase } from "@/lib/base";
import { useAudioDeck } from "./AudioDeck";

export function AudioPlayer({
  src,
  title,
  artwork,
  id,
}: {
  src: string;
  title: string;
  artwork?: string;
  id: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { register, playTrack, currentId, playing } = useAudioDeck();
  const [progress, setProgress] = useState(0);
  const active = currentId === id && playing;

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    register(id, el, title, artwork);
  }, [id, title, artwork, register]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => {
      if (!el.duration) return;
      setProgress((el.currentTime / el.duration) * 100);
    };
    el.addEventListener("timeupdate", onTime);
    return () => el.removeEventListener("timeupdate", onTime);
  }, []);

  return (
    <div className={`audio-card ${active ? "is-active" : ""}`}>
      <img
        className="audio-art"
        src={withBase(artwork || "/brand/icon-512.png")}
        alt=""
        loading="lazy"
      />
      <div className="audio-meta">
        <h3>{title}</h3>
        <div className="audio-progress" aria-hidden>
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="btn-row">
          <button
            type="button"
            className="btn"
            onClick={() => playTrack(id)}
            aria-pressed={active}
          >
            {active ? "Pause" : "Play"}
          </button>
        </div>
      </div>
      <audio ref={audioRef} preload="metadata" src={withBase(src)} />
    </div>
  );
}
