/**
 * The family-tree entity model, §16.
 *
 * Six entities, stored explicitly: Family, Person, Relationship, Media,
 * CustomField and AuditLog. They live in content/data/*.json and are written
 * through /api/families/, which is the same shape the rest of this site uses
 * for members, directory, events and developments — a committed JSON file as
 * the reviewed source of truth, plus an R2 overlay the admin writes at runtime
 * so a correction does not wait for a deploy.
 *
 * Two rules the types themselves enforce:
 *
 * 1. A relationship is a ROW, never a guess. §4 forbids inferring relatedness
 *    from surname, initials, similar names, caste, location, occupation or
 *    photographs, so there is no code path that derives one — every edge in
 *    every tree exists because someone created it and it carries who and when.
 *
 * 2. Nothing crosses a family boundary by accident. §19 lists thirteen
 *    branches that must stay separate; `familyId` is required on Person, and
 *    a cross-family relationship has to be created deliberately and is
 *    flagged so it shows up in review.
 *
 * Client-safe: no node imports.
 */

export type VerificationStatus = "verified" | "needs-verification" | "incomplete";

/** §16. `child` is stored as the inverse of `parent`, both rows written. */
export type RelationshipType = "parent" | "child" | "spouse";

/** Optional and never required. §2 says gender only "if required". */
export type Gender = "male" | "female" | "other" | "unspecified";

/**
 * A person.
 *
 * `familyId` is mandatory — §16 — and is the ONLY thing that decides family
 * membership. §2 is explicit that a surname must not determine it, which is
 * why there is no surname field to be tempted by.
 */
export type Person = {
  id: string;
  fullName: string;
  familyId: string;
  /** Denormalised family name, for display. Derived, never authoritative. */
  familyBranch?: string;
  photo: string | null;
  gender?: Gender;
  /** Free text, e.g. "Married", "Unmarried". Not a controlled vocabulary. */
  status?: string | null;
  occupation: string | null;
  location: string | null;
  /** 1 = the branch root. Recomputed from relationships on every save. */
  generation: number;
  adapaduchu: boolean;
  deceased: boolean;
  married: boolean;
  /**
   * A public caption, shown on the person's page.
   *
   * This is where a genuine public disclosure belongs — "children not listed
   * under this couple", "exact relationship not yet confirmed". It is rendered
   * on the public site, so it must never hold anything private.
   */
  notes: string | null;
  /**
   * Admin-only working notes. §17: "The public page must NOT expose ...
   * Private notes."
   *
   * Stripped by publicFamilyTreeDataset() before anything public sees the
   * dataset. Kept a separate field from `notes` rather than a flag, so that
   * making a note private can never be forgotten — the admin picks the box.
   */
  privateNotes?: string | null;
  verificationStatus: VerificationStatus;
  /** §10. Admin-defined name/value pairs, no code change needed. */
  customFields?: CustomField[];
  /** §11. Media ids assigned to this person. */
  mediaIds?: string[];
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * An explicit relationship row.
 *
 * §16 names the fields, and this uses them. The older seed model called these
 * personId/relatedPersonId; `loadRelationships` accepts both so the migration
 * cannot lose an edge.
 */
export type Relationship = {
  id: string;
  fromPersonId: string;
  toPersonId: string;
  relationshipType: RelationshipType;
  verificationStatus: VerificationStatus;
  /** §16's "metadata if required" — e.g. { adopted: true }. */
  metadata?: Record<string, string | number | boolean | null>;
  /** True when the two people are in different families. Deliberate only. */
  crossFamily?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

/** §9's editable family. Matches content/data/families.json as it already is. */
export type Family = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  history?: string | null;
  coverPhoto?: string | null;
  displayOrder: number;
  isPublished: boolean;
  /** Branch roots. Derived when absent: people with no parent in the family. */
  rootPersonIds?: string[];
  customFields?: CustomField[];
  createdAt?: string;
  updatedAt?: string;
};

/** §10. */
export type CustomField = {
  id: string;
  name: string;
  value: string;
  /** §17: a private field is admin-only, like notes. */
  isPublic?: boolean;
};

/**
 * §11. A media record, assigned deliberately.
 *
 * §11 forbids assigning a photo to a person by filename or visual similarity,
 * so there is no matcher here — `personId` and `familyId` are set by whoever
 * assigned it, and that is the only way an image reaches a person.
 */
export type Media = {
  id: string;
  url: string;
  caption?: string | null;
  /** §17: private media is never rendered on the public page. */
  isPublic: boolean;
  personId?: string | null;
  familyId?: string | null;
  uploadedBy?: string | null;
  createdAt?: string;
};

/** §15. Written before the change is applied, never after. */
export type AuditLog = {
  id: string;
  at: string;
  /** Who. From the admin session, not from the client. */
  actor: string;
  action: "create" | "update" | "delete" | "restore";
  entity: "family" | "person" | "relationship" | "media" | "custom-field";
  entityId: string;
  /** The field that changed, when the change is a field edit. */
  field?: string;
  previousValue?: unknown;
  newValue?: unknown;
  /** A human sentence, for the history panel. */
  summary: string;
};

export type FamilyTreeDataset = {
  families: Family[];
  people: Person[];
  relationships: Relationship[];
  media: Media[];
  audit: AuditLog[];
};

/** ------------------------------------------------------------- helpers */

export function relationshipId(
  type: RelationshipType,
  from: string,
  to: string,
): string {
  return `${type}:${from}:${to}`;
}

/**
 * The inverse of a relationship type.
 *
 * Stored in both directions on purpose: a tree is walked downward from a
 * parent and upward from a child, and deriving one direction from the other at
 * read time is how an orphaned edge survives a delete unnoticed.
 */
export function inverseType(type: RelationshipType): RelationshipType {
  if (type === "parent") return "child";
  if (type === "child") return "parent";
  return "spouse";
}

/** §8. The only public rendering of adapaduchu. Never "- A". */
export function adapaduchuLabel(person: Pick<Person, "adapaduchu" | "deceased">): string | null {
  if (!person.adapaduchu) return null;
  return person.deceased ? "Adapaduchu (Married, Deceased)" : "Adapaduchu (Married)";
}

export function verificationLabel(status: VerificationStatus): string {
  if (status === "needs-verification") return "Needs Verification";
  if (status === "incomplete") return "Information not yet provided";
  return "Verified";
}

/** A stable id from a display name, for newly created people. */
export function personIdFrom(fullName: string, existing: Set<string>): string {
  const base =
    fullName
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "person";
  if (!existing.has(base)) return base;
  for (let n = 2; n < 500; n += 1) {
    const candidate = `${base}-${n}`;
    if (!existing.has(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}
