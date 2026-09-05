"use client";

import Link from "next/link";
import { PeopleNav } from "@/components/people/PeopleNav";
import { displayStatus, familyHref } from "@/lib/family-trees";
import { useAdapaduchulu } from "@/lib/family-trees/overlay";

export function AdapaduchuluPage() {
  const people = useAdapaduchulu();

  return (
    <div className="adapaduchulu-page">
      <PeopleNav />
      <div className="section-head">
        <div>
          <p className="eyebrow">People</p>
          <h2>Adapaduchulu</h2>
          <p className="lede">
            Married daughters of Reddivaripalli families. Each remains a member
            of her original parental family. Marriage adds another connection;
            it does not erase the first.
          </p>
        </div>
      </div>
      <ul className="ft-adapaduchu-list">
        {people.map((person) => (
          <li key={person.id}>
            <article className="ft-card" data-adapaduchu="true">
              <strong>{person.fullName}</strong>
              {displayStatus(person).map((label) => (
                <span key={label}>{label}</span>
              ))}
              <p className="muted">{person.familyBranch}</p>
              <Link className="btn ghost" href={familyHref(person.familyId)}>
                View Family
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
