"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { m, useReducedMotion } from "framer-motion";
import {
  Award,
  Star,
  Rocket,
  Heart,
  Search,
  X,
  ExternalLink,
  Pencil,
  Upload,
  GripVertical,
} from "lucide-react";
import type { Member, MemberGroup } from "@/lib/types";
import {
  MEMBER_GROUP_DESCRIPTIONS,
  MEMBER_GROUP_LABELS,
  MEMBER_GROUP_ORDER,
  isMemorial,
  memberInitials,
  resolveMemberGroup,
} from "@/lib/member-groups";
import {
  PROFESSION_LABELS,
  PROFESSION_ORDER,
  computeMemberStats,
  publishedMembers,
  matchProfession,
  type ProfessionKey,
} from "@/lib/member-stats";
import { dobMonthDay, formatBirthdayLabel, monthDay } from "@/lib/dates";
import { SITE_NAME } from "@/lib/site";
import { useEditMode } from "@/lib/use-super-admin";
import {
  memberPhotoSrc,
  prepareMemberImage,
  uploadMemberPhotoFile,
} from "@/lib/member-image";
import {
  downloadMembersCsv,
  parseMembersCsv,
} from "@/lib/member-csv";
import {
  useMemberEditOptional,
  createBlankMember,
} from "./MemberEditProvider";
import { MemberEditPanel } from "./MemberEditPanel";
import { useUiLang } from "@/components/i18n/LanguageProvider";

const GROUP_ICONS = {
  legacy: Award,
  core: Star,
  nextgen: Rocket,
} as const;

type SortMode = "group" | "alpha";

function MemberCard({
  member,
  index,
  onOpen,
  editMode,
  selected,
  onToggleSelect,
  onEdit,
  onQuickPhoto,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  member: Member;
  index: number;
  onOpen: (member: Member) => void;
  editMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onEdit?: () => void;
  onQuickPhoto?: (file: File) => void;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: DragEvent) => void;
  onDrop?: () => void;
  onDragEnd?: () => void;
}) {
  const { t } = useUiLang();
  const reduce = useReducedMotion();
  const hasPhoto = Boolean(member.photo);
  const birthdayLabel = formatBirthdayLabel(member.dob);
  const isBirthdayToday = dobMonthDay(member.dob) === monthDay();
  const memorial = isMemorial(member);
  const group = resolveMemberGroup(member);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <m.article
      className={`member-card${isBirthdayToday ? " is-birthday-today" : ""}${memorial ? " is-memorial" : ""}${editMode ? " is-edit-mode" : ""}${selected ? " is-selected" : ""}`}
      initial={reduce ? false : { opacity: 1, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05, margin: "80px 0px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.02, 0.2) }}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      data-member-id={member.id}
    >
      {editMode ? (
        <div className="member-edit-card-bar">
          <label className="member-select">
            <input
              type="checkbox"
              checked={Boolean(selected)}
              onChange={onToggleSelect}
              aria-label={`Select ${member.name}`}
            />
          </label>
          {draggable ? (
            <span className="member-drag-handle" aria-hidden title="Drag to reorder">
              <GripVertical size={16} />
            </span>
          ) : null}
          <button
            type="button"
            className="icon-btn member-edit-btn"
            aria-label={`Edit ${member.name}`}
            onClick={onEdit}
          >
            <Pencil size={14} />
          </button>
        </div>
      ) : null}

      {memorial ? (
        <span className="member-memorial-ribbon" aria-label={t("members.inLovingMemory")}>
          <Heart size={12} aria-hidden /> {t("members.inLovingMemory")}
        </span>
      ) : null}
      {isBirthdayToday && !memorial ? (
        <span className="member-bday-ribbon" aria-label={t("members.todaysBirthday")}>
          Today&apos;s Birthday
        </span>
      ) : null}

      <div
        className="member-card-photo"
        data-placeholder={!hasPhoto || undefined}
        data-memorial={memorial || undefined}
      >
        {hasPhoto ? (
          <img
            src={memberPhotoSrc(member.photo)}
            alt={member.name}
            width={400}
            height={400}
            loading="lazy"
          />
        ) : (
          <div className="member-avatar" aria-hidden>
            <span className="member-avatar-initials">
              {memberInitials(member.name)}
            </span>
            <span className="member-photo-soon">{t("members.photoSoon")}</span>
          </div>
        )}
        <span className={`member-group-badge member-group-badge--${group}`}>
          {MEMBER_GROUP_LABELS[group]}
        </span>
        {editMode ? (
          <>
            <button
              type="button"
              className="member-photo-upload-btn"
              aria-label={`Upload photo for ${member.name}`}
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={14} aria-hidden /> {t("members.photo")}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.heic,.heif"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onQuickPhoto?.(file);
                e.target.value = "";
              }}
            />
          </>
        ) : null}
      </div>

      <div className="member-card-body">
        <h3>
          {member.name}
          {member.nickname ? (
            <span className="member-nickname"> “{member.nickname}”</span>
          ) : null}
        </h3>
        {member.designation ? (
          <p className="member-designation">{member.designation}</p>
        ) : null}
        {member.profession || member.company ? (
          <p className="member-designation">
            {[member.profession, member.company].filter(Boolean).join(" · ")}
          </p>
        ) : null}
        {memorial ? (
          <p className="member-forever">{t("members.foreverRemembered")}</p>
        ) : birthdayLabel ? (
          <p className="member-birthday">Birthday · {birthdayLabel}</p>
        ) : null}
        {member.social?.length ? (
          <div className="member-social-row">
            {member.social.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="member-social-link"
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
        <div className="btn-row member-card-actions">
          <button
            type="button"
            className="btn ghost member-profile-btn"
            onClick={() => onOpen(member)}
          >
            {t("members.viewProfile")}
          </button>
          {editMode ? (
            <button
              type="button"
              className="btn member-profile-btn"
              onClick={onEdit}
            >
              Edit
            </button>
          ) : null}
        </div>
      </div>
    </m.article>
  );
}

function MemberProfileModal({
  member,
  onClose,
  editMode,
  onEdit,
}: {
  member: Member;
  onClose: () => void;
  editMode?: boolean;
  onEdit?: () => void;
}) {
  const { t } = useUiLang();
  const titleId = useId();
  const hasPhoto = Boolean(member.photo);
  const memorial = isMemorial(member);
  const group = resolveMemberGroup(member);
  const birthdayLabel = formatBirthdayLabel(member.dob);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="member-profile-backdrop" role="presentation" onClick={onClose}>
      <div
        className={`member-profile-modal${memorial ? " is-memorial" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="icon-btn member-profile-close"
          aria-label={t("members.closeProfile")}
          onClick={onClose}
        >
          <X size={18} />
        </button>
        <div
          className="member-profile-photo"
          data-placeholder={!hasPhoto || undefined}
          data-memorial={memorial || undefined}
        >
          {hasPhoto ? (
            <img
              src={memberPhotoSrc(member.photo)}
              alt=""
              width={320}
              height={320}
            />
          ) : (
            <div className="member-avatar" aria-hidden>
              <span className="member-avatar-initials">
                {memberInitials(member.name)}
              </span>
              <span className="member-photo-soon">{t("members.photoSoon")}</span>
            </div>
          )}
        </div>
        <div className="member-profile-body">
          <p className={`member-group-badge member-group-badge--${group}`}>
            {MEMBER_GROUP_LABELS[group]}
          </p>
          <h2 id={titleId}>
            {member.name}
            {member.nickname ? (
              <span className="member-nickname"> “{member.nickname}”</span>
            ) : null}
          </h2>
          {member.designation ? (
            <p className="member-designation">{member.designation}</p>
          ) : null}
          {member.bio ? <p className="lede">{member.bio}</p> : null}
          {memorial ? (
            <p className="member-forever">
              <Heart size={14} aria-hidden /> {t("members.foreverRemembered")}
            </p>
          ) : null}
          {birthdayLabel ? (
            <p className="member-birthday">Birthday · {birthdayLabel}</p>
          ) : null}
          {member.achievements?.length ? (
            <div className="member-achievements">
              <p className="eyebrow">{t("members.achievements")}</p>
              <ul>
                {member.achievements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {member.social?.length ? (
            <div className="member-social-row">
              {member.social.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn ghost"
                >
                  {link.label} <ExternalLink size={14} aria-hidden />
                </a>
              ))}
            </div>
          ) : null}
          {editMode ? (
            <button type="button" className="btn" onClick={onEdit}>
              Edit in panel
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EditToast({
  toast,
  onClose,
}: {
  toast: { kind: "ok" | "err"; text: string };
  onClose: () => void;
}) {
  useEffect(() => {
    const t = window.setTimeout(onClose, 4200);
    return () => window.clearTimeout(t);
  }, [toast, onClose]);
  return (
    <div
      className={`member-edit-toast member-edit-toast--${toast.kind}`}
      role="status"
    >
      <span>{toast.text}</span>
      <button type="button" className="icon-btn" aria-label="Dismiss" onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  );
}

export function MembersGrid({
  members: seedMembers,
  eyebrow = "Community",
  title = "Our circles",
  lede = `Legacy Circle, Core Members, and Next Generation — the living structure of ${SITE_NAME}.`,
}: {
  members: Member[];
  eyebrow?: string;
  title?: string;
  lede?: string;
}) {
  const { t } = useUiLang();
  const { editMode } = useEditMode();
  const edit = useMemberEditOptional();
  const members = edit?.members ?? seedMembers;

  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<MemberGroup | "all">("all");
  const [profession, setProfession] = useState<ProfessionKey | "all">("all");
  const [sort, setSort] = useState<SortMode>("group");
  const [active, setActive] = useState<Member | null>(null);
  const [localToast, setLocalToast] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [bulkGroup, setBulkGroup] = useState<MemberGroup>("core");
  const csvRef = useRef<HTMLInputElement>(null);

  const toast = edit?.toast || localToast;
  const clearToast = () => {
    edit?.clearToast();
    setLocalToast(null);
  };

  // The list and the total above it must come from the same call. A bare
  // !archived filter here left the grid printing cards for members the stat
  // had already excluded, so the page disagreed with itself.
  const activeMembers = useMemo(() => publishedMembers(members), [members]);
  const stats = useMemo(
    () => computeMemberStats(activeMembers),
    [activeMembers],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = activeMembers.filter((m) => {
      if (groupFilter !== "all" && resolveMemberGroup(m) !== groupFilter) {
        return false;
      }
      if (
        profession !== "all" &&
        !matchProfession(m.designation, profession) &&
        !matchProfession(m.profession, profession)
      ) {
        return false;
      }
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        (m.nickname || "").toLowerCase().includes(q) ||
        (m.designation || "").toLowerCase().includes(q) ||
        (m.profession || "").toLowerCase().includes(q) ||
        (m.company || "").toLowerCase().includes(q)
      );
    });
    if (sort === "alpha") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [activeMembers, groupFilter, profession, query, sort]);

  const groups = MEMBER_GROUP_ORDER.map((group) => ({
    group,
    label: MEMBER_GROUP_LABELS[group],
    description: MEMBER_GROUP_DESCRIPTIONS[group],
    people: filtered.filter((m) => resolveMemberGroup(m) === group),
  })).filter((g) => g.people.length);

  const canDrag = Boolean(editMode && edit && sort === "group");

  async function quickPhoto(member: Member, file: File) {
    if (!edit) return;
    try {
      const prepared = await prepareMemberImage(file);
      const url = await uploadMemberPhotoFile(prepared.file);
      if (!url) throw new Error("Upload returned no URL");
      await edit.saveMember({ ...member, photo: url });
      URL.revokeObjectURL(prepared.previewUrl);
    } catch (err) {
      setLocalToast({
        kind: "err",
        text: err instanceof Error ? err.message : "Photo upload failed",
      });
    }
  }

  async function onDropCard(targetId: string, group: MemberGroup) {
    if (!edit || !dragId || dragId === targetId) return;
    const people = publishedMembers(edit.members || []).filter(
      (m) => resolveMemberGroup(m) === group,
    );
    const ids = people.map((m) => m.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0) {
      await edit.moveMemberToGroup(dragId, group, Math.max(0, to));
      setDragId(null);
      return;
    }
    if (to < 0) return;
    const next = [...ids];
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    await edit.reorderInGroup(group, next);
    setDragId(null);
  }

  async function onImportCsv(file: File | undefined) {
    if (!file || !edit) return;
    try {
      const text = await file.text();
      const rows = parseMembersCsv(text);
      if (!rows.length) throw new Error("No rows found in CSV");
      const byId = new Map(edit.allMembers.map((m) => [m.id, m]));
      const byName = new Map(
        edit.allMembers.map((m) => [m.name.toLowerCase(), m]),
      );
      let next = [...edit.allMembers];
      for (const row of rows) {
        const existing =
          (row.id && byId.get(row.id)) ||
          (row.name ? byName.get(row.name.toLowerCase()) : undefined);
        if (existing) {
          next = next.map((m) =>
            m.id === existing.id ? { ...m, ...row, id: existing.id } : m,
          );
        } else {
          const blank = createBlankMember(
            (row.group as MemberGroup) || "core",
          );
          next.push({ ...blank, ...row, id: row.id || blank.id });
        }
      }
      await edit.persistRoster(next, {
        action: "import",
        note: `Imported ${rows.length} CSV row(s).`,
      });
    } catch (err) {
      setLocalToast({
        kind: "err",
        text: err instanceof Error ? err.message : "CSV import failed",
      });
    }
  }

  return (
    <section
      className={`section members-section${editMode ? " members-section--edit" : ""}`}
      id="members"
    >
      {(eyebrow || title || lede) && (
        <div className="section-head">
          <div>
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            {title ? <h2>{title}</h2> : null}
            {lede ? <p className="lede">{lede}</p> : null}
          </div>
        </div>
      )}

      {editMode && edit ? (
        <div className="member-edit-toolbar" aria-label="Super Admin edit tools">
          <p className="eyebrow" style={{ margin: 0 }}>
            Edit Mode
          </p>
          <button
            type="button"
            className="btn ghost"
            onClick={() =>
              edit.startNewMember(
                groupFilter === "all" ? "core" : groupFilter,
              )
            }
          >
            Add member
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() =>
              downloadMembersCsv(
                edit.allMembers,
                "reddivaripalli-members.csv",
              )
            }
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
            disabled={!edit.selectedIds.size}
            onClick={() => void edit.bulkArchive([...edit.selectedIds])}
          >
            Archive selected ({edit.selectedIds.size})
          </button>
          <label className="member-bulk-move">
            Move to
            <select
              value={bulkGroup}
              onChange={(e) => setBulkGroup(e.target.value as MemberGroup)}
            >
              {MEMBER_GROUP_ORDER.map((g) => (
                <option key={g} value={g}>
                  {MEMBER_GROUP_LABELS[g]}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn ghost"
              disabled={!edit.selectedIds.size}
              onClick={() =>
                void edit.bulkMoveCategory([...edit.selectedIds], bulkGroup)
              }
            >
              Apply
            </button>
          </label>
          <p className="muted" style={{ fontSize: "0.8rem", margin: 0 }}>
            Drag cards to reorder when ordered by category. Changes auto-save to R2.
          </p>
        </div>
      ) : null}

      <div className="member-stats" aria-label={t("members.communityStats")}>
        <div className="member-stat">
          <strong>{stats.total}</strong>
          <span>{t("members.totalMembers")}</span>
        </div>
        <div className="member-stat">
          <strong>{stats.byGroup.legacy}</strong>
          <span>{t("members.legacyCircle")}</span>
        </div>
        <div className="member-stat">
          <strong>{stats.byGroup.core}</strong>
          <span>{t("members.coreMembers")}</span>
        </div>
        <div className="member-stat">
          <strong>{stats.byGroup.nextgen}</strong>
          <span>{t("members.nextGeneration")}</span>
        </div>
        {PROFESSION_ORDER.map((key) => (
          <div key={key} className="member-stat member-stat--soft">
            <strong>{stats.byProfession[key]}</strong>
            <span>{PROFESSION_LABELS[key]}</span>
          </div>
        ))}
      </div>

      <div className="member-toolbar">
        <label className="member-search">
          <Search size={16} aria-hidden />
          <input
            type="search"
            placeholder={t("members.searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t("members.searchLabel")}
          />
        </label>
        <label>
          {t("members.category")}
          <select
            value={groupFilter}
            onChange={(e) =>
              setGroupFilter(e.target.value as MemberGroup | "all")
            }
          >
            <option value="all">{t("members.allCategories")}</option>
            {MEMBER_GROUP_ORDER.map((g) => (
              <option key={g} value={g}>
                {MEMBER_GROUP_LABELS[g]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("members.profession")}
          <select
            value={profession}
            onChange={(e) =>
              setProfession(e.target.value as ProfessionKey | "all")
            }
          >
            <option value="all">{t("members.allProfessions")}</option>
            {PROFESSION_ORDER.map((key) => (
              <option key={key} value={key}>
                {PROFESSION_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("members.order")}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
          >
            <option value="group">{t("members.byCategory")}</option>
            <option value="alpha">{t("members.alphabetical")}</option>
          </select>
        </label>
      </div>

      <p className="muted member-filter-count">
        Showing {filtered.length} of {stats.total} members
      </p>

      {sort === "alpha" ? (
        <div className="members-grid">
          {filtered.map((member, index) => (
            <MemberCard
              key={member.id}
              member={member}
              index={index}
              onOpen={setActive}
              editMode={editMode}
              selected={edit?.selectedIds.has(member.id)}
              onToggleSelect={() => edit?.toggleSelected(member.id)}
              onEdit={() => edit?.openEditor(member.id)}
              onQuickPhoto={(file) => void quickPhoto(member, file)}
            />
          ))}
        </div>
      ) : (
        groups.map(({ group, label, description, people }) => {
          const Icon = GROUP_ICONS[group];
          return (
            <div
              key={group}
              className="members-group"
              data-group={group}
              id={`members-${group}`}
              onDragOver={(e) => {
                if (canDrag) e.preventDefault();
              }}
              onDrop={() => {
                if (!canDrag || !dragId || !edit) return;
                const inGroup = people.some((p) => p.id === dragId);
                if (!inGroup) {
                  void edit.moveMemberToGroup(dragId, group, people.length);
                  setDragId(null);
                }
              }}
            >
              <div className="members-group-head">
                <div className="members-group-icon" aria-hidden>
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="members-group-title">{label}</h3>
                  <p className="members-group-desc muted">{description}</p>
                </div>
                <p
                  className="members-group-count"
                  aria-label={`${people.length} members`}
                >
                  {people.length}
                </p>
              </div>
              <div className="members-grid">
                {people.map((member, index) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    index={index}
                    onOpen={setActive}
                    editMode={editMode}
                    selected={edit?.selectedIds.has(member.id)}
                    onToggleSelect={() => edit?.toggleSelected(member.id)}
                    onEdit={() => edit?.openEditor(member.id)}
                    onQuickPhoto={(file) => void quickPhoto(member, file)}
                    draggable={canDrag}
                    onDragStart={() => setDragId(member.id)}
                    onDragOver={(e) => {
                      if (canDrag) e.preventDefault();
                    }}
                    onDrop={() => void onDropCard(member.id, group)}
                    onDragEnd={() => setDragId(null)}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}

      {!filtered.length ? (
        <p className="muted" style={{ marginTop: "1.5rem" }}>
          {t("members.noMatch")}
        </p>
      ) : null}

      {active ? (
        <MemberProfileModal
          member={active}
          onClose={() => setActive(null)}
          editMode={editMode}
          onEdit={() => {
            edit?.openEditor(active.id);
            setActive(null);
          }}
        />
      ) : null}

      {editMode && edit ? <MemberEditPanel /> : null}

      {toast ? <EditToast toast={toast} onClose={clearToast} /> : null}
    </section>
  );
}

export function MembersByGroup({
  members,
}: {
  group: MemberGroup;
  members: Member[];
}) {
  const [active, setActive] = useState<Member | null>(null);
  return (
    <>
      <div className="members-grid">
        {members.map((member, index) => (
          <MemberCard
            key={member.id}
            member={member}
            index={index}
            onOpen={setActive}
          />
        ))}
      </div>
      {active ? (
        <MemberProfileModal member={active} onClose={() => setActive(null)} />
      ) : null}
    </>
  );
}
