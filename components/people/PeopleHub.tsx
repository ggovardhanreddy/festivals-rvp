"use client";

import Link from "next/link";
import type { DirectoryEntry, Member } from "@/lib/types";
import { isMemorial, resolveMemberGroup } from "@/lib/member-groups";
import { dobMonthDay, formatBirthdayLabel } from "@/lib/dates";
import { memberPhotoSrc } from "@/lib/member-image";
import { loadVillageHeritage } from "@/lib/village-heritage";
import { SITE_CONTACT_EMAIL } from "@/lib/site";
import { PeopleNav } from "./PeopleNav";
import { allPeople, adapaduchulu } from "@/lib/family-trees";
import { publishedMembers } from "@/lib/member-stats";

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
  const heritage = loadVillageHeritage();
  const living = publishedMembers(members);
  const directoryPeople = allPeople();
  const adapaduchuCount = adapaduchulu(directoryPeople).length;
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
        {living.length} {living.length === 1 ? "person" : "people"} in the
        directory · {directoryPeople.length} family members · {adapaduchuCount}{" "}
        Adapaduchulu. Counts come from the current records, not a fixed number.
      </p>

      <section className="section" id="elders">
        <div className="section-head">
          <div>
            <p className="eyebrow">Respected across generations</p>
            <h2>Elders & Notable People</h2>
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
            <p className="eyebrow">Service to the village</p>
            <h2>Village Contributors</h2>
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
            <p className="eyebrow">Work of the village</p>
            <h2>Professionals</h2>
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
            <h3 className="village-heritage-subhead">Village directory</h3>
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
            <p className="eyebrow">Celebrated among us</p>
            <h2>Birthdays</h2>
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
          <p className="muted">No public birthdays have been shared yet.</p>
        )}
        <Link className="btn ghost" href="/rvp-birthdays/">
          Birthday photographs
        </Link>
      </section>
    </div>
  );
}
