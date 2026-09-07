"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { DIST, DUR, EASE, VIEWPORT_SAFE } from "@/components/motion/tokens";
import { withBase } from "@/lib/base";
import type { TimelineEntry } from "@/lib/timeline";
import { useUiLang } from "@/components/i18n/LanguageProvider";

export function HistoryTimeline({ entries }: { entries: TimelineEntry[] }) {
  const { t } = useUiLang();
  const reduce = useReducedMotion();

  if (!entries.length) return null;

  return (
    <Reveal className="section home-timeline" id="timeline">
      <div className="section-head">
        <div>
          <p className="eyebrow">{t("home.ourStory")}</p>
          <h2>{t("home.historyTimeline")}</h2>
          <p className="lede">
            Walk through the years that shaped Kondreddigaripalli — one memory at
            a time.
          </p>
        </div>
        <Link className="btn ghost" href="/timeline/">
          {t("home.fullTimeline")}
        </Link>
      </div>

      <ol className="history-timeline" aria-label={t("home.villageHistoryTimeline")}>
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
                /*
                 * Starts fully opaque and only moves. This card used to start
                 * at opacity 0, which meant a missed whileInView left a piece
                 * of the village's history permanently invisible -- the one
                 * failure mode the rest of the motion system is built to
                 * avoid. VIEWPORT_SAFE also triggers earlier, because a tall
                 * card with an image can otherwise clear the old 25%
                 * threshold late.
                 */
                initial={reduce ? false : { opacity: 1, y: DIST.mid }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT_SAFE}
                transition={{
                  duration: DUR.reveal,
                  // Entries unfold one after another rather than together, and
                  // the delay is capped so a long history never leaves the
                  // last event waiting.
                  delay: Math.min(index, 5) * 0.1,
                  ease: EASE,
                }}
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
                  {t("home.viewMore")}
                </Link>
              </m.article>
            </li>
          );
        })}
      </ol>
    </Reveal>
  );
}
