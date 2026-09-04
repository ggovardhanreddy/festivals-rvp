"use client";

/**
 * The admin family-tree editor. §1 and §20.
 *
 * The tree IS the interface. §20 is explicit that this must not become a
 * separate "subtask" form-filling screen, so selecting a node reveals its
 * controls on the node itself — [+ Parent] [Edit] [+ Spouse] [+ Child]
 * [Delete] — and every structural change re-lays out immediately.
 *
 * It renders through layoutFamilyTree, the same engine the public page uses,
 * so what the admin sees is what the village will see. There is no second
 * layout to drift.
 *
 * Nothing here writes to the server until Save. Undo, Redo and Cancel all
 * operate on local history (see useTreeEditor), and a delete asks first.
 */
import { useCallback, useMemo, useState } from "react";
import {
  TREE_NODE_HEIGHT,
  TREE_NODE_WIDTH,
  layoutFamilyTree,
} from "@/lib/family-trees/layout";
import type { Family, FamilyTreeDataset, Person } from "@/lib/family-trees/entities";
import { adapaduchuLabel, verificationLabel } from "@/lib/family-trees/entities";
import {
  addPerson,
  addRelationship,
  deletePerson,
  movePersonToFamily,
  removeRelationship,
  updatePerson,
} from "@/lib/family-trees/mutate";
import { deriveRoots } from "@/lib/family-trees/roots";
import { useTreeEditor } from "./useTreeEditor";
import { PersonForm, type PersonDraft } from "./PersonForm";

type Mode =
  | { kind: "idle" }
  | { kind: "edit"; personId: string }
  | { kind: "add-child"; parentId: string }
  | { kind: "add-parent"; childId: string }
  | { kind: "add-spouse"; personId: string }
  | { kind: "link-existing"; personId: string; relation: "parent" | "child" | "spouse" }
  | { kind: "confirm-delete"; personId: string }
  | { kind: "move"; personId: string };

export function FamilyTreeEditor({
  initialDataset,
  familyId,
  actor,
  previewHref,
}: {
  initialDataset: FamilyTreeDataset;
  familyId: string;
  actor: string;
  previewHref: string;
}) {
  const editor = useTreeEditor(initialDataset, actor);
  const { dataset, apply } = editor;
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: "idle" });
  const [notice, setNotice] = useState<string | null>(null);

  const family = dataset.families.find((f) => f.id === familyId);
  const people = useMemo(
    () => dataset.people.filter((p) => p.familyId === familyId),
    [dataset.people, familyId],
  );

  // Same call the public page makes. The old relationship field names are what
  // the layout expects, so they are mapped here rather than forking the engine.
  const layout = useMemo(() => {
    const rels = dataset.relationships.map((r) => ({
      id: r.id,
      personId: r.fromPersonId,
      relatedPersonId: r.toPersonId,
      relationshipType: r.relationshipType,
      verificationStatus: r.verificationStatus,
    }));
    return layoutFamilyTree({
      people: people as never,
      relationships: rels as never,
      rootPersonIds: family?.rootPersonIds?.length
        ? family.rootPersonIds
        : deriveRoots(dataset, familyId),
    });
  }, [dataset, people, family, familyId]);

  const byId = useMemo(() => new Map(dataset.people.map((p) => [p.id, p])), [dataset.people]);
  const selectedPerson = selected ? byId.get(selected) : undefined;

  const relationsOf = useCallback(
    (personId: string) => {
      const parents: Person[] = [];
      const children: Person[] = [];
      const spouses: Person[] = [];
      for (const rel of dataset.relationships) {
        if (rel.fromPersonId !== personId) continue;
        const other = byId.get(rel.toPersonId);
        if (!other) continue;
        if (rel.relationshipType === "parent") parents.push(other);
        else if (rel.relationshipType === "child") children.push(other);
        else spouses.push(other);
      }
      return { parents, children, spouses };
    },
    [dataset.relationships, byId],
  );

  const close = () => setMode({ kind: "idle" });

  /** Create a person and immediately link them. One undo step, not two. */
  const createLinked = (
    draft: PersonDraft,
    anchorId: string,
    relation: "parent" | "child" | "spouse",
  ) => {
    apply((d) => {
      const created = addPerson(d, actor, draft);
      const linked =
        relation === "parent"
          ? addRelationship(created.dataset, actor, anchorId, created.personId, "parent")
          : relation === "child"
            ? addRelationship(created.dataset, actor, anchorId, created.personId, "child")
            : addRelationship(created.dataset, actor, anchorId, created.personId, "spouse");
      return {
        dataset: linked.dataset,
        audit: [...linked.audit, ...created.audit],
      };
    });
    setNotice(`Added ${draft.fullName}. Not saved yet.`);
    close();
  };

  return (
    <div className="ft-editor">
      <header className="ft-editor-bar">
        <div className="ft-editor-bar-main">
          <h2>{family?.name ?? familyId}</h2>
          <p className="muted">
            {editor.stats.people} people · {editor.stats.relationships} relationships
            {editor.stats.needsReview > 0 ? (
              <> · <strong>{editor.stats.needsReview} need verification</strong></>
            ) : null}
            {editor.stats.crossFamily > 0 ? (
              <> · {editor.stats.crossFamily} cross-family link(s)</>
            ) : null}
          </p>
        </div>
        <div className="ft-editor-actions">
          <button type="button" className="btn" onClick={editor.undo} disabled={!editor.canUndo}>
            ↶ Undo
          </button>
          <button type="button" className="btn" onClick={editor.redo} disabled={!editor.canRedo}>
            ↷ Redo
          </button>
          <a className="btn" href={previewHref} target="_blank" rel="noopener">
            Preview Family Tree ↗
          </a>
          <button
            type="button"
            className="btn"
            onClick={() => {
              editor.cancel();
              setSelected(null);
              setNotice("Changes discarded.");
            }}
            disabled={!editor.dirty}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void editor.save()}
            disabled={!editor.dirty || editor.saveState === "saving"}
          >
            {editor.saveState === "saving" ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </header>

      {editor.dirty ? (
        <p className="ft-editor-dirty">
          Unsaved changes. The public tree still shows the last saved version.
        </p>
      ) : null}
      {editor.saveState === "saved" ? (
        <p className="ft-editor-ok">
          Saved. The public page updates on the next publish.
        </p>
      ) : null}
      {editor.error ? <p className="ft-editor-error">Save failed — {editor.error}</p> : null}
      {notice ? <p className="ft-editor-notice">{notice}</p> : null}

      <div className="ft-editor-canvas-wrap">
        {layout.nodes.length === 0 ? (
          <div className="ft-editor-empty">
            <p>
              <strong>No one in this family yet.</strong>
            </p>
            <p className="muted">
              Add the earliest ancestor you know of, then build downward with{" "}
              <em>+ Child</em>.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setMode({ kind: "add-child", parentId: "" })}
            >
              + Add first person
            </button>
          </div>
        ) : (
          <div
            className="ft-editor-canvas"
            style={{ width: layout.width, height: layout.height }}
          >
            <svg
              className="ft-editor-edges"
              width={layout.width}
              height={layout.height}
              aria-hidden
            >
              {layout.edges.map((edge) => (
                <path
                  key={edge.id}
                  d={edge.d}
                  className={`ft-edge ft-edge--${edge.kind}`}
                  fill="none"
                />
              ))}
            </svg>

            {layout.nodes.map((node) => {
              const person = byId.get(node.id);
              if (!person) return null;
              const isSelected = selected === person.id;
              const adap = adapaduchuLabel(person);
              return (
                <div
                  key={node.id}
                  className={`ft-node${isSelected ? " is-selected" : ""}${
                    node.ambiguous ? " is-ambiguous" : ""
                  }`}
                  style={{
                    left: node.x,
                    top: node.y,
                    width: TREE_NODE_WIDTH,
                    minHeight: TREE_NODE_HEIGHT,
                  }}
                >
                  <button
                    type="button"
                    className="ft-node-hit"
                    onClick={() => {
                      setSelected(isSelected ? null : person.id);
                      setMode({ kind: "idle" });
                      setNotice(null);
                    }}
                    aria-expanded={isSelected}
                  >
                    <span className="ft-node-name">{person.fullName}</span>
                    {adap ? <span className="ft-node-adap">{adap}</span> : null}
                    {!adap && person.deceased ? (
                      <span className="ft-node-adap">Deceased</span>
                    ) : null}
                    {person.occupation ? (
                      <span className="ft-node-meta">{person.occupation}</span>
                    ) : null}
                    {person.verificationStatus !== "verified" ? (
                      <span className={`ft-node-verify ft-node-verify--${person.verificationStatus}`}>
                        {verificationLabel(person.verificationStatus)}
                      </span>
                    ) : null}
                  </button>

                  {/* §20 — controls on the node itself. */}
                  {isSelected ? (
                    <div className="ft-node-tools" role="group" aria-label={`Edit ${person.fullName}`}>
                      <button type="button" onClick={() => setMode({ kind: "add-parent", childId: person.id })}>
                        + Parent
                      </button>
                      <button type="button" onClick={() => setMode({ kind: "edit", personId: person.id })}>
                        Edit
                      </button>
                      <button type="button" onClick={() => setMode({ kind: "add-spouse", personId: person.id })}>
                        + Spouse
                      </button>
                      <button type="button" onClick={() => setMode({ kind: "add-child", parentId: person.id })}>
                        + Child
                      </button>
                      <button type="button" onClick={() => setMode({ kind: "move", personId: person.id })}>
                        Move
                      </button>
                      <button
                        type="button"
                        className="is-danger"
                        onClick={() => setMode({ kind: "confirm-delete", personId: person.id })}
                      >
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ---- panels ------------------------------------------------------ */}

      {mode.kind === "edit" && selectedPerson ? (
        <div className="ft-panel">
          <PersonForm
            person={selectedPerson}
            families={dataset.families}
            title={`Edit ${selectedPerson.fullName}`}
            submitLabel="Apply"
            onCancel={close}
            onSubmit={(draft) => {
              apply((d) => updatePerson(d, actor, selectedPerson.id, draft));
              setNotice(`Updated ${draft.fullName}. Not saved yet.`);
              close();
            }}
          />
          <RelationshipPanel
            person={selectedPerson}
            relations={relationsOf(selectedPerson.id)}
            onRemove={(otherId, relation) => {
              apply((d) => removeRelationship(d, actor, selectedPerson.id, otherId, relation));
              setNotice("Relationship removed. Not saved yet.");
            }}
            onLinkExisting={(relation) =>
              setMode({ kind: "link-existing", personId: selectedPerson.id, relation })
            }
          />
        </div>
      ) : null}

      {mode.kind === "add-child" ? (
        <div className="ft-panel">
          <PersonForm
            families={dataset.families}
            title={mode.parentId ? `Add a child of ${byId.get(mode.parentId)?.fullName ?? ""}` : "Add the first person"}
            submitLabel="Add"
            onCancel={close}
            onSubmit={(draft) => {
              if (!mode.parentId) {
                apply((d) => addPerson(d, actor, { ...draft, familyId: draft.familyId || familyId }));
                setNotice(`Added ${draft.fullName}. Not saved yet.`);
                close();
                return;
              }
              createLinked({ ...draft, familyId: draft.familyId || familyId }, mode.parentId, "child");
            }}
          />
        </div>
      ) : null}

      {mode.kind === "add-parent" ? (
        <div className="ft-panel">
          <PersonForm
            families={dataset.families}
            title={`Add a parent of ${byId.get(mode.childId)?.fullName ?? ""}`}
            submitLabel="Add"
            onCancel={close}
            onSubmit={(draft) =>
              createLinked({ ...draft, familyId: draft.familyId || familyId }, mode.childId, "parent")
            }
          />
        </div>
      ) : null}

      {mode.kind === "add-spouse" ? (
        <div className="ft-panel">
          <p className="ft-panel-lede">
            Create a new person as spouse, or{" "}
            <button
              type="button"
              className="link-btn"
              onClick={() => setMode({ kind: "link-existing", personId: mode.personId, relation: "spouse" })}
            >
              link someone already in the tree
            </button>
            .
          </p>
          <PersonForm
            families={dataset.families}
            title={`Add a spouse for ${byId.get(mode.personId)?.fullName ?? ""}`}
            submitLabel="Add"
            onCancel={close}
            onSubmit={(draft) =>
              createLinked(
                { ...draft, familyId: draft.familyId || familyId, married: true },
                mode.personId,
                "spouse",
              )
            }
          />
        </div>
      ) : null}

      {mode.kind === "link-existing" ? (
        <LinkExistingPanel
          dataset={dataset}
          personId={mode.personId}
          relation={mode.relation}
          onCancel={close}
          onLink={(otherId, verified) => {
            apply((d) =>
              addRelationship(d, actor, mode.personId, otherId, mode.relation, {
                verificationStatus: verified ? "verified" : "needs-verification",
              }),
            );
            setNotice("Relationship added. Not saved yet.");
            close();
          }}
        />
      ) : null}

      {mode.kind === "move" && selectedPerson ? (
        <MovePanel
          person={selectedPerson}
          families={dataset.families}
          onCancel={close}
          onMove={(targetFamilyId, withDescendants) => {
            apply((d) =>
              movePersonToFamily(d, actor, selectedPerson.id, targetFamilyId, { withDescendants }),
            );
            setNotice("Moved. Not saved yet.");
            close();
          }}
        />
      ) : null}

      {mode.kind === "confirm-delete" && selectedPerson ? (
        <ConfirmDelete
          person={selectedPerson}
          relations={relationsOf(selectedPerson.id)}
          onCancel={close}
          onConfirm={() => {
            apply((d) => deletePerson(d, actor, selectedPerson.id));
            setSelected(null);
            setNotice(
              `Deleted ${selectedPerson.fullName}. Undo is available, and the removed data is in the history.`,
            );
            close();
          }}
        />
      ) : null}

      {editor.pendingAudit.length > 0 ? (
        <section className="ft-history">
          <h3>Unsaved changes ({editor.pendingAudit.length})</h3>
          <ol>
            {editor.pendingAudit.slice(0, 25).map((entry) => (
              <li key={entry.id}>
                <span>{entry.summary}</span>
                {entry.field ? (
                  <code>
                    {entry.field}: {JSON.stringify(entry.previousValue) ?? "—"} →{" "}
                    {JSON.stringify(entry.newValue) ?? "—"}
                  </code>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}

/** §4 — the relationship editor for the selected person. */
function RelationshipPanel({
  person,
  relations,
  onRemove,
  onLinkExisting,
}: {
  person: Person;
  relations: { parents: Person[]; children: Person[]; spouses: Person[] };
  onRemove: (otherId: string, relation: "parent" | "child" | "spouse") => void;
  onLinkExisting: (relation: "parent" | "child" | "spouse") => void;
}) {
  const groups = [
    { key: "parent" as const, label: "Parents", list: relations.parents },
    { key: "spouse" as const, label: "Spouses", list: relations.spouses },
    { key: "child" as const, label: "Children", list: relations.children },
  ];
  return (
    <section className="ft-relations">
      <h3>Relationships</h3>
      <p className="muted">
        Every one of these is a stored record. None is guessed from a name, a
        photograph or a location.
      </p>
      {groups.map((group) => (
        <div className="ft-relation-group" key={group.key}>
          <h4>{group.label}</h4>
          {group.list.length === 0 ? <p className="muted">None recorded.</p> : null}
          <ul>
            {group.list.map((other) => (
              <li key={other.id}>
                <span>{other.fullName}</span>
                {other.familyId !== person.familyId ? (
                  <span className="ft-cross">in {other.familyBranch ?? other.familyId}</span>
                ) : null}
                <button type="button" className="btn ghost" onClick={() => onRemove(other.id, group.key)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="btn" onClick={() => onLinkExisting(group.key)}>
            + Link existing person as {group.label.toLowerCase().replace(/s$/, "")}
          </button>
        </div>
      ))}
    </section>
  );
}

/** §5 / §4 — link a person who already exists. */
function LinkExistingPanel({
  dataset,
  personId,
  relation,
  onCancel,
  onLink,
}: {
  dataset: FamilyTreeDataset;
  personId: string;
  relation: "parent" | "child" | "spouse";
  onCancel: () => void;
  onLink: (otherId: string, verified: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [choice, setChoice] = useState<string>("");
  const [verified, setVerified] = useState(false);
  const person = dataset.people.find((p) => p.id === personId);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dataset.people
      .filter((p) => p.id !== personId)
      .filter((p) => !q || p.fullName.toLowerCase().includes(q))
      .slice(0, 60);
  }, [dataset.people, personId, query]);

  const target = dataset.people.find((p) => p.id === choice);
  const cross = Boolean(target && person && target.familyId !== person.familyId);

  return (
    <div className="ft-panel">
      <h3 className="ft-form-title">
        Link an existing person as {relation} of {person?.fullName}
      </h3>
      <label className="ft-field">
        <span>Search</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a name…"
          autoFocus
        />
      </label>
      <label className="ft-field">
        <span>Person</span>
        <select value={choice} onChange={(e) => setChoice(e.target.value)}>
          <option value="">Select…</option>
          {matches.map((p) => (
            <option key={p.id} value={p.id}>
              {p.fullName} — {p.familyBranch ?? p.familyId}
            </option>
          ))}
        </select>
      </label>

      {cross ? (
        <p className="ft-warn">
          This links two different families. That is allowed, but it is never
          automatic — it will be recorded as a deliberate cross-family
          relationship and flagged in the history.
        </p>
      ) : null}

      <label className="ft-field ft-field--check">
        <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} />
        <span>
          I have confirmed this relationship
          <small>Leave unticked to save it as Needs Verification.</small>
        </span>
      </label>

      <div className="ft-form-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!choice}
          onClick={() => onLink(choice, verified)}
        >
          Link
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/** §4 — move a person to the correct branch. */
function MovePanel({
  person,
  families,
  onCancel,
  onMove,
}: {
  person: Person;
  families: Family[];
  onCancel: () => void;
  onMove: (familyId: string, withDescendants: boolean) => void;
}) {
  const [target, setTarget] = useState("");
  const [withDescendants, setWithDescendants] = useState(true);
  return (
    <div className="ft-panel">
      <h3 className="ft-form-title">Move {person.fullName} to another family</h3>
      <label className="ft-field">
        <span>Family</span>
        <select value={target} onChange={(e) => setTarget(e.target.value)}>
          <option value="">Select…</option>
          {families
            .filter((f) => f.id !== person.familyId)
            .map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
        </select>
      </label>
      <label className="ft-field ft-field--check">
        <input
          type="checkbox"
          checked={withDescendants}
          onChange={(e) => setWithDescendants(e.target.checked)}
        />
        <span>
          Move their descendants too
          <small>
            Usually right — moving a person without their children leaves the
            children behind in the old branch.
          </small>
        </span>
      </label>
      <p className="muted">
        Relationships are kept. Any that now cross a family boundary are marked
        so they show up for review.
      </p>
      <div className="ft-form-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!target}
          onClick={() => onMove(target, withDescendants)}
        >
          Move
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/** §13 — confirmation before a destructive change. */
function ConfirmDelete({
  person,
  relations,
  onCancel,
  onConfirm,
}: {
  person: Person;
  relations: { parents: Person[]; children: Person[]; spouses: Person[] };
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const total = relations.parents.length + relations.children.length + relations.spouses.length;
  return (
    <div className="ft-panel ft-panel--danger">
      <h3 className="ft-form-title">Delete {person.fullName}?</h3>
      <p>
        This removes them from the tree along with {total} relationship
        {total === 1 ? "" : "s"}.
      </p>
      {relations.children.length > 0 ? (
        <p className="ft-warn">
          {relations.children.length} child
          {relations.children.length === 1 ? "" : "ren"} will lose this parent link:{" "}
          {relations.children.map((c) => c.fullName).join(", ")}.
        </p>
      ) : null}
      <p className="muted">
        Undo is available, and what was removed is kept in the change history —
        so this is recoverable.
      </p>
      <div className="ft-form-actions">
        <button type="button" className="btn btn-danger" onClick={onConfirm}>
          Delete {person.fullName}
        </button>
        <button type="button" className="btn" onClick={onCancel} autoFocus>
          Keep them
        </button>
      </div>
    </div>
  );
}
