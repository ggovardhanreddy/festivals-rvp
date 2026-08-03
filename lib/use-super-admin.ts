"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { withBase } from "@/lib/base";

const EDIT_MODE_KEY = "rvp-edit-mode";

type SuperAdminState = {
  ready: boolean;
  isAdmin: boolean;
  username: string | null;
  editMode: boolean;
  setEditMode: (on: boolean) => void;
  toggleEditMode: () => void;
  refresh: () => Promise<void>;
};

const SuperAdminContext = createContext<SuperAdminState | null>(null);

async function fetchAdminSession(): Promise<{
  ok: boolean;
  username: string | null;
}> {
  try {
    const res = await fetch(withBase("/api/admin/session"), {
      credentials: "include",
      cache: "no-store",
    });
    const data = (await res.json()) as {
      ok?: boolean;
      username?: string | null;
    };
    return {
      ok: Boolean(data.ok),
      username: data.ok ? data.username || "Govardhan" : null,
    };
  } catch {
    return { ok: false, username: null };
  }
}

export function SuperAdminProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [editMode, setEditModeState] = useState(false);

  const refresh = useCallback(async () => {
    const session = await fetchAdminSession();
    setIsAdmin(session.ok);
    setUsername(session.username);
    if (!session.ok) {
      setEditModeState(false);
      try {
        sessionStorage.removeItem(EDIT_MODE_KEY);
      } catch {
        /* ignore */
      }
    } else {
      try {
        setEditModeState(sessionStorage.getItem(EDIT_MODE_KEY) === "1");
      } catch {
        /* ignore */
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setEditMode = useCallback(
    (on: boolean) => {
      if (!isAdmin) return;
      setEditModeState(on);
      try {
        if (on) sessionStorage.setItem(EDIT_MODE_KEY, "1");
        else sessionStorage.removeItem(EDIT_MODE_KEY);
      } catch {
        /* ignore */
      }
    },
    [isAdmin],
  );

  const toggleEditMode = useCallback(() => {
    setEditMode(!editMode);
  }, [editMode, setEditMode]);

  const value = useMemo(
    () => ({
      ready,
      isAdmin,
      username,
      editMode: isAdmin && editMode,
      setEditMode,
      toggleEditMode,
      refresh,
    }),
    [ready, isAdmin, username, editMode, setEditMode, toggleEditMode, refresh],
  );

  return createElement(SuperAdminContext.Provider, { value }, children);
}

export function useSuperAdmin(): SuperAdminState {
  const ctx = useContext(SuperAdminContext);
  if (!ctx) {
    throw new Error("useSuperAdmin must be used within SuperAdminProvider");
  }
  return ctx;
}

/** Convenience: admin session + edit-mode flag. */
export function useEditMode() {
  const { ready, isAdmin, editMode, setEditMode, toggleEditMode, username } =
    useSuperAdmin();
  return {
    ready,
    isAdmin,
    editMode,
    setEditMode,
    toggleEditMode,
    username,
  };
}
