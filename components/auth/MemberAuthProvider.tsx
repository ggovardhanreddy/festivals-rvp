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
import type { Member } from "@/lib/types";
import {
  authenticateMember,
  clearSession,
  readSession,
  writeSession,
  type MemberSession,
} from "@/lib/auth";

type AuthContextValue = {
  session: MemberSession | null;
  ready: boolean;
  login: (username: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function MemberAuthProvider({
  members,
  children,
}: {
  members: Member[];
  children: ReactNode;
}) {
  const [session, setSession] = useState<MemberSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setSession(readSession());
    sync();
    setReady(true);
    window.addEventListener("rvp:auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("rvp:auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const login = useCallback(
    (username: string, password: string) => {
      const member = authenticateMember(username, password, members);
      if (!member) {
        return {
          ok: false as const,
          error: "Invalid username or password. Both are case-sensitive.",
        };
      }
      setSession(writeSession(member));
      return { ok: true as const };
    },
    [members],
  );

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, ready, login, logout }),
    [session, ready, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useMemberAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useMemberAuth must be used within MemberAuthProvider");
  }
  return ctx;
}
