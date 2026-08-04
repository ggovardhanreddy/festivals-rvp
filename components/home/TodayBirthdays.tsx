"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { withBase } from "@/lib/base";
import type { Member } from "@/lib/types";
import { memberAge } from "@/lib/member-groups";
import { formatBirthdayLabel } from "@/lib/dates";

export function TodayBirthdays({ members }: { members: Member[] }) {
  const reduce = useReducedMotion();
  const [celebrate, setCelebrate] = useState(!reduce);

  useEffect(() => {
    if (reduce) return;
    setCelebrate(true);
    const stop = window.setTimeout(() => setCelebrate(false), 4200);
    return () => window.clearTimeout(stop);
  }, [reduce, members]);

  if (!members.length) return null;

  const featured = members[0]!;

  return (
    <section
      className={`section home-birthdays birthday-celebrate${celebrate ? " is-celebrating" : ""}`}
      id="todays-birthdays"
    >
      {celebrate ? (
        <div className="birthday-confetti" aria-hidden>
          {Array.from({ length: 18 }, (_, i) => (
            <span key={i} style={{ "--i": i } as CSSProperties} />
          ))}
        </div>
      ) : null}
      <div className="section-head">
        <div>
          <p className="eyebrow">Today</p>
          <h2>Today&apos;s Birthday</h2>
          <p className="lede">Celebrating our own — with love from the village.</p>
        </div>
        <Link className="btn ghost" href="/rvp-birthdays/">
          Birthday gallery
        </Link>
      </div>

      <article className="birthday-hero-card">
        <div
          className="birthday-hero-photo"
          data-placeholder={!featured.photo || undefined}
        >
          {featured.photo ? (
            <img
              src={withBase(featured.photo)}
              alt={featured.name}
              width={280}
              height={280}
            />
          ) : (
            <span className="member-avatar" aria-hidden>
              {featured.name
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
          <p className="birthday-greeting">Happy Birthday!</p>
          <h3>{featured.name}</h3>
          <p className="muted">
            {formatBirthdayLabel(featured.dob) || "Birthday celebration"}
            {memberAge(featured) != null ? ` · age ${memberAge(featured)}` : ""}
          </p>
          <p className="lede">
            May this year bring health, joy, and every blessing — from all of us
            in Kondreddigaripalli.
          </p>
        </div>
      </article>

      {members.length > 1 ? (
        <div className="birthday-strip">
          {members.slice(1).map((member) => {
            const hasPhoto = Boolean(member.photo);
            const age = memberAge(member);
            const label = formatBirthdayLabel(member.dob);
            return (
              <article key={member.id} className="birthday-card is-today">
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
                  <p className="birthday-greeting">Happy Birthday!</p>
                  <p className="muted">
                    {label || "Birthday celebration"}
                    {age != null ? ` · age ${age}` : ""}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
