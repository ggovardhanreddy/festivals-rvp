/**
 * Import year-organized Downloads/Photos into content/<year>/<bucket>/.
 * Skips Background/ and Logo/. Then run: npm run sync
 */
import fs from "node:fs";
import path from "node:path";
import { CMS_ALBUMS } from "../lib/cms";
import { CONTENT_DIR, IMAGE_EXTS, VIDEO_EXTS } from "../lib/paths";
import type { BucketKey } from "../lib/types";
import { slugify } from "../lib/slug";

const SOURCE =
  process.argv[2] ||
  path.join(
    process.env.HOME || "",
    "Downloads",
    "Photos",
  );

const FOLDER_TO_BUCKET: Record<string, BucketKey> = {
  "fun-fest": "fun-trips",
  funfest: "fun-trips",
  "vinayaka chaviti": "vinayaka-chavithi",
  "vinayaka chavithi": "vinayaka-chavithi",
  "vinakayachavithi": "vinayaka-chavithi",
  mathamma: "mathamma-jathara",
  "mathamma ": "mathamma-jathara",
  devapatlamma: "devapatlamma-jathara",
  "devapatlamma ": "devapatlamma-jathara",
  sankranthi: "sankranthi",
  sankranti: "sankranthi",
  sreeramanavami: "sri-rama-navami",
  "sri rama navami": "sri-rama-navami",
  ramanavami: "sri-rama-navami",
};

function normalizeFolder(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function resolveBucket(folderName: string): BucketKey | null {
  const key = normalizeFolder(folderName);
  if (FOLDER_TO_BUCKET[key]) return FOLDER_TO_BUCKET[key];
  if (FOLDER_TO_BUCKET[`${key} `]) return FOLDER_TO_BUCKET[`${key} `];
  // fuzzy
  if (key.includes("fun")) return "fun-trips";
  if (key.includes("vinayaka") || key.includes("vinakaya")) return "vinayaka-chavithi";
  if (key.includes("mathamma")) return "mathamma-jathara";
  if (key.includes("devapat")) return "devapatlamma-jathara";
  if (key.includes("sankr")) return "sankranthi";
  if (key.includes("rama")) return "sri-rama-navami";
  return null;
}

function walkMedia(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (/^background$/i.test(entry.name) || /^logo$/i.test(entry.name)) continue;
      out.push(...walkMedia(full));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTS.has(ext) || VIDEO_EXTS.has(ext)) out.push(full);
    }
  }
  return out;
}

function uniqueName(destDir: string, base: string, ext: string) {
  let name = `${base}${ext}`;
  let i = 2;
  while (fs.existsSync(path.join(destDir, name))) {
    name = `${base}-${i}${ext}`;
    i += 1;
  }
  return name;
}

function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`Source not found: ${SOURCE}`);
    process.exit(1);
  }

  // Ensure CMS folders exist for known years
  for (const year of fs.readdirSync(SOURCE)) {
    const yearPath = path.join(SOURCE, year);
    // top-level are festival names, not years
  }

  let copied = 0;
  let skipped = 0;
  const byBucket: Record<string, number> = {};

  for (const festivalEntry of fs.readdirSync(SOURCE, { withFileTypes: true })) {
    if (!festivalEntry.isDirectory() || festivalEntry.name.startsWith(".")) continue;
    if (/^logo$/i.test(festivalEntry.name)) continue;

    const bucket = resolveBucket(festivalEntry.name);
    if (!bucket) {
      console.warn(`Skipping unknown folder: ${festivalEntry.name}`);
      continue;
    }
    if (!CMS_ALBUMS.includes(bucket)) continue;

    const festivalDir = path.join(SOURCE, festivalEntry.name);
    for (const yearEntry of fs.readdirSync(festivalDir, { withFileTypes: true })) {
      if (!yearEntry.isDirectory() || yearEntry.name.startsWith(".")) continue;
      if (/^background$/i.test(yearEntry.name)) continue;
      if (!/^\d{4}$/.test(yearEntry.name)) {
        // files directly under festival (rare) — skip; Background handled separately
        continue;
      }
      const year = yearEntry.name;
      const yearDir = path.join(festivalDir, year);
      const destDir = path.join(CONTENT_DIR, year, bucket);
      fs.mkdirSync(destDir, { recursive: true });

      const files = walkMedia(yearDir);
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        const base =
          slugify(path.basename(file, ext)) || `media-${copied + 1}`;
        const destName = uniqueName(destDir, base, ext);
        const dest = path.join(destDir, destName);
        // Skip if same basename already present (merge-friendly)
        const existingSame = fs
          .readdirSync(destDir)
          .some((n) => n.toLowerCase() === destName.toLowerCase());
        if (existingSame) {
          skipped += 1;
          continue;
        }
        fs.copyFileSync(file, dest);
        copied += 1;
        byBucket[bucket] = (byBucket[bucket] || 0) + 1;
      }
      console.log(
        `  ${festivalEntry.name}/${year} → content/${year}/${bucket}/ (${files.length} scanned)`,
      );
    }
  }

  console.log(JSON.stringify({ copied, skipped, byBucket }, null, 2));
}

main();
