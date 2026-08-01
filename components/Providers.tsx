"use client";

import { ThemeProvider } from "next-themes";
import { LazyMotion, domAnimation } from "framer-motion";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LazyMotion features={domAnimation}>{children}</LazyMotion>
    </ThemeProvider>
  );
}
