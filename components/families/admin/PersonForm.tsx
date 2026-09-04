"use client";

/**
 * The person editor. §2, §3, §10, §11, §12.
 *
 * Every field the brief lists, plus admin-defined custom fields, plus media
 * assignment. Three things it deliberately does NOT have:
 *
 *  - No surname field. §2 says family membership must not be determined by
 *    one, and the reliable way to honour that is to give nobody the option.
 *  - No caste field, label, heading, filter or grouping. §18.
 *  - No generation input. It is computed from the relationships on every
 *    save, so a number typed here could only ever disagree with the tree.
 *    The current value is shown, read-only, so the admin can see it.
 */
import { useEffect, useState } from "react";
import type {
  CustomField,
  Family,
  Gender,
  Person,
  VerificationStatus,
} from "@/lib/family-trees/entities";

export type PersonDraft = Partial<Person> & { fullName: string; familyId: string };

const GENDERS: { value: Gender; label: string }[] = [
  { value: "unspecified", label: "Not specified" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
];

const VERIFICATION: { value: VerificationStatus; label: string }[] = [
  { value: "needs-verification", label: "Needs Verification" },
  { value: "verified", label: "Verified" },
  { value: "incomplete", label: "Information not yet provided" },
];

export function PersonForm({
  person,
  families,
  title,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  person?: Person;
  families: Family[];
  title: string;
  submitLabel: string;
  onSubmit: (draft: PersonDraft) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<PersonDraft>(() => ({
    fullName: person?.fullName ?? "",
    familyId: person?.familyId ?? families[0]?.id ?? "",
    photo: person?.photo ?? null,
    gender: person?.gender ?? "unspecified",
    status: person?.status ?? "",
    occupation: person?.occupation ?? "",
    location: person?.location ?? "",
    adapaduchu: person?.adapaduchu ?? false,
    deceased: person?.deceased ?? false,
    married: person?.married ?? false,
    notes: person?.notes ?? "",
    privateNotes: person?.privateNotes ?? "",
    verificationStatus: person?.verificationStatus ?? "needs-verification",
    customFields: person?.customFields ?? [],
  }));

  useEffect(() => {
    setDraft({
      fullName: person?.fullName ?? "",
      familyId: person?.familyId ?? families[0]?.id ?? "",
      photo: person?.photo ?? null,
      gender: person?.gender ?? "unspecified",
      status: person?.status ?? "",
      occupation: person?.occupation ?? "",
      location: person?.location ?? "",
      adapaduchu: person?.adapaduchu ?? false,
      deceased: person?.deceased ?? false,
      married: person?.married ?? false,
      notes: person?.notes ?? "",
    privateNotes: person?.privateNotes ?? "",
      verificationStatus: person?.verificationStatus ?? "needs-verification",
      customFields: person?.customFields ?? [],
    });
  }, [person, families]);

  const set = <K extends keyof PersonDraft>(key: K, value: PersonDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const fields = draft.customFields ?? [];
  const setFields = (next: CustomField[]) => set("customFields", next);

  const canSubmit = draft.fullName.trim().length > 0 && Boolean(draft.familyId);

  return (
    <form
      className="ft-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit({
          ...draft,
          fullName: draft.fullName.trim(),
          status: draft.status?.trim() || null,
          occupation: draft.occupation?.trim() || null,
          location: draft.location?.trim() || null,
          notes: draft.notes?.trim() || null,
          privateNotes: draft.privateNotes?.trim() || null,
          customFields: fields.filter((f) => f.name.trim() && f.value.trim()),
        });
      }}
    >
      <h3 className="ft-form-title">{title}</h3>

      <label className="ft-field">
        <span>
          Full name <em>required</em>
        </span>
        <input
          type="text"
          value={draft.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          autoFocus
          required
        />
      </label>

      <label className="ft-field">
        <span>Family</span>
        <select value={draft.familyId} onChange={(e) => set("familyId", e.target.value)}>
          {families.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        <small>
          Family membership is set here and nowhere else — never guessed from a name.
        </small>
      </label>

      <div className="ft-field-row">
        <label className="ft-field">
          <span>Occupation</span>
          <input
            type="text"
            value={draft.occupation ?? ""}
            onChange={(e) => set("occupation", e.target.value)}
          />
        </label>
        <label className="ft-field">
          <span>Location</span>
          <input
            type="text"
            value={draft.location ?? ""}
            onChange={(e) => set("location", e.target.value)}
          />
        </label>
      </div>

      <div className="ft-field-row">
        <label className="ft-field">
          <span>Status</span>
          <input
            type="text"
            value={draft.status ?? ""}
            onChange={(e) => set("status", e.target.value)}
            placeholder="e.g. Married, Unmarried"
          />
        </label>
        <label className="ft-field">
          <span>Gender</span>
          <select
            value={draft.gender ?? "unspecified"}
            onChange={(e) => set("gender", e.target.value as Gender)}
          >
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="ft-field-row">
        <label className="ft-field ft-field--check">
          <input
            type="checkbox"
            checked={Boolean(draft.adapaduchu)}
            onChange={(e) => set("adapaduchu", e.target.checked)}
          />
          <span>
            Adapaduchu
            <small>
              Shows publicly as{" "}
              <strong>
                {draft.deceased ? "Adapaduchu (Married, Deceased)" : "Adapaduchu (Married)"}
              </strong>
              . She stays in this parental family tree.
            </small>
          </span>
        </label>
        <label className="ft-field ft-field--check">
          <input
            type="checkbox"
            checked={Boolean(draft.deceased)}
            onChange={(e) => set("deceased", e.target.checked)}
          />
          <span>Deceased</span>
        </label>
      </div>

      <label className="ft-field">
        <span>Verification</span>
        <select
          value={draft.verificationStatus ?? "needs-verification"}
          onChange={(e) => set("verificationStatus", e.target.value as VerificationStatus)}
        >
          {VERIFICATION.map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          ))}
        </select>
      </label>

      <label className="ft-field">
        <span>Photo URL</span>
        <input
          type="text"
          value={draft.photo ?? ""}
          onChange={(e) => set("photo", e.target.value || null)}
          placeholder="/images/… or an R2 URL"
        />
        <small>
          Paste a path, or pick one from the Media panel. A photo is never matched to a
          person automatically.
        </small>
      </label>

      {/*
        Two note fields, not one with a checkbox.
        §17 withholds private notes from the public site, and the surest way to
        honour that is to make the admin choose the box as they type, rather
        than rely on remembering to tick something afterwards.
      */}
      <label className="ft-field">
        <span>
          Public note <em>visible to everyone</em>
        </span>
        <textarea
          rows={2}
          value={draft.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
        />
        <small>
          Shown on this person&rsquo;s public page. Use it for a disclosure a
          visitor should see, e.g. &ldquo;children not listed under this
          couple&rdquo;.
        </small>
      </label>

      <label className="ft-field">
        <span>
          Private note <em>admin only</em>
        </span>
        <textarea
          rows={3}
          value={draft.privateNotes ?? ""}
          onChange={(e) => set("privateNotes", e.target.value)}
        />
        <small>
          Never leaves the admin area &mdash; not in the page, not in the
          source. Use it for who told you something, or what still needs
          checking.
        </small>
      </label>

      {/* §10 — new information without a code change. */}
      <fieldset className="ft-custom-fields">
        <legend>Additional information</legend>
        {fields.length === 0 ? (
          <p className="muted">
            Nothing yet. Add a field for anything the form above does not cover.
          </p>
        ) : null}
        {fields.map((field, i) => (
          <div className="ft-custom-row" key={field.id}>
            <input
              type="text"
              aria-label="Field name"
              placeholder="Field name"
              value={field.name}
              onChange={(e) => {
                const next = [...fields];
                next[i] = { ...field, name: e.target.value };
                setFields(next);
              }}
            />
            <input
              type="text"
              aria-label="Field value"
              placeholder="Value"
              value={field.value}
              onChange={(e) => {
                const next = [...fields];
                next[i] = { ...field, value: e.target.value };
                setFields(next);
              }}
            />
            <label className="ft-custom-public">
              <input
                type="checkbox"
                checked={field.isPublic !== false}
                onChange={(e) => {
                  const next = [...fields];
                  next[i] = { ...field, isPublic: e.target.checked };
                  setFields(next);
                }}
              />
              Public
            </label>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setFields(fields.filter((f) => f.id !== field.id))}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn"
          onClick={() =>
            setFields([
              ...fields,
              { id: `cf-${Date.now()}-${fields.length}`, name: "", value: "", isPublic: true },
            ])
          }
        >
          + Add field
        </button>
      </fieldset>

      {person ? (
        <p className="ft-form-meta">
          Generation {person.generation} — computed from the relationships, not typed.
        </p>
      ) : null}

      <div className="ft-form-actions">
        <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
          {submitLabel}
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
