"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { withBase } from "@/lib/base";
import { MEDIA_ACCEPT, R2_CATEGORIES, type R2Category } from "@/lib/r2-storage";
import {
  MEDIA_PIPELINE_STAGE_LABELS,
  MEDIA_PIPELINE_STAGE_ORDER,
  formatBytes,
  type MediaPipelineStage,
} from "@/lib/media-pipeline/constants";
import { prepareFileForUpload } from "@/lib/media-pipeline/client-optimize";

const ALBUMS = [
  "vinayaka-chavithi",
  "varalakshmi-vratam",
  "sankranthi",
  "sri-rama-navami",
  "mathamma-jathara",
  "devapatlamma-jathara",
  "ugadi",
  "deepavali",
  "dasara",
  "rvp-birthdays",
  "fun-trips",
] as const;

const LOCAL_API =
  process.env.NEXT_PUBLIC_ADMIN_API || "http://localhost:8788";

function uploadWithProgress(
  url: string,
  form: FormData,
  onProgress: (pct: number) => void,
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.withCredentials = true;
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(xhr.responseText) as Record<string, unknown>;
      } catch {
        data = { error: xhr.responseText || "Invalid response" };
      }
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data });
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });
}

function stageIndex(stage: MediaPipelineStage): number {
  const i = MEDIA_PIPELINE_STAGE_ORDER.indexOf(stage);
  return i === -1 ? 0 : i;
}

/**
 * GitHub remains the CMS for album sync. Admins can also upload processed
 * files directly to Cloudflare R2 when the MEDIA binding is configured.
 */
export function AdminClient() {
  const router = useRouter();
  const [folder, setFolder] = useState("~/Downloads/Photos");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<R2Category>("gallery");
  const [uploadYear, setUploadYear] = useState(String(new Date().getFullYear()));
  const [uploadAlbum, setUploadAlbum] = useState<(typeof ALBUMS)[number] | "">(
    "vinayaka-chavithi",
  );
  const [uploadPct, setUploadPct] = useState(0);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [uploadStage, setUploadStage] =
    useState<MediaPipelineStage>("queued");
  const [sizeSummary, setSizeSummary] = useState<string | null>(null);
  const [reindexBusy, setReindexBusy] = useState(false);
  const [autoReindex, setAutoReindex] = useState(true);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [watermarkOn, setWatermarkOn] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

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
      setResult(
        typeof data.next === "string"
          ? data.next
          : "Import finished. Open Gallery to review — then run media:migrate:r2 to push to Cloudflare R2.",
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

  async function uploadToR2() {
    const input = fileRef.current;
    const files = input?.files ? Array.from(input.files) : [];
    if (!files.length) {
      setUploadErr("Choose one or more files to upload.");
      return;
    }
    setUploadBusy(true);
    setUploadErr(null);
    setUploadMsg(null);
    setSizeSummary(null);
    setUploadPct(0);
    setUploadStage("queued");
    const uploaded: string[] = [];
    const sizeLines: string[] = [];
    try {
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i]!;
        setUploadStage("compressing");
        setUploadMsg(
          `${i + 1}/${files.length}: ${MEDIA_PIPELINE_STAGE_LABELS.compressing} — ${file.name}`,
        );

        const prepared = await prepareFileForUpload(
          file,
          (p) => {
            if (p.stage === "converting") setUploadStage("converting");
            else if (p.stage === "generating_preview")
              setUploadStage("generating_preview");
            else if (p.stage === "compressing") setUploadStage("compressing");
            setUploadMsg(
              `${i + 1}/${files.length}: ${p.message}`,
            );
            if (typeof p.pct === "number") {
              setUploadPct(
                Math.round(((i + p.pct / 200) / files.length) * 100),
              );
            }
          },
          { category },
        );

        if ("blocked" in prepared && prepared.blocked) {
          throw new Error(
            prepared.blockReason ||
              `${file.name} needs local/CI optimize (Workers cannot run FFmpeg).`,
          );
        }

        let uploadFile: File = file;
        let thumb: File | undefined;
        let originalBytes = file.size;
        let clientOptimized = false;
        let width = "";
        let height = "";

        if (prepared.kind === "image") {
          uploadFile = prepared.full;
          thumb = prepared.thumb;
          originalBytes = prepared.originalBytes;
          clientOptimized = true;
          width = String(prepared.width);
          height = String(prepared.height);
          sizeLines.push(
            `${file.name}: ${formatBytes(prepared.originalBytes)} → ${formatBytes(prepared.compressedBytes)} (−${prepared.savingsPct}%)`,
          );
          URL.revokeObjectURL(prepared.previewUrl);
        } else {
          uploadFile = prepared.file;
          sizeLines.push(
            `${file.name}: ${formatBytes(prepared.originalBytes)} (passthrough${prepared.note ? ` — ${prepared.note}` : ""})`,
          );
        }

        setUploadStage("uploading_r2");
        setUploadMsg(
          `${i + 1}/${files.length}: ${MEDIA_PIPELINE_STAGE_LABELS.uploading_r2} — ${uploadFile.name}`,
        );

        const form = new FormData();
        form.append("file", uploadFile);
        form.append("category", category);
        form.append("visibility", visibility);
        form.append("originalName", uploadFile.name);
        form.append("clientOptimized", clientOptimized ? "1" : "0");
        form.append("originalBytes", String(originalBytes));
        if (width) form.append("width", width);
        if (height) form.append("height", height);
        if (thumb) form.append("thumb", thumb);
        if (
          uploadYear &&
          uploadAlbum &&
          (category === "gallery" ||
            category === "videos" ||
            category === "funfest")
        ) {
          form.append("year", uploadYear);
          form.append("album", uploadAlbum);
        }
        const { ok, status, data } = await uploadWithProgress(
          withBase("/api/media/upload"),
          form,
          (pct) => {
            const overall = Math.round(
              ((i + 0.5 + pct / 200) / files.length) * 100,
            );
            setUploadPct(Math.min(99, overall));
          },
        );
        if (!ok) {
          throw new Error(
            String(data.error || `Upload failed for ${file.name} (${status})`),
          );
        }
        uploaded.push(String(data.key || uploadFile.name));
        if (data.key) {
          await fetch(withBase("/api/community/media-protection"), {
            method: "POST",
            credentials: "include",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              item: {
                id: String(data.key),
                visibility,
                watermark: watermarkOn,
                updatedAt: new Date().toISOString(),
              },
            }),
          }).catch(() => undefined);
        }
        window.dispatchEvent(
          new CustomEvent("rvp:media-uploaded", { detail: data }),
        );
        void import("@/lib/use-community").then(({ trackAnalyticsHit }) =>
          trackAnalyticsHit({
            path: "/admin/",
            kind: "upload",
            meta: String(data.key || uploadFile.name),
          }),
        );
      }

      setSizeSummary(sizeLines.join(" · "));

      let reindexNote = "";
      if (
        autoReindex &&
        uploadYear &&
        uploadAlbum &&
        (category === "gallery" ||
          category === "videos" ||
          category === "funfest")
      ) {
        setUploadStage("updating_gallery");
        setUploadMsg(MEDIA_PIPELINE_STAGE_LABELS.updating_gallery);
        const res = await fetch(withBase("/api/media/reindex"), {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ dispatch: true }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          albums?: number;
          media?: number;
          github?: { dispatched?: boolean };
        };
        if (!res.ok) {
          reindexNote = ` Reindex failed: ${data.error || res.status}. Use “Reindex gallery” manually.`;
        } else {
          reindexNote = ` Gallery updated (${data.albums ?? 0} albums / ${data.media ?? 0} media)${
            data.github?.dispatched ? "; content-sync dispatched." : "."
          }`;
        }
      }

      setUploadStage("completed");
      setUploadPct(100);
      setUploadMsg(
        `Completed — uploaded ${uploaded.length} file(s) to R2` +
          (uploadYear && uploadAlbum
            ? ` under ${uploadYear}/${uploadAlbum}.`
            : ` (flat ${category}/).`) +
          reindexNote,
      );
      if (input) input.value = "";
      router.refresh();
    } catch (err) {
      setUploadStage("failed");
      setUploadErr(
        err instanceof Error
          ? err.message
          : "R2 upload failed. Ensure R2 is enabled and you are signed in as admin.",
      );
    } finally {
      setUploadBusy(false);
    }
  }

  async function reindexGallery() {
    setReindexBusy(true);
    setUploadErr(null);
    setUploadMsg("Reindexing gallery from R2…");
    try {
      const res = await fetch(withBase("/api/media/reindex"), {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ dispatch: true }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        albums?: number;
        media?: number;
        github?: { dispatched?: boolean };
        note?: string;
      };
      if (!res.ok) throw new Error(data.error || `Reindex failed (${res.status})`);
      setUploadMsg(
        `Reindex OK — ${data.albums ?? 0} albums / ${data.media ?? 0} media written to catalog/albums.json.` +
          (data.github?.dispatched
            ? " GitHub content-sync dispatched."
            : " (No GitHub dispatch token — push/deploy still picks up catalog on next build.)") +
          (data.note ? ` ${data.note}` : ""),
      );
    } catch (err) {
      setUploadErr(
        err instanceof Error ? err.message : "Gallery reindex failed.",
      );
      setUploadMsg(null);
    } finally {
      setReindexBusy(false);
    }
  }

  return (
    <div className="adminbox cms-guide">
      <p className="eyebrow">Administrator</p>
      <h2>Media workflow</h2>
      <p className="muted">
        Album media is processed locally (HEIC→WebP, video→MP4) then stored in{" "}
        <strong>Cloudflare R2</strong>. The Pages deploy bundle only keeps the
        site shell — large media is served from R2.
      </p>

      <section className="admin-local-import">
        <h3>Upload to Cloudflare R2</h3>
        <p className="muted">
          Images are compressed in-browser (WebP ≤500&nbsp;KB, max edge 1920,
          EXIF stripped via canvas redraw) before upload. HEIC and large video
          need <code>npm run media:optimize</code> or the GitHub Action “Media
          Optimize” (Workers cannot run FFmpeg). Official{" "}
          <code>festivals/*/hero.webp</code> is never overwritten. Fun Fest
          paths stay private/signed.
        </p>
        <label className="admin-path-label">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as R2Category)}
            disabled={uploadBusy || reindexBusy}
          >
            {R2_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}/
              </option>
            ))}
          </select>
        </label>
        {category === "gallery" ||
        category === "videos" ||
        category === "funfest" ? (
          <div className="btn-row" style={{ gap: "0.75rem", flexWrap: "wrap" }}>
            <label className="admin-path-label">
              Year
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{4}"
                value={uploadYear}
                onChange={(e) => setUploadYear(e.target.value)}
                disabled={uploadBusy || reindexBusy}
                placeholder="2026"
              />
            </label>
            <label className="admin-path-label">
              Festival / album
              <select
                value={uploadAlbum}
                onChange={(e) =>
                  setUploadAlbum(e.target.value as (typeof ALBUMS)[number] | "")
                }
                disabled={uploadBusy || reindexBusy}
              >
                <option value="">(flat upload — not auto-indexed)</option>
                {ALBUMS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
        <fieldset className="admin-path-label" style={{ border: 0, padding: 0 }}>
          <legend>Visibility</legend>
          <label className="notif-pref-row">
            <input
              type="radio"
              name="media-visibility"
              checked={visibility === "public"}
              onChange={() => setVisibility("public")}
            />
            Public
          </label>
          <label className="notif-pref-row">
            <input
              type="radio"
              name="media-visibility"
              checked={visibility === "private"}
              onChange={() => setVisibility("private")}
            />
            Private — signed URL, not listed on the public gallery
          </label>
        </fieldset>
        <fieldset className="admin-path-label" style={{ border: 0, padding: 0 }}>
          <legend>Watermark</legend>
          <label className="notif-pref-row">
            <input
              type="radio"
              name="media-watermark"
              checked={watermarkOn}
              onChange={() => setWatermarkOn(true)}
            />
            Enabled
          </label>
          <label className="notif-pref-row">
            <input
              type="radio"
              name="media-watermark"
              checked={!watermarkOn}
              onChange={() => setWatermarkOn(false)}
            />
            Disabled
          </label>
        </fieldset>
        <p className="muted">Download: Disabled on public protected photographs.</p>
        <label className="admin-path-label">
          Files
          <input
            ref={fileRef}
            type="file"
            accept={MEDIA_ACCEPT}
            multiple
            disabled={uploadBusy || reindexBusy}
          />
        </label>
        <label className="admin-path-label" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            type="checkbox"
            checked={autoReindex}
            onChange={(e) => setAutoReindex(e.target.checked)}
            disabled={uploadBusy || reindexBusy}
          />
          Auto-reindex gallery after structured upload
        </label>
        {(uploadBusy || uploadStage === "completed" || uploadStage === "failed") && (
          <div className="admin-progress" role="status">
            <ol
              className="cms-steps"
              style={{ marginBottom: "0.75rem", fontSize: "0.9rem" }}
            >
              {MEDIA_PIPELINE_STAGE_ORDER.filter((s) => s !== "queued").map(
                (s) => {
                  const current = stageIndex(uploadStage);
                  const idx = stageIndex(s);
                  const done =
                    uploadStage === "completed" ||
                    (uploadStage !== "failed" && idx < current);
                  const active = s === uploadStage;
                  return (
                    <li
                      key={s}
                      style={{
                        opacity: done || active ? 1 : 0.45,
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      {done ? "✓ " : active ? "→ " : ""}
                      {MEDIA_PIPELINE_STAGE_LABELS[s]}
                    </li>
                  );
                },
              )}
            </ol>
            {uploadBusy ? (
              <>
                <div
                  className="admin-progress-bar admin-progress-bar--determinate"
                  style={{ width: `${uploadPct}%` }}
                />
                <p className="muted">
                  {MEDIA_PIPELINE_STAGE_LABELS[uploadStage]}… {uploadPct}%
                </p>
              </>
            ) : null}
          </div>
        )}
        {sizeSummary ? <p className="muted">{sizeSummary}</p> : null}
        {uploadErr ? <p className="media-error">{uploadErr}</p> : null}
        {uploadMsg ? <p className="muted">{uploadMsg}</p> : null}
        <div className="btn-row">
          <button
            type="button"
            className="btn"
            disabled={uploadBusy || reindexBusy}
            onClick={() => void uploadToR2()}
          >
            {uploadBusy
              ? `${MEDIA_PIPELINE_STAGE_LABELS[uploadStage]} ${uploadPct}%`
              : "Optimize & upload to R2"}
          </button>
          <button
            type="button"
            className="btn ghost"
            disabled={uploadBusy || reindexBusy}
            onClick={() => void reindexGallery()}
          >
            {reindexBusy ? "Reindexing…" : "Reindex gallery"}
          </button>
          <Link className="btn ghost" href="/gallery/">
            Open gallery
          </Link>
        </div>
      </section>

      <section className="admin-local-import">
        <h3>Local import (development)</h3>
        <p className="muted">
          Requires the local admin server on port 8788. Validates types, converts
          unsupported formats, and writes into <code>content/</code> +{" "}
          <code>public/</code>. Then run{" "}
          <code>npm run media:migrate:r2</code>.
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

      <h3>Production pipeline</h3>
      <ol className="cms-steps">
        <li>
          Stills: Admin <strong>Optimize &amp; upload</strong> (browser WebP),
          or HEIC/video via <code>npm run media:optimize</code> / GitHub Action.
        </li>
        <li>
          Git CMS: add under <code>content/&lt;YEAR&gt;/&lt;album&gt;/</code> →{" "}
          <code>npm run sync</code> (Sharp + optional FFmpeg).
        </li>
        <li>
          Enable R2 → <code>npm run media:migrate:r2</code> uploads to the
          bucket.
        </li>
        <li>
          Set <code>NEXT_PUBLIC_R2_PUBLIC_URL</code> and{" "}
          <code>npm run deploy:cf</code> (strips local media from the Pages
          bundle).
        </li>
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
        Supported images: JPG, PNG, GIF, WEBP, HEIC/HEIF, AVIF, BMP, TIFF.
        Videos: MP4, MOV, AVI, MKV, WEBM, M4V, 3GP, MPEG. Audio: MP3, WAV, AAC,
        M4A, OGG, FLAC.
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
