"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import { NAV } from "@/lib/site";
import { ThemeToggle } from "./Theme";
import { Logo } from "./Logo";

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const reduce = useReducedMotion();
  const [hidden, setHidden] = useState(false);
  const [ready, setReady] = useState(pathname !== "/");

  useEffect(() => {
    if (pathname !== "/") {
      const frame = window.requestAnimationFrame(() => setReady(true));
      return () => window.cancelAnimationFrame(frame);
    }
    setReady(false);
    const reveal = () => setReady(true);
    window.addEventListener("rvp:intro-chrome", reveal);
    window.addEventListener("rvp:intro-complete", reveal);
    if (reduce) {
      const frame = window.requestAnimationFrame(reveal);
      return () => {
        window.cancelAnimationFrame(frame);
        window.removeEventListener("rvp:intro-chrome", reveal);
        window.removeEventListener("rvp:intro-complete", reveal);
      };
    }
    return () => {
      window.removeEventListener("rvp:intro-chrome", reveal);
      window.removeEventListener("rvp:intro-complete", reveal);
    };
  }, [pathname, reduce]);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > last && y > 120) setHidden(true);
      else setHidden(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <m.header
        className="nav nav-floating"
        initial={{ y: -24, opacity: 0 }}
        animate={{
          y: hidden ? -110 : 0,
          opacity: ready ? 1 : 0,
          pointerEvents: ready ? "auto" : "none",
        }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link href="/" className="brand-link" aria-label="RVP Youth home">
          <Logo />
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? normalized === "/"
                : normalized.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} data-active={active}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
        </div>
      </m.header>
      <nav
        className="mobile-nav"
        aria-label="Mobile"
        style={{ opacity: ready ? 1 : 0, pointerEvents: ready ? "auto" : "none" }}
      >
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? normalized === "/"
              : normalized.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} data-active={active}>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
