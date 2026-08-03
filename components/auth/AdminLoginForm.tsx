"use client";

import { FormEvent, useState } from "react";
import { withBase } from "@/lib/base";

export function AdminLoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(withBase("/api/admin/login"), {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Invalid Super Admin credentials");
      }
      setPassword("");
      onSuccess?.();
      window.location.href = withBase("/admin/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-login-form glass-card" onSubmit={onSubmit}>
      <p className="eyebrow">Super Admin</p>
      <h2>Super Admin sign in</h2>
      <p className="muted">
        Only the Super Administrator can manage members, media, approvals,
        documents, and website settings.
      </p>
      <label>
        Username
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
          disabled={busy}
          placeholder="Super Admin username"
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          disabled={busy}
        />
      </label>
      {error ? <p className="media-error">{error}</p> : null}
      <button
        className="btn"
        type="submit"
        disabled={busy || !username || !password}
      >
        {busy ? "Signing in…" : "Sign in as Super Admin"}
      </button>
    </form>
  );
}
