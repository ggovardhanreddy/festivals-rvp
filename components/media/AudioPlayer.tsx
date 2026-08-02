"use client";

import { useEffect, useRef, useState } from "react";
import { withBase } from "@/lib/base";
import { useAudioDeck } from "./AudioDeck";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

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
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
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
      setCurrent(el.currentTime);
      setDuration(el.duration);
      setProgress((el.currentTime / el.duration) * 100);
    };
    const onMeta = () => setDuration(el.duration || 0);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
    };
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
        <p className="audio-time muted">
          {formatTime(current)} / {formatTime(duration)}
        </p>
        {error ? <p className="media-error muted">{error}</p> : null}
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
      <audio
        ref={audioRef}
        preload="metadata"
        src={withBase(src)}
        onError={() =>
          setError("This audio file could not be played.")
        }
      />
    </div>
  );
}
