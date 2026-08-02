"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { withBase } from "@/lib/base";
import type { TimelineEntry } from "@/lib/timeline";

export function HistoryTimeline({ entries }: { entries: TimelineEntry[] }) {
  const reduce = useReducedMotion();

  if (!entries.length) return null;

  return (
    <Reveal className="section home-timeline" id="timeline">
      <div className="section-head">
        <div>
          <p className="eyebrow">Our story</p>
          <h2>History timeline</h2>
          <p className="lede">
            Walk through the years that shaped Kondreddigaripalli — one memory at
            a time.
          </p>
        </div>
        <Link className="btn ghost" href="/years/">
          All years
        </Link>
      </div>

      <ol className="history-timeline" aria-label="Village history timeline">
        {entries.map((entry, index) => {
          const side = index % 2 === 0 ? "left" : "right";
          return (
            <li
              key={entry.year}
              className="history-timeline-item"
              data-side={side}
            >
              <div className="history-timeline-axis" aria-hidden>
                <span className="history-timeline-dot" />
              </div>
              <m.article
                className="history-timeline-card"
                initial={reduce ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="history-timeline-year">{entry.year}</p>
                {entry.image ? (
                  <div className="history-timeline-media">
                    <img
                      src={withBase(entry.image)}
                      alt=""
                      width={640}
                      height={400}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ) : null}
                <h3>{entry.title}</h3>
                <p className="muted">{entry.description}</p>
                <Link className="btn ghost" href={entry.href}>
                  View more
                </Link>
              </m.article>
            </li>
          );
        })}
      </ol>
    </Reveal>
  );
}
