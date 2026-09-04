"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { navHref } from "@/lib/routes/registry";
import { isReady } from "@/lib/platform/doors";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { SectionIcon } from "./SectionIcon";
import { EasyModeToggle } from "@/components/easy/EasyModeToggle";

/**
 * Ordered by village life first. General knowledge sections are intentionally
 * absent — they remain at their old URLs but are no longer part of the public
 * village identity.
 */
const SECTIONS = [
  { href: "/about/",        labelKey: "nav.ourVillage",       icon: "temples" },
  { href: "/people/",      labelKey: "nav.people",           icon: "community" },
  { href: "/temples/",      labelKey: "nav.templesFestivals", icon: "temples" },
  { href: "/developments/", labelKey: "nav.developments",     icon: "engineering" },
  { href: "/gallery/",      labelKey: "nav.gallery",          icon: "gallery" },
  { href: "/stories/",      labelKey: "nav.stories",          icon: "book" },
  { href: "/contact/",      labelKey: "nav.contact",          icon: "community" },
  { href: "/government/",   labelKey: "nav.government",       icon: "government" },
  { href: "/suggestions/",  labelKey: "nav.suggestions",      icon: "book" },
  { href: "/weather/",      labelKey: "nav.weather",          icon: "weather" },
  { href: "/safety/",       labelKey: "safety.title",         icon: "shield" },
];

const UTILITY = [
  { href: "/settings/", labelKey: "nav.settings" },
  { href: "/privacy/",  labelKey: "nav.privacy" },
  { href: "/terms/",    labelKey: "nav.terms" },
];

export function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useUiLang();
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  useEffect(() => { mounted.current = true; }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const sheet = (
    <>
      <div className="more-backdrop" data-open={open || undefined} aria-hidden="true" onClick={onClose} />
      <div
        ref={ref}
        className="more-sheet"
        data-open={open || undefined}
        role="dialog"
        aria-modal={open || undefined}
        aria-label={t("nav.more")}
        inert={!open}
      >
        <div className="more-sheet-handle" aria-hidden />
        <ul className="more-grid">
          {SECTIONS.map((s) => (
            <li key={s.href}>
              <Link
                href={navHref(s.href, lang)}
                onClick={onClose}
                data-pending={isReady(s.href) ? undefined : true}
              >
                <SectionIcon name={s.icon} size={22} />
                <span>{t(s.labelKey)}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="more-utility">
          <LanguageSwitcher />
          <EasyModeToggle compact />
          <ul>
            {UTILITY.map((u) => (
              <li key={u.href}>
                <Link href={navHref(u.href, lang)} onClick={onClose}>
                  {t(u.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );

  if (typeof document === "undefined") return null;
  return createPortal(sheet, document.body);
}
