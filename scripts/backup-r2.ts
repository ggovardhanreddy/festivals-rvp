/**
 * Back up the mutable R2 state that has no other copy.
 *
 *   npx tsx scripts/backup-r2.ts            # community collections + inventory
 *   npx tsx scripts/backup-r2.ts --verify   # verify the newest backup instead
 *
 * Covers the two gaps identified in docs/BACKUP_AND_RECOVERY.md:
 *
 *   1. community/<collection>.json  — admin edits overwrite in place, no history
 *   2. an object inventory          — so media loss is at least DETECTABLE
 *
 * It does NOT copy media objects; that is `rclone sync` (see the doc). Backups
 * are written outside the repository. Requires wrangler to be authenticated.
 */
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BUCKET = process.env.R2_BUCKET || "reddivaripalli";
const ROOT = process.cwd();
const BACKUP_ROOT = path.resolve(
  process.env.R2_BACKUP_DIR || path.join(os.homedir(), "rvp-backups"),
);

/** Mirrors COLLECTIONS in functions/api/community/[[route]].ts. */
const COLLECTIONS = [
  "directory", "members", "lost-found", "panchayat-docs", "heritage",
  "suggestions", "site-settings", "analytics", "audit", "events", "announcements",
] as const;

function wrangler(args: string[]): string {
  return execFileSync("npx", ["wrangler", ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 256 * 1024 * 1024,
  });
}

function sha256(file: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function newestBackup(): string | null {
  if (!fs.existsSync(BACKUP_ROOT)) return null;
  const dirs = fs.readdirSync(BACKUP_ROOT).filter((d) => d.startsWith("r2-")).sort();
  return dirs.length ? path.join(BACKUP_ROOT, dirs[dirs.length - 1]!) : null;
}

function verify() {
  const dir = newestBackup();
  if (!dir) {
    console.error(`No backup found under ${BACKUP_ROOT}`);
    process.exit(1);
  }
  const manifestPath = path.join(dir, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error(`Backup at ${dir} has no manifest — treat it as untrusted.`);
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
    files: { name: string; sha256: string; bytes: number }[];
  };
  let bad = 0;
  for (const f of manifest.files) {
    const p = path.join(dir, f.name);
    if (!fs.existsSync(p)) { console.error(`MISSING  ${f.name}`); bad += 1; continue; }
    const actual = sha256(p);
    if (actual !== f.sha256) { console.error(`CORRUPT  ${f.name}`); bad += 1; continue; }
    try { JSON.parse(fs.readFileSync(p, "utf8")); }
    catch { console.error(`INVALID JSON  ${f.name}`); bad += 1; continue; }
    console.log(`ok  ${f.name}  ${f.bytes} bytes`);
  }
  console.log("");
  if (bad) { console.error(`VERIFY FAILED — ${bad} problem(s) in ${dir}`); process.exit(1); }
  console.log(`Verified ${manifest.files.length} file(s) in ${dir}`);
}

/** Fail fast if the bucket is unreachable, so we never write an empty "backup". */
function assertBucketReachable() {
  try {
    wrangler(["r2", "object", "list", BUCKET, "--remote"]);
  } catch (err) {
    console.error(`Cannot reach R2 bucket "${BUCKET}".`);
    console.error("Authenticate first:  npx wrangler login");
    console.error("Or set CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID.");
    console.error("");
    console.error("Refusing to write a backup directory that would look like a");
    console.error("successful backup while containing nothing.");
    console.error(String(err).split("\n").slice(0, 3).join("\n"));
    process.exit(1);
  }
}

function backup() {
  assertBucketReachable();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const dir = path.join(BACKUP_ROOT, `r2-${stamp}`);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });

  const files: { name: string; sha256: string; bytes: number }[] = [];
  let saved = 0, absent = 0;

  for (const c of COLLECTIONS) {
    const name = `community-${c}.json`;
    const dest = path.join(dir, name);
    try {
      wrangler(["r2", "object", "get", `${BUCKET}/community/${c}.json`, "--file", dest, "--remote"]);
      if (!fs.existsSync(dest) || fs.statSync(dest).size === 0) {
        fs.rmSync(dest, { force: true });
        console.log(`absent  ${c}  (never written — Function serves the git seed)`);
        absent += 1;
        continue;
      }
      JSON.parse(fs.readFileSync(dest, "utf8")); // fail fast on corruption
      const bytes = fs.statSync(dest).size;
      files.push({ name, sha256: sha256(dest), bytes });
      console.log(`saved   ${c}  ${bytes} bytes`);
      saved += 1;
    } catch {
      console.log(`absent  ${c}  (not present in R2)`);
      absent += 1;
    }
  }

  let inventoryCount = 0;
  try {
    const listing = wrangler(["r2", "object", "list", BUCKET, "--remote"]);
    const invPath = path.join(dir, "inventory.txt");
    fs.writeFileSync(invPath, listing, { mode: 0o600 });
    inventoryCount = listing.split("\n").filter(Boolean).length;
    files.push({ name: "inventory.txt", sha256: sha256(invPath), bytes: fs.statSync(invPath).size });
    console.log(`saved   inventory  ${inventoryCount} lines`);
  } catch (err) {
    console.error("Bucket became unreachable mid-backup — treat this backup as incomplete.");
    console.error(String(err).split("\n")[0]);
    process.exit(1);
  }

  fs.writeFileSync(
    path.join(dir, "manifest.json"),
    JSON.stringify({ bucket: BUCKET, takenAt: new Date().toISOString(), saved, absent, files }, null, 2),
    { mode: 0o600 },
  );

  console.log("");
  console.log(`Backup: ${dir}`);
  console.log(`  ${saved} collection(s) saved, ${absent} absent`);
  console.log("");
  console.log("Media objects are NOT copied by this script. For those:");
  console.log(`  rclone sync r2:${BUCKET} ~/rvp-backups/media/ --progress`);
  console.log("");
  console.log("Verify this backup before relying on it:");
  console.log("  npx tsx scripts/backup-r2.ts --verify");
  if (BACKUP_ROOT.startsWith(ROOT)) {
    console.error("");
    console.error("WARNING: backups are inside the repository. Set R2_BACKUP_DIR elsewhere.");
  }
}

process.argv.includes("--verify") ? verify() : backup();
