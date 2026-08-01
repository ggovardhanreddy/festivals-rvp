"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const { resolvedTheme, setTheme } = useTheme();

  if (!mounted) {
    return <button className="icon-btn" aria-label="Theme" type="button" />;
  }

  const dark = resolvedTheme === "dark";
  return (
    <button
      className="icon-btn"
      type="button"
      aria-label="Toggle color theme"
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? "Light" : "Dark"}
    </button>
  );
}
