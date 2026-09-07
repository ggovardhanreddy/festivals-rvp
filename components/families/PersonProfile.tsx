"use client";

import { useMemo } from "react";

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
import { useCommunityList } from "@/lib/use-community";
import { memberPhotoSrc } from "@/lib/member-image";
import { ProtectedMedia } from "@/components/media/ProtectedMedia";
import { FadeUp, ImageReveal, StaggerChildren, StaggerItem, DIST } from "@/components/motion";
import type { Member } from "@/lib/types";
import membersSeed from "@/content/data/members.json";

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

const MEMBER_SEED = membersSeed as Member[];

export function PersonProfile({ personId }: { personId: string }) {
  // Seeded from the build-time tree, so the server still renders this page in
  // full for crawlers, then replaced by the stored records once they load.
  const { t } = useUiLang();
  const { person, parents, spouses, children } = useFamilyTreePerson(personId);
  /**
   * A portrait, where one exists.
   *
   * No tree record carries a photo of its own -- all 266 are without one --
   * but 35 of the 39 members do, and the family tree has always borrowed them
   * by id. This page never did, so a person with a perfectly good photograph
   * had a profile with no face on it. Nothing is invented: this is the same
   * photo the same person already has as a member, and anyone without one
   * simply gets no portrait rather than a placeholder silhouette.
   */
  const { items: members } = useCommunityList<Member>("members", MEMBER_SEED);
  const portrait = useMemo(() => {
    if (!person) return null;
    const match = members.find((member) => member.id === person.id);
    return memberPhotoSrc(person.photo ?? match?.photo ?? null);
  }, [members, person]);

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
        {portrait ? (
          <ImageReveal className="ft-profile-portrait">
            <ProtectedMedia>
              <img
                src={portrait}
                alt={`${person.fullName}`}
                width={480}
                height={480}
                loading="eager"
                draggable={false}
              />
            </ProtectedMedia>
          </ImageReveal>
        ) : null}

        {/*
          Text rises further than the portrait -- 45px against 30px -- so the
          two arrive at slightly different speeds and the page has a sense of
          depth without anything actually moving very far.
        */}
        <FadeUp distance={DIST.far} delay={0.1}>
          <p className="eyebrow">{person.familyBranch}</p>
          <h1>{person.fullName}</h1>
        </FadeUp>

        <StaggerChildren as="ul" className="ft-profile-flags" delay={0.2}>
          {labels.map((label) => (
            <StaggerItem as="li" key={label}>
              {label}
            </StaggerItem>
          ))}
        </StaggerChildren>

        <FadeUp as="div" delay={0.15}>
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
        </FadeUp>

        {person.notes ? <p className="muted">{person.notes}</p> : null}

        {/* Relationships last: the person, then their facts, then their family. */}
        <FadeUp delay={0.05}>
          <PeopleList label={t("person.parents")} people={parents} />
        </FadeUp>
        <FadeUp delay={0.1}>
          <PeopleList label={t("person.spouse")} people={spouses} />
        </FadeUp>
        <FadeUp delay={0.15}>
          <PeopleList label={t("person.children")} people={children} />
        </FadeUp>

        <Link className="btn" href={`${familyHref(person.familyId)}?focus=${encodeURIComponent(person.id)}`}>
          {t("person.viewTree")}
        </Link>
      </article>
    </div>
  );
}
