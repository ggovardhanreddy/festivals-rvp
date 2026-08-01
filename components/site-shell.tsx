"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = ["years", "festivals", "trips", "gallery", "favorites", "search", "about"];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(localStorage.theme === "dark"); if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js"); }, []);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); localStorage.theme = dark ? "dark" : "light"; }, [dark]);
  return <><header className="shell"><nav className="nav"><Link href="/" className="brand">Festivals RVP</Link><div className="navlinks">{links.map((x) => <Link key={x} href={`/${x}`}>{x}</Link>)}<Link href="/admin">admin</Link><button aria-label="Toggle theme" onClick={() => setDark(!dark)}>{dark ? "☀︎" : "◐"}</button></div></nav></header>{children}<footer className="shell footer">A family memory archive · Please enjoy respectfully. <Link href="/offline">Offline access</Link></footer></>;
}

export function PrivateNotice() {
  return <p className="notice">This is a personal archive. Images are displayed for viewing only; please respect the family’s privacy.</p>;
}
