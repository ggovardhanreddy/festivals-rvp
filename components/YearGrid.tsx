"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";

export function YearGrid({
  years,
  counts,
}: {
  years: string[];
  counts?: Record<string, { albums: number; media: number }>;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="year-grid">
      {years.map((year, index) => {
        const meta = counts?.[year];
        return (
          <m.div
            key={year}
            initial={reduce ? false : { opacity: 1, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.05, margin: "80px 0px" }}
            transition={{ delay: index * 0.06, duration: 0.45 }}
          >
            <Link className="year-card" href={`/years/${year}/`}>
              <strong>{year}</strong>
              <p className="muted" style={{ margin: "0.35rem 0 0" }}>
                {meta
                  ? `${meta.albums} collections · ${meta.media} memories`
                  : "Open year archive"}
              </p>
            </Link>
          </m.div>
        );
      })}
    </div>
  );
}
