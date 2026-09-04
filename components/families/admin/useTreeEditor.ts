"use client";

/**
 * The editor's state machine: dataset, history, dirty flag, save.
 *
 * §13 wants Save / Cancel / Undo / Redo. Because every mutation in
 * lib/family-trees/mutate.ts is a pure dataset → dataset function, history is
 * just an array of datasets and undo is an index move. No diffing, no
 * inverse-operation bookkeeping, nothing to get subtly wrong.
 *
 * Nothing is written until Save. Until then the admin is editing a local copy,
 * which is what makes Cancel honest — and what stops a half-finished
 * correction reaching the public tree.
 */
import { useCallback, useMemo, useRef, useState } from "react";
import type { AuditLog, FamilyTreeDataset } from "@/lib/family-trees/entities";
import { fetchStoredAudit, mergeAudit } from "@/lib/family-trees/audit-client";
import type { MutationResult } from "@/lib/family-trees/mutate";

/** How many steps back the admin can go. Generous; datasets are small. */
const HISTORY_LIMIT = 60;

export type SaveState = "idle" | "saving" | "saved" | "error";

export function useTreeEditor(initial: FamilyTreeDataset, actor: string) {
  const [history, setHistory] = useState<FamilyTreeDataset[]>([initial]);
  const [cursor, setCursor] = useState(0);
  const [pendingAudit, setPendingAudit] = useState<AuditLog[]>([]);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const baseline = useRef(initial);

  const dataset = history[cursor]!;
  const canUndo = cursor > 0;
  const canRedo = cursor < history.length - 1;
  const dirty = cursor !== 0 || pendingAudit.length > 0;

  /**
   * Apply a mutation.
   *
   * A mutation that changed nothing (returned no audit entries) does not push
   * a history step — otherwise Undo would appear to do nothing, which reads
   * as a broken button.
   */
  const apply = useCallback(
    (fn: (d: FamilyTreeDataset) => MutationResult) => {
      setError(null);
      const result = fn(history[cursor]!);
      if (result.audit.length === 0) return result;
      setHistory((prev) => {
        const truncated = prev.slice(0, cursor + 1);
        const next = [...truncated, result.dataset];
        return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
      });
      setCursor((c) => Math.min(c + 1, HISTORY_LIMIT - 1));
      setPendingAudit((prev) => [...result.audit, ...prev]);
      setSaveState("idle");
      return result;
    },
    [cursor, history],
  );

  const undo = useCallback(() => {
    setCursor((c) => Math.max(0, c - 1));
    setSaveState("idle");
  }, []);

  const redo = useCallback(() => {
    setCursor((c) => Math.min(history.length - 1, c + 1));
    setSaveState("idle");
  }, [history.length]);

  const cancel = useCallback(() => {
    setHistory([baseline.current]);
    setCursor(0);
    setPendingAudit([]);
    setSaveState("idle");
    setError(null);
  }, []);

  /**
   * Persist through /api/community/, one collection at a time.
   *
   * The audit collection is appended FIRST. §15 asks for history of what
   * changed; writing it before the data means a crash mid-save leaves a record
   * of the intent rather than a silent partial write.
   *
   * The existing history is fetched here rather than taken from the dataset:
   * the dataset arrives as a build-time prop with an empty audit array on
   * purpose, so the log is never baked into the public /admin/index.html
   * (§17). See lib/family-trees/audit-client.ts.
   */
  const save = useCallback(async () => {
    setSaveState("saving");
    setError(null);
    try {
      const post = async (collection: string, items: unknown[]) => {
        const res = await fetch(`/api/community/${collection}?admin=1`, {
          method: "PUT",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ items }),
        });
        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          throw new Error(`${collection}: ${res.status} ${detail.slice(0, 160)}`);
        }
      };

      if (pendingAudit.length > 0) {
        const stored = await fetchStoredAudit();
        await post("family-audit", mergeAudit(pendingAudit, [...dataset.audit, ...stored]));
      }
      await post("family-people", dataset.people);
      await post("family-relationships", dataset.relationships);
      await post("families", dataset.families);
      if (dataset.media.length > 0) await post("family-media", dataset.media);

      baseline.current = dataset;
      setHistory([dataset]);
      setCursor(0);
      setPendingAudit([]);
      setSaveState("saved");
    } catch (err) {
      setSaveState("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [dataset, pendingAudit]);

  const stats = useMemo(() => {
    const people = dataset.people.length;
    return {
      people,
      relationships: dataset.relationships.length,
      needsReview:
        dataset.people.filter((p) => p.verificationStatus !== "verified").length +
        dataset.relationships.filter((r) => r.verificationStatus !== "verified").length,
      crossFamily: dataset.relationships.filter((r) => r.crossFamily).length,
    };
  }, [dataset]);

  return {
    dataset,
    actor,
    apply,
    undo,
    redo,
    cancel,
    save,
    canUndo,
    canRedo,
    dirty,
    saveState,
    error,
    pendingAudit,
    stats,
  };
}
