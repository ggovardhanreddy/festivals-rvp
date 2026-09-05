"use client";

import { useEffect, useState, type ReactNode } from "react";
import { withBase } from "@/lib/base";
import { roleCan } from "@/lib/roles";

/** Why a session was refused, straight from the server. */
export type AdminSessionReason =
  | "server-not-configured"
  | "no-session-cookie"
  | "session-invalid-or-expired"
  | "unreachable"
  | null;

export function useAdminSession() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const [reason, setReason] = useState<AdminSessionReason>(null);

  const refresh = async () => {
    try {
      const res = await fetch(withBase("/api/admin/session"), {
        credentials: "include",
        cache: "no-store",
      });
      const data = (await res.json()) as {
        ok?: boolean;
        reason?: AdminSessionReason;
      };
      setIsAdmin(Boolean(data.ok));
      setReason(data.ok ? null : (data.reason ?? null));
    } catch {
      setIsAdmin(false);
      setReason("unreachable");
    } finally {
      setReady(true);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  return {
    isAdmin,
    ready,
    reason,
    refresh,
    canAccessAdmin: roleCan("admin", "access-admin") && isAdmin,
  };
}

export function RequireAdmin({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isAdmin, ready, reason } = useAdminSession();

  if (!ready) {
    return <p className="muted">Checking administrator access…</p>;
  }
  if (!isAdmin) {
    // Say which of the three faults this is. They all used to show the same
    // "Sign in required" card, which made a server misconfiguration and an
    // ordinary expired login indistinguishable from the admin's side.
    const detail =
      reason === "server-not-configured"
        ? "The server has no administrator signing key configured, so no sign-in can be accepted. This needs the site's Cloudflare secrets checked — signing in again will not help."
        : reason === "no-session-cookie"
          ? "No sign-in cookie reached the server. Sign in again — and if you were signed in already, check that you are on www.reddivaripalli.com and that the browser is not blocking cookies for this site."
          : reason === "session-invalid-or-expired"
            ? "Your sign-in has expired. Sessions last 24 hours. Please sign in again."
            : reason === "unreachable"
              ? "Could not reach the sign-in service. Check your connection and reload."
              : "Only administrators can manage uploads, approvals, documents, and website settings.";
    return (
      fallback || (
        <div className="glass-card" style={{ padding: "1.25rem" }}>
          <p className="eyebrow">Administrator</p>
          <h2>Sign in required</h2>
          <p className="muted">{detail}</p>
          <p className="muted">
            <a href={withBase("/login/")}>Go to the sign-in page</a>
          </p>
        </div>
      )
    );
  }
  return <>{children}</>;
}
