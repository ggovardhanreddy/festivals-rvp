"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMemberAuth } from "./MemberAuthProvider";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, ready } = useMemberAuth();
  const router = useRouter();
  const pathname = usePathname() || "/";

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      const next = pathname.endsWith("/") ? pathname : `${pathname}/`;
      router.replace(`/login/?next=${encodeURIComponent(next)}`);
    }
  }, [ready, session, router, pathname]);

  if (!ready) {
    return (
      <div className="auth-gate" aria-busy="true">
        <p className="muted">Checking member access…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="auth-gate" aria-busy="true">
        <p className="muted">Redirecting to sign in…</p>
      </div>
    );
  }

  return <>{children}</>;
}
