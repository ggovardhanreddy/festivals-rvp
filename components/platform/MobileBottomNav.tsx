"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, CalendarDays, Images, Search, Menu } from "lucide-react";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { stripLocale } from "@/lib/i18n/config";
import { navHref } from "@/lib/routes/registry";
import { MoreSheet } from "./MoreSheet";

/**
 * Four fixed destinations plus More. These mirror the header's priorities —
 * Learn and Play moved into the More sheet, where every other section already
 * lives, so the bar reflects what this site is for.
 */
const ITEMS = [
  { id: "home",   href: "/",         labelKey: "nav.home",       Icon: Home },
  { id: "events", href: "/events/",  labelKey: "nav.eventsShort", Icon: CalendarDays },
  { id: "gallery", href: "/gallery/", labelKey: "nav.gallery",   Icon: Images },
  { id: "search", href: "/search/",  labelKey: "nav.search",     Icon: Search },
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
                  href={navHref(href, lang)}
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
