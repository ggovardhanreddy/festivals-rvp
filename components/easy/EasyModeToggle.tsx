"use client";

import { useEffect, useState } from "react";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { readEasyMode, setEasyMode } from "@/lib/easy-mode";

/** The Easy Mode switch. Rendered in Settings and in the mobile More sheet. */
export function EasyModeToggle({ compact = false }: { compact?: boolean }) {
  const { t } = useUiLang();
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(readEasyMode());
    const sync = (e: Event) => setOn(Boolean((e as CustomEvent<boolean>).detail));
    window.addEventListener("rvp:easy-mode", sync);
    return () => window.removeEventListener("rvp:easy-mode", sync);
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    setEasyMode(next);
  };

  if (compact) {
    return (
      <button
        type="button"
        className={`easy-chip${on ? " is-on" : ""}`}
        role="switch"
        aria-checked={on}
        onClick={toggle}
      >
        <span aria-hidden className="easy-chip-mark">
          A
        </span>
        {t("easy.title")}
      </button>
    );
  }

  return (
    <section className="section easy-panel">
      <h2>{t("easy.title")}</h2>
      <p className="muted">{t("easy.body")}</p>
      <button
        type="button"
        className={`easy-switch${on ? " is-on" : ""}`}
        role="switch"
        aria-checked={on}
        onClick={toggle}
      >
        <span className="easy-switch-track" aria-hidden>
          <span className="easy-switch-thumb" />
        </span>
        <span>{on ? t("easy.on") : t("easy.off")}</span>
      </button>
      <p className="muted easy-note">{t("easy.note")}</p>
    </section>
  );
}
