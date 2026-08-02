"use client";

import { useTheme } from "next-themes";
import { useEffect, useSyncExternalStore } from "react";
import { isDaytimeAtVillage } from "@/lib/daynight";

const emptySubscribe = () => () => {};

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
      // Apply class without changing stored preference away from system
      document.documentElement.classList.toggle("dark", next === "dark");
      document.documentElement.style.colorScheme = next;
    };
    apply();
    const id = window.setInterval(apply, 60_000);
    return () => window.clearInterval(id);
  }, [theme, setTheme]);

  return null;
}

export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const { theme, resolvedTheme, setTheme } = useTheme();

  if (!mounted) {
    return (
      <button className="icon-btn theme-toggle" aria-label="Theme" type="button">
        Auto
      </button>
    );
  }

  const current = (theme as (typeof CYCLE)[number]) || "system";
  const label =
    current === "system" ? "Auto" : current === "dark" ? "Dark" : "Light";
  const icon = current === "system" ? "◐" : current === "dark" ? "☾" : "☀";

  return (
    <button
      className="icon-btn theme-toggle"
      type="button"
      aria-label={`Color theme: ${label}. Tap for Auto, Light, or Dark.`}
      title={`Theme: ${label}${resolvedTheme ? ` (${resolvedTheme})` : ""}`}
      onClick={() => {
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
