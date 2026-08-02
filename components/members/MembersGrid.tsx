"use client";

import { m, useReducedMotion } from "framer-motion";
import { Award, Star, Rocket } from "lucide-react";
import { withBase } from "@/lib/base";
import type { Member, MemberGroup } from "@/lib/types";
import {
  MEMBER_GROUP_AGE_HINT,
  MEMBER_GROUP_DESCRIPTIONS,
  MEMBER_GROUP_LABELS,
  MEMBER_GROUP_ORDER,
  memberAge,
  resolveMemberGroup,
} from "@/lib/member-groups";
import { dobMonthDay, formatBirthdayLabel, monthDay } from "@/lib/dates";
import { SITE_NAME } from "@/lib/site";

const GROUP_ICONS = {
  legacy: Award,
  core: Star,
  nextgen: Rocket,
} as const;

function MemberCard({ member, index }: { member: Member; index: number }) {
  const reduce = useReducedMotion();
  const hasPhoto = Boolean(member.photo);
  const birthdayLabel = formatBirthdayLabel(member.dob);
  const age = memberAge(member);
  const isBirthdayToday = dobMonthDay(member.dob) === monthDay();
  return (
    <m.article
      className={`member-card${isBirthdayToday ? " is-birthday-today" : ""}`}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.03, 0.3) }}
    >
      <div className="member-card-photo" data-placeholder={!hasPhoto || undefined}>
        {hasPhoto ? (
          <img
            src={withBase(member.photo!)}
            alt={member.name}
            width={400}
            height={400}
            loading="lazy"
          />
        ) : (
          <div className="member-avatar" aria-hidden>
            {member.name
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0])
              .join("")
              .toUpperCase()}
          </div>
        )}
      </div>
      <div className="member-card-body">
        <h3>{member.name}</h3>
        {member.designation ? (
          <p className="muted">{member.designation}</p>
        ) : null}
        {member.joinYear ? (
          <p className="member-join-year">Joined {member.joinYear}</p>
        ) : null}
        <p className="member-birthday">
          {birthdayLabel
            ? `Birthday · ${birthdayLabel}`
            : "Birthday not available"}
          {age != null ? ` · age ${age}` : ""}
        </p>
        {!hasPhoto ? (
          <p className="member-photo-soon">Photo will be added soon.</p>
        ) : null}
      </div>
    </m.article>
  );
}

export function MembersGrid({
  members,
  eyebrow = SITE_NAME,
  title = "Members",
  lede = "Legacy Circle, Core Members, and NextGen — the people who keep Kondreddigaripalli celebrations alive.",
}: {
  members: Member[];
  eyebrow?: string;
  title?: string;
  lede?: string;
}) {
  const groups = MEMBER_GROUP_ORDER.map((group) => ({
    group,
    label: MEMBER_GROUP_LABELS[group],
    description: MEMBER_GROUP_DESCRIPTIONS[group],
    ageHint: MEMBER_GROUP_AGE_HINT[group],
    people: members.filter((m) => resolveMemberGroup(m) === group),
  })).filter((g) => g.people.length);

  return (
    <section className="section members-section" id="members">
      {(eyebrow || title || lede) && (
        <div className="section-head">
          <div>
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            {title ? <h2>{title}</h2> : null}
            {lede ? <p className="lede">{lede}</p> : null}
          </div>
        </div>
      )}
      {groups.map(({ group, label, description, ageHint, people }) => {
        const Icon = GROUP_ICONS[group];
        return (
          <div
            key={group}
            className="members-group"
            data-group={group}
            id={`members-${group}`}
          >
            <div className="members-group-head">
              <div className="members-group-icon" aria-hidden>
                <Icon size={22} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="members-group-title">{label}</h3>
                <p className="members-group-age muted">{ageHint}</p>
                <p className="members-group-desc muted">{description}</p>
              </div>
              <p className="members-group-count" aria-label={`${people.length} members`}>
                {people.length}
              </p>
            </div>
            <div className="members-grid">
              {people.map((member, index) => (
                <MemberCard key={member.id} member={member} index={index} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

export function MembersByGroup({
  members,
}: {
  group: MemberGroup;
  members: Member[];
}) {
  return (
    <div className="members-grid">
      {members.map((member, index) => (
        <MemberCard key={member.id} member={member} index={index} />
      ))}
    </div>
  );
}
