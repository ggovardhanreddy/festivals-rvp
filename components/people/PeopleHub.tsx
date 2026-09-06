"use client";

import Link from "next/link";
import type { DirectoryEntry, Member } from "@/lib/types";
import { isMemorial, resolveMemberGroup } from "@/lib/member-groups";
import { dobMonthDay, formatBirthdayLabel } from "@/lib/dates";
import { memberPhotoSrc } from "@/lib/member-image";
import { loadVillageHeritage } from "@/lib/village-heritage";
import { SITE_CONTACT_EMAIL } from "@/lib/site";
import { PeopleNav } from "./PeopleNav";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { allPeople } from "@/lib/family-trees";
import { publishedMembers, villagePeopleStats } from "@/lib/people-stats";

function PersonChip({
  name,
  role,
  photo,
}: {
  name: string;
  role?: string;
  photo?: string | null;
}) {
  return (
    <article className="people-chip">
      <div className="people-chip-photo" data-placeholder={!photo || undefined}>
        {photo ? (
          <img src={memberPhotoSrc(photo)} alt="" width={72} height={72} />
        ) : (
          <span aria-hidden>{name.replace(/^Dr\.?\s+/i, "").slice(0, 1)}</span>
        )}
      </div>
      <div>
        <strong>{name}</strong>
        {role ? <p className="muted">{role}</p> : null}
      </div>
    </article>
  );
}

export function PeopleHub({
  members,
  directory,
}: {
  members: Member[];
  directory: DirectoryEntry[];
}) {
  const { t } = useUiLang();
  const heritage = loadVillageHeritage();
  const living = publishedMembers(members);
  const directoryPeople = allPeople();
  // Two populations, counted once, named apart. The member roster and the
  // family-tree records are different sets of people and were previously both
  // described as "the directory".
  const stats = villagePeopleStats(members, directoryPeople);
  const elders = living.filter((m) => resolveMemberGroup(m) === "legacy");
  const contributors = living.filter((m) => resolveMemberGroup(m) === "core");
  const withBirthday = living
    .filter((m) => m.dob && formatBirthdayLabel(m.dob))
    .sort((a, b) => (dobMonthDay(a.dob) || "").localeCompare(dobMonthDay(b.dob) || ""));

  return (
    <div className="people-hub">
      <p className="muted" style={{ marginBottom: "1.25rem" }}>
        Names and photographs are shared for public remembrance. Phone numbers
        and home addresses are not shown. To correct or remove a listing, email{" "}
        <a
          href={`mailto:${SITE_CONTACT_EMAIL}?subject=${encodeURIComponent("Request to correct or remove personal information")}`}
        >
          {SITE_CONTACT_EMAIL}
        </a>
        .
      </p>
      <PeopleNav />
      <p className="muted" style={{ marginBottom: "1.5rem" }}>
        {stats.roster.total === 1
          ? t("people.rosterCountOne")
          : t("people.rosterCount", undefined, { count: stats.roster.total })}
        {" · "}
        {t("people.treeCount", undefined, { count: stats.tree.people })}
        {" · "}
        {t("people.adapaduchuCount", undefined, {
          count: stats.tree.adapaduchulu,
        })}
        {". "}
        {t("people.countsNote")}
      </p>

      <section className="section" id="elders">
        <div className="section-head">
          <div>
            <p className="eyebrow">{t("people.eldersEyebrow")}</p>
            <h2>{t("people.eldersHeading")}</h2>
            <p className="lede">
              Senior members of Reddivaripalli, remembered with the legends who
              shaped the village.
            </p>
          </div>
        </div>
        <div className="people-chip-grid">
          {elders.map((m) => (
            <PersonChip
              key={m.id}
              name={m.name}
              role={m.designation}
              photo={m.photo}
            />
          ))}
        </div>
        <div className="stories-grid" style={{ marginTop: "1.5rem" }}>
          <article className="story-card">
            <p className="eyebrow">{heritage.memorial.founder.role}</p>
            <h3>{heritage.memorial.founder.name}</h3>
            <p>{heritage.memorial.founder.bio}</p>
          </article>
          <article className="story-card">
            <p className="eyebrow">{heritage.memorial.successor.role}</p>
            <h3>{heritage.memorial.successor.name}</h3>
            <p>{heritage.memorial.successor.bio}</p>
          </article>
        </div>
        {heritage.memorial.legends?.length ? (
          <div className="story-names">
            <h3>{heritage.memorial.legendsTitle}</h3>
            <ul>
              {heritage.memorial.legends.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {heritage.memorial.foreverRemembered.length ? (
          <div className="story-names">
            <h3>{heritage.memorial.foreverRememberedTitle}</h3>
            <ul>
              {heritage.memorial.foreverRemembered.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {living.filter(isMemorial).length ? (
          <div className="people-chip-grid" style={{ marginTop: "1.5rem" }}>
            {living.filter(isMemorial).map((m) => (
              <PersonChip
                key={m.id}
                name={m.name}
                role="Forever remembered"
                photo={m.photo}
              />
            ))}
          </div>
        ) : null}
      </section>

      <section className="section" id="contributors">
        <div className="section-head">
          <div>
            <p className="eyebrow">{t("people.contributorsEyebrow")}</p>
            <h2>{t("people.contributorsHeading")}</h2>
            <p className="lede">
              Neighbours who organise festivals, support development, and keep
              Reddivaripalli’s daily life going.
            </p>
          </div>
        </div>
        <div className="people-chip-grid">
          {contributors.map((m) => (
            <PersonChip
              key={m.id}
              name={m.name}
              role={m.designation}
              photo={m.photo}
            />
          ))}
        </div>
      </section>

      <section className="section" id="professionals">
        <div className="section-head">
          <div>
            <p className="eyebrow">{t("people.workOfVillage")}</p>
            <h2>{t("people.professionals")}</h2>
            <p className="lede">{heritage.professionals.lede}</p>
          </div>
        </div>
        <div className="village-heritage-professionals">
          {heritage.professionals.groups.map((group) => (
            <article key={group.name} className="village-heritage-panel">
              <h3>{group.name}</h3>
              <ul>
                {group.people.map((person) => (
                  <li key={`${group.name}-${person.name}`}>
                    <strong>{person.name}</strong>
                    {person.role ? (
                      <span className="muted"> — {person.role}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        {directory.length ? (
          <>
            <h3 className="village-heritage-subhead">{t("people.directory")}</h3>
            <p className="muted">
              Public roles only — phone numbers and private addresses are not
              shown.
            </p>
            <div className="people-chip-grid">
              {directory.map((entry) => (
                <PersonChip
                  key={entry.id}
                  name={entry.name}
                  role={entry.designation || entry.profession}
                  photo={entry.photo}
                />
              ))}
            </div>
          </>
        ) : null}
      </section>

      <section className="section" id="birthdays">
        <div className="section-head">
          <div>
            <p className="eyebrow">{t("people.birthdaysEyebrow")}</p>
            <h2>{t("people.birthdays")}</h2>
          </div>
        </div>
        {withBirthday.length ? (
          <ul className="people-birthday-list">
            {withBirthday.map((m) => (
              <li key={m.id}>
                <strong>{m.name}</strong>
                <span className="muted">{formatBirthdayLabel(m.dob)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">{t("people.noBirthdays")}</p>
        )}
        <Link className="btn ghost" href="/rvp-birthdays/">
          {t("people.birthdayPhotos")}
        </Link>
      </section>
    </div>
  );
}
