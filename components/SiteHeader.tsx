"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { COMMUNITY_NAV, NAV } from "@/lib/site";
import { ThemeToggle } from "./Theme";
import { Logo } from "./Logo";
import { NotificationBell } from "./notifications/NotificationBell";

function isActive(href: string, normalized: string) {
  if (href === "/") return normalized === "/";
  if (href.startsWith("/#")) return normalized === "/";
  return normalized.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    document.documentElement.classList.toggle("nav-drawer-open", open);
    return () => {
      document.body.style.overflow = "";
      document.documentElement.classList.remove("nav-drawer-open");
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    // Focus first link for keyboard / screen-reader users
    const first = drawerRef.current?.querySelector<HTMLAnchorElement>("a");
    first?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

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
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

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
              onClick={close}
            >
              {item.label}
            </Link>
          ))}
          {COMMUNITY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive(item.href, normalized)}
              onClick={close}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/timeline/" onClick={close}>
            Timeline
          </Link>
          <Link href="/fun-trips/" onClick={close}>
            Fun Fest
          </Link>
          <Link href="/search/" onClick={close}>
            Search
          </Link>
          <Link href="/settings/" onClick={close}>
            Settings
          </Link>
          <Link href="/admin/" onClick={close} className="nav-drawer-superadmin">
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
}
