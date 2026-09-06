"use client";

/**
 * A save the administrator can see the result of.
 *
 * Several admin controls called `void saveAll(next)` -- fire and forget. The
 * promise was discarded, so a rejected save produced nothing at all: no
 * message, no retry, no trace. An admin marking a submission approved, or
 * removing a document, had no way to tell a successful write from a 401 or a
 * failed R2 put. The document panel was worse still, removing the row from the
 * screen before the save and leaving it there whether or not the write landed,
 * so a failure looked exactly like success.
 *
 * `run` reports what happened and returns whether it worked, so a caller can
 * hold off on changing the screen until the server has agreed.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export type AdminSaveState = "idle" | "saving" | "saved" | "error";

/** How long a success message stays up before the panel goes quiet again. */
const SAVED_MS = 2500;

export function useAdminSave() {
  const [state, setState] = useState<AdminSaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const run = useCallback(
    async (save: () => Promise<unknown>, what?: string): Promise<boolean> => {
      if (timer.current) window.clearTimeout(timer.current);
      setState("saving");
      setError(null);
      setLabel(what ?? null);
      try {
        await save();
        if (!alive.current) return true;
        setState("saved");
        timer.current = window.setTimeout(() => {
          if (alive.current) setState("idle");
        }, SAVED_MS);
        return true;
      } catch (err) {
        if (!alive.current) return false;
        setState("error");
        // The server's own words. "Admin required" and "R2 MEDIA binding is
        // not configured" need different responses, and a generic "save
        // failed" hides which one happened.
        setError(err instanceof Error ? err.message : String(err));
        return false;
      }
    },
    [],
  );

  return { state, error, label, run };
}
