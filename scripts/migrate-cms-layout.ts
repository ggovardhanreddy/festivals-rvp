/**
 * One-time (safe re-run) migration to flat GitHub CMS layout:
 * content/<YEAR>/<album>/
 *
 * Moves legacy content/<YEAR>/{Festivals|Birthdays|Trips}/<slug>/metadata.json
 * into content/<YEAR>/<bucket>/metadata.json
 * and copies public optimized images into content as source photos when missing.
 */
import fs from "node:fs";
import path from "node:path";
import { CMS_ALBUMS, isCmsAlbum, isYearDir } from "../lib/cms";
import { CONTENT_DIR, PUBLIC_IMAGES_DIR } from "../lib/paths";
import type { BucketKey } from "../lib/types";

function ensureAlbumDirs(year: string) {
  for (const album of CMS_ALBUMS) {
    fs.mkdirSync(path.join(CONTENT_DIR, year, album), { recursive: true });
  }
}

function bucketFromLegacy(category: string, slug: string): BucketKey {
  const cat = category.toLowerCase();
  if (isCmsAlbum(slug)) return slug;
  if (cat === "birthdays" || slug.includes("birthday")) return "rvp-birthdays";
  if (slug.includes("vinayaka")) return "vinayaka-chavithi";
  if (slug.includes("sankr")) return "sankranthi";
  if (cat === "trips" || slug.includes("trip")) return "fun-trips";
  return "fun-trips";
}

const SOURCE_EXTS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".gif",
  ".mp4",
  ".mov",
  ".webm",
]);

function copyDirFiles(src: string, dest: string) {
  if (!fs.existsSync(src)) return 0;
  fs.mkdirSync(dest, { recursive: true });
  let count = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      count += copyDirFiles(from, to);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (!SOURCE_EXTS.has(ext)) continue; // skip .avif derivatives
    if (!fs.existsSync(to)) {
      fs.copyFileSync(from, to);
      count += 1;
    }
  }
  return count;
}

function migrateYear(year: string) {
  const yearDir = path.join(CONTENT_DIR, year);
  ensureAlbumDirs(year);
  let movedMeta = 0;
  let copiedImages = 0;

  for (const category of ["Festivals", "Birthdays", "Trips", "festivals", "birthdays", "trips"]) {
    const categoryPath = path.join(yearDir, category);
    if (!fs.existsSync(categoryPath)) continue;

    for (const albumName of fs.readdirSync(categoryPath)) {
      const albumPath = path.join(categoryPath, albumName);
      if (!fs.statSync(albumPath).isDirectory()) continue;
      const metaFile = path.join(albumPath, "metadata.json");
      const bucket = bucketFromLegacy(category, albumName);

      let destDir = path.join(yearDir, bucket);
      if (bucket === "rvp-birthdays" && albumName !== "rvp-birthdays") {
        destDir = path.join(yearDir, "rvp-birthdays", albumName);
        fs.mkdirSync(destDir, { recursive: true });
      }

      if (fs.existsSync(metaFile)) {
        const destMeta = path.join(destDir, "metadata.json");
        if (!fs.existsSync(destMeta)) {
          fs.copyFileSync(metaFile, destMeta);
          movedMeta += 1;
        }
      }

      // Seed content album with public images when content has no media yet
      const publicSrc =
        bucket === "rvp-birthdays" && albumName !== "rvp-birthdays"
          ? path.join(PUBLIC_IMAGES_DIR, year, bucket, albumName)
          : path.join(PUBLIC_IMAGES_DIR, year, bucket);
      const hasMedia = fs
        .readdirSync(destDir)
        .some((name) => !name.startsWith(".") && name !== "metadata.json");
      if (!hasMedia) {
        copiedImages += copyDirFiles(publicSrc, destDir);
      }
    }
  }

  // Remove empty legacy category dirs after moving metadata
  for (const category of ["Festivals", "Birthdays", "Trips", "festivals", "birthdays", "trips"]) {
    const categoryPath = path.join(yearDir, category);
    if (!fs.existsSync(categoryPath)) continue;
    // Remove nested album dirs (metadata already copied)
    for (const albumName of fs.readdirSync(categoryPath)) {
      const albumPath = path.join(categoryPath, albumName);
      if (!fs.statSync(albumPath).isDirectory()) continue;
      fs.rmSync(albumPath, { recursive: true, force: true });
    }
    fs.rmSync(categoryPath, { recursive: true, force: true });
  }

  return { movedMeta, copiedImages };
}

function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.log("No content/ directory.");
    return;
  }

  const years = fs
    .readdirSync(CONTENT_DIR)
    .filter((name) => isYearDir(name) && fs.statSync(path.join(CONTENT_DIR, name)).isDirectory());

  let meta = 0;
  let images = 0;
  for (const year of years) {
    const result = migrateYear(year);
    meta += result.movedMeta;
    images += result.copiedImages;
    console.log(`${year}: meta ${result.movedMeta}, seeded images ${result.copiedImages}`);
  }

  // Ensure current year scaffold
  const current = String(new Date().getFullYear());
  ensureAlbumDirs(current);

  console.log(`Migration complete. metadata=${meta}, images=${images}`);
}

main();
