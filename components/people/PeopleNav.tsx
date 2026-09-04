"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/people/", prefix: "/people/", label: "People" },
  { href: "/families/", prefix: "/families/", label: "Families" },
  { href: "/families/#list", prefix: "/families/", label: "Family Trees" },
  { href: "/adapaduchulu/", prefix: "/adapaduchulu/", label: "Adapaduchulu" },
  { href: "/people/#elders", prefix: "/people/", label: "Elders & Notable People" },
  { href: "/people/#contributors", prefix: "/people/", label: "Village Contributors" },
  { href: "/stories/", prefix: "/stories/", label: "Memories & Stories" },
] as const;

export function PeopleNav() {
  const pathname = usePathname() || "/";
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;

  return (
    <nav className="people-tabs" aria-label="People sections">
      {ITEMS.map((item) => {
        const active =
          item.label === "People"
            ? normalized === "/people/" || normalized === "/members/"
            : item.label === "Elders & Notable People" ||
                item.label === "Village Contributors"
              ? normalized.startsWith("/people/") || normalized.startsWith("/members/")
              : item.label === "Families" || item.label === "Family Trees"
                ? normalized.startsWith("/families/")
                : normalized.startsWith(item.prefix);
        return (
          <Link
            key={item.label}
            href={item.href}
            className="filter-chip"
            data-active={active || undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
