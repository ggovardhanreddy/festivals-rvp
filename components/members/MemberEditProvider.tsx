"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useCommunityList } from "@/lib/use-community";
import { mergeMemberRosters, diffMemberFields } from "@/lib/member-stats";
import { appendMemberAudit } from "@/lib/member-audit";
import { useEditMode } from "@/lib/use-super-admin";
import type { Member, MemberGroup } from "@/lib/types";
import { newCommunityId } from "@/lib/community";

type Toast = { kind: "ok" | "err"; text: string } | null;

type MemberEditContextValue = {
  members: Member[];
  allMembers: Member[];
  loading: boolean;
  toast: Toast;
  clearToast: () => void;
  editingId: string | null;
  openEditor: (id: string) => void;
  startNewMember: (group?: MemberGroup) => void;
  closeEditor: () => void;
  editingMember: Member | null;
  saveMember: (next: Member) => Promise<void>;
  persistRoster: (
    next: Member[],
    meta?: { action?: "reorder" | "import" | "archive"; note?: string },
  ) => Promise<void>;
  reorderInGroup: (
    group: MemberGroup,
    orderedIds: string[],
  ) => Promise<void>;
  moveMemberToGroup: (
    memberId: string,
    group: MemberGroup,
    indexInGroup: number,
  ) => Promise<void>;
  bulkArchive: (ids: string[]) => Promise<void>;
  bulkMoveCategory: (ids: string[], group: MemberGroup) => Promise<void>;
  selectedIds: Set<string>;
  toggleSelected: (id: string) => void;
  clearSelected: () => void;
  setSelectedIds: (ids: string[]) => void;
  refresh: () => Promise<void>;
};

const MemberEditContext = createContext<MemberEditContextValue | null>(null);

export function MemberEditProvider({
  seed,
  children,
}: {
  seed: Member[];
  children: ReactNode;
}) {
  const { isAdmin, username } = useEditMode();
  const { raw, saveAll, refresh, loading } = useCommunityList<Member>(
    "members",
    seed,
    { admin: isAdmin },
  );
  const [allMembers, setAllMembers] = useState<Member[]>(() =>
    mergeMemberRosters(seed, [], { includeArchived: true }),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<Member | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [selectedIds, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setAllMembers(mergeMemberRosters(seed, raw, { includeArchived: true }));
  }, [raw, seed]);

  const members = useMemo(
    () => allMembers.filter((m) => !m.archived),
    [allMembers],
  );

  const clearToast = useCallback(() => setToast(null), []);

  const persistRoster = useCallback(
    async (
      next: Member[],
      meta?: { action?: "reorder" | "import" | "archive"; note?: string },
    ) => {
      if (!isAdmin) {
        const err = new Error("Admin session required");
        setToast({ kind: "err", text: err.message });
        throw err;
      }
      try {
        await saveAll(next);
        setAllMembers(next);
        setToast({
          kind: "ok",
          text: meta?.note || "Members saved to Cloudflare R2.",
        });
        if (meta?.action === "reorder" || meta?.action === "import" || meta?.action === "archive") {
          try {
            await appendMemberAudit({
              adminName: username || "Govardhan",
              memberId: meta.action,
              memberName: meta.note,
              action: meta.action === "archive" ? "archive" : meta.action,
              fields: ["roster"],
              before: null,
              after: { name: `${next.length} members` },
            });
          } catch {
            /* audit is best-effort */
          }
        }
        // Skip refresh() here: a follow-up GET can return an empty/stale
        // overlay and drop members who are not yet in the Git seed.
      } catch (err) {
        setToast({
          kind: "err",
          text: err instanceof Error ? err.message : "Save failed",
        });
        throw err;
      }
    },
    [isAdmin, saveAll, username],
  );

  const saveMember = useCallback(
    async (next: Member) => {
      if (!isAdmin) {
        const err = new Error("Admin session required");
        setToast({ kind: "err", text: err.message });
        throw err;
      }
      const before =
        allMembers.find((m) => m.id === next.id) ||
        (editingDraft?.id === next.id ? editingDraft : null);
      const { fields, beforeSnap, afterSnap } = diffMemberFields(before, next);
      if (!fields.length) {
        setToast({ kind: "ok", text: "No changes to save." });
        setEditingId(null);
        setEditingDraft(null);
        return;
      }
      const exists = allMembers.some((m) => m.id === next.id);
      const roster = exists
        ? allMembers.map((m) => (m.id === next.id ? next : m))
        : [...allMembers, next];
      try {
        await saveAll(roster);
        setAllMembers(roster);
        try {
          await appendMemberAudit({
            adminName: username || "Govardhan",
            memberId: next.id,
            memberName: next.name,
            action: exists ? (fields.includes("photo") ? "photo" : "update") : "create",
            fields,
            before: beforeSnap,
            after: afterSnap,
          });
        } catch {
          /* best-effort */
        }
        setToast({ kind: "ok", text: `Saved ${next.name}.` });
        setEditingId(null);
        setEditingDraft(null);
      } catch (err) {
        setToast({
          kind: "err",
          text: err instanceof Error ? err.message : "Save failed",
        });
        throw err;
      }
    },
    [isAdmin, allMembers, editingDraft, saveAll, username],
  );

  const reorderInGroup = useCallback(
    async (group: MemberGroup, orderedIds: string[]) => {
      const orderMap = new Map(orderedIds.map((id, i) => [id, i]));
      const next = allMembers.map((m) => {
        if (m.group !== group || m.archived) return m;
        const idx = orderMap.get(m.id);
        if (idx === undefined) return m;
        return { ...m, displayOrder: idx };
      });
      await persistRoster(next, {
        action: "reorder",
        note: `Reordered ${group} members.`,
      });
    },
    [allMembers, persistRoster],
  );

  const moveMemberToGroup = useCallback(
    async (memberId: string, group: MemberGroup, indexInGroup: number) => {
      const target = allMembers.find((m) => m.id === memberId);
      if (!target) return;
      const others = allMembers.filter(
        (m) => m.id !== memberId && m.group === group && !m.archived,
      );
      others.splice(Math.max(0, Math.min(indexInGroup, others.length)), 0, {
        ...target,
        group,
      });
      const orderIds = others.map((m) => m.id);
      const next = allMembers.map((m) => {
        if (m.id === memberId) {
          return { ...m, group, displayOrder: orderIds.indexOf(memberId) };
        }
        if (m.group === group && !m.archived) {
          const idx = orderIds.indexOf(m.id);
          return idx >= 0 ? { ...m, displayOrder: idx } : m;
        }
        return m;
      });
      await persistRoster(next, {
        action: "reorder",
        note: `Moved ${target.name} to ${group}.`,
      });
    },
    [allMembers, persistRoster],
  );

  const bulkArchive = useCallback(
    async (ids: string[]) => {
      const set = new Set(ids);
      const next = allMembers.map((m) =>
        set.has(m.id)
          ? {
              ...m,
              archived: true,
              status: "Archived" as const,
              memorial: false,
            }
          : m,
      );
      await persistRoster(next, {
        action: "archive",
        note: `Archived ${ids.length} member(s).`,
      });
      setSelected(new Set());
    },
    [allMembers, persistRoster],
  );

  const bulkMoveCategory = useCallback(
    async (ids: string[], group: MemberGroup) => {
      const set = new Set(ids);
      const next = allMembers.map((m) =>
        set.has(m.id) ? { ...m, group } : m,
      );
      await persistRoster(next, {
        action: "reorder",
        note: `Moved ${ids.length} member(s) to ${group}.`,
      });
      setSelected(new Set());
    },
    [allMembers, persistRoster],
  );

  const value = useMemo<MemberEditContextValue>(
    () => ({
      members,
      allMembers,
      loading,
      toast,
      clearToast,
      editingId,
      openEditor: (id) => {
        setEditingDraft(null);
        setEditingId(id);
      },
      startNewMember: (group: MemberGroup = "core") => {
        const blank = createBlankMember(group);
        setEditingDraft(blank);
        setEditingId(blank.id);
      },
      closeEditor: () => {
        setEditingId(null);
        setEditingDraft(null);
      },
      editingMember:
        editingDraft && editingId === editingDraft.id
          ? editingDraft
          : editingId
            ? allMembers.find((m) => m.id === editingId) || null
            : null,
      saveMember,
      persistRoster,
      reorderInGroup,
      moveMemberToGroup,
      bulkArchive,
      bulkMoveCategory,
      selectedIds,
      toggleSelected: (id) =>
        setSelected((prev) => {
          const n = new Set(prev);
          if (n.has(id)) n.delete(id);
          else n.add(id);
          return n;
        }),
      clearSelected: () => setSelected(new Set()),
      setSelectedIds: (ids) => setSelected(new Set(ids)),
      refresh,
    }),
    [
      members,
      allMembers,
      loading,
      toast,
      clearToast,
      editingId,
      editingDraft,
      saveMember,
      persistRoster,
      reorderInGroup,
      moveMemberToGroup,
      bulkArchive,
      bulkMoveCategory,
      selectedIds,
      refresh,
    ],
  );

  return (
    <MemberEditContext.Provider value={value}>
      {children}
    </MemberEditContext.Provider>
  );
}

export function useMemberEdit() {
  const ctx = useContext(MemberEditContext);
  if (!ctx) {
    throw new Error("useMemberEdit must be used within MemberEditProvider");
  }
  return ctx;
}

export function useMemberEditOptional() {
  return useContext(MemberEditContext);
}

export function createBlankMember(group: MemberGroup = "core"): Member {
  return {
    id: newCommunityId("member"),
    name: "",
    photo: null,
    dob: null,
    group,
    designation: "",
    nickname: "",
    profession: "",
    company: "",
    bio: "",
    phone: "",
    email: "",
    bloodGroup: "",
    memorial: false,
    archived: false,
    status: "Active",
    achievements: [],
    social: [],
    displayOrder: 9999,
  };
}
