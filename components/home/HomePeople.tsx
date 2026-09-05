"use client";

import Link from "next/link";
import type { Member } from "@/lib/types";
import { memberPhotoSrc } from "@/lib/member-image";
import { memberInitials, resolveMemberGroup } from "@/lib/member-groups";
import { publishedMembers, rosterStats } from "@/lib/people-stats";
import { useUiLang } from "@/components/i18n/LanguageProvider";

export function HomePeople({ members }: { members: Member[] }) {
  const { t } = useUiLang();
  // publishedMembers, not a bare !archived filter: retired ids in
  // members-removed.json must drop out here too, or the homepage advertises a
  // total the People page does not list.
  const living = publishedMembers(members);
  const stats = rosterStats(members);
  const shown = living
    .sort((a, b) => {
      const order = { legacy: 0, core: 1, nextgen: 2 } as const;
      return order[resolveMemberGroup(a)] - order[resolveMemberGroup(b)];
    })
    .slice(0, 6);

  if (!shown.length) return null;

  return (
    <section className="section home-people" aria-labelledby="home-people-heading">
      <div className="home-section-head">
        <div>
          <p className="eyebrow">{t("home.eyebrow.people")}</p>
          <h2 id="home-people-heading">{t("home.ourPeople")}</h2>
          <p className="muted">
            {stats.total === 1
              ? t("people.rosterCountOne")
              : t("people.rosterCount", undefined, { count: stats.total })}
          </p>
        </div>
        <Link className="btn ghost" href="/people/">
          {t("home.meetOurPeople")} <span aria-hidden>→</span>
        </Link>
      </div>
      <ul className="home-people-grid">
        {shown.map((member) => (
          <li key={member.id}>
            <Link className="home-person-card" href="/people/">
              <span
                className="home-person-photo"
                data-placeholder={!member.photo || undefined}
              >
                {member.photo ? (
                  <img
                    src={memberPhotoSrc(member.photo)}
                    alt=""
                    width={160}
                    height={160}
                    loading="lazy"
                  />
                ) : (
                  <span aria-hidden>{memberInitials(member.name)}</span>
                )}
              </span>
              <strong>{member.name}</strong>
              {member.designation ? (
                <span className="muted">{member.designation}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
