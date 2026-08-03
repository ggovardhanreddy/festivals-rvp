"use client";

import { useEffect, useState, type ReactNode } from "react";
import { withBase } from "@/lib/base";
import { roleCan } from "@/lib/roles";

export function useAdminSession() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  const refresh = async () => {
    try {
      const res = await fetch(withBase("/api/admin/session"), {
        credentials: "include",
        cache: "no-store",
      });
      const data = (await res.json()) as { ok?: boolean };
      setIsAdmin(Boolean(data.ok));
    } catch {
      setIsAdmin(false);
    } finally {
      setReady(true);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  return { isAdmin, ready, refresh, canAccessAdmin: roleCan("admin", "access-admin") && isAdmin };
}

export function RequireAdmin({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isAdmin, ready } = useAdminSession();

  if (!ready) {
    return <p className="muted">Checking administrator access…</p>;
  }
  if (!isAdmin) {
    return (
      fallback || (
        <div className="glass-card" style={{ padding: "1.25rem" }}>
          <p className="eyebrow">Administrator</p>
          <h2>Sign in required</h2>
          <p className="muted">
            Only administrators can manage uploads, approvals, documents, and
            website settings. Members and guests cannot access this area.
          </p>
        </div>
      )
    );
  }
  return <>{children}</>;
}
