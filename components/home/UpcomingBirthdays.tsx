"use client";

import Link from "next/link";
import { withBase } from "@/lib/base";
import type { Member } from "@/lib/types";
import { formatBirthdayLabel, formatCountdown } from "@/lib/dates";
import { memberAge } from "@/lib/member-groups";
import { daysUntilNextBirthday } from "@/lib/member-birthdays";

export function UpcomingBirthdays({
  members,
  limit = 8,
}: {
  members: Member[];
  limit?: number;
}) {
  const upcoming = members
    .filter((m) => m.dob)
    .map((member) => ({
      member,
      days: daysUntilNextBirthday(member.dob!),
    }))
    .filter((x) => x.days > 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, limit);

  if (!upcoming.length) {
    return (
      <section className="section home-birthdays-upcoming" id="upcoming-birthdays">
        <div className="section-head">
          <div>
            <p className="eyebrow">Birthdays</p>
            <h2>Upcoming birthdays</h2>
            <p className="lede muted">
              Birthday dates will appear here as they are added for each member.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section home-birthdays-upcoming" id="upcoming-birthdays">
      <div className="section-head">
        <div>
          <p className="eyebrow">Birthdays</p>
          <h2>Upcoming birthdays</h2>
          <p className="lede">Next celebrations in our community.</p>
        </div>
        <Link className="btn ghost" href="/members/">
          All members
        </Link>
      </div>
      <div className="birthday-strip">
        {upcoming.map(({ member, days }) => {
          const hasPhoto = Boolean(member.photo);
          const label = formatBirthdayLabel(member.dob);
          const age = memberAge(member);
          return (
            <article key={member.id} className="birthday-card">
              <div
                className="birthday-card-photo"
                data-placeholder={!hasPhoto || undefined}
              >
                {hasPhoto ? (
                  <img
                    src={withBase(member.photo!)}
                    alt={member.name}
                    width={120}
                    height={120}
                    loading="lazy"
                  />
                ) : (
                  <span className="member-avatar" aria-hidden>
                    {member.name
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h3>{member.name}</h3>
                <p className="eyebrow">{formatCountdown(days)}</p>
                <p className="muted">
                  {label || "Birthday not available"}
                  {age != null ? ` · turns ${age + 1}` : ""}
                </p>
                {!hasPhoto ? (
                  <p className="member-photo-soon">Photo Coming Soon</p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
