"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import {
  Award,
  Star,
  Rocket,
  Heart,
  Search,
  X,
  ExternalLink,
} from "lucide-react";
import { withBase } from "@/lib/base";
import type { Member, MemberGroup } from "@/lib/types";
import {
  MEMBER_GROUP_DESCRIPTIONS,
  MEMBER_GROUP_LABELS,
  MEMBER_GROUP_ORDER,
  isMemorial,
  memberInitials,
  resolveMemberGroup,
} from "@/lib/member-groups";
import {
  PROFESSION_LABELS,
  PROFESSION_ORDER,
  computeMemberStats,
  matchProfession,
  type ProfessionKey,
} from "@/lib/member-stats";
import { dobMonthDay, formatBirthdayLabel, monthDay } from "@/lib/dates";
import { SITE_NAME } from "@/lib/site";

const GROUP_ICONS = {
  legacy: Award,
  core: Star,
  nextgen: Rocket,
} as const;

type SortMode = "group" | "alpha";

function MemberCard({
  member,
  index,
  onOpen,
}: {
  member: Member;
  index: number;
  onOpen: (member: Member) => void;
}) {
  const reduce = useReducedMotion();
  const hasPhoto = Boolean(member.photo);
  const birthdayLabel = formatBirthdayLabel(member.dob);
  const isBirthdayToday = dobMonthDay(member.dob) === monthDay();
  const memorial = isMemorial(member);
  const group = resolveMemberGroup(member);

  return (
    <m.article
      className={`member-card${isBirthdayToday ? " is-birthday-today" : ""}${memorial ? " is-memorial" : ""}`}
      initial={reduce ? false : { opacity: 1, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05, margin: "80px 0px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.02, 0.2) }}
    >
      {memorial ? (
        <span className="member-memorial-ribbon" aria-label="In Loving Memory">
          <Heart size={12} aria-hidden /> In Loving Memory
        </span>
      ) : null}
      {isBirthdayToday && !memorial ? (
        <span className="member-bday-ribbon" aria-label="Today's Birthday">
          Today&apos;s Birthday
        </span>
      ) : null}

      <div
        className="member-card-photo"
        data-placeholder={!hasPhoto || undefined}
        data-memorial={memorial || undefined}
      >
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
            {memberInitials(member.name)}
          </div>
        )}
        <span className={`member-group-badge member-group-badge--${group}`}>
          {MEMBER_GROUP_LABELS[group]}
        </span>
      </div>

      <div className="member-card-body">
        <h3>{member.name}</h3>
        {member.designation ? (
          <p className="member-designation">{member.designation}</p>
        ) : null}
        {memorial ? (
          <p className="member-forever">Forever Remembered</p>
        ) : birthdayLabel ? (
          <p className="member-birthday">Birthday · {birthdayLabel}</p>
        ) : null}
        {!hasPhoto ? (
          <p className="member-photo-soon">Photo Coming Soon</p>
        ) : null}
        {member.social?.length ? (
          <div className="member-social-row">
            {member.social.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="member-social-link"
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          className="btn ghost member-profile-btn"
          onClick={() => onOpen(member)}
        >
          View Profile
        </button>
      </div>
    </m.article>
  );
}

function MemberProfileModal({
  member,
  onClose,
}: {
  member: Member;
  onClose: () => void;
}) {
  const titleId = useId();
  const hasPhoto = Boolean(member.photo);
  const memorial = isMemorial(member);
  const group = resolveMemberGroup(member);
  const birthdayLabel = formatBirthdayLabel(member.dob);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="member-profile-backdrop" role="presentation" onClick={onClose}>
      <div
        className={`member-profile-modal${memorial ? " is-memorial" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="icon-btn member-profile-close"
          aria-label="Close profile"
          onClick={onClose}
        >
          <X size={18} />
        </button>
        <div
          className="member-profile-photo"
          data-placeholder={!hasPhoto || undefined}
          data-memorial={memorial || undefined}
        >
          {hasPhoto ? (
            <img src={withBase(member.photo!)} alt="" width={320} height={320} />
          ) : (
            <div className="member-avatar" aria-hidden>
              {memberInitials(member.name)}
            </div>
          )}
        </div>
        <div className="member-profile-body">
          <p className={`member-group-badge member-group-badge--${group}`}>
            {MEMBER_GROUP_LABELS[group]}
          </p>
          <h2 id={titleId}>{member.name}</h2>
          {member.designation ? (
            <p className="member-designation">{member.designation}</p>
          ) : null}
          {memorial ? (
            <p className="member-forever">
              <Heart size={14} aria-hidden /> Forever Remembered
            </p>
          ) : null}
          {birthdayLabel ? (
            <p className="member-birthday">Birthday · {birthdayLabel}</p>
          ) : null}
          {!hasPhoto ? (
            <p className="member-photo-soon">Photo Coming Soon</p>
          ) : null}
          {member.achievements?.length ? (
            <div className="member-achievements">
              <p className="eyebrow">Achievements</p>
              <ul>
                {member.achievements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {member.social?.length ? (
            <div className="member-social-row">
              {member.social.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn ghost"
                >
                  {link.label} <ExternalLink size={14} aria-hidden />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function MembersGrid({
  members,
  eyebrow = "Community",
  title = "Our circles",
  lede = `Legacy Circle, Core Members, and Next Generation — the living structure of ${SITE_NAME}.`,
}: {
  members: Member[];
  eyebrow?: string;
  title?: string;
  lede?: string;
}) {
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<MemberGroup | "all">("all");
  const [profession, setProfession] = useState<ProfessionKey | "all">("all");
  const [sort, setSort] = useState<SortMode>("group");
  const [active, setActive] = useState<Member | null>(null);

  const activeMembers = useMemo(
    () => members.filter((m) => !m.archived),
    [members],
  );
  const stats = useMemo(
    () => computeMemberStats(activeMembers),
    [activeMembers],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = activeMembers.filter((m) => {
      if (groupFilter !== "all" && resolveMemberGroup(m) !== groupFilter) {
        return false;
      }
      if (profession !== "all" && !matchProfession(m.designation, profession)) {
        return false;
      }
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        (m.designation || "").toLowerCase().includes(q)
      );
    });
    if (sort === "alpha") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [activeMembers, groupFilter, profession, query, sort]);

  const groups = MEMBER_GROUP_ORDER.map((group) => ({
    group,
    label: MEMBER_GROUP_LABELS[group],
    description: MEMBER_GROUP_DESCRIPTIONS[group],
    people: filtered.filter((m) => resolveMemberGroup(m) === group),
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

      <div className="member-stats" aria-label="Community statistics">
        <div className="member-stat">
          <strong>{stats.total}</strong>
          <span>Total Members</span>
        </div>
        <div className="member-stat">
          <strong>{stats.byGroup.legacy}</strong>
          <span>Legacy Circle</span>
        </div>
        <div className="member-stat">
          <strong>{stats.byGroup.core}</strong>
          <span>Core Members</span>
        </div>
        <div className="member-stat">
          <strong>{stats.byGroup.nextgen}</strong>
          <span>Next Generation</span>
        </div>
        {PROFESSION_ORDER.map((key) => (
          <div key={key} className="member-stat member-stat--soft">
            <strong>{stats.byProfession[key]}</strong>
            <span>{PROFESSION_LABELS[key]}</span>
          </div>
        ))}
      </div>

      <div className="member-toolbar">
        <label className="member-search">
          <Search size={16} aria-hidden />
          <input
            type="search"
            placeholder="Search by name or designation…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search members"
          />
        </label>
        <label>
          Category
          <select
            value={groupFilter}
            onChange={(e) =>
              setGroupFilter(e.target.value as MemberGroup | "all")
            }
          >
            <option value="all">All categories</option>
            {MEMBER_GROUP_ORDER.map((g) => (
              <option key={g} value={g}>
                {MEMBER_GROUP_LABELS[g]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Profession
          <select
            value={profession}
            onChange={(e) =>
              setProfession(e.target.value as ProfessionKey | "all")
            }
          >
            <option value="all">All professions</option>
            {PROFESSION_ORDER.map((key) => (
              <option key={key} value={key}>
                {PROFESSION_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Order
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
          >
            <option value="group">By category</option>
            <option value="alpha">Alphabetical</option>
          </select>
        </label>
      </div>

      <p className="muted member-filter-count">
        Showing {filtered.length} of {stats.total} members
      </p>

      {sort === "alpha" ? (
        <div className="members-grid">
          {filtered.map((member, index) => (
            <MemberCard
              key={member.id}
              member={member}
              index={index}
              onOpen={setActive}
            />
          ))}
        </div>
      ) : (
        groups.map(({ group, label, description, people }) => {
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
                  <p className="members-group-desc muted">{description}</p>
                </div>
                <p
                  className="members-group-count"
                  aria-label={`${people.length} members`}
                >
                  {people.length}
                </p>
              </div>
              <div className="members-grid">
                {people.map((member, index) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    index={index}
                    onOpen={setActive}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}

      {!filtered.length ? (
        <p className="muted" style={{ marginTop: "1.5rem" }}>
          No members match your search or filters.
        </p>
      ) : null}

      {active ? (
        <MemberProfileModal member={active} onClose={() => setActive(null)} />
      ) : null}
    </section>
  );
}

export function MembersByGroup({
  members,
}: {
  group: MemberGroup;
  members: Member[];
}) {
  const [active, setActive] = useState<Member | null>(null);
  return (
    <>
      <div className="members-grid">
        {members.map((member, index) => (
          <MemberCard
            key={member.id}
            member={member}
            index={index}
            onOpen={setActive}
          />
        ))}
      </div>
      {active ? (
        <MemberProfileModal member={active} onClose={() => setActive(null)} />
      ) : null}
    </>
  );
}
