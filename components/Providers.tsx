"use client";

import { ThemeProvider } from "next-themes";
import { LazyMotion, domAnimation } from "framer-motion";
import { SmoothScroll } from "./experience/SmoothScroll";
import { CursorLight } from "./experience/CursorLight";
import { AudioDeckProvider } from "./media/AudioDeck";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LazyMotion features={domAnimation}>
        <AudioDeckProvider>
          <SmoothScroll />
          <CursorLight />
          {children}
        </AudioDeckProvider>
      </LazyMotion>
    </ThemeProvider>
  );
}
