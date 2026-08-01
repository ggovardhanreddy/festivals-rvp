"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_MUSIC_THEME,
  getMusicTheme,
  themeSourcesAbsolute,
  type MusicTheme,
  type MusicThemeId,
  MUSIC_THEMES,
} from "@/lib/music-themes";

const SESSION = {
  wantsPlay: "rvp-music-wants-play",
  volume: "rvp-music-volume",
  muted: "rvp-music-muted",
  theme: "rvp-music-theme",
} as const;

type MusicContextValue = {
  themes: MusicTheme[];
  theme: MusicTheme;
  themeId: MusicThemeId;
  setThemeId: (id: MusicThemeId) => void;
  playing: boolean;
  muted: boolean;
  volume: number;
  /** Browser blocked autoplay — waiting for a tap */
  needsGesture: boolean;
  play: () => void;
  pause: () => void;
  stop: () => void;
  toggle: () => void;
  mute: () => void;
  unmute: () => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
  /** Temporarily lower music (intro / hover scenes) */
  duck: (amount?: number) => void;
  unduck: () => void;
  /** Brief swell for fireworks climax */
  swell: (ms?: number) => void;
  ready: boolean;
};

const MusicContext = createContext<MusicContextValue | null>(null);

function readSession(key: string, fallback: string): string {
  try {
    return sessionStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeSession(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function fadeVolume(
  el: HTMLAudioElement,
  from: number,
  to: number,
  ms: number,
  onDone?: () => void,
) {
  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / ms);
    const eased = t * t * (3 - 2 * t);
    el.volume = Math.min(1, Math.max(0, from + (to - from) * eased));
    if (t < 1) requestAnimationFrame(tick);
    else {
      el.volume = to;
      onDone?.();
    }
  };
  requestAnimationFrame(tick);
}

function loadThemeSources(el: HTMLAudioElement, theme: MusicTheme) {
  while (el.firstChild) el.removeChild(el.firstChild);
  for (const s of themeSourcesAbsolute(theme)) {
    const source = document.createElement("source");
    source.src = s.src;
    source.type = s.type;
    el.appendChild(source);
  }
  el.load();
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [themeId, setThemeIdState] = useState<MusicThemeId>(DEFAULT_MUSIC_THEME);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.6);
  const [ready, setReady] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const wantsPlay = useRef(true); // autoplay by default until user stops
  const fadeLock = useRef(false);
  const loadedTheme = useRef<string | null>(null);
  const autoTried = useRef(false);
  const duckMul = useRef(1);
  const baseVolume = useRef(0.6);
  const volumeRef = useRef(0.6);
  const mutedRef = useRef(false);

  const theme = getMusicTheme(themeId);

  useEffect(() => {
    baseVolume.current = volume;
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const applyGain = useCallback(() => {
    const el = audioRef.current;
    if (!el || mutedRef.current || fadeLock.current) return;
    el.volume = Math.min(1, Math.max(0, volumeRef.current * duckMul.current));
  }, []);

  useEffect(() => {
    const savedTheme = readSession(SESSION.theme, DEFAULT_MUSIC_THEME);
    const savedVol = Number(readSession(SESSION.volume, "0.6"));
    const savedMuted = readSession(SESSION.muted, "0") === "1";
    // Default autoplay: only skip if user explicitly stopped this session
    const savedPlay = readSession(SESSION.wantsPlay, "1") !== "0";
    setThemeIdState(
      MUSIC_THEMES.some((t) => t.id === savedTheme)
        ? (savedTheme as MusicThemeId)
        : DEFAULT_MUSIC_THEME,
    );
    setVolumeState(
      Number.isFinite(savedVol) ? Math.min(1, Math.max(0, savedVol)) : 0.6,
    );
    setMuted(savedMuted);
    wantsPlay.current = savedPlay;
    setReady(true);
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.loop = true;
    el.preload = "none";
    const onPlay = () => {
      setPlaying(true);
      setNeedsGesture(false);
    };
    const onPause = () => setPlaying(false);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, []);

  const ensureLoaded = useCallback(
    (id: MusicThemeId = themeId) => {
      const el = audioRef.current;
      if (!el) return;
      if (loadedTheme.current === id && el.childElementCount > 0) return;
      loadThemeSources(el, getMusicTheme(id));
      loadedTheme.current = id;
    },
    [themeId],
  );

  const play = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    ensureLoaded(themeId);
    wantsPlay.current = true;
    writeSession(SESSION.wantsPlay, "1");
    const target = muted ? 0 : volume;
    el.muted = muted;
    el.volume = 0;
    fadeLock.current = true;
    void el
      .play()
      .then(() => {
        setNeedsGesture(false);
        fadeVolume(el, 0, target, 900, () => {
          fadeLock.current = false;
        });
      })
      .catch(() => {
        fadeLock.current = false;
        setNeedsGesture(true);
      });
  }, [ensureLoaded, muted, volume, themeId]);

  const pause = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    wantsPlay.current = false;
    writeSession(SESSION.wantsPlay, "0");
    setNeedsGesture(false);
    const from = el.volume;
    fadeLock.current = true;
    fadeVolume(el, from, 0, 600, () => {
      el.pause();
      fadeLock.current = false;
    });
  }, []);

  const stop = useCallback(() => {
    pause();
    const el = audioRef.current;
    if (el) el.currentTime = 0;
  }, [pause]);

  const toggle = useCallback(() => {
    if (playing) pause();
    else play();
  }, [playing, play, pause]);

  const setVolume = useCallback(
    (v: number) => {
      const next = Math.min(1, Math.max(0, v));
      setVolumeState(next);
      writeSession(SESSION.volume, String(next));
      const el = audioRef.current;
      if (el && !muted && !fadeLock.current) {
        el.volume = next * duckMul.current;
      }
    },
    [muted],
  );

  const mute = useCallback(() => {
    setMuted(true);
    writeSession(SESSION.muted, "1");
    const el = audioRef.current;
    if (el) el.muted = true;
  }, []);

  const unmute = useCallback(() => {
    setMuted(false);
    writeSession(SESSION.muted, "0");
    const el = audioRef.current;
    if (el) {
      el.muted = false;
      if (!fadeLock.current) el.volume = volume;
    }
  }, [volume]);

  const toggleMute = useCallback(() => {
    if (muted) unmute();
    else mute();
  }, [muted, mute, unmute]);

  const setThemeId = useCallback(
    (id: MusicThemeId) => {
      if (id === loadedTheme.current) {
        setThemeIdState(id);
        writeSession(SESSION.theme, id);
        return;
      }
      const el = audioRef.current;
      const resume = wantsPlay.current;
      setThemeIdState(id);
      writeSession(SESSION.theme, id);
      if (!el) return;

      const swap = () => {
        loadThemeSources(el, getMusicTheme(id));
        loadedTheme.current = id;
        el.muted = mutedRef.current;
        el.currentTime = 0;
        if (resume) {
          el.volume = 0;
          fadeLock.current = true;
          void el
            .play()
            .then(() => {
              setNeedsGesture(false);
              const target = mutedRef.current
                ? 0
                : volumeRef.current * duckMul.current;
              fadeVolume(el, 0, target, 1100, () => {
                fadeLock.current = false;
              });
            })
            .catch(() => {
              fadeLock.current = false;
              setNeedsGesture(true);
            });
        }
      };

      if (playing && !mutedRef.current) {
        fadeLock.current = true;
        fadeVolume(el, el.volume, 0, 500, () => {
          el.pause();
          fadeLock.current = false;
          swap();
        });
      } else {
        swap();
      }
    },
    [playing],
  );

  const duck = useCallback(
    (amount = 0.35) => {
      duckMul.current = Math.min(1, Math.max(0.12, amount));
      applyGain();
    },
    [applyGain],
  );

  const unduck = useCallback(() => {
    duckMul.current = 1;
    applyGain();
  }, [applyGain]);

  const swell = useCallback(
    (ms = 1400) => {
      const el = audioRef.current;
      if (!el || mutedRef.current || !wantsPlay.current) return;
      const from = el.volume;
      const peak = Math.min(1, volumeRef.current * 1.15);
      fadeLock.current = true;
      fadeVolume(el, from, peak, Math.min(400, ms * 0.3), () => {
        fadeVolume(el, peak, volumeRef.current * duckMul.current, ms * 0.7, () => {
          fadeLock.current = false;
        });
      });
    },
    [],
  );

  // Intro / fireworks audio cues
  useEffect(() => {
    const onChrome = () => duck(0.42);
    const onComplete = () => unduck();
    const onSwell = () => swell(1600);
    window.addEventListener("rvp:intro-chrome", onChrome);
    window.addEventListener("rvp:intro-complete", onComplete);
    window.addEventListener("rvp:audio-swell", onSwell);
    return () => {
      window.removeEventListener("rvp:intro-chrome", onChrome);
      window.removeEventListener("rvp:intro-complete", onComplete);
      window.removeEventListener("rvp:audio-swell", onSwell);
    };
  }, [duck, unduck, swell]);

  // Soft autoplay after first paint — load audio only when attempting play
  useEffect(() => {
    if (!ready || autoTried.current) return;
    if (!wantsPlay.current) return;

    const start = () => {
      if (autoTried.current) return;
      autoTried.current = true;
      ensureLoaded(themeId);
      const el = audioRef.current;
      if (!el) return;

      el.muted = muted;
      el.volume = 0;
      fadeLock.current = true;
      void el
        .play()
        .then(() => {
          setNeedsGesture(false);
          fadeVolume(el, 0, muted ? 0 : volume, 1200, () => {
            fadeLock.current = false;
          });
        })
        .catch(() => {
          fadeLock.current = false;
          setNeedsGesture(true);
          const unlock = () => {
            if (!wantsPlay.current) return;
            ensureLoaded(themeId);
            const audio = audioRef.current;
            if (!audio) return;
            audio.muted = muted;
            audio.volume = 0;
            void audio.play().then(() => {
              setNeedsGesture(false);
              fadeVolume(audio, 0, muted ? 0 : volume, 900);
              window.removeEventListener("pointerdown", unlock);
              window.removeEventListener("keydown", unlock);
              window.removeEventListener("touchstart", unlock);
            });
          };
          window.addEventListener("pointerdown", unlock, { once: true });
          window.addEventListener("keydown", unlock, { once: true });
          window.addEventListener("touchstart", unlock, { once: true });
        });
    };

    // Defer network until after first paint / intro sky
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!cancelled) start();
    }, 900);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [ready, ensureLoaded, themeId, muted, volume]);

  const value = useMemo(
    () => ({
      themes: MUSIC_THEMES,
      theme,
      themeId,
      setThemeId,
      playing,
      muted,
      volume,
      needsGesture,
      play,
      pause,
      stop,
      toggle,
      mute,
      unmute,
      toggleMute,
      setVolume,
      duck,
      unduck,
      swell,
      ready,
    }),
    [
      theme,
      themeId,
      setThemeId,
      playing,
      muted,
      volume,
      needsGesture,
      play,
      pause,
      stop,
      toggle,
      mute,
      unmute,
      toggleMute,
      setVolume,
      duck,
      unduck,
      swell,
      ready,
    ],
  );

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        className="site-music-audio"
        loop
        preload="none"
        playsInline
        aria-hidden
      />
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used within MusicProvider");
  return ctx;
}

export function useMusicOptional() {
  return useContext(MusicContext);
}
