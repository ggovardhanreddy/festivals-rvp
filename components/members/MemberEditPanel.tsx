"use client";

import { useEffect, useId, useState } from "react";
import { RotateCw, Upload, X } from "lucide-react";
import { withBase } from "@/lib/base";
import { BLOOD_GROUPS } from "@/lib/community";
import {
  MEMBER_GROUP_LABELS,
  memberInitials,
} from "@/lib/member-groups";
import {
  prepareMemberImage,
  uploadMemberPhotoFile,
} from "@/lib/member-image";
import type { Member, MemberGroup, MemberStatus, MemberSocialLink } from "@/lib/types";
import { useMemberEdit } from "./MemberEditProvider";

const STATUS_OPTIONS: MemberStatus[] = [
  "Active",
  "In Loving Memory",
  "Archived",
];

function applyStatus(status: MemberStatus, member: Member): Partial<Member> {
  if (status === "Archived") {
    return { status, archived: true, memorial: false };
  }
  if (status === "In Loving Memory") {
    return { status, archived: false, memorial: true };
  }
  return { status: "Active", archived: false, memorial: false };
}

function currentStatus(m: Member): MemberStatus {
  if (m.archived || m.status === "Archived") return "Archived";
  if (m.memorial || m.status === "In Loving Memory") return "In Loving Memory";
  return "Active";
}

export function MemberEditPanel() {
  const { editingMember, closeEditor, saveMember } = useMemberEdit();
  const titleId = useId();
  const [draft, setDraft] = useState<Member | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [rotate, setRotate] = useState<0 | 90 | 180 | 270>(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (!editingMember) {
      setDraft(null);
      setPreview(null);
      setPendingFile(null);
      setRotate(0);
      setError(null);
      setNote(null);
      return;
    }
    setDraft({
      ...editingMember,
      achievements: [...(editingMember.achievements || [])],
      social: [...(editingMember.social || [])],
    });
    setPreview(null);
    setPendingFile(null);
    setRotate(0);
    setError(null);
    setNote(null);
  }, [editingMember]);

  useEffect(() => {
    if (!editingMember) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) closeEditor();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [editingMember, busy, closeEditor]);

  if (!editingMember || !draft) return null;

  const photoSrc = preview || (draft.photo ? withBase(draft.photo) : null);
  const status = currentStatus(draft);

  function patch(p: Partial<Member>) {
    setDraft((prev) => (prev ? { ...prev, ...p } : prev));
  }

  async function onPickFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setNote(null);
    setBusy(true);
    try {
      const prepared = await prepareMemberImage(file, { rotate: 0 });
      if (preview) URL.revokeObjectURL(preview);
      setPreview(prepared.previewUrl);
      setPendingFile(prepared.file);
      setRotate(0);
      if (prepared.note) setNote(prepared.note);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not prepare photo");
    } finally {
      setBusy(false);
    }
  }

  async function onRotate() {
    const current = draft;
    if (!current) return;
    if (!pendingFile && !current.photo) return;
    const nextRotate = ((rotate + 90) % 360) as 0 | 90 | 180 | 270;
    setBusy(true);
    setError(null);
    try {
      let source: File;
      if (pendingFile) {
        source = pendingFile;
      } else if (current.photo) {
        const res = await fetch(withBase(current.photo));
        const blob = await res.blob();
        source = new File([blob], "member-photo.jpg", {
          type: blob.type || "image/jpeg",
        });
      } else {
        return;
      }
      const prepared = await prepareMemberImage(source, { rotate: 90 });
      if (preview) URL.revokeObjectURL(preview);
      setPreview(prepared.previewUrl);
      setPendingFile(prepared.file);
      setRotate(nextRotate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rotate failed");
    } finally {
      setBusy(false);
    }
  }

  async function onSave() {
    const current = draft;
    if (!current) return;
    if (!current.name.trim()) {
      setError("Name is required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let photo = current.photo;
      if (pendingFile) {
        photo = await uploadMemberPhotoFile(pendingFile);
        if (!photo) throw new Error("Upload returned no URL");
      }
      const statusPatch = applyStatus(currentStatus(current), current);
      const next: Member = {
        ...current,
        ...statusPatch,
        id: current.id,
        name: current.name.trim(),
        group: current.group,
        photo,
        nickname: current.nickname?.trim() || undefined,
        designation: current.designation?.trim() || undefined,
        profession: current.profession?.trim() || undefined,
        company: current.company?.trim() || undefined,
        bio: current.bio?.trim() || undefined,
        phone: current.phone?.trim() || undefined,
        email: current.email?.trim() || undefined,
        bloodGroup: current.bloodGroup || undefined,
        dob: current.dob?.trim() || null,
        achievements: (current.achievements || [])
          .map((s) => s.trim())
          .filter(Boolean),
        social: (current.social || []).filter((s) => s.href.trim()),
      };
      await saveMember(next);
      if (preview) URL.revokeObjectURL(preview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  function updateSocial(index: number, patchLink: Partial<MemberSocialLink>) {
    const current = draft;
    if (!current) return;
    const social = [...(current.social || [])];
    social[index] = { ...social[index]!, ...patchLink };
    patch({ social });
  }

  return (
    <div
      className="member-edit-backdrop"
      role="presentation"
      onClick={() => {
        if (!busy) closeEditor();
      }}
    >
      <aside
        className="member-edit-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="member-edit-panel-head">
          <div>
            <p className="eyebrow">Inline edit</p>
            <h2 id={titleId}>Edit member</h2>
          </div>
          <button
            type="button"
            className="icon-btn"
            aria-label="Close editor"
            disabled={busy}
            onClick={closeEditor}
          >
            <X size={18} />
          </button>
        </header>

        <div className="member-edit-panel-body">
          <div className="member-edit-photo-block">
            <div
              className="member-edit-photo"
              data-placeholder={!photoSrc || undefined}
            >
              {photoSrc ? (
                <img src={photoSrc} alt="" width={200} height={200} />
              ) : (
                <div className="member-avatar" aria-hidden>
                  {memberInitials(draft.name || "?")}
                </div>
              )}
            </div>
            <div className="member-edit-photo-actions">
              <label className="btn ghost">
                <Upload size={14} aria-hidden />{" "}
                {busy ? "Working…" : "Upload / replace"}
                <input
                  type="file"
                  accept="image/*,.heic,.heif"
                  hidden
                  disabled={busy}
                  onChange={(e) => void onPickFile(e.target.files?.[0])}
                />
              </label>
              <button
                type="button"
                className="btn ghost"
                disabled={busy || (!pendingFile && !draft.photo)}
                onClick={() => void onRotate()}
              >
                <RotateCw size={14} aria-hidden /> Rotate
              </button>
              {!photoSrc ? (
                <p className="muted member-photo-soon">Photo Coming Soon</p>
              ) : null}
              <p className="muted" style={{ fontSize: "0.78rem" }}>
                JPEG, PNG, or WebP preferred. HEIC may need conversion first.
              </p>
            </div>
          </div>

          <label>
            Name *
            <input
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              required
              disabled={busy}
            />
          </label>
          <label>
            Nickname
            <input
              value={draft.nickname || ""}
              onChange={(e) => patch({ nickname: e.target.value })}
              disabled={busy}
            />
          </label>
          <label>
            Category
            <select
              value={draft.group}
              onChange={(e) =>
                patch({ group: e.target.value as MemberGroup })
              }
              disabled={busy}
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
              value={status}
              onChange={(e) =>
                patch(applyStatus(e.target.value as MemberStatus, draft))
              }
              disabled={busy}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            Designation
            <input
              value={draft.designation || ""}
              onChange={(e) => patch({ designation: e.target.value })}
              disabled={busy}
            />
          </label>
          <label>
            Profession
            <input
              value={draft.profession || ""}
              onChange={(e) => patch({ profession: e.target.value })}
              disabled={busy}
            />
          </label>
          <label>
            Company
            <input
              value={draft.company || ""}
              onChange={(e) => patch({ company: e.target.value })}
              disabled={busy}
            />
          </label>
          <label>
            Bio
            <textarea
              rows={3}
              value={draft.bio || ""}
              onChange={(e) => patch({ bio: e.target.value })}
              disabled={busy}
            />
          </label>
          <label>
            Birthday (YYYY-MM-DD or MM-DD)
            <input
              value={draft.dob || ""}
              onChange={(e) => patch({ dob: e.target.value || null })}
              placeholder="1990-05-12"
              disabled={busy}
            />
          </label>
          <div className="member-edit-grid-2">
            <label>
              Phone
              <input
                value={draft.phone || ""}
                onChange={(e) => patch({ phone: e.target.value })}
                disabled={busy}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={draft.email || ""}
                onChange={(e) => patch({ email: e.target.value })}
                disabled={busy}
              />
            </label>
          </div>
          <label>
            Blood group
            <select
              value={draft.bloodGroup || ""}
              onChange={(e) => patch({ bloodGroup: e.target.value || undefined })}
              disabled={busy}
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
              value={draft.displayOrder ?? ""}
              onChange={(e) =>
                patch({
                  displayOrder:
                    e.target.value === ""
                      ? undefined
                      : Number(e.target.value),
                })
              }
              disabled={busy}
            />
          </label>
          <label>
            Achievements (one per line)
            <textarea
              rows={3}
              value={(draft.achievements || []).join("\n")}
              onChange={(e) =>
                patch({
                  achievements: e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              disabled={busy}
            />
          </label>
          <div className="member-edit-social">
            <div className="btn-row">
              <p className="eyebrow" style={{ margin: 0 }}>
                Social links
              </p>
              <button
                type="button"
                className="btn ghost"
                disabled={busy}
                onClick={() =>
                  patch({
                    social: [
                      ...(draft.social || []),
                      { label: "Link", href: "" },
                    ],
                  })
                }
              >
                Add link
              </button>
            </div>
            {(draft.social || []).map((link, i) => (
              <div key={i} className="member-edit-grid-2">
                <label>
                  Label
                  <input
                    value={link.label}
                    onChange={(e) => updateSocial(i, { label: e.target.value })}
                    disabled={busy}
                  />
                </label>
                <label>
                  URL
                  <input
                    value={link.href}
                    onChange={(e) => updateSocial(i, { href: e.target.value })}
                    disabled={busy}
                  />
                </label>
              </div>
            ))}
          </div>

          {note ? <p className="muted">{note}</p> : null}
          {error ? <p className="media-error">{error}</p> : null}
        </div>

        <footer className="member-edit-panel-foot">
          <button
            type="button"
            className="btn ghost"
            disabled={busy}
            onClick={closeEditor}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn"
            disabled={busy}
            onClick={() => void onSave()}
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
        </footer>
      </aside>
    </div>
  );
}
