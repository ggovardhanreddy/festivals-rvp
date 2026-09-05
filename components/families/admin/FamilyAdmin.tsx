"use client";

/**
 * The admin family area. §9, §14, §20.
 *
 * A family picker on the left, the visual editor on the right. Picking a
 * family is a URL-free switch on purpose: §20 asks for one page that edits
 * everything, and a page reload between families would lose unsaved work.
 *
 * The family form (§9) sits above the tree rather than on a separate screen,
 * because family metadata and family membership are the same job.
 */
import { useMemo, useState } from "react";
import type { CustomField, Family, FamilyTreeDataset } from "@/lib/family-trees/entities";
import { fetchStoredAudit, mergeAudit } from "@/lib/family-trees/audit-client";
import {
  addFamily,
  deleteFamily,
  reorderFamilies,
  setCustomFields,
  updateFamily,
} from "@/lib/family-trees/mutate";
import { FamilyTreeEditor } from "./FamilyTreeEditor";
import { FamiliesManager } from "@/components/admin/FamiliesManager";
import { useStoredFamilyTreeDataset } from "@/lib/family-trees/overlay";

export function FamilyAdmin({
  dataset: seed,
  actor,
}: {
  dataset: FamilyTreeDataset;
  actor: string;
}) {
  // The prop is the build-time copy. What the admin must see and edit is what
  // is actually stored, so the editor waits for it rather than opening on a
  // snapshot that may be several corrections out of date.
  const { dataset, ready } = useStoredFamilyTreeDataset(seed);
  const ordered = useMemo(
    () => [...dataset.families].sort((a, b) => a.displayOrder - b.displayOrder),
    [dataset.families],
  );
  const [familyId, setFamilyId] = useState(ordered[0]?.id ?? "");
  const [tab, setTab] = useState<"tree" | "family" | "families" | "bulk">("tree");

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const person of dataset.people) {
      map.set(person.familyId, (map.get(person.familyId) ?? 0) + 1);
    }
    return map;
  }, [dataset.people]);

  const family = ordered.find((f) => f.id === familyId);

  return (
    <div className="ft-admin">
      <aside className="ft-admin-side">
        <h3>Families</h3>
        <ul className="ft-admin-family-list">
          {ordered.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                className={f.id === familyId ? "is-active" : ""}
                onClick={() => {
                  setFamilyId(f.id);
                  setTab("tree");
                }}
              >
                <span className="ft-admin-family-name">{f.name}</span>
                <span className="ft-admin-family-count">
                  {counts.get(f.id) ?? 0}
                  {f.isPublished ? "" : " · draft"}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="muted">
          These thirteen branches stay separate. Nothing merges them because two
          names look alike — only a relationship you create deliberately links
          two families.
        </p>
      </aside>

      <div className="ft-admin-main">
        <nav className="admin-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "tree"}
            className={tab === "tree" ? "is-active" : ""}
            onClick={() => setTab("tree")}
          >
            Edit Family Tree
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "family"}
            className={tab === "family" ? "is-active" : ""}
            onClick={() => setTab("family")}
          >
            Family Details
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "families"}
            className={tab === "families" ? "is-active" : ""}
            onClick={() => setTab("families")}
          >
            All Families
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "bulk"}
            className={tab === "bulk" ? "is-active" : ""}
            onClick={() => setTab("bulk")}
          >
            Bulk assign
          </button>
        </nav>

        {tab === "tree" && family && !ready ? (
          <p className="muted">Loading the stored tree…</p>
        ) : null}

        {tab === "tree" && family && ready ? (
          <FamilyTreeEditor
            key={family.id}
            initialDataset={dataset}
            familyId={family.id}
            actor={actor}
            previewHref={`/families/${family.slug}/`}
          />
        ) : null}

        {tab === "family" && family ? (
          <FamilyDetails family={family} dataset={dataset} actor={actor} />
        ) : null}

        {tab === "families" ? (
          <AllFamilies dataset={dataset} actor={actor} counts={counts} />
        ) : null}

        {/* Kept from the earlier admin: reassigning many people at once is
            genuinely faster than moving them one by one in the tree. It is a
            tool on this page, not a separate interface. */}
        {tab === "bulk" ? (
          <div className="ft-admin-bulk">
            <p className="muted">
              For correcting many people at once. The tree above is the normal
              way to work; this is the shortcut when a whole group sits in the
              wrong branch.
            </p>
            <FamiliesManager />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** §9 — everything about one family. */
function FamilyDetails({
  family,
  dataset,
  actor,
}: {
  family: Family;
  dataset: FamilyTreeDataset;
  actor: string;
}) {
  const [draft, setDraft] = useState<Family>(family);
  const [fields, setFields] = useState<CustomField[]>(family.customFields ?? []);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Family>(key: K, value: Family[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const save = async () => {
    setState("saving");
    setError(null);
    try {
      const withFamily = updateFamily(dataset, actor, family.id, draft);
      const withFields = setCustomFields(withFamily.dataset, actor, { familyId: family.id }, fields);
      const audit = [...withFields.audit, ...withFamily.audit];
      const res = await fetch("/api/community/families?admin=1", {
        method: "PUT",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: withFields.dataset.families }),
      });
      if (!res.ok) throw new Error(`${res.status} ${await res.text().catch(() => "")}`);
      if (audit.length > 0) {
        // Stored history is read back here, not taken from the prop: the
        // dataset is built with an empty audit array so the log never lands
        // in the public static /admin/index.html (§17).
        const stored = await fetchStoredAudit();
        await fetch("/api/community/family-audit?admin=1", {
          method: "PUT",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            items: mergeAudit(audit, [...dataset.audit, ...stored]),
          }),
        });
      }
      setState("saved");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <form
      className="ft-form ft-form--wide"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <h3 className="ft-form-title">{family.name}</h3>

      <div className="ft-field-row">
        <label className="ft-field">
          <span>Family name</span>
          <input type="text" value={draft.name} onChange={(e) => set("name", e.target.value)} required />
        </label>
        <label className="ft-field">
          <span>Slug</span>
          <input type="text" value={draft.slug} onChange={(e) => set("slug", e.target.value)} required />
          <small>The public URL: /families/{draft.slug}/</small>
        </label>
      </div>

      <label className="ft-field">
        <span>Description</span>
        <textarea
          rows={3}
          value={draft.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
        />
      </label>

      <label className="ft-field">
        <span>Family history</span>
        <textarea
          rows={6}
          value={draft.history ?? ""}
          onChange={(e) => set("history", e.target.value)}
        />
      </label>

      <div className="ft-field-row">
        <label className="ft-field">
          <span>Cover photo</span>
          <input
            type="text"
            value={draft.coverPhoto ?? ""}
            onChange={(e) => set("coverPhoto", e.target.value || null)}
            placeholder="/images/…"
          />
        </label>
        <label className="ft-field">
          <span>Display order</span>
          <input
            type="number"
            min={1}
            value={draft.displayOrder}
            onChange={(e) => set("displayOrder", Number(e.target.value) || 1)}
          />
        </label>
      </div>

      <label className="ft-field ft-field--check">
        <input
          type="checkbox"
          checked={draft.isPublished}
          onChange={(e) => set("isPublished", e.target.checked)}
        />
        <span>
          Published
          <small>Unpublished families are hidden from the public site entirely.</small>
        </span>
      </label>

      <fieldset className="ft-custom-fields">
        <legend>Additional information</legend>
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
            setFields([...fields, { id: `cf-${Date.now()}`, name: "", value: "", isPublic: true }])
          }
        >
          + Add field
        </button>
      </fieldset>

      {state === "saved" ? <p className="ft-editor-ok">Saved.</p> : null}
      {error ? <p className="ft-editor-error">{error}</p> : null}

      <div className="ft-form-actions">
        <button type="submit" className="btn btn-primary" disabled={state === "saving"}>
          {state === "saving" ? "Saving…" : "Save family"}
        </button>
        <a className="btn" href={`/families/${family.slug}/`} target="_blank" rel="noopener">
          Preview ↗
        </a>
      </div>
    </form>
  );
}

/** §9 — add, reorder, delete. */
function AllFamilies({
  dataset,
  actor,
  counts,
}: {
  dataset: FamilyTreeDataset;
  actor: string;
  counts: Map<string, number>;
}) {
  const [families, setFamilies] = useState<Family[]>(
    [...dataset.families].sort((a, b) => a.displayOrder - b.displayOrder),
  );
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const persist = async (next: Family[]) => {
    setFamilies(next);
    await fetch("/api/community/families?admin=1", {
      method: "PUT",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: next }),
    }).catch(() => setMessage("Could not save — check the connection."));
  };

  const move = (id: string, delta: number) => {
    const index = families.findIndex((f) => f.id === id);
    const target = index + delta;
    if (index === -1 || target < 0 || target >= families.length) return;
    const next = [...families];
    const [row] = next.splice(index, 1);
    next.splice(target, 0, row!);
    const result = reorderFamilies({ ...dataset, families: next }, actor, next.map((f) => f.id));
    void persist([...result.dataset.families].sort((a, b) => a.displayOrder - b.displayOrder));
  };

  return (
    <section className="ft-form ft-form--wide">
      <h3 className="ft-form-title">All families</h3>
      {message ? <p className="ft-editor-error">{message}</p> : null}
      <ol className="ft-family-order">
        {families.map((f, i) => (
          <li key={f.id}>
            <span className="ft-family-order-name">
              {f.name}
              <small>
                {counts.get(f.id) ?? 0} people{f.isPublished ? "" : " · unpublished"}
              </small>
            </span>
            <span className="ft-family-order-tools">
              <button type="button" className="btn ghost" onClick={() => move(f.id, -1)} disabled={i === 0}>
                ↑
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() => move(f.id, 1)}
                disabled={i === families.length - 1}
              >
                ↓
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  const result = deleteFamily({ ...dataset, families }, actor, f.id);
                  if (result.refused) {
                    setMessage(result.refused);
                    return;
                  }
                  if (!window.confirm(`Delete the empty family "${f.name}"?`)) return;
                  void persist(result.dataset.families);
                  setMessage(`Deleted ${f.name}.`);
                }}
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ol>

      <div className="ft-field-row">
        <label className="ft-field">
          <span>New family name</span>
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} />
        </label>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!newName.trim()}
          onClick={() => {
            const result = addFamily({ ...dataset, families }, actor, { name: newName.trim() });
            void persist(result.dataset.families);
            setNewName("");
            setMessage("Family added, unpublished. Add people to it, then publish.");
          }}
        >
          + Add family
        </button>
      </div>
      <p className="muted">
        A family with people in it cannot be deleted — move them somewhere else
        first. That is deliberate: a delete that orphaned thirty people would be
        the worst button on this page.
      </p>
    </section>
  );
}
