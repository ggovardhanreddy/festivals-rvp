"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { useMemberAuth } from "./MemberAuthProvider";
import { SITE_NAME } from "@/lib/site";

export function FunFestLoginDialog({
  open,
  onClose,
  next = "/fun-trips/",
}: {
  open: boolean;
  onClose: () => void;
  next?: string;
}) {
  const { login, session, ready } = useMemberAuth();
  const router = useRouter();
  const formId = useId();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const destination =
    next.startsWith("/fun-trips") ? next : "/fun-trips/";

  useEffect(() => {
    if (!open) return;
    if (ready && session) {
      onClose();
      router.push(destination);
    }
  }, [open, ready, session, router, destination, onClose]);

  useEffect(() => {
    if (!open) {
      setUsername("");
      setPassword("");
      setError("");
      setPending(false);
    }
  }, [open]);

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
    onClose();
    router.push(destination);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Fun Fest member sign in"
      className="funfest-login-dialog"
    >
      <div className="login-card login-card--dialog">
        <p className="eyebrow">Fun Fest</p>
        <h2>Members only</h2>
        <p className="lede">
          Fun Fest photos and videos are private to {SITE_NAME} members. Sign
          in with your first name — username and password match (case-sensitive).
        </p>

        <form
          id={formId}
          className="login-form"
          onSubmit={(e) => void onSubmit(e)}
          noValidate
        >
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
              autoFocus
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
          <div className="btn-row" style={{ justifyContent: "stretch" }}>
            <button className="btn" type="submit" disabled={pending}>
              {pending ? "Signing in…" : "Enter Fun Fest"}
            </button>
            <button
              className="btn ghost"
              type="button"
              onClick={onClose}
              disabled={pending}
            >
              Cancel
            </button>
          </div>
        </form>

        <p className="muted login-hint">
          Examples: <strong>Raja</strong>/<strong>Raja</strong>,{" "}
          <strong>Rajesh</strong>/<strong>Rajesh</strong>,{" "}
          <strong>Govardhan</strong>/<strong>Govardhan</strong>. Trim spaces;
          both fields are case-sensitive.
        </p>
      </div>
    </Dialog>
  );
}
