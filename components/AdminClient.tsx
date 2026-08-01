"use client";

import Link from "next/link";

const ALBUMS = [
  "sankranthi",
  "vinayaka-chavithi",
  "rvp-birthdays",
  "fun-trips",
] as const;

/**
 * GitHub is the CMS. No upload API, no database, no backend writes.
 */
export function AdminClient() {
  return (
    <div className="adminbox cms-guide">
      <p className="eyebrow">Administrator</p>
      <h2>GitHub content workflow</h2>
      <p className="muted">
        Photos are managed only in the <code>festivals-rvp</code> repository.
        There is no website upload form and no database.
      </p>

      <ol className="cms-steps">
        <li>Open the GitHub repo (web, mobile, Desktop, VS Code, Cursor, or git).</li>
        <li>
          Go to <code>content/&lt;YEAR&gt;/&lt;album&gt;/</code>
        </li>
        <li>Upload photos into the correct album folder.</li>
        <li>Commit and push to <code>main</code>.</li>
        <li>Wait for GitHub Actions → Cloudflare Pages deploy.</li>
        <li>Visit the live site — galleries update automatically.</li>
      </ol>

      <h3>Album folders</h3>
      <ul className="cms-albums">
        {ALBUMS.map((album) => (
          <li key={album}>
            <code>content/YYYY/{album}/</code>
          </li>
        ))}
      </ul>

      <p className="muted">
        Years are detected automatically. Hidden files like <code>.DS_Store</code>{" "}
        are ignored. Optional <code>metadata.json</code> can override title/story —
        media lists are generated on build.
      </p>

      <div className="btn-row" style={{ marginTop: "1.25rem" }}>
        <a
          className="btn"
          href="https://github.com/ggovardhanreddy/festivals-rvp"
          target="_blank"
          rel="noreferrer"
        >
          Open GitHub repo
        </a>
        <Link className="btn ghost" href="/">
          Back to village
        </Link>
      </div>
    </div>
  );
}
