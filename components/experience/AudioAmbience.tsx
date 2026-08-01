"use client";

import { useEffect, useRef, useState } from "react";

/** Calm cinematic ambience — muted by default, never autoplays with sound. */
export function AudioAmbience({ className = "" }: { className?: string }) {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearInterval(id));
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
    master.gain.value = 0.04;
    master.connect(ctx.destination);

    // Soft wind bed
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.18;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 480;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.32;
    noise.connect(filter);
    filter.connect(windGain);
    windGain.connect(master);
    noise.start();

    // Gentle flute-like pad
    const flute = ctx.createOscillator();
    flute.type = "sine";
    flute.frequency.value = 392;
    const fluteGain = ctx.createGain();
    fluteGain.gain.value = 0.012;
    const fluteFilter = ctx.createBiquadFilter();
    fluteFilter.type = "lowpass";
    fluteFilter.frequency.value = 1200;
    flute.connect(fluteFilter);
    fluteFilter.connect(fluteGain);
    fluteGain.connect(master);
    flute.start();

    // Soft string drone
    const strings = ctx.createOscillator();
    strings.type = "triangle";
    strings.frequency.value = 196;
    const stringGain = ctx.createGain();
    stringGain.gain.value = 0.01;
    strings.connect(stringGain);
    stringGain.connect(master);
    strings.start();

    // Bird chirp
    const bird = ctx.createOscillator();
    bird.type = "sine";
    bird.frequency.value = 880;
    const birdGain = ctx.createGain();
    birdGain.gain.value = 0;
    bird.connect(birdGain);
    birdGain.connect(master);
    bird.start();

    // Distant temple bell (partial)
    const bell = ctx.createOscillator();
    bell.type = "sine";
    bell.frequency.value = 528;
    const bellGain = ctx.createGain();
    bellGain.gain.value = 0;
    bell.connect(bellGain);
    bellGain.connect(master);
    bell.start();

    timers.current.push(
      window.setInterval(() => {
        const now = ctx.currentTime;
        bird.frequency.setValueAtTime(760 + Math.random() * 280, now);
        birdGain.gain.cancelScheduledValues(now);
        birdGain.gain.setValueAtTime(0, now);
        birdGain.gain.linearRampToValueAtTime(0.07, now + 0.04);
        birdGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      }, 4800),
    );

    timers.current.push(
      window.setInterval(() => {
        const now = ctx.currentTime;
        bell.frequency.setValueAtTime(520 + Math.random() * 40, now);
        bellGain.gain.cancelScheduledValues(now);
        bellGain.gain.setValueAtTime(0, now);
        bellGain.gain.linearRampToValueAtTime(0.055, now + 0.02);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
      }, 11000),
    );

    // Light percussion pulse (very soft)
    timers.current.push(
      window.setInterval(() => {
        const now = ctx.currentTime;
        const click = ctx.createOscillator();
        click.type = "triangle";
        click.frequency.value = 110;
        const g = ctx.createGain();
        g.gain.value = 0;
        click.connect(g);
        g.connect(master);
        click.start(now);
        g.gain.linearRampToValueAtTime(0.018, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        click.stop(now + 0.2);
      }, 3200),
    );

    setOn(true);
  };

  const stop = async () => {
    timers.current.forEach((id) => window.clearInterval(id));
    timers.current = [];
    await ctxRef.current?.close();
    ctxRef.current = null;
    setOn(false);
  };

  return (
    <button
      type="button"
      className={`audio-toggle ${className}`.trim()}
      aria-pressed={on}
      aria-label={on ? "Pause village ambience" : "Play village ambience"}
      onClick={() => {
        if (on) void stop();
        else void start();
      }}
    >
      {on ? "Pause music" : "Play music"}
    </button>
  );
}
