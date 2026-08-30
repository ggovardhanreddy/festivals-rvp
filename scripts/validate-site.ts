/**
 * Pre-deploy quality gate.
 * Fails the process (exit 1) when critical checks fail.
 */
import fs from "node:fs";
import path from "node:path";
import { publicAlbums, years } from "../lib/content";
import { albumHref, BUCKETS } from "../lib/site";
import { CMS_ALBUMS } from "../lib/cms";

const root = process.cwd();
const errors: string[] = [];
const warnings: string[] = [];

function exists(rel: string) {
  return fs.existsSync(path.join(root, rel));
}

function checkGenerated() {
  if (!exists("generated/albums.json")) {
    errors.push("Missing generated/albums.json — run npm run sync");
    return;
  }
  const albums = JSON.parse(
    fs.readFileSync(path.join(root, "generated/albums.json"), "utf8"),
  ) as unknown[];
  if (!Array.isArray(albums) || albums.length === 0) {
    warnings.push("generated/albums.json has zero albums");
  }
}

function checkPublicAssets() {
  for (const file of [
    "public/search-index.json",
    "public/sitemap.xml",
    "public/robots.txt",
    "public/manifest.webmanifest",
    "public/logo/social-banner.png",
    "public/logo/app-icon.png",
    "public/logo/android-icon.png",
    "public/logo/maskable-icon.png",
    "public/logo/apple-touch-icon.png",
    "public/logo/favicon.ico",
    "public/logo/logo-master.webp",
    "public/logo/logo-vertical.webp",
    "public/logo/logo-mark.webp",
  ]) {
    if (!exists(file)) errors.push(`Missing required asset: ${file}`);
  }
}

function checkAlbumsAndMedia() {
  const albums = publicAlbums();
  const yearList = years();
  if (!yearList.length) warnings.push("No years detected from content/");

  const hrefs = new Set<string>();
  for (const album of albums) {
    if (!CMS_ALBUMS.includes(album.bucket as (typeof CMS_ALBUMS)[number])) {
      warnings.push(`Unexpected bucket on album ${album.title}: ${album.bucket}`);
    }
    const href = albumHref(album);
    if (hrefs.has(href)) errors.push(`Duplicate route detected: ${href}`);
    hrefs.add(href);

    if (!album.media?.length) {
      warnings.push(`Album has no media: ${album.year}/${album.slug}`);
      continue;
    }
    for (const item of album.media.slice(0, 3)) {
      // Absolute R2 / CDN URLs are validated by live HTTP, not local disk
      if (/^https?:\/\//i.test(item.file)) continue;
      const rel = path.join("public", item.file.replace(/^\//, ""));
      if (!exists(rel) && !item.file.startsWith("/brand/")) {
        warnings.push(`Missing media file referenced by album: ${item.file}`);
      }
    }
  }

  for (const bucket of BUCKETS) {
    if (!hrefs.size) break;
    // ensure bucket pages are conceptually valid
    if (!bucket.key) errors.push("Invalid bucket configuration");
  }
}

function checkContentLayout() {
  const content = path.join(root, "content");
  if (!fs.existsSync(content)) {
    errors.push("Missing content/ directory");
    return;
  }
  for (const name of fs.readdirSync(content)) {
    if (["hashes.json", "phashes.json"].includes(name)) continue;
    const full = path.join(content, name);
    if (!fs.statSync(full).isDirectory()) continue;
    if (!/^\d{4}$/.test(name) && name !== "Unknown") {
      warnings.push(`Non-year folder in content/: ${name}`);
    }
  }
}

function main() {
  console.log("Running site validation…");
  checkGenerated();
  checkPublicAssets();
  checkContentLayout();
  if (!errors.some((e) => e.includes("generated/albums.json"))) {
    checkAlbumsAndMedia();
  }

  for (const warning of warnings) console.warn(`WARN: ${warning}`);
  for (const error of errors) console.error(`ERROR: ${error}`);

  if (errors.length) {
    console.error(`Validation failed with ${errors.length} error(s).`);
    process.exit(1);
  }

  let albumCount = 0;
  let yearCount = 0;
  try {
    albumCount = publicAlbums().length;
    yearCount = years().length;
  } catch {
    warnings.push("Could not read albums for summary counts");
  }
  console.log(
    `Validation passed (${warnings.length} warning(s), ${albumCount} albums, ${yearCount} years).`,
  );
}

main();
