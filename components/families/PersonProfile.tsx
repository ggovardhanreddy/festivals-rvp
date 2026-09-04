import Link from "next/link";
import { PeopleNav } from "@/components/people/PeopleNav";
import { PersonCard } from "./PersonCard";
import {
  childrenOf,
  displayStatus,
  familyHref,
  findPerson,
  parentsOf,
  personHref,
  reddivaripalliConnection,
  spousesOf,
  verificationLabel,
} from "@/lib/family-trees";

function PeopleList({
  label,
  people,
}: {
  label: string;
  people: ReturnType<typeof parentsOf>;
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
  const person = findPerson(personId);
  if (!person) return null;
  const parents = parentsOf(person.id);
  const spouses = spousesOf(person.id);
  const children = childrenOf(person.id);
  const labels = displayStatus(person);

  return (
    <div className="person-profile">
      <PeopleNav />
      <nav className="ft-breadcrumb" aria-label="Breadcrumb">
        <Link href="/people/">People</Link>
        <span aria-hidden>/</span>
        <Link href="/families/">Village Families</Link>
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
            <dt>Family</dt>
            <dd>
              <Link href={familyHref(person.familyId)}>{person.familyBranch}</Link>
            </dd>
          </div>
          <div>
            <dt>Generation</dt>
            <dd>{person.generation}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              {person.adapaduchu && person.deceased
                ? "Adapaduchu (Married, Deceased)"
                : person.adapaduchu
                  ? "Adapaduchu (Married)"
                  : person.deceased
                    ? "Deceased"
                    : person.married
                      ? "Married"
                      : "Information not yet provided"}
            </dd>
          </div>
          <div>
            <dt>Occupation</dt>
            <dd>{person.occupation || "Information not yet provided"}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{person.location || "Information not yet provided"}</dd>
          </div>
          <div>
            <dt>Reddivaripalli Connection</dt>
            <dd>{reddivaripalliConnection(person)}</dd>
          </div>
          <div>
            <dt>Verification Status</dt>
            <dd>{verificationLabel(person.verificationStatus)}</dd>
          </div>
        </dl>

        {person.notes ? <p className="muted">{person.notes}</p> : null}

        <PeopleList label="Parents" people={parents} />
        <PeopleList label="Spouse" people={spouses} />
        <PeopleList label="Children" people={children} />

        <Link className="btn" href={`${familyHref(person.familyId)}?focus=${encodeURIComponent(person.id)}`}>
          View family tree
        </Link>
      </article>
    </div>
  );
}
