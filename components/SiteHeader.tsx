"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { m } from "framer-motion";
import { NAV, SITE_BRAND } from "@/lib/site";
import { ThemeToggle } from "./Theme";

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;

  return (
    <>
      <m.header
        className="nav"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link href="/" className="brand">
          {SITE_BRAND}
          <small>Memories</small>
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
      <nav className="mobile-nav" aria-label="Mobile">
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
