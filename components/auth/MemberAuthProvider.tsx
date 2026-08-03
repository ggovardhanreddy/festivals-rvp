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
import { withBase } from "@/lib/base";
import {
  clearSession,
  readSession,
  writeSession,
  type MemberSession,
} from "@/lib/auth";

type AuthContextValue = {
  session: MemberSession | null;
  ready: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function MemberAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<MemberSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      try {
        const res = await fetch(withBase("/api/auth/session"), {
          credentials: "include",
        });
        if (res.ok) {
          const data = (await res.json()) as {
            ok?: boolean;
            session?: { memberId: string; username: string; name: string };
          };
          if (data.ok && data.session) {
            const next = writeSession({
              memberId: data.session.memberId,
              username: data.session.username,
              name: data.session.name,
              at: Date.now(),
            });
            if (!cancelled) setSession(next);
            if (!cancelled) setReady(true);
            return;
          }
        }
      } catch {
        /* offline / local next without Functions */
      }
      if (!cancelled) {
        setSession(readSession());
        setReady(true);
      }
    };

    const sync = () => setSession(readSession());
    void hydrate();
    window.addEventListener("rvp:auth-change", sync);
    return () => {
      cancelled = true;
      window.removeEventListener("rvp:auth-change", sync);
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const user = username.trim();
    const pass = password.trim();
    try {
      const res = await fetch(withBase("/api/auth/login"), {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: user, password: pass }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        session?: { memberId: string; username: string; name: string };
      };
      if (!res.ok || !data.ok || !data.session) {
        return {
          ok: false as const,
          error:
            data.error ||
            "Invalid username or password. Both are case-sensitive.",
        };
      }
      const next = writeSession({
        memberId: data.session.memberId,
        username: data.session.username,
        name: data.session.name,
        at: Date.now(),
      });
      setSession(next);
      return { ok: true as const };
    } catch {
      return {
        ok: false as const,
        error:
          "Sign-in service is unavailable. Deploy with Cloudflare Pages Functions, then try again.",
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(withBase("/api/auth/logout"), {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* ignore */
    }
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
