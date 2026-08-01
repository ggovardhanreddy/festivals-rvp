"use client";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
export default function Login() {
  const [message, setMessage] = useState("");
  async function submit(form: FormData) { const r = await fetch("http://localhost:8788/login", { method:"POST", credentials:"include", headers:{"content-type":"application/json"}, body:JSON.stringify({password:form.get("password")}) }); setMessage(r.ok ? "Signed in. Return to the dashboard." : "Sign-in failed."); }
  return <SiteShell><main className="admin"><h1>Admin sign in</h1><p>Only Govardhan Reddy may administer this local archive.</p><form action={submit}><label>Password<input name="password" type="password" required autoComplete="current-password" /></label><button className="button">Sign in</button></form>{message && <p>{message}</p>}</main></SiteShell>;
}
