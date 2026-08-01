"use client";

import dynamic from "next/dynamic";
import { ThemeProvider } from "next-themes";
import { LazyMotion, domAnimation } from "framer-motion";
import { AudioDeckProvider } from "./media/AudioDeck";
import { MusicProvider } from "./music/MusicProvider";
import { GlassMusicPlayer } from "./music/GlassMusicPlayer";
import { MusicRouteSync } from "./music/MusicRouteSync";

const SmoothScroll = dynamic(
  () => import("./experience/SmoothScroll").then((m) => m.SmoothScroll),
  { ssr: false },
);

const LiquidCursor = dynamic(
  () => import("./experience/LiquidCursor").then((m) => m.LiquidCursor),
  { ssr: false },
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LazyMotion features={domAnimation}>
        <MusicProvider>
          <AudioDeckProvider>
            <MusicRouteSync />
            <SmoothScroll />
            <LiquidCursor />
            {children}
            <GlassMusicPlayer />
          </AudioDeckProvider>
        </MusicProvider>
      </LazyMotion>
    </ThemeProvider>
  );
}
