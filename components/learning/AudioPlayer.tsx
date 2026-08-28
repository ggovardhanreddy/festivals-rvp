"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useUiLang } from "@/components/i18n/LanguageProvider";

/**
 * Audio player sized for a child's thumb.
 *
 * Three controls and a scrubber, nothing else. The buttons are 3rem so a
 * six-year-old hits them, the scrubber is a real range input so it works with
 * a keyboard and a screen reader, and the elapsed time uses tabular figures
 * so it stops jittering while it counts.
 */
function clock(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function AudioPlayer({
  src,
  label,
  captions,
}: {
  src: string;
  label: string;
  captions?: string;
}) {
  const { t } = useUiLang();
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onTime = () => setTime(el.currentTime);
    const onMeta = () => setDuration(el.duration || 0);
    const onEnd = () => setPlaying(false);
    const onErr = () => {
      setFailed(true);
      setPlaying(false);
    };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnd);
    el.addEventListener("error", onErr);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("ended", onEnd);
      el.removeEventListener("error", onErr);
    };
  }, []);

  const toggle = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      void el.play().then(() => setPlaying(true)).catch(() => setFailed(true));
    } else {
      el.pause();
      setPlaying(false);
    }
  }, []);

  const replay = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.currentTime = 0;
    void el.play().then(() => setPlaying(true)).catch(() => setFailed(true));
  }, []);

  if (failed) {
    return (
      <p className="player-failed" role="status">
        {t("player.audioUnavailable")}
      </p>
    );
  }

  return (
    <div className="audioplayer">
      <audio ref={ref} src={src} preload="metadata">
        {captions ? <track kind="captions" src={captions} default /> : null}
      </audio>
      <button
        type="button"
        className="player-btn player-btn--primary"
        onClick={toggle}
        aria-label={playing ? t("player.pause") : t("player.play", undefined, { label })}
      >
        {playing ? <Pause size={26} aria-hidden /> : <Play size={26} aria-hidden />}
      </button>
      <button
        type="button"
        className="player-btn"
        onClick={replay}
        aria-label={t("player.replay")}
      >
        <RotateCcw size={22} aria-hidden />
      </button>
      <label className="player-scrub">
        <span className="sr-only">{t("player.progress")}</span>
        <input
          type="range"
          min={0}
          max={Math.max(duration, 0.1)}
          step={0.1}
          value={time}
          onChange={(e) => {
            const el = ref.current;
            if (el) el.currentTime = Number(e.target.value);
          }}
        />
      </label>
      <span className="player-time">
        {clock(time)} / {clock(duration)}
      </span>
    </div>
  );
}
