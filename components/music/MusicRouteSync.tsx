"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { themeForPathname } from "@/lib/music-themes";
import { useMusic } from "./MusicProvider";

/** Crossfade background music when navigating between home / festival chapters. */
export function MusicRouteSync() {
  const pathname = usePathname() || "/";
  const { setThemeId, ready, themeId } = useMusic();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    const next = themeForPathname(pathname);
    if (last.current === next) return;
    last.current = next;
    if (themeId !== next) setThemeId(next);
  }, [pathname, ready, setThemeId, themeId]);

  return null;
}
