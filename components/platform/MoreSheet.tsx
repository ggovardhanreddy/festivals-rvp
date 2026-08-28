"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { withLocale } from "@/lib/i18n/config";
import { isReady } from "@/lib/platform/doors";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { SectionIcon } from "./SectionIcon";
import { EasyModeToggle } from "@/components/easy/EasyModeToggle";

/**
 * Ordered by what people come here for, not alphabetically. The four
 * directories that answer a real errand come first; browsing sections follow.
 */
const SECTIONS = [
  { href: "/government/",           labelKey: "nav.government",    icon: "government" },
  { href: "/banking/",              labelKey: "banking.title",     icon: "banking" },
  { href: "/students/",             labelKey: "students.title",    icon: "students" },
  { href: "/farmers/",              labelKey: "farmers.title",     icon: "farmers" },
  { href: "/government/documents/", labelKey: "docs.title",        icon: "book" },
  { href: "/agriculture/",          labelKey: "nav.agriculture",   icon: "agriculture" },
  { href: "/kids/",                 labelKey: "nav.kids",          icon: "kids" },
  { href: "/careers/",              labelKey: "nav.careers",       icon: "careers" },
  { href: "/weather/",              labelKey: "nav.weather",       icon: "weather" },
  { href: "/safety/",               labelKey: "safety.title",      icon: "shield" },
  { href: "/emergency/",            labelKey: "emergency.title",   icon: "siren" },
  { href: "/heritage/",             labelKey: "nav.temples",       icon: "temples" },
  { href: "/members/",              labelKey: "nav.community",     icon: "community" },
  { href: "/english/",              labelKey: "nav.english",       icon: "english" },
  { href: "/it/",                   labelKey: "nav.it",            icon: "it" },
  { href: "/engineering/",          labelKey: "nav.engineering",   icon: "engineering" },
  { href: "/digital-skills/",       labelKey: "nav.digitalSkills", icon: "digital" },
];

const UTILITY = [
  { href: "/settings/", labelKey: "nav.settings" },
  { href: "/about/",    labelKey: "nav.about" },
  { href: "/contact/",  labelKey: "nav.contact" },
  { href: "/privacy/",  labelKey: "nav.privacy" },
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
                href={withLocale(s.href, lang)}
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
                <Link href={withLocale(u.href, lang)} onClick={onClose}>
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
