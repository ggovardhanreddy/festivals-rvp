import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
const tasks = ["Create or rename years and albums", "Upload images or ingest ZIPs from inbox/", "Edit dates, titles, descriptions and tags", "Choose covers and favorites", "Reorder items and publish or hide albums", "Delete content, then locally publish with Git"];
export default function AdminPage() {
  return <SiteShell><main className="admin"><div className="eyebrow">Govardhan Reddy · local administration</div><h1>Archive dashboard</h1><p>The static site is edited through the local admin server. Authentication uses an HMAC-signed HttpOnly session cookie; Cloudflare Pages serves the published output.</p><section className="grid">{tasks.map((task) => <article className="card" key={task}><h3>{task}</h3><p>Use <code>npm run dev</code>, then the local dashboard API at port 8788.</p></article>)}</section><Link className="button" href="/admin/login">Sign in locally</Link></main></SiteShell>;
}
