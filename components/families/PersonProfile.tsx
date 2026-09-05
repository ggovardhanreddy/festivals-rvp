"use client";

import Link from "next/link";
import { PeopleNav } from "@/components/people/PeopleNav";
import { PersonCard } from "./PersonCard";
import {
  displayStatus,
  familyHref,
  personHref,
  reddivaripalliConnection,
  verificationLabel,
} from "@/lib/family-trees";
import { useFamilyTreePerson } from "@/lib/family-trees/overlay";
import { useUiLang } from "@/components/i18n/LanguageProvider";

function PeopleList({
  label,
  people,
}: {
  label: string;
  people: ReturnType<typeof useFamilyTreePerson>["parents"];
}) {
  return (
    <div className="ft-profile-block">
      <h3>{label}</h3>
      {people.length ? (
        <ul className="ft-profile-people">
          {people.map((person) => (
            <li key={person.id}>
              <PersonCard person={person} href={personHref(person)} compact />
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Information not yet provided</p>
      )}
    </div>
  );
}

export function PersonProfile({ personId }: { personId: string }) {
  // Seeded from the build-time tree, so the server still renders this page in
  // full for crawlers, then replaced by the stored records once they load.
  const { t } = useUiLang();
  const { person, parents, spouses, children } = useFamilyTreePerson(personId);
  if (!person) return null;
  const labels = displayStatus(person, t);

  return (
    <div className="person-profile">
      <PeopleNav />
      <nav className="ft-breadcrumb" aria-label="Breadcrumb">
        <Link href="/people/">People</Link>
        <span aria-hidden>/</span>
        <Link href="/families/">{t("tree.villageFamilies")}</Link>
        <span aria-hidden>/</span>
        <Link href={familyHref(person.familyId)}>{person.familyBranch}</Link>
        <span aria-hidden>/</span>
        <span>{person.fullName}</span>
      </nav>

      <article className="ft-profile">
        <p className="eyebrow">{person.familyBranch}</p>
        <h1>{person.fullName}</h1>
        <ul className="ft-profile-flags">
          {labels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>

        <dl className="ft-profile-dl">
          <div>
            <dt>{t("person.family")}</dt>
            <dd>
              <Link href={familyHref(person.familyId)}>{person.familyBranch}</Link>
            </dd>
          </div>
          <div>
            <dt>{t("person.generation")}</dt>
            <dd>{person.generation}</dd>
          </div>
          <div>
            <dt>{t("person.status")}</dt>
            <dd>
              {labels[0] ?? t("person.infoNotProvided")}
            </dd>
          </div>
          <div>
            <dt>{t("person.occupation")}</dt>
            <dd>{person.occupation || "Information not yet provided"}</dd>
          </div>
          <div>
            <dt>{t("person.location")}</dt>
            <dd>{person.location || "Information not yet provided"}</dd>
          </div>
          <div>
            <dt>{t("person.connection")}</dt>
            <dd>{reddivaripalliConnection(person, t)}</dd>
          </div>
          <div>
            <dt>{t("person.verification")}</dt>
            <dd>{verificationLabel(person.verificationStatus, t)}</dd>
          </div>
        </dl>

        {person.notes ? <p className="muted">{person.notes}</p> : null}

        <PeopleList label={t("person.parents")} people={parents} />
        <PeopleList label={t("person.spouse")} people={spouses} />
        <PeopleList label={t("person.children")} people={children} />

        <Link className="btn" href={`${familyHref(person.familyId)}?focus=${encodeURIComponent(person.id)}`}>
          {t("person.viewTree")}
        </Link>
      </article>
    </div>
  );
}
