/**
 * Upload local public media to Cloudflare R2 and rewrite albums.json paths.
 *
 * Prerequisites:
 * 1. R2 bucket exists (default: reddivaripalli)
 * 2. Public URL enabled (r2.dev or custom domain)
 * 3. Env vars set (see .env.example)
 *
 * Usage:
 *   npm run media:migrate:r2:dry
 *   NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev npm run media:migrate:r2
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToR2Key } from "../lib/media-url";
import { guessContentType } from "../lib/r2-storage";

const ROOT = process.cwd();

/** Load KEY=VALUE pairs from .env.local without executing the file. */
function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env) || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(ROOT, ".env.local"));
loadEnvFile(path.join(ROOT, ".env"));

const BUCKET = process.env.R2_BUCKET || "reddivaripalli";
const PUBLIC_URL = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "").replace(
  /\/$/,
  "",
);
const DRY = process.env.R2_MIGRATE_DRY === "1";
const CONCURRENCY = Math.max(
  1,
  Math.min(16, Number(process.env.R2_MIGRATE_CONCURRENCY || "8")),
);
const MANIFEST_PATH = path.join(ROOT, "generated", "r2-migration.json");

const SOURCE_DIRS = [
  "public/images",
  "public/thumbs",
  "public/videos",
  "public/audio",
  "public/docs",
  "public/brand",
  "public/festivals",
  "public/logo",
  "public/members",
] as const;

type Manifest = {
  bucket: string;
  publicUrl: string | null;
  uploaded: number;
  failed: number;
  skipped: number;
  at: string;
  dry: boolean;
  keys?: string[];
};

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function sitePathFromPublicFile(file: string): string {
  const rel = path
    .relative(path.join(ROOT, "public"), file)
    .replace(/\\/g, "/");
  return `/${rel}`;
}

function loadDoneKeys(): Set<string> {
  try {
    if (!fs.existsSync(MANIFEST_PATH)) return new Set();
    const data = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) as Manifest;
    return new Set(data.keys || []);
  } catch {
    return new Set();
  }
}

function uploadOne(file: string, key: string): Promise<void> {
  if (DRY) {
    console.log(`[dry] ${file} → r2://${BUCKET}/${key}`);
    return Promise.resolve();
  }
  const contentType = guessContentType(path.basename(file));
  return new Promise((resolve, reject) => {
    const child = spawn(
      "npx",
      [
        "wrangler",
        "r2",
        "object",
        "put",
        `${BUCKET}/${key}`,
        "--file",
        file,
        "--remote",
        "--content-type",
        contentType,
      ],
      { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] },
    );
    let err = "";
    child.stderr.on("data", (chunk) => {
      err += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(err || `wrangler exit ${code}`));
    });
  });
}

async function mapPool<T>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>,
) {
  let idx = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (idx < items.length) {
      const current = idx;
      idx += 1;
      await worker(items[current]!, current);
    }
  });
  await Promise.all(runners);
}

function rewriteAlbumsJson() {
  if (!PUBLIC_URL) {
    console.warn(
      "NEXT_PUBLIC_R2_PUBLIC_URL not set — skipping albums.json rewrite.",
    );
    return;
  }
  const albumsPath = path.join(ROOT, "generated", "albums.json");
  if (!fs.existsSync(albumsPath)) {
    console.warn("generated/albums.json missing — run npm run sync first.");
    return;
  }
  const albums = JSON.parse(fs.readFileSync(albumsPath, "utf8")) as Array<{
    cover?: string;
    media?: Array<{
      file?: string;
      thumb?: string;
      poster?: string;
      original?: string;
      fileAvif?: string;
    }>;
  }>;

  const rewrite = (p?: string) => {
    if (!p || /^https?:\/\//i.test(p)) return p;
    // Keep private paths relative so the client requests signed URLs
    if (
      p.includes("/fun-trips/") ||
      p.startsWith("/docs/") ||
      p.includes("/funfest/")
    ) {
      return p;
    }
    if (
      p.startsWith("/images/") ||
      p.startsWith("/thumbs/") ||
      p.startsWith("/videos/") ||
      p.startsWith("/audio/") ||
      p.startsWith("/brand/") ||
      p.startsWith("/members/") ||
      p.startsWith("/logo/") ||
      p.startsWith("/festivals/")
    ) {
      return `${PUBLIC_URL}/${pathToR2Key(p)}`;
    }
    return p;
  };

  for (const album of albums) {
    album.cover = rewrite(album.cover);
    for (const item of album.media || []) {
      item.file = rewrite(item.file);
      item.thumb = rewrite(item.thumb);
      item.poster = rewrite(item.poster);
      item.original = rewrite(item.original);
      item.fileAvif = rewrite(item.fileAvif);
    }
  }

  const outPath = path.join(ROOT, "generated", "albums.r2.json");
  fs.writeFileSync(outPath, JSON.stringify(albums, null, 2));
  fs.writeFileSync(albumsPath, JSON.stringify(albums, null, 2));
  console.log(`Rewrote media URLs → ${PUBLIC_URL} (${albums.length} albums)`);
}

async function main() {
  console.log(
    `R2 migrate → bucket=${BUCKET} dry=${DRY} concurrency=${CONCURRENCY}`,
  );
  if (!PUBLIC_URL && !DRY) {
    console.warn(
      "Tip: set NEXT_PUBLIC_R2_PUBLIC_URL so albums.json is rewritten after upload.",
    );
  }

  const jobs: Array<{ file: string; key: string }> = [];
  for (const dir of SOURCE_DIRS) {
    const abs = path.join(ROOT, dir);
    const files = walk(abs);
    console.log(`${dir}: ${files.length} files`);
    for (const file of files) {
      const sitePath = sitePathFromPublicFile(file);
      const key = pathToR2Key(sitePath);
      jobs.push({ file, key });
    }
  }

  const done = loadDoneKeys();
  let uploaded = 0;
  let failed = 0;
  let skipped = 0;
  const keys = new Set(done);

  const pending = jobs.filter((j) => {
    if (done.has(j.key) && !DRY) {
      skipped += 1;
      return false;
    }
    return true;
  });

  console.log(
    `Total=${jobs.length} pending=${pending.length} already=${skipped}`,
  );

  let completed = 0;
  await mapPool(pending, CONCURRENCY, async (job) => {
    try {
      await uploadOne(job.file, job.key);
      uploaded += 1;
      keys.add(job.key);
    } catch (error) {
      failed += 1;
      console.error(`Failed ${job.file}:`, error);
    } finally {
      completed += 1;
      if (completed % 25 === 0 || completed === pending.length) {
        console.log(
          `Progress ${completed}/${pending.length} (ok=${uploaded} fail=${failed})`,
        );
        // Persist resume manifest periodically
        if (!DRY) {
          fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
          fs.writeFileSync(
            MANIFEST_PATH,
            JSON.stringify(
              {
                bucket: BUCKET,
                publicUrl: PUBLIC_URL || null,
                uploaded: keys.size,
                failed,
                skipped,
                at: new Date().toISOString(),
                dry: DRY,
                keys: [...keys],
              } satisfies Manifest,
              null,
              2,
            ),
          );
        }
      }
    }
  });

  rewriteAlbumsJson();

  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(
    MANIFEST_PATH,
    JSON.stringify(
      {
        bucket: BUCKET,
        publicUrl: PUBLIC_URL || null,
        uploaded: keys.size,
        failed,
        skipped,
        at: new Date().toISOString(),
        dry: DRY,
        keys: DRY ? undefined : [...keys],
      } satisfies Manifest,
      null,
      2,
    ),
  );

  console.log(
    `Done. uploaded=${uploaded} failed=${failed} skipped=${skipped}. Manifest → generated/r2-migration.json`,
  );
  console.log(
    "After confirming R2 URLs work, deploy with NEXT_PUBLIC_R2_PUBLIC_URL set (npm run deploy:cf strips local media).",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
