"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { withBase } from "@/lib/base";

type Track = {
  id: string;
  el: HTMLAudioElement;
  title: string;
  artwork?: string;
};

type Deck = {
  register: (
    id: string,
    el: HTMLAudioElement,
    title: string,
    artwork?: string,
  ) => void;
  playTrack: (id: string) => void;
  currentId: string | null;
  playing: boolean;
  title: string;
  artwork?: string;
  toggle: () => void;
  setVolume: (v: number) => void;
  volume: number;
  repeat: boolean;
  setRepeat: (v: boolean) => void;
};

const AudioDeckContext = createContext<Deck | null>(null);

export function AudioDeckProvider({ children }: { children: React.ReactNode }) {
  const tracks = useRef(new Map<string, Track>());
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.85);
  const [repeat, setRepeat] = useState(false);
  const [title, setTitle] = useState("Village audio");
  const [artwork, setArtwork] = useState<string | undefined>();

  const register = useCallback(
    (id: string, el: HTMLAudioElement, trackTitle: string, art?: string) => {
      tracks.current.set(id, { id, el, title: trackTitle, artwork: art });
      el.volume = volume;
      el.loop = repeat;
    },
    [volume, repeat],
  );

  const playTrack = useCallback(
    (id: string) => {
      const track = tracks.current.get(id);
      if (!track) return;
      for (const [otherId, other] of tracks.current) {
        if (otherId !== id) {
          other.el.pause();
        }
      }
      if (currentId === id && !track.el.paused) {
        track.el.pause();
        setPlaying(false);
        return;
      }
      track.el.volume = volume;
      track.el.loop = repeat;
      void track.el.play();
      setCurrentId(id);
      setPlaying(true);
      setTitle(track.title);
      setArtwork(track.artwork);
    },
    [currentId, volume, repeat],
  );

  const toggle = useCallback(() => {
    if (!currentId) return;
    playTrack(currentId);
  }, [currentId, playTrack]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    for (const track of tracks.current.values()) {
      track.el.volume = v;
    }
  }, []);

  const value = useMemo(
    () => ({
      register,
      playTrack,
      currentId,
      playing,
      title,
      artwork,
      toggle,
      setVolume,
      volume,
      repeat,
      setRepeat: (v: boolean) => {
        setRepeat(v);
        for (const track of tracks.current.values()) track.el.loop = v;
      },
    }),
    [
      register,
      playTrack,
      currentId,
      playing,
      title,
      artwork,
      toggle,
      setVolume,
      volume,
      repeat,
    ],
  );

  return (
    <AudioDeckContext.Provider value={value}>
      {children}
      {currentId && (
        <div className="mini-player" role="region" aria-label="Audio mini player">
          <img
            src={withBase(artwork || "/brand/icon-512.png")}
            alt=""
            width={40}
            height={40}
          />
          <div>
            <p className="eyebrow">Now playing</p>
            <strong>{title}</strong>
          </div>
          <button type="button" className="btn ghost" onClick={toggle}>
            {playing ? "Pause" : "Play"}
          </button>
          <label className="mini-vol">
            <span className="sr-only">Volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
            />
          </label>
          <button
            type="button"
            className="btn ghost"
            aria-pressed={repeat}
            onClick={() => value.setRepeat(!repeat)}
          >
            Repeat
          </button>
        </div>
      )}
    </AudioDeckContext.Provider>
  );
}

export function useAudioDeck() {
  const ctx = useContext(AudioDeckContext);
  if (!ctx) {
    throw new Error("useAudioDeck must be used within AudioDeckProvider");
  }
  return ctx;
}
