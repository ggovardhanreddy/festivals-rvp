"use client";

import { useEffect, useRef, useState } from "react";

/** Muted-by-default procedural ambience. Never autoplays with sound. */
export function AudioAmbience() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      void ctxRef.current?.close();
    };
  }, []);

  const start = async () => {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0.045;
    master.connect(ctx.destination);

    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.2;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 520;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.35;
    noise.connect(filter);
    filter.connect(windGain);
    windGain.connect(master);
    noise.start();

    const bird = ctx.createOscillator();
    bird.type = "sine";
    bird.frequency.value = 880;
    const birdGain = ctx.createGain();
    birdGain.gain.value = 0;
    bird.connect(birdGain);
    birdGain.connect(master);
    bird.start();

    timerRef.current = window.setInterval(() => {
      const now = ctx.currentTime;
      bird.frequency.setValueAtTime(760 + Math.random() * 280, now);
      birdGain.gain.cancelScheduledValues(now);
      birdGain.gain.setValueAtTime(0, now);
      birdGain.gain.linearRampToValueAtTime(0.08, now + 0.05);
      birdGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    }, 4200);

    setOn(true);
  };

  const stop = async () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    await ctxRef.current?.close();
    ctxRef.current = null;
    setOn(false);
  };

  return (
    <button
      type="button"
      className="audio-toggle"
      aria-pressed={on}
      aria-label={on ? "Mute village ambience" : "Enable village ambience"}
      onClick={() => {
        if (on) void stop();
        else void start();
      }}
    >
      {on ? "Sound on" : "Sound off"}
    </button>
  );
}
