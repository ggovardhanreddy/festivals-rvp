"use client";

import { useEffect, useMemo, useState } from "react";
import { withBase } from "@/lib/base";
import { newCommunityId } from "@/lib/community";
import { useCommunityList } from "@/lib/use-community";
import type { Member, MemberGroup } from "@/lib/types";
import { MEMBER_GROUP_LABELS } from "@/lib/member-groups";
import { mergeMemberRosters } from "@/lib/member-stats";
import membersSeed from "@/content/data/members.json";

const SEED = membersSeed as Member[];

async function uploadMemberPhoto(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("category", "members");
  form.append("originalName", file.name);
  const res = await fetch(withBase("/api/media/upload"), {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const data = (await res.json()) as {
    error?: string;
    key?: string;
    publicUrl?: string;
    url?: string;
  };
  if (!res.ok) throw new Error(data.error || "Photo upload failed");
  return (
    data.publicUrl ||
    data.url ||
    (data.key ? `/api/media/object?key=${encodeURIComponent(data.key)}` : "")
  );
}

export function MembersManager() {
  const seed = useMemo(() => SEED, []);
  const { raw, saveAll, refresh, loading } = useCommunityList<Member>(
    "members",
    seed,
    { admin: true },
  );
  const [items, setItems] = useState<Member[]>(seed);
  const [msg, setMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setItems(mergeMemberRosters(seed, raw));
  }, [raw, seed]);

  async function persist(next: Member[]) {
    setMsg(null);
    try {
      await saveAll(next);
      setItems(next);
      setMsg("Members saved to Cloudflare R2. Public Members page will refresh.");
      await refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Save failed");
    }
  }

  function update(id: string, patch: Partial<Member>) {
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  async function onPhoto(id: string, file: File | undefined) {
    if (!file) return;
    setBusyId(id);
    setMsg(null);
    try {
      const url = await uploadMemberPhoto(file);
      if (!url) throw new Error("Upload returned no URL");
      update(id, { photo: url });
      setMsg("Photo uploaded. Click Save members to publish.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <p className="muted">
        Add or edit members: name, designation, category, birthday, achievements,
        memorial status, archive, and profile photo. Photos upload to R2
        (<code>members/</code>). Save publishes the roster site-wide.
      </p>
      {loading ? <p className="muted">Loading members…</p> : null}
      <div className="btn-row" style={{ marginBottom: "1rem" }}>
        <button
          type="button"
          className="btn"
          onClick={() =>
            setItems((prev) => [
              ...prev,
              {
                id: newCommunityId("member"),
                name: "New member",
                photo: null,
                dob: null,
                group: "core",
                designation: "",
                birthYear: null,
                joinYear: null,
                memorial: false,
                archived: false,
                achievements: [],
              },
            ])
          }
        >
          Add member
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => void persist(items)}
        >
          Save members
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => void persist(seed)}
        >
          Reset to seed JSON
        </button>
      </div>
      {msg ? <p className="muted">{msg}</p> : null}
      <div className="admin-manage-list">
        {items.map((member) => (
          <article key={member.id} className="glass-card admin-manage-card">
            <div className="admin-member-photo-row">
              {member.photo ? (
                <img
                  src={withBase(member.photo)}
                  alt=""
                  width={72}
                  height={72}
                  className="admin-member-thumb"
                />
              ) : (
                <div className="admin-member-thumb admin-member-thumb--empty">
                  No photo
                </div>
              )}
              <label className="btn ghost">
                {busyId === member.id ? "Uploading…" : "Upload photo"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={busyId === member.id}
                  onChange={(e) =>
                    void onPhoto(member.id, e.target.files?.[0])
                  }
                />
              </label>
            </div>
            <label>
              Name
              <input
                value={member.name}
                onChange={(e) => update(member.id, { name: e.target.value })}
              />
            </label>
            <label>
              Designation
              <input
                value={member.designation || ""}
                onChange={(e) =>
                  update(member.id, { designation: e.target.value })
                }
              />
            </label>
            <label>
              Category
              <select
                value={member.group}
                onChange={(e) =>
                  update(member.id, { group: e.target.value as MemberGroup })
                }
              >
                {(Object.keys(MEMBER_GROUP_LABELS) as MemberGroup[]).map((g) => (
                  <option key={g} value={g}>
                    {MEMBER_GROUP_LABELS[g]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Birthday (YYYY-MM-DD or MM-DD)
              <input
                value={member.dob || ""}
                onChange={(e) =>
                  update(member.id, { dob: e.target.value || null })
                }
                placeholder="1990-05-12"
              />
            </label>
            <label>
              Achievements (one per line)
              <textarea
                rows={3}
                value={(member.achievements || []).join("\n")}
                onChange={(e) =>
                  update(member.id, {
                    achievements: e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </label>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={Boolean(member.memorial)}
                onChange={(e) =>
                  update(member.id, {
                    memorial: e.target.checked,
                    status: e.target.checked
                      ? "In Loving Memory"
                      : member.status === "In Loving Memory"
                        ? undefined
                        : member.status,
                  })
                }
              />
              In Loving Memory
            </label>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={Boolean(member.archived)}
                onChange={(e) =>
                  update(member.id, { archived: e.target.checked })
                }
              />
              Archive (hide from public directory)
            </label>
            <label>
              Photo URL / R2 path
              <input
                value={member.photo || ""}
                onChange={(e) =>
                  update(member.id, { photo: e.target.value || null })
                }
              />
            </label>
            <button
              type="button"
              className="btn ghost"
              onClick={() =>
                setItems((prev) => prev.filter((m) => m.id !== member.id))
              }
            >
              Remove
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
