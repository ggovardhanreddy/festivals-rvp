"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, BookOpen, Gamepad2, Search, Menu } from "lucide-react";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { stripLocale, withLocale } from "@/lib/i18n/config";
import { MoreSheet } from "./MoreSheet";

const ITEMS = [
  { id: "home",   href: "/",        labelKey: "nav.home",   Icon: Home },
  { id: "learn",  href: "/learn/",  labelKey: "nav.learn",  Icon: BookOpen },
  { id: "play",   href: "/play/",   labelKey: "nav.play",   Icon: Gamepad2 },
  { id: "search", href: "/search/", labelKey: "nav.search", Icon: Search },
] as const;

/**
 * Fixed bottom navigation. Five targets, never more.
 *
 * `body` gets a matching bottom padding class so the bar can never cover the
 * end of a page, and the bar respects env(safe-area-inset-bottom) for the
 * iPhone home indicator.
 */
export function MobileBottomNav() {
  const pathname = usePathname() || "/";
  const canonical = stripLocale(pathname);
  const { t, lang } = useUiLang();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add("has-bottom-nav");
    return () => document.body.classList.remove("has-bottom-nav");
  }, []);

  useEffect(() => setMoreOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === "/" ? canonical === "/" : canonical.startsWith(href);

  return (
    <>
      <nav className="bottom-nav" aria-label={t("nav.primary")}>
        <ul>
          {ITEMS.map(({ id, href, labelKey, Icon }) => {
            const active = isActive(href);
            return (
              <li key={id}>
                <Link
                  href={withLocale(href, lang)}
                  data-active={active || undefined}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={22} aria-hidden />
                  <span>{t(labelKey)}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              data-active={moreOpen || undefined}
              aria-expanded={moreOpen}
              aria-haspopup="dialog"
              onClick={() => setMoreOpen((v) => !v)}
            >
              <Menu size={22} aria-hidden />
              <span>{t("nav.more")}</span>
            </button>
          </li>
        </ul>
      </nav>
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
