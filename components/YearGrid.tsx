"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
export function YearGrid({ years }: { years: string[] }) {
  const reduce = useReducedMotion();
  return (
    <div className="year-grid">
      {years.map((year, index) => (
        <m.div
          key={year}
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.06, duration: 0.45 }}
        >
          <Link className="year-card" href={`/years/${year}/`}>
            <strong>{year}</strong>
            <p className="muted" style={{ margin: "0.35rem 0 0" }}>
              Open chapter
            </p>
          </Link>
        </m.div>
      ))}
    </div>
  );
}
