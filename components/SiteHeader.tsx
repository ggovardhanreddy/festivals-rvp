"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Menu, Pencil, Search, X } from "lucide-react";
import { MORE_NAV, NAV } from "@/lib/site";
import { withBase } from "@/lib/base";
import { ThemeToggle } from "./Theme";
import { Logo } from "./Logo";
import { NotificationBell } from "./notifications/NotificationBell";
import { useEditMode } from "@/lib/use-super-admin";
import { useMemberAuth } from "./auth/MemberAuthProvider";
import { FunFestLoginDialog } from "./auth/FunFestLoginDialog";
import { useUiLang } from "./i18n/LanguageProvider";
import { LanguageSwitcher } from "./i18n/LanguageSwitcher";

function isActive(href: string, normalized: string) {
  if (href === "/") return normalized === "/";
  if (href.startsWith("/#")) return normalized === "/";
  // Birthday albums live under /rvp-birthdays/ but belong to Events.
  if (href === "/events/" && normalized.startsWith("/rvp-birthdays/")) {
    return true;
  }
  return normalized.startsWith(href);
}

function unlockBodyScroll() {
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
  document.documentElement.classList.remove("nav-drawer-open");
}

function isMobileShell() {
  return (
    document.documentElement.classList.contains("rvp-mobile") ||
    window.matchMedia("(max-width: 919px)").matches ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

/**
 * Site header.
 *
 * Six destinations plus More. Search is an icon, Settings lives in More, and
 * every secondary page the header used to carry is still one click away —
 * nothing was removed from the site, only from the top row.
 */
export function SiteHeader() {
  const pathname = usePathname() || "/";
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuId = useId();
  const moreId = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const { ready, isAdmin, editMode, toggleEditMode } = useEditMode();
  const { session: memberSession, ready: memberReady } = useMemberAuth();
  const { t } = useUiLang();
  const router = useRouter();
  const [funFestLoginOpen, setFunFestLoginOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onFunFestNav = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      unlockBodyScroll();
      setOpen(false);
      setMoreOpen(false);
      if (!memberReady) {
        event.preventDefault();
        return;
      }
      if (!memberSession) {
        event.preventDefault();
        setFunFestLoginOpen(true);
        return;
      }
      event.preventDefault();
      if (isMobileShell()) {
        window.setTimeout(() => {
          window.location.assign(withBase("/fun-trips/"));
        }, 0);
        return;
      }
      router.push("/fun-trips/");
    },
    [memberReady, memberSession, router],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer on route change and always restore scroll
  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
    unlockBodyScroll();
  }, [pathname]);

  // Safety: never leave body scroll locked after bfcache / history / tab return
  useEffect(() => {
    const unlock = () => {
      if (drawerRef.current?.hasAttribute("data-open")) return;
      unlockBodyScroll();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") unlock();
    };
    window.addEventListener("pageshow", unlock);
    window.addEventListener("popstate", unlock);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("pageshow", unlock);
      window.removeEventListener("popstate", unlock);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    document.documentElement.classList.toggle("nav-drawer-open", open);
    if (!open) unlockBodyScroll();
    return () => unlockBodyScroll();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        unlockBodyScroll();
        btnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    // Auto-focus first link only for keyboard users — focus can cancel taps on iOS
    if (!window.matchMedia("(pointer: coarse)").matches) {
      drawerRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    }
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Desktop "More" menu: close on Escape or a click outside.
  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [moreOpen]);

  const close = () => {
    setOpen(false);
    unlockBodyScroll();
  };
  const toggle = () => setOpen((v) => !v);

  /**
   * Hard-navigate from the drawer for Members (and always on mobile/PWA).
   * Soft nav was leaving Members blank/404 on installed apps.
   */
  const onDrawerNav = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    unlockBodyScroll();
    setOpen(false);
    const mustHard =
      isMobileShell() || href === "/members/" || href.startsWith("/members/");
    if (!mustHard) return;
    event.preventDefault();
    const target = withBase(href);
    window.setTimeout(() => {
      window.location.assign(target);
    }, 0);
  };

  const drawer = (
    <>
      <div
        className="nav-drawer-backdrop"
        data-open={open || undefined}
        aria-hidden={!open}
        onClick={close}
      />

      <div
        id={menuId}
        ref={drawerRef}
        className="nav-drawer"
        data-open={open || undefined}
        role="dialog"
        aria-modal={open || undefined}
        aria-label="Site menu"
        inert={!open}
      >
        <nav className="nav-drawer-links" aria-label="Mobile">
          <p className="nav-drawer-group">Explore</p>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive(item.href, normalized)}
              onClick={(event) => onDrawerNav(event, item.href)}
            >
              {t(item.href, item.label)}
            </Link>
          ))}

          <p className="nav-drawer-group">More</p>
          {MORE_NAV.map((item) =>
            item.href === "/fun-trips/" ? (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive(item.href, normalized)}
                onClick={onFunFestNav}
              >
                {t(item.href, item.label)}
              </Link>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive(item.href, normalized)}
                onClick={(event) => onDrawerNav(event, item.href)}
              >
                {t(item.href, item.label)}
              </Link>
            ),
          )}

          <p className="nav-drawer-group">Tools</p>
          <Link href="/search/" onClick={(event) => onDrawerNav(event, "/search/")}>
            {t("/search/")}
          </Link>
          <Link href="/settings/" onClick={(event) => onDrawerNav(event, "/settings/")}>
            {t("/settings/")}
          </Link>
          {ready && isAdmin ? (
            <button
              type="button"
              className={`btn ghost${editMode ? " is-selected" : ""}`}
              aria-pressed={editMode}
              onClick={() => {
                toggleEditMode();
                close();
              }}
            >
              {editMode ? t("exit-edit") : t("enter-edit")}
            </button>
          ) : null}
          {ready && isAdmin ? (
            <Link
              href="/admin/"
              onClick={(event) => onDrawerNav(event, "/admin/")}
              className="nav-drawer-superadmin"
            >
              {t("admin-dashboard")}
            </Link>
          ) : null}
          <button
            type="button"
            className="btn"
            onClick={() => {
              close();
              window.dispatchEvent(new CustomEvent("rvp:show-install"));
            }}
          >
            {t("install-app")}
          </button>
        </nav>
      </div>
    </>
  );

  return (
    <>
      <header className="nav nav-sticky" data-scrolled={scrolled || undefined}>
        <Link href="/" className="brand-link" aria-label="Reddivaripalli home">
          <Logo />
        </Link>

        <nav className="nav-links" aria-label={t("primary-nav")}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive(item.href, normalized)}
            >
              {t(item.href, item.label)}
            </Link>
          ))}

          <div className="nav-more" ref={moreRef}>
            <button
              type="button"
              className="nav-more-btn"
              aria-expanded={moreOpen}
              aria-controls={moreId}
              aria-haspopup="true"
              onClick={() => setMoreOpen((v) => !v)}
            >
              {t("nav.more")}
              <ChevronDown size={15} aria-hidden />
            </button>
            <div
              id={moreId}
              className="nav-more-panel"
              data-open={moreOpen || undefined}
              hidden={!moreOpen}
            >
              <ul>
                {MORE_NAV.map((item) => (
                  <li key={item.href}>
                    {item.href === "/fun-trips/" ? (
                      <Link href={item.href} onClick={onFunFestNav}>
                        {t(item.href, item.label)}
                      </Link>
                    ) : (
                      <Link
                        href={item.href}
                        data-active={isActive(item.href, normalized)}
                        onClick={() => setMoreOpen(false)}
                      >
                        {t(item.href, item.label)}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>

        <div className="nav-actions">
          <Link
            className="icon-btn nav-search-btn"
            href="/search/"
            aria-label={t("nav.search")}
            title={t("nav.search")}
          >
            <Search size={20} aria-hidden />
          </Link>
          <LanguageSwitcher className="nav-lang" />
          <NotificationBell />
          <ThemeToggle />
          {ready && isAdmin ? (
            <button
              type="button"
              className={`btn ghost nav-edit-mode-btn${editMode ? " is-active" : ""}`}
              aria-pressed={editMode}
              aria-label={editMode ? t("exit-edit") : t("enter-edit")}
              title={editMode ? t("exit-edit") : t("enter-edit")}
              onClick={toggleEditMode}
            >
              <Pencil size={14} aria-hidden />
              <span className="nav-edit-mode-label">
                {editMode ? t("editing") : t("edit-mode")}
              </span>
            </button>
          ) : null}
          {ready && isAdmin ? (
            <Link
              href="/admin/"
              className="btn ghost nav-superadmin-btn"
              aria-label={t("admin-dashboard")}
            >
              {t("admin")}
            </Link>
          ) : null}
          <button
            ref={btnRef}
            type="button"
            className="icon-btn nav-menu-btn"
            aria-label={open ? t("close-menu") : t("open-menu")}
            aria-expanded={open}
            aria-controls={menuId}
            onClick={toggle}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Portal escapes page stacking contexts so the drawer stays tappable */}
      {mounted ? createPortal(drawer, document.body) : drawer}
      <FunFestLoginDialog
        open={funFestLoginOpen}
        onClose={() => setFunFestLoginOpen(false)}
        next="/fun-trips/"
      />
    </>
  );
}
