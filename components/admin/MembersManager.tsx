"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BLOOD_GROUPS, newCommunityId } from "@/lib/community";
import { useCommunityList } from "@/lib/use-community";
import type { Member, MemberGroup, MemberStatus } from "@/lib/types";
import { MEMBER_GROUP_LABELS } from "@/lib/member-groups";
import { mergeMemberRosters } from "@/lib/member-stats";
import {
  memberPhotoSrc,
  prepareMemberImage,
  uploadMemberPhotoFile,
} from "@/lib/member-image";
import {
  downloadMembersCsv,
  parseMembersCsv,
} from "@/lib/member-csv";
import { appendMemberAudit } from "@/lib/member-audit";
import { useEditMode } from "@/lib/use-super-admin";
import membersSeed from "@/content/data/members.json";

const SEED = membersSeed as Member[];

const STATUS_OPTIONS: MemberStatus[] = [
  "Active",
  "In Loving Memory",
  "Archived",
];

function statusOf(m: Member): MemberStatus {
  if (m.archived || m.status === "Archived") return "Archived";
  if (m.memorial || m.status === "In Loving Memory") return "In Loving Memory";
  return "Active";
}

function fromStatus(status: MemberStatus): Partial<Member> {
  if (status === "Archived") {
    return { status, archived: true, memorial: false };
  }
  if (status === "In Loving Memory") {
    return { status, archived: false, memorial: true };
  }
  return { status: "Active", archived: false, memorial: false };
}

export function MembersManager() {
  const seed = useMemo(() => SEED, []);
  const { username } = useEditMode();
  const { raw, saveAll, refresh, loading } = useCommunityList<Member>(
    "members",
    seed,
    { admin: true },
  );
  const [items, setItems] = useState<Member[]>(seed);
  const [msg, setMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const csvRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(mergeMemberRosters(seed, raw, { includeArchived: true }));
  }, [raw, seed]);

  async function persist(next: Member[], note?: string) {
    setMsg(null);
    try {
      await saveAll(next);
      setItems(next);
      setMsg(note || "Members saved to Cloudflare R2. Public Members page will refresh.");
      try {
        await appendMemberAudit({
          adminName: username || "Govardhan",
          memberId: "roster",
          action: "update",
          fields: ["roster"],
          before: null,
          after: { name: `${next.length} members` },
        });
      } catch {
        /* best-effort */
      }
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
      const prepared = await prepareMemberImage(file);
      const url = await uploadMemberPhotoFile(prepared.file);
      URL.revokeObjectURL(prepared.previewUrl);
      if (!url) throw new Error("Upload returned no URL");
      update(id, { photo: url });
      setMsg("Photo uploaded. Click Save members to publish.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusyId(null);
    }
  }

  async function onImportCsv(file: File | undefined) {
    if (!file) return;
    try {
      const text = await file.text();
      const rows = parseMembersCsv(text);
      if (!rows.length) throw new Error("No CSV rows found");
      let next = [...items];
      for (const row of rows) {
        const existing = next.find(
          (m) =>
            (row.id && m.id === row.id) ||
            (row.name && m.name.toLowerCase() === row.name.toLowerCase()),
        );
        if (existing) {
          next = next.map((m) =>
            m.id === existing.id ? { ...m, ...row, id: existing.id } : m,
          );
        } else {
          next.push({
            id: row.id || newCommunityId("member"),
            name: row.name || "New member",
            photo: row.photo ?? null,
            dob: row.dob ?? null,
            group: (row.group as MemberGroup) || "core",
            ...row,
          } as Member);
        }
      }
      setItems(next);
      setMsg(`Imported ${rows.length} row(s). Click Save members to publish.`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "CSV import failed");
    }
  }

  return (
    <div>
      <p className="muted">
        Add or edit members: photo, name, nickname, category, designation,
        profession, company, bio, birthday, contacts, blood group, social,
        achievements, memorial/archive status, and display order. Photos upload
        to R2 (<code>members/</code>). Save publishes the roster site-wide.
        Prefer JPEG/PNG/WebP — HEIC may need conversion in Photos first.
      </p>
      {loading ? <p className="muted">Loading members…</p> : null}
      <div className="btn-row" style={{ marginBottom: "1rem", flexWrap: "wrap" }}>
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
                nickname: "",
                profession: "",
                company: "",
                bio: "",
                phone: "",
                email: "",
                bloodGroup: "",
                birthYear: null,
                joinYear: null,
                memorial: false,
                archived: false,
                status: "Active",
                achievements: [],
                social: [],
                displayOrder: prev.length,
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
          onClick={() => downloadMembersCsv(items)}
        >
          Export CSV
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => csvRef.current?.click()}
        >
          Import CSV
        </button>
        <input
          ref={csvRef}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={(e) => {
            void onImportCsv(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          className="btn ghost"
          onClick={() => void persist(seed, "Reset to seed JSON.")}
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
                  src={memberPhotoSrc(member.photo)}
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
                  accept="image/*,.heic,.heif"
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
              Nickname
              <input
                value={member.nickname || ""}
                onChange={(e) =>
                  update(member.id, { nickname: e.target.value })
                }
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
              Profession
              <input
                value={member.profession || ""}
                onChange={(e) =>
                  update(member.id, { profession: e.target.value })
                }
              />
            </label>
            <label>
              Company
              <input
                value={member.company || ""}
                onChange={(e) =>
                  update(member.id, { company: e.target.value })
                }
              />
            </label>
            <label>
              Bio
              <textarea
                rows={2}
                value={member.bio || ""}
                onChange={(e) => update(member.id, { bio: e.target.value })}
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
              Status
              <select
                value={statusOf(member)}
                onChange={(e) =>
                  update(
                    member.id,
                    fromStatus(e.target.value as MemberStatus),
                  )
                }
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
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
              Phone
              <input
                value={member.phone || ""}
                onChange={(e) => update(member.id, { phone: e.target.value })}
              />
            </label>
            <label>
              Email
              <input
                value={member.email || ""}
                onChange={(e) => update(member.id, { email: e.target.value })}
              />
            </label>
            <label>
              Blood group
              <select
                value={member.bloodGroup || ""}
                onChange={(e) =>
                  update(member.id, {
                    bloodGroup: e.target.value || undefined,
                  })
                }
              >
                <option value="">—</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Display order
              <input
                type="number"
                value={member.displayOrder ?? ""}
                onChange={(e) =>
                  update(member.id, {
                    displayOrder:
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                  })
                }
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
            <label>
              Social (Label|URL per line)
              <textarea
                rows={2}
                value={(member.social || [])
                  .map((s) => `${s.label}|${s.href}`)
                  .join("\n")}
                onChange={(e) =>
                  update(member.id, {
                    social: e.target.value
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line) => {
                        const [label, ...rest] = line.split("|");
                        return {
                          label: label || "Link",
                          href: rest.join("|") || "",
                        };
                      }),
                  })
                }
              />
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
