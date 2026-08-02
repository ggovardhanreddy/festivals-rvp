"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { m } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV } from "@/lib/site";
import { ThemeToggle } from "./Theme";
import { Logo } from "./Logo";
import { NotificationBell } from "./notifications/NotificationBell";
import { useMemberAuth } from "./auth/MemberAuthProvider";

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
  const { session, logout, ready } = useMemberAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <m.header
        className="nav nav-sticky"
        data-scrolled={scrolled || undefined}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
          {ready && session ? (
            <>
              <Link href="/chat/" className="btn ghost nav-auth-btn">
                Chat
              </Link>
              <button
                type="button"
                className="btn ghost nav-auth-btn"
                onClick={logout}
                title={`Signed in as ${session.username}`}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login/" className="btn ghost nav-auth-btn">
              Sign in
            </Link>
          )}
          <NotificationBell />
          <ThemeToggle />
          <button
            type="button"
            className="icon-btn nav-menu-btn"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </m.header>

      <div
        className="nav-drawer"
        data-open={open || undefined}
        aria-hidden={!open}
      >
        <nav className="nav-drawer-links" aria-label="Mobile">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive(item.href, normalized)}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/search/" onClick={() => setOpen(false)}>
            Search
          </Link>
          <Link href="/settings/" onClick={() => setOpen(false)}>
            Settings
          </Link>
          {ready && session ? (
            <Link href="/chat/" onClick={() => setOpen(false)}>
              Chat
            </Link>
          ) : null}
        </nav>
      </div>
    </>
  );
}
