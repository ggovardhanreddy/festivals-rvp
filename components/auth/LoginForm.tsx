"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useMemberAuth } from "./MemberAuthProvider";
import { SITE_NAME } from "@/lib/site";

export function LoginForm() {
  const { login, session, ready } = useMemberAuth();
  const router = useRouter();
  const params = useSearchParams();
  const nextParam = params.get("next") || "/fun-trips/";
  const next =
    nextParam.startsWith("/fun-trips")
      ? nextParam
      : "/fun-trips/";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (ready && session) {
      router.replace(next);
    }
  }, [ready, session, router, next]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError("");
    const result = await login(username.trim(), password.trim());
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace(next);
  };

  return (
    <section className="login-panel">
      <div className="login-card">
        <Logo variant="vertical" className="login-logo" />
        <p className="eyebrow">Fun Fest</p>
        <h1>Member sign in</h1>
        <p className="lede">
          Fun Fest photos and videos are private to {SITE_NAME} members.
          Username and password are case-sensitive.
        </p>

        <form className="login-form" onSubmit={(e) => void onSubmit(e)} noValidate>
          <label>
            <span>Username</span>
            <input
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError("");
              }}
              required
              spellCheck={false}
              autoCapitalize="off"
            />
          </label>
          <label>
            <span>Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
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
            {pending ? "Signing in…" : "Enter Fun Fest"}
          </button>
        </form>

        <p className="muted login-hint">
          Use your first name exactly as listed (for example{" "}
          <strong>Rajesh</strong> for “M Rajesh”). The initial password matches
          the username. Duplicate first names use a letter prefix (for example{" "}
          <strong>KBalaji</strong>).
        </p>
        <p className="muted">
          <Link href="/">Back to home</Link>
        </p>
      </div>
    </section>
  );
}
