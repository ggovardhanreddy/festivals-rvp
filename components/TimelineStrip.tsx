"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { Reveal } from "./Reveal";

export function TimelineStrip({ years }: { years: string[] }) {
  const reduce = useReducedMotion();

  return (
    <Reveal className="section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Timeline</p>
          <h2>Years that still speak</h2>
        </div>
        <Link className="btn ghost" href="/timeline/">
          Full timeline
        </Link>
      </div>
      <ol className="timeline-strip timeline-3d" aria-label="Years">
        {years.map((year, index) => (
          <li key={year}>
            <m.div
              whileHover={reduce ? undefined : { y: -8, rotateX: 6, scale: 1.04 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <Link href={`/years/${year}/`} className="timeline-year glass-year">
                <span>{year}</span>
              </Link>
            </m.div>
            {index < years.length - 1 && (
              <span className="timeline-arrow" aria-hidden>
                ↓
              </span>
            )}
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
