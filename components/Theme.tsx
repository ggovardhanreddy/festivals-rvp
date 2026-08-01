"use client";

import { useEffect, useState } from "react";

export function Theme() {
  const [dark, setDark] = useState(() =>
    typeof window !== "undefined" &&
    (localStorage.theme === "dark" ||
      (!localStorage.theme &&
        matchMedia("(prefers-color-scheme: dark)").matches)),
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <button
      className="icon"
      onClick={() => {
        localStorage.theme = dark ? "light" : "dark";
        setDark(!dark);
      }}
      aria-label="Toggle color theme"
    >
      {dark ? "☀" : "☾"}
    </button>
  );
}
