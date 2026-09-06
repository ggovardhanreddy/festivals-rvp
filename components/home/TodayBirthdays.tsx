"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import type { Member } from "@/lib/types";
import { memberAge } from "@/lib/member-groups";
import { memberPhotoSrc } from "@/lib/member-image";
import { formatBirthdayLabel } from "@/lib/dates";
import { panchangHintForDob } from "@/lib/telugu-panchangam";
import { useUiLang } from "@/components/i18n/LanguageProvider";

export function TodayBirthdays({ members }: { members: Member[] }) {
  const { t } = useUiLang();
  const reduce = useReducedMotion();
  const [celebrate, setCelebrate] = useState(!reduce);
  const [panchangHint, setPanchangHint] = useState<string | null>(null);

  useEffect(() => {
    if (reduce) return;
    setCelebrate(true);
    const stop = window.setTimeout(() => setCelebrate(false), 4200);
    return () => window.clearTimeout(stop);
  }, [reduce, members]);

  useEffect(() => {
    const featuredDob = members[0]?.dob;
    if (!featuredDob) {
      setPanchangHint(null);
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      setPanchangHint(panchangHintForDob(featuredDob));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [members]);

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
          <p className="eyebrow">{t("home.today")}</p>
          <h2>Today&apos;s Birthday</h2>
          <p className="lede">{t("home.celebratingOurOwn")}</p>
        </div>
        <Link className="btn ghost" href="/events/?tab=birthdays">
          {t("home.allBirthdays")}
        </Link>
      </div>

      <article className="birthday-hero-card">
        <div
          className="birthday-hero-photo"
          data-placeholder={!featured.photo || undefined}
        >
          {featured.photo ? (
            <img
              src={memberPhotoSrc(featured.photo)}
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
          <p className="birthday-greeting">{t("home.happyBirthday")}</p>
          <h3>{featured.name}</h3>
          <p className="muted">
            {formatBirthdayLabel(featured.dob) || "Birthday celebration"}
            {memberAge(featured) != null ? ` · age ${memberAge(featured)}` : ""}
            {panchangHint ? ` · ${panchangHint}` : ""}
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
                  <p className="birthday-greeting">{t("home.happyBirthday")}</p>
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
