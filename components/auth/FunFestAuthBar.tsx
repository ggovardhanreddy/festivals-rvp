"use client";

import { useRouter } from "next/navigation";
import { useMemberAuth } from "./MemberAuthProvider";

export function FunFestAuthBar() {
  const { session, logout, ready } = useMemberAuth();
  const router = useRouter();

  if (!ready || !session) return null;

  return (
    <div className="funfest-auth-bar" role="region" aria-label="Fun Fest session">
      <p className="muted">
        Signed in as <strong>{session.name}</strong>
      </p>
      <button
        type="button"
        className="btn ghost"
        onClick={() => {
          void logout().then(() => router.replace("/"));
        }}
      >
        Log out
      </button>
    </div>
  );
}
