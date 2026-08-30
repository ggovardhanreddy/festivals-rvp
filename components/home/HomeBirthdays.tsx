"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Member } from "@/lib/types";
import { formatBirthdayLabel } from "@/lib/dates";
import { memberPhotoSrc } from "@/lib/member-image";
import { daysUntilNextBirthday } from "@/lib/member-birthdays";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

/**
 * The next four birthdays, today's included.
 *
 * Sorted by days-to-go in the village's timezone, so someone whose birthday is
 * today leads the list instead of being counted as 365 days away. The complete
 * list stays on Events & Birthdays.
 */
export function HomeBirthdays({
  members,
  limit = 4,
}: {
  members: Member[];
  limit?: number;
}) {
  const upcoming = useMemo(
    () =>
      members
        .filter((m) => m.dob)
        .map((member) => ({ member, days: daysUntilNextBirthday(member.dob!) }))
        .filter((x) => Number.isFinite(x.days))
        .sort((a, b) => a.days - b.days || a.member.name.localeCompare(b.member.name))
        .slice(0, limit),
    [members, limit],
  );

  return (
    <section
      className="home-panel home-birthdays"
      aria-labelledby="home-birthdays-heading"
    >
      <p className="eyebrow">Celebrations</p>
      <h2 id="home-birthdays-heading">Upcoming Birthdays</h2>

      {upcoming.length ? (
        <ul className="home-birthday-list">
          {upcoming.map(({ member, days }) => {
            const label = formatBirthdayLabel(member.dob);
            return (
              <li key={member.id} className="home-birthday" data-today={days === 0 || undefined}>
                <span className="home-birthday-photo" data-placeholder={!member.photo || undefined}>
                  {member.photo ? (
                    <img
                      src={memberPhotoSrc(member.photo)}
                      alt={member.name}
                      width={96}
                      height={96}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="member-avatar" aria-hidden>
                      {initials(member.name)}
                    </span>
                  )}
                </span>
                <span className="home-birthday-body">
                  <span className="home-birthday-name">{member.name}</span>
                  <span className="home-birthday-date muted">
                    {label || "Date to be confirmed"}
                  </span>
                </span>
                {days === 0 ? (
                  <span className="home-birthday-today">Today</span>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="home-empty">
          Birthday dates appear here as they are added for each member.
        </p>
      )}

      <div className="home-panel-actions">
        <Link className="btn ghost" href="/events/?tab=birthdays">
          View All Birthdays <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
