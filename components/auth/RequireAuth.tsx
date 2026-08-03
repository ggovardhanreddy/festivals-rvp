"use client";

import { useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useMemberAuth } from "./MemberAuthProvider";
import { FunFestLoginDialog } from "./FunFestLoginDialog";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, ready } = useMemberAuth();
  const pathname = usePathname() || "/";
  const [dismissed, setDismissed] = useState(false);

  const next = useMemo(() => {
    if (!pathname.includes("/fun-trips")) return "/fun-trips/";
    return pathname.endsWith("/") ? pathname : `${pathname}/`;
  }, [pathname]);

  if (!ready) {
    return (
      <div className="auth-gate" aria-busy="true">
        <p className="muted">Checking member access…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <div className="auth-gate">
          <p className="eyebrow">Fun Fest</p>
          <h1>Members only</h1>
          <p className="lede">
            Sign in with your first name to open the private Fun Fest gallery.
          </p>
          <button
            type="button"
            className="btn"
            onClick={() => setDismissed(false)}
          >
            Sign in
          </button>
        </div>
        <FunFestLoginDialog
          open={!dismissed}
          onClose={() => setDismissed(true)}
          next={next}
        />
      </>
    );
  }

  return <>{children}</>;
}
