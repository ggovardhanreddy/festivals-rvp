/**
 * Remove heavy media folders from `out/` before Cloudflare Pages deploy
 * when media is served from R2 (NEXT_PUBLIC_R2_PUBLIC_URL is set).
 *
 * Keeps small brand/logo fallbacks under a few MB for PWA/icons.
 * Never delete route HTML (e.g. out/members/index.html).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "out");
const R2 = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

/** Whole directories that are media-only (no Next.js route HTML inside). */
const REMOVE_DIRS = ["images", "videos", "thumbs", "audio", "docs", "festivals"];

/** Media extensions to strip from route folders that also hold HTML (e.g. members/). */
const MEDIA_EXT = new Set([
  ".webp",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".avif",
  ".mp4",
  ".webm",
  ".mov",
  ".mp3",
  ".wav",
  ".ogg",
  ".pdf",
]);

function rmrf(target: string) {
  if (!fs.existsSync(target)) return;
  fs.rmSync(target, { recursive: true, force: true });
  console.log("removed", path.relative(ROOT, target));
}

/** Delete media files only; keep index.html / .txt for the route. */
function stripMediaFiles(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      stripMediaFiles(full);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (MEDIA_EXT.has(ext)) {
      fs.unlinkSync(full);
      console.log("stripped media", path.relative(ROOT, full));
    }
  }
}

function main() {
  if (!R2) {
    console.log(
      "NEXT_PUBLIC_R2_PUBLIC_URL unset — keeping local media in out/ (will still drop >24MiB files).",
    );
  } else {
    for (const dir of REMOVE_DIRS) {
      rmrf(path.join(OUT, dir));
    }
    // members/ holds both the /members/ page and portrait webps — keep the page
    stripMediaFiles(path.join(OUT, "members"));
  }

  // Always strip Cloudflare Pages 25 MiB offenders
  const max = 24 * 1024 * 1024;
  const walk = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (fs.statSync(full).size > max) {
        fs.unlinkSync(full);
        console.log("stripped oversized", path.relative(OUT, full));
      }
    }
  };
  walk(OUT);
}

main();
