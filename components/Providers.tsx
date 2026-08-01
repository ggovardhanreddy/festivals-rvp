"use client";

import { ThemeProvider } from "next-themes";
import { LazyMotion, domAnimation } from "framer-motion";
import { SmoothScroll } from "./experience/SmoothScroll";
import { LiquidCursor } from "./experience/LiquidCursor";
import { AudioDeckProvider } from "./media/AudioDeck";
import { MusicProvider } from "./music/MusicProvider";
import { GlassMusicPlayer } from "./music/GlassMusicPlayer";
import { MusicRouteSync } from "./music/MusicRouteSync";

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
