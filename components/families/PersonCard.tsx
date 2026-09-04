"use client";

import Link from "next/link";
import { displayStatus, personHref, verificationLabel } from "@/lib/family-trees";
import type { Person } from "@/lib/family-trees/types";

export function PersonCard({
  person,
  href,
  compact = false,
}: {
  person: Person;
  href?: string;
  compact?: boolean;
}) {
  const labels = displayStatus(person);
  const to = href ?? personHref(person);
  return (
    <Link
      href={to}
      className="ft-card"
      data-adapaduchu={person.adapaduchu || undefined}
      data-deceased={person.deceased || undefined}
      data-compact={compact || undefined}
    >
      <strong>{person.fullName}</strong>
      {labels.map((label) => (
        <span key={label}>{label}</span>
      ))}
      {person.verificationStatus !== "verified" ? (
        <span className="ft-card-verify">{verificationLabel(person.verificationStatus)}</span>
      ) : null}
    </Link>
  );
}
