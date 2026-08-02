"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { useMemberAuth } from "./MemberAuthProvider";
import { SITE_NAME, VILLAGE_ALSO_KNOWN_AS } from "@/lib/site";

export function LoginForm() {
  const { login, session, ready } = useMemberAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/members/";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (ready && session) {
      router.replace(next.startsWith("/") ? next : "/members/");
    }
  }, [ready, session, router, next]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError("");
    const result = login(username, password);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace(next.startsWith("/") ? next : "/members/");
  };

  return (
    <section className="login-panel">
      <div className="login-card">
        <Logo variant="vertical" className="login-logo" />
        <p className="eyebrow">Member access</p>
        <h1>Sign in to {SITE_NAME}</h1>
        <p className="lede">
          Protected area for {VILLAGE_ALSO_KNOWN_AS} members. Username and
          password are case-sensitive.
        </p>

        <form className="login-form" onSubmit={onSubmit} noValidate>
          <label>
            <span>Username</span>
            <input
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              spellCheck={false}
            />
          </label>
          <label>
            <span>Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              spellCheck={false}
            />
          </label>
          {error ? (
            <p className="login-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="btn" type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="muted login-hint">
          Use your first name exactly as listed (for example,{" "}
          <strong>Rajesh</strong> for “M Rajesh”). Password matches the username
          exactly.
        </p>
      </div>
    </section>
  );
}
