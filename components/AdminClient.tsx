"use client";

import Link from "next/link";
import { useState } from "react";

const ALBUMS = [
  "sankranthi",
  "vinayaka-chavithi",
  "mathamma-jathara",
  "devapatlamma-jathara",
  "sri-rama-navami",
  "rvp-birthdays",
  "fun-trips",
] as const;

const LOCAL_API =
  process.env.NEXT_PUBLIC_ADMIN_API || "http://localhost:8788";

/**
 * GitHub is the CMS for production. Local admin API can import a folder
 * when `npm run admin:api` (or scripts/admin-server) is running.
 */
export function AdminClient() {
  const [folder, setFolder] = useState("~/Downloads/Photos");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function importFolder() {
    setBusy(true);
    setError(null);
    setResult(null);
    setProgress("Connecting to local admin API…");
    try {
      setProgress("Importing & converting media (HEIC→WebP, video→MP4)…");
      const res = await fetch(`${LOCAL_API}/api/admin/import-folder`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          path: folder,
          keepOriginals: true,
          processImages: true,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        result?: unknown;
        next?: string;
      };
      if (!res.ok) {
        throw new Error(
          data.error ||
            (res.status === 401
              ? "Sign in to the local admin API first."
              : `Import failed (${res.status})`),
        );
      }
      setProgress("Refreshing gallery catalog…");
      // Kick a client refresh of album pages after local import
      setResult(
        typeof data.next === "string"
          ? data.next
          : "Import finished. Open Gallery to review — no page rebuild required for local public assets already written.",
      );
      setProgress("");
    } catch (err) {
      setProgress("");
      setError(
        err instanceof Error
          ? err.message
          : "Local admin API is not running. Use the GitHub workflow below, or start `npx tsx scripts/admin-server.ts`.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adminbox cms-guide">
      <p className="eyebrow">Administrator</p>
      <h2>Media workflow</h2>
      <p className="muted">
        Production publishes from GitHub <code>content/</code> only — there is
        no public upload API. Locally you can import a folder; the pipeline
        converts HEIC/HEIF → WebP and MOV/etc → MP4 before the gallery reads
        them.
      </p>

      <section className="admin-local-import">
        <h3>Local import (development)</h3>
        <p className="muted">
          Requires the local admin server on port 8788. Validates types, converts
          unsupported formats, and writes into <code>content/</code> +{" "}
          <code>public/</code>.
        </p>
        <label className="admin-path-label">
          Folder path
          <input
            type="text"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            disabled={busy}
            placeholder="~/Downloads/Photos"
          />
        </label>
        {busy ? (
          <div className="admin-progress" role="status">
            <div className="admin-progress-bar" />
            <p className="muted">{progress || "Working…"}</p>
          </div>
        ) : null}
        {error ? <p className="media-error">{error}</p> : null}
        {result ? <p className="muted">{result}</p> : null}
        <div className="btn-row">
          <button
            type="button"
            className="btn"
            disabled={busy || !folder.trim()}
            onClick={() => void importFolder()}
          >
            {busy ? "Importing…" : "Import folder"}
          </button>
        </div>
      </section>

      <h3>Production (GitHub)</h3>
      <ol className="cms-steps">
        <li>Open the GitHub repo.</li>
        <li>
          Go to <code>content/&lt;YEAR&gt;/&lt;album&gt;/</code>
        </li>
        <li>
          Upload JPG, PNG, WEBP, HEIC, MP4, MOV, and other supported media.
        </li>
        <li>Commit and push to <code>main</code>.</li>
        <li>CI runs sync (sharp + ffmpeg) → Cloudflare Pages deploy.</li>
        <li>Galleries update automatically with browser-safe WebP/MP4.</li>
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
        Supported images: JPG, PNG, GIF, WEBP, HEIC/HEIF, AVIF source, BMP,
        TIFF, SVG (sanitized). Videos: MP4, MOV, AVI, MKV, WEBM, M4V, 3GP,
        MPEG. Audio: MP3, WAV, AAC, M4A, OGG, FLAC.
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
        <Link className="btn ghost" href="/gallery/">
          Open gallery
        </Link>
        <Link className="btn ghost" href="/">
          Back to village
        </Link>
      </div>
    </div>
  );
}
