"use client";

import Link from "next/link";
import { PeopleNav } from "@/components/people/PeopleNav";
import { displayStatus, familyHref } from "@/lib/family-trees";
import { useAdapaduchulu } from "@/lib/family-trees/overlay";
import { useUiLang } from "@/components/i18n/LanguageProvider";

export function AdapaduchuluPage() {
  const { t } = useUiLang();
  const people = useAdapaduchulu();

  return (
    <div className="adapaduchulu-page">
      <PeopleNav />
      <div className="section-head">
        <div>
          <p className="eyebrow">People</p>
          <h2>{t("adapaduchulu.title")}</h2>
          <p className="lede">{t("adapaduchulu.lede")}</p>
        </div>
      </div>
      <ul className="ft-adapaduchu-list">
        {people.map((person) => (
          <li key={person.id}>
            <article className="ft-card" data-adapaduchu="true">
              <strong>{person.fullName}</strong>
              {displayStatus(person, t).map((label) => (
                <span key={label}>{label}</span>
              ))}
              <p className="muted">{person.familyBranch}</p>
              <Link className="btn ghost" href={familyHref(person.familyId)}>
                {t("adapaduchulu.viewFamily")}
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
