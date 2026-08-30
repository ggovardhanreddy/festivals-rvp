"use client";

import { useMemo } from "react";
import type { Announcement } from "@/lib/types";
import { daysUntil, formatEventDate } from "@/lib/dates";
import { useLiveAnnouncements } from "@/lib/live-calendar";

/**
 * Every published village update, newest first.
 *
 * The homepage shows the latest one and links here. Nothing is generated: if
 * the announcement feed is empty this section does not render.
 */
export function VillageUpdatesList({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const live = useLiveAnnouncements(announcements);
  const items = useMemo(() => {
    const source = live.length ? live : announcements;
    return source
      .filter((a) => a.title && (!a.date || daysUntil(a.date) <= 0))
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [live, announcements]);

  if (!items.length) return null;

  return (
    <section className="section village-updates" id="updates" aria-labelledby="village-updates-heading">
      <div className="section-head">
        <div>
          <p className="eyebrow">Notices</p>
          <h2 id="village-updates-heading">Village Updates</h2>
          <p className="lede">Announcements from the Gram Panchayat and RVP Youth.</p>
        </div>
      </div>
      <ul className="village-update-list">
        {items.map((item) => (
          <li key={item.id} data-important={item.important || undefined}>
            <article>
              <h3>{item.title}</h3>
              {item.date ? (
                <p className="muted">{formatEventDate(item.date)}</p>
              ) : null}
              {item.body ? <p>{item.body}</p> : null}
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
