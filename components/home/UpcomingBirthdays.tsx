"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Member } from "@/lib/types";
import { formatBirthdayLabel, formatCountdown } from "@/lib/dates";
import { memberAge } from "@/lib/member-groups";
import { memberPhotoSrc } from "@/lib/member-image";
import { daysUntilNextBirthday } from "@/lib/member-birthdays";
import { panchangHintForDob } from "@/lib/telugu-panchangam";
import { useUiLang } from "@/components/i18n/LanguageProvider";

export function UpcomingBirthdays({
  members,
  limit = 8,
}: {
  members: Member[];
  limit?: number;
}) {
  const { t } = useUiLang();
  const upcoming = members
    .filter((m) => m.dob)
    .map((member) => ({
      member,
      days: daysUntilNextBirthday(member.dob!),
    }))
    .filter((x) => x.days > 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, limit);

  const [hints, setHints] = useState<Record<string, string>>({});
  const upcomingKey = upcoming.map((x) => x.member.id).join("|");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const next: Record<string, string> = {};
      for (const { member } of upcoming) {
        const hint = panchangHintForDob(member.dob);
        if (hint) next[member.id] = hint;
      }
      setHints(next);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [upcomingKey, upcoming]);

  if (!upcoming.length) {
    return (
      <section className="section home-birthdays-upcoming" id="upcoming-birthdays">
        <div className="section-head">
          <div>
            <p className="eyebrow">{t("home.birthdaysHeading")}</p>
            <h2>{t("home.upcomingBirthdays")}</h2>
            <p className="lede muted">
              {t("home.birthdaysEmpty")}
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
          <p className="eyebrow">{t("home.birthdaysHeading")}</p>
          <h2>{t("home.upcomingBirthdays")}</h2>
          <p className="lede">{t("home.nextCelebrations")}</p>
        </div>
        <Link className="btn ghost" href="/events/?tab=birthdays">
          {t("home.allBirthdays")}
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
                    src={memberPhotoSrc(member.photo)}
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
                  {hints[member.id] ? ` · ${hints[member.id]}` : ""}
                </p>
                {!hasPhoto ? (
                  <p className="member-photo-soon">{t("home.photoSoon")}</p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
