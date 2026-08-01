"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <button className="icon-btn" aria-label="Theme" />;
  const dark = resolvedTheme === "dark";
  return (
    <button
      className="icon-btn"
      aria-label="Toggle color theme"
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? "☀" : "☾"}
    </button>
  );
}
