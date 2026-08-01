"use client";

import { ThemeProvider } from "next-themes";
import { LazyMotion, domAnimation } from "framer-motion";
import { SmoothScroll } from "./experience/SmoothScroll";
import { CursorLight } from "./experience/CursorLight";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LazyMotion features={domAnimation}>
        <SmoothScroll />
        <CursorLight />
        {children}
      </LazyMotion>
    </ThemeProvider>
  );
}
