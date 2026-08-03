"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Menu, Pencil, X } from "lucide-react";
import { COMMUNITY_NAV, NAV } from "@/lib/site";
import { withBase } from "@/lib/base";
import { ThemeToggle } from "./Theme";
import { Logo } from "./Logo";
import { NotificationBell } from "./notifications/NotificationBell";
import { useEditMode } from "@/lib/use-super-admin";

function isActive(href: string, normalized: string) {
  if (href === "/") return normalized === "/";
  if (href.startsWith("/#")) return normalized === "/";
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

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuId = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const { ready, isAdmin, editMode, toggleEditMode } = useEditMode();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer on route change and always restore scroll
  useEffect(() => {
    setOpen(false);
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

  const close = () => {
    setOpen(false);
    unlockBodyScroll();
  };
  const toggle = () => setOpen((v) => !v);

  /**
   * Mobile/PWA: hard-navigate from the drawer.
   * Soft nav + inert/pointer-events races were leaving pages blank/stuck.
   */
  const onDrawerNav = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    unlockBodyScroll();
    setOpen(false);
    if (!isMobileShell()) return;
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
        aria-hidden={!open}
        role="dialog"
        aria-modal={open || undefined}
        aria-label="Site menu"
      >
        <nav className="nav-drawer-links" aria-label="Mobile">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive(item.href, normalized)}
              onClick={(event) => onDrawerNav(event, item.href)}
            >
              {item.label}
            </Link>
          ))}
          {COMMUNITY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive(item.href, normalized)}
              onClick={(event) => onDrawerNav(event, item.href)}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/timeline/" onClick={(event) => onDrawerNav(event, "/timeline/")}>
            Timeline
          </Link>
          <Link href="/fun-trips/" onClick={(event) => onDrawerNav(event, "/fun-trips/")}>
            Fun Fest
          </Link>
          <Link href="/search/" onClick={(event) => onDrawerNav(event, "/search/")}>
            Search
          </Link>
          <Link href="/settings/" onClick={(event) => onDrawerNav(event, "/settings/")}>
            Settings
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
              {editMode ? "Exit Edit Mode" : "Enter Edit Mode"}
            </button>
          ) : null}
          <Link
            href="/admin/"
            onClick={(event) => onDrawerNav(event, "/admin/")}
            className="nav-drawer-superadmin"
          >
            Super Admin Login
          </Link>
          <button
            type="button"
            className="btn"
            onClick={() => {
              close();
              window.dispatchEvent(new CustomEvent("rvp:show-install"));
            }}
          >
            Install App
          </button>
        </nav>
      </div>
    </>
  );

  return (
    <>
      <header
        className="nav nav-sticky"
        data-scrolled={scrolled || undefined}
      >
        <Link href="/" className="brand-link" aria-label="RVP Youth home">
          <Logo />
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive(item.href, normalized)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <NotificationBell />
          <ThemeToggle />
          {ready && isAdmin ? (
            <button
              type="button"
              className={`btn ghost nav-edit-mode-btn${editMode ? " is-active" : ""}`}
              aria-pressed={editMode}
              aria-label={editMode ? "Turn off Edit Mode" : "Turn on Edit Mode"}
              onClick={toggleEditMode}
            >
              <Pencil size={14} aria-hidden />
              {editMode ? "Editing" : "Edit Mode"}
            </button>
          ) : null}
          <Link
            href="/admin/"
            className="btn ghost nav-superadmin-btn"
            aria-label="Super Admin login"
          >
            Super Admin
          </Link>
          <button
            ref={btnRef}
            type="button"
            className="icon-btn nav-menu-btn"
            aria-label={open ? "Close menu" : "Open menu"}
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
    </>
  );
}
