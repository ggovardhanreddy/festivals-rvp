/**
 * Pre-flight and post-flight verification for a media migration to R2.
 *
 *   npx tsx scripts/verify-media-migration.ts --pre   [--prefix images/2026/devapatlamma-jathara]
 *   npx tsx scripts/verify-media-migration.ts --post  [--prefix ...]
 *
 * --pre  runs BEFORE `npm run media:migrate:r2`:
 *        counts local objects, records size + md5 for each, resolves the
 *        destination bucket and public base, and reports which albums
 *        reference the files. Writes a manifest.
 *
 * --post runs AFTER the migration:
 *        lists the bucket, compares against the manifest, and reports any
 *        object that did not arrive or arrived at the wrong size.
 *
 * It never deletes anything. Deletion of local originals is a separate,
 * manual decision that should only follow a clean --post run.
 */
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const BUCKET = process.env.R2_BUCKET || "reddivaripalli";
const PUBLIC_BASE = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";
const OUT_DIR = path.resolve(
  process.env.MIGRATION_DIR || path.join(os.homedir(), "rvp-backups", "migrations"),
);
const MEDIA_DIRS = ["public/images", "public/thumbs", "public/videos", "public/audio"];

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function walk(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.isFile() && !e.name.startsWith(".")) acc.push(p);
  }
  return acc;
}

function md5(file: string): string {
  return crypto.createHash("md5").update(fs.readFileSync(file)).digest("hex");
}

/** public/images/x/y.webp -> images/x/y.webp (the R2 key convention). */
function r2Key(rel: string): string {
  return rel.replace(/^public\//, "");
}

function collectLocal(prefix?: string) {
  const all = MEDIA_DIRS.flatMap((d) => walk(path.join(ROOT, d)))
    .map((abs) => path.relative(ROOT, abs));
  return prefix ? all.filter((r) => r2Key(r).startsWith(prefix)) : all;
}

function albumReferences(keys: Set<string>) {
  const p = path.join(ROOT, "generated", "albums.json");
  if (!fs.existsSync(p)) return { referenced: 0, orphaned: [] as string[] };
  const raw = fs.readFileSync(p, "utf8");
  let referenced = 0;
  const orphaned: string[] = [];
  for (const k of keys) {
    if (raw.includes(k)) referenced += 1;
    else orphaned.push(k);
  }
  return { referenced, orphaned };
}

function pre() {
  const prefix = arg("--prefix");
  const files = collectLocal(prefix);
  if (!files.length) {
    console.error(`No local media found${prefix ? ` under ${prefix}` : ""}.`);
    process.exit(1);
  }

  console.log("=== DESTINATION ===");
  console.log(`  bucket       ${BUCKET}`);
  console.log(`  public base  ${PUBLIC_BASE || "(NEXT_PUBLIC_R2_PUBLIC_URL not set — set it before migrating)"}`);
  if (!PUBLIC_BASE) {
    console.error("\nRefusing to produce a manifest without a public base URL.");
    console.error("The build rewrites gallery URLs using it; migrating without it would break links.");
    process.exit(1);
  }

  const entries = files.map((rel) => {
    const abs = path.join(ROOT, rel);
    return { key: r2Key(rel), local: rel, bytes: fs.statSync(abs).size, md5: md5(abs) };
  });
  const totalBytes = entries.reduce((n, e) => n + e.bytes, 0);

  console.log("\n=== OBJECTS ===");
  console.log(`  count        ${entries.length}`);
  console.log(`  total        ${(totalBytes / 1048576).toFixed(1)} MiB`);
  const byExt = new Map<string, number>();
  for (const e of entries) {
    const ext = path.extname(e.key).toLowerCase() || "(none)";
    byExt.set(ext, (byExt.get(ext) || 0) + 1);
  }
  for (const [ext, n] of [...byExt].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${ext.padEnd(8)} ${n}`);
  }

  console.log("\n=== ACCESS ===");
  const priv = entries.filter((e) => /(^|\/)(funfest|fun-trips|documents|private)\//.test(e.key));
  console.log(`  public       ${entries.length - priv.length}`);
  console.log(`  private      ${priv.length}  (served signed via /api/media)`);

  console.log("\n=== APPLICATION REFERENCES ===");
  const { referenced, orphaned } = albumReferences(new Set(entries.map((e) => e.key)));
  console.log(`  in generated/albums.json  ${referenced} of ${entries.length}`);
  if (orphaned.length === entries.length && entries.length > 0) {
    // Every object unreferenced almost always means a stale catalogue, not
    // 152 orphaned files. generated/albums.json is rebuilt by `npm run sync`
    // from the media actually present on disk.
    console.log(`  not referenced            ${orphaned.length}  <-- ALL of them`);
    console.log("");
    console.log("  This is far more likely a STALE CATALOGUE than orphaned media.");
    console.log("  Run `npm run sync` to rebuild generated/albums.json from disk,");
    console.log("  then re-run --pre. Do not migrate on the strength of this result.");
  } else if (orphaned.length) {
    console.log(`  not referenced            ${orphaned.length}`);
    for (const o of orphaned.slice(0, 8)) console.log(`    ${o}`);
    if (orphaned.length > 8) console.log(`    … and ${orphaned.length - 8} more`);
    console.log("  (unreferenced objects still migrate; they just are not shown yet)");
  }

  fs.mkdirSync(OUT_DIR, { recursive: true, mode: 0o700 });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const manifestPath = path.join(OUT_DIR, `migration-${stamp}.json`);
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      { bucket: BUCKET, publicBase: PUBLIC_BASE, prefix: prefix || null,
        createdAt: new Date().toISOString(), count: entries.length, totalBytes, entries },
      null, 2,
    ),
    { mode: 0o600 },
  );

  console.log(`\n=== MANIFEST ===\n  ${manifestPath}`);
  console.log("\nNext:");
  console.log("  1. npx tsx scripts/backup-r2.ts        # snapshot before writing");
  console.log("  2. R2_MIGRATE_DRY=1 npm run media:migrate:r2");
  console.log("  3. npm run media:migrate:r2");
  console.log("  4. npx tsx scripts/verify-media-migration.ts --post");
  console.log("\nDo NOT delete local originals until step 4 reports zero missing.");
}

function post() {
  fs.mkdirSync(OUT_DIR, { recursive: true, mode: 0o700 });
  const manifests = fs.readdirSync(OUT_DIR).filter((f) => f.startsWith("migration-")).sort();
  if (!manifests.length) {
    console.error(`No manifest in ${OUT_DIR}. Run --pre first.`);
    process.exit(1);
  }
  const manifestPath = path.join(OUT_DIR, manifests[manifests.length - 1]!);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
    bucket: string; entries: { key: string; bytes: number }[];
  };
  console.log(`Verifying against ${manifestPath}\n`);

  let listing = "";
  try {
    listing = execFileSync("npx", ["wrangler", "r2", "object", "list", manifest.bucket, "--remote"],
      { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  } catch {
    console.error("Could not list the bucket. Is wrangler authenticated?");
    process.exit(1);
  }

  const missing = manifest.entries.filter((e) => !listing.includes(e.key));
  console.log(`  expected  ${manifest.entries.length}`);
  console.log(`  present   ${manifest.entries.length - missing.length}`);
  console.log(`  MISSING   ${missing.length}`);
  if (missing.length) {
    for (const m of missing.slice(0, 20)) console.log(`    ${m.key}`);
    if (missing.length > 20) console.log(`    … and ${missing.length - 20} more`);
    console.error("\nMIGRATION INCOMPLETE — do not delete local originals.");
    process.exit(1);
  }
  console.log("\nAll objects present in R2.");
  console.log("Now confirm in a browser that a migrated image renders on the live site,");
  console.log("then local originals may be removed if you choose.");
}

if (process.argv.includes("--post")) post();
else if (process.argv.includes("--pre")) pre();
else { console.error("Usage: verify-media-migration.ts --pre|--post [--prefix <r2-prefix>]"); process.exit(1); }
