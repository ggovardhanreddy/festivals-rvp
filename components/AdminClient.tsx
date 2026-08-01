"use client";

import { useEffect, useState } from "react";

const API = "http://localhost:8788";

type ImportResult = {
  scanned: number;
  imported: number;
  skippedDuplicates: number;
  nearDuplicatesReview?: number;
  skippedUnsupported: number;
  unknownYear: number;
  byBucket?: Record<string, number>;
  albumsTouched: string[];
  errors: string[];
};

export function AdminClient() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [folder, setFolder] = useState(
    "/Users/govardhan.reddy.g.94gmail.com/Downloads/Fest",
  );
  const [keepOriginals, setKeepOriginals] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [lastImport, setLastImport] = useState<ImportResult | null>(null);

  useEffect(() => {
    fetch(`${API}/api/admin/session`, { credentials: "include" })
      .then((r) => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, []);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      setAuthed(response.ok);
      setMessage(
        response.ok
          ? "Signed in as Govardhan Reddy."
          : "Sign-in failed. Is npm run dev / admin-server running?",
      );
    } catch {
      setMessage("Admin API unreachable. Start with npm run dev (port 8788).");
    } finally {
      setBusy(false);
    }
  }

  async function importFolder() {
    if (!folder.trim()) {
      setMessage("Enter a local folder path, e.g. ~/Downloads/Photos");
      return;
    }
    setBusy(true);
    setMessage("Scanning and importing… this can take a while.");
    try {
      const response = await fetch(`${API}/api/admin/import-folder`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          path: folder.trim(),
          keepOriginals,
          processImages: true,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        result?: ImportResult;
        error?: string;
        next?: string;
      };
      if (!response.ok) {
        setMessage(data.error || "Import failed.");
        setLastImport(null);
      } else {
        setLastImport(data.result || null);
        setMessage(
          data.next ||
            "Import finished. Review the site, then confirm publish when ready.",
        );
      }
    } catch {
      setMessage("Import failed. Confirm the admin API is running locally.");
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    const confirmed = window.confirm(
      "Publish imported memories to GitHub now?\n\nThis will commit, push to ggovardhanreddy/festivals-rvp, and trigger deploy.\nNothing has been published yet.",
    );
    if (!confirmed) {
      setMessage("Publish cancelled. Local import is unchanged.");
      return;
    }
    setBusy(true);
    setMessage("Publishing…");
    try {
      const response = await fetch(`${API}/api/admin/publish`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        output?: string;
      };
      setMessage(
        response.ok
          ? "Published. GitHub Actions will deploy the updated archive."
          : data.error || data.output || "Publish failed.",
      );
    } catch {
      setMessage("Publish failed. Check git remote and admin API logs.");
    } finally {
      setBusy(false);
    }
  }

  if (!authed) {
    return (
      <section className="adminbox">
        <h2>Administrator sign-in</h2>
        <p>Only Govardhan Reddy may import local photos or publish changes.</p>
        <form onSubmit={login}>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <button disabled={busy} type="submit">
            Sign in
          </button>
        </form>
        {message && <p className="notice">{message}</p>}
      </section>
    );
  }

  return (
    <section className="adminbox">
      <h2>Local photos import</h2>
      <p>
        Select a folder on this computer. The archive scans every subfolder for
        photos and videos — ZIP files are not required. Import never pushes to
        GitHub until you confirm publish.
      </p>

      <label>
        Local folder path (default Fest source)
        <input
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          placeholder="/Users/govardhan.reddy.g.94gmail.com/Downloads/Fest"
        />
      </label>

      <label className="check">
        <input
          type="checkbox"
          checked={keepOriginals}
          onChange={(e) => setKeepOriginals(e.target.checked)}
        />
        Keep originals under <code>originals/</code> (git-ignored)
      </label>

      <div className="admin-actions">
        <button disabled={busy} onClick={importFolder} type="button">
          Import folder
        </button>
        <button
          disabled={busy || !lastImport}
          className="alt"
          onClick={publish}
          type="button"
        >
          Confirm & publish
        </button>
      </div>

      {lastImport && (
        <div className="notice">
          <p>
            Scanned {lastImport.scanned}, imported {lastImport.imported}, exact
            dupes {lastImport.skippedDuplicates}, near-dupe review{" "}
            {lastImport.nearDuplicatesReview || 0}, unsupported{" "}
            {lastImport.skippedUnsupported}.
          </p>
          {!!lastImport.albumsTouched.length && (
            <p>Albums: {lastImport.albumsTouched.join(", ")}</p>
          )}
          {!!lastImport.errors.length && (
            <p>Errors: {lastImport.errors.slice(0, 5).join(" | ")}</p>
          )}
        </div>
      )}

      {message && <p className="notice">{message}</p>}

      <p>
        Supported: JPG, JPEG, PNG, HEIC, WEBP, AVIF, GIF, MP4, MOV, WEBM, MKV.
        EXIF date → year folders under <code>public/images/</code>. SHA-256
        duplicates are skipped. CLI:{" "}
        <code>npm run import:folder -- --dir &quot;~/Downloads&quot;</code>
      </p>
    </section>
  );
}
