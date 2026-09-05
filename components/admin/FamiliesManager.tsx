"use client";

import { useEffect, useMemo, useState } from "react";
import { newCommunityId } from "@/lib/community";
import { useCommunityList } from "@/lib/use-community";
import {
  loadVillageFamilies,
  slugifyFamilyName,
  sortFamilies,
} from "@/lib/families/catalog";
import { allPeople } from "@/lib/family-trees";
import {
  memberPhotoSrc,
  prepareMemberImage,
  uploadFamilyPhotoFile,
} from "@/lib/member-image";
import type { FamilyPersonAssignment, VillageFamily } from "@/lib/types";

const SEED = loadVillageFamilies();

function blankFamily(order: number): VillageFamily {
  const now = new Date().toISOString();
  return {
    id: newCommunityId("FAMILY").toUpperCase().replace(/-/g, "_"),
    name: "",
    slug: "",
    description: "",
    displayOrder: order,
    coverPhoto: null,
    history: "",
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function FamiliesManager() {
  const { raw, saveAll, loading } = useCommunityList<VillageFamily>(
    "families",
    SEED,
    { admin: true, replaceSeedWhenRemote: true },
  );
  const {
    raw: assignmentRaw,
    saveAll: saveAssignments,
  } = useCommunityList<FamilyPersonAssignment>("family-people", [], {
    admin: true,
  });
  const [items, setItems] = useState<VillageFamily[]>(SEED);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [personQuery, setPersonQuery] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setItems(sortFamilies(raw.length ? raw : SEED));
  }, [raw]);

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const person of allPeople()) next[person.id] = person.familyId;
    for (const row of assignmentRaw) next[row.id] = row.familyId;
    setAssignments(next);
  }, [assignmentRaw]);

  const sorted = useMemo(() => sortFamilies(items), [items]);
  const people = useMemo(() => {
    const q = personQuery.trim().toLowerCase();
    return allPeople()
      .filter((person) =>
        q
          ? person.fullName.toLowerCase().includes(q) ||
            person.familyBranch.toLowerCase().includes(q)
          : true,
      )
      .slice(0, q ? 80 : 40);
  }, [personQuery]);

  function update(id: string, patch: Partial<VillageFamily>) {
    setItems((prev) =>
      prev.map((family) =>
        family.id === id
          ? { ...family, ...patch, updatedAt: new Date().toISOString() }
          : family,
      ),
    );
  }

  async function persist(next: VillageFamily[], note?: string) {
    setMsg(null);
    try {
      const ordered = sortFamilies(
        next.map((family, index) => ({
          ...family,
          displayOrder: family.displayOrder || index + 1,
        })),
      ).map((family, index) => ({ ...family, displayOrder: index + 1 }));
      await saveAll(ordered);
      setItems(ordered);
      setMsg(note || "Families saved. The /families/ page will use this order.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Save failed");
    }
  }

  function move(id: string, dir: -1 | 1) {
    const list = [...sorted];
    const index = list.findIndex((family) => family.id === id);
    const nextIndex = index + dir;
    if (index < 0 || nextIndex < 0 || nextIndex >= list.length) return;
    const [row] = list.splice(index, 1);
    list.splice(nextIndex, 0, row);
    setItems(list.map((family, i) => ({ ...family, displayOrder: i + 1 })));
  }

  async function onPhoto(
    id: string,
    field: "coverPhoto",
    file: File | undefined,
  ) {
    if (!file) return;
    setBusyId(`${id}-${field}`);
    setMsg(null);
    try {
      const prepared = await prepareMemberImage(file);
      const url = await uploadFamilyPhotoFile(prepared.file);
      URL.revokeObjectURL(prepared.previewUrl);
      if (!url) throw new Error("Upload returned no URL");
      update(id, { [field]: url });
      setMsg("Photo uploaded. Click Save families to publish.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusyId(null);
    }
  }

  async function persistAssignments() {
    setMsg(null);
    try {
      const seedMap = new Map(allPeople().map((p) => [p.id, p.familyId]));
      const rows: FamilyPersonAssignment[] = Object.entries(assignments)
        .filter(([id, familyId]) => seedMap.get(id) !== familyId)
        .map(([id, familyId]) => ({ id, familyId }));
      await saveAssignments(rows);
      setMsg("Family assignments saved. People now use the selected familyId.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not save assignments");
    }
  }

  return (
    <div>
      <p className="muted">
        Village Families on <code>/families/</code> come from this list — not
        from surnames. Display order is 1 at the top. Gundluru Konda Reddy and
        Gundluru Venkata Subba Reddy must stay separate unless you explicitly
        relate them here. Similar names (Jagadam / Jagili, Marimeni / Marimeni
        Nadupanna) are not merged automatically. Family names are shown on the
        public site without caste or community labels.
      </p>
      {loading ? <p className="muted">Loading families…</p> : null}
      {msg ? <p className="muted">{msg}</p> : null}

      <div className="btn-row" style={{ marginBottom: "1rem", flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn"
          onClick={() =>
            setItems((prev) => [...prev, blankFamily(prev.length + 1)])
          }
        >
          Add Family
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => void persist(items)}
        >
          Save families
        </button>
      </div>

      <div className="admin-stack">
        {sorted.map((family, index) => (
          <article key={family.id} className="village-heritage-panel">
            <div className="btn-row" style={{ flexWrap: "wrap" }}>
              <strong>
                {index + 1}. {family.name || "New family"}
              </strong>
              <button
                type="button"
                className="btn ghost"
                disabled={index === 0}
                onClick={() => move(family.id, -1)}
              >
                Move up
              </button>
              <button
                type="button"
                className="btn ghost"
                disabled={index === sorted.length - 1}
                onClick={() => move(family.id, 1)}
              >
                Move down
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() =>
                  update(family.id, { isPublished: !family.isPublished })
                }
              >
                {family.isPublished ? "Unpublish" : "Publish"}
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  if (
                    !window.confirm(
                      `Delete ${family.name || "this family"}? People keep their records; they will need a new family assignment.`,
                    )
                  ) {
                    return;
                  }
                  setItems((prev) => prev.filter((row) => row.id !== family.id));
                }}
              >
                Delete
              </button>
            </div>
            <div className="admin-grid">
              <label>
                Family name
                <input
                  value={family.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    update(family.id, {
                      name,
                      slug: family.slug || slugifyFamilyName(name),
                    });
                  }}
                />
              </label>
              <label>
                Slug
                <input
                  value={family.slug}
                  onChange={(e) =>
                    update(family.id, {
                      slug: slugifyFamilyName(e.target.value) || e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Family ID
                <input value={family.id} readOnly />
              </label>
              <label>
                Display order
                <input
                  type="number"
                  min={1}
                  value={family.displayOrder}
                  onChange={(e) =>
                    update(family.id, {
                      displayOrder: Number(e.target.value) || 1,
                    })
                  }
                />
              </label>
              <label>
                Published
                <select
                  value={family.isPublished ? "yes" : "no"}
                  onChange={(e) =>
                    update(family.id, {
                      isPublished: e.target.value === "yes",
                    })
                  }
                >
                  <option value="yes">Published</option>
                  <option value="no">Unpublished</option>
                </select>
              </label>
            </div>
            <label>
              Description
              <textarea
                rows={2}
                value={family.description}
                onChange={(e) =>
                  update(family.id, { description: e.target.value })
                }
              />
            </label>
            <label>
              Family history
              <textarea
                rows={4}
                value={family.history}
                onChange={(e) => update(family.id, { history: e.target.value })}
              />
            </label>
            <label>
              Family photo
              {family.coverPhoto ? (
                 
                <img
                  src={memberPhotoSrc(family.coverPhoto)}
                  alt=""
                  style={{ width: "6rem", height: "4rem", objectFit: "cover" }}
                />
              ) : null}
              <input
                type="file"
                accept="image/*"
                disabled={busyId === `${family.id}-coverPhoto`}
                onChange={(e) =>
                  void onPhoto(family.id, "coverPhoto", e.target.files?.[0])
                }
              />
            </label>
          </article>
        ))}
      </div>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">People</p>
            <h2>Assign people to a family branch</h2>
            <p className="lede">
              Each person has an explicit familyId. Do not type a family name —
              choose the branch from the list.
            </p>
          </div>
        </div>
        <label className="ft-search">
          <span className="sr-only">Search people</span>
          <input
            type="search"
            value={personQuery}
            onChange={(e) => setPersonQuery(e.target.value)}
            placeholder="Search people to assign…"
          />
        </label>
        <div className="admin-stack" style={{ marginTop: "1rem" }}>
          {people.map((person) => (
            <label key={person.id} className="admin-assign-row">
              <span>
                {person.fullName}
                <small className="muted"> {person.id}</small>
              </span>
              <select
                value={assignments[person.id] || person.familyId}
                onChange={(e) =>
                  setAssignments((prev) => ({
                    ...prev,
                    [person.id]: e.target.value,
                  }))
                }
              >
                {sorted.map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.name}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <button
          type="button"
          className="btn"
          style={{ marginTop: "1rem" }}
          onClick={() => void persistAssignments()}
        >
          Save family assignments
        </button>
      </section>
    </div>
  );
}
