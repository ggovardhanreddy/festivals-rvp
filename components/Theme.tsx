"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { isDaytimeAtVillage } from "@/lib/daynight";

const CYCLE = ["system", "light", "dark"] as const;

/** When Auto (system), sync light/dark to village sunrise–sunset. */
export function AutoDayNightSync() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (theme !== "system") return;
    let last: "light" | "dark" | null = null;
    const apply = () => {
      const next = isDaytimeAtVillage() ? "light" : "dark";
      if (next === last) return;
      last = next;
      // Apply class without changing stored preference away from system.
      // Dark is the :root default, so `light` must be set explicitly —
      // merely dropping `dark` would leave a daytime visitor in dark.
      const root = document.documentElement;
      root.classList.toggle("dark", next === "dark");
      root.classList.toggle("light", next === "light");
      root.style.colorScheme = next;
    };
    apply();
    const id = window.setInterval(apply, 60_000);
    return () => window.clearInterval(id);
  }, [theme, setTheme]);

  return null;
}

export function ThemeToggle() {
  /**
   * Why useState + useEffect and not the useSyncExternalStore trick.
   *
   * This used to gate on
   *   useSyncExternalStore(emptySubscribe, () => true, () => false)
   * and return a completely different element before mount: a button whose
   * only child was the text "Auto". The mounted button renders two spans
   * instead, so the server HTML and the hydrating client tree disagreed on
   * structure and React bailed out with error #418 on every page of the site,
   * regenerating the tree. useState(false) is guaranteed to still be false
   * during hydration, because effects run after commit.
   *
   * The pre-mount and post-mount markup is also now the SAME shape -- two
   * spans either way -- so there is nothing left to mismatch even if the gate
   * were wrong again, and the button does not change size when it settles.
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { theme, resolvedTheme, setTheme } = useTheme();

  // Before mount there is no stored preference to read, so both the server and
  // the first client render describe Auto.
  const current = mounted
    ? ((theme as (typeof CYCLE)[number]) || "system")
    : "system";
  const label =
    current === "system" ? "Auto" : current === "dark" ? "Dark" : "Light";
  const icon = current === "system" ? "\u25d0" : current === "dark" ? "\u263e" : "\u2600";

  return (
    <button
      className="icon-btn theme-toggle"
      type="button"
      aria-label={`Color theme: ${label}. Tap for Auto, Light, or Dark.`}
      title={`Theme: ${label}${mounted && resolvedTheme ? ` (${resolvedTheme})` : ""}`}
      onClick={() => {
        if (!mounted) return;
        const i = CYCLE.indexOf(current);
        setTheme(CYCLE[(i + 1) % CYCLE.length]!);
      }}
    >
      <span aria-hidden className="theme-toggle-icon">
        {icon}
      </span>
      <span className="theme-toggle-label">{label}</span>
    </button>
  );
}
