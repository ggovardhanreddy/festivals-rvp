/**
 * Pre-deploy quality gate.
 * Fails the process (exit 1) when critical checks fail.
 */
import fs from "node:fs";
import path from "node:path";
import { publicAlbums, years } from "../lib/content";
import { albumHref, BUCKETS } from "../lib/site";
import { CMS_ALBUMS } from "../lib/cms";
import { validateMembers } from "../lib/member-validation";
import type { Member } from "../lib/types";

const root = process.cwd();
const errors: string[] = [];
const warnings: string[] = [];

function exists(rel: string) {
  return fs.existsSync(path.join(root, rel));
}

/**
 * The member roster.
 *
 * A duplicate or missing id is an error because it silently changes who is
 * listed and therefore every count derived from the roster. Everything else --
 * an odd date, a private field left in -- is a warning the admin should see
 * but that need not block a deploy.
 */
function checkMembers() {
  const rel = "content/data/members.json";
  if (!exists(rel)) {
    errors.push(`Missing ${rel}`);
    return;
  }
  let members: Member[];
  try {
    members = JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")) as Member[];
  } catch (err) {
    errors.push(`${rel} is not valid JSON: ${(err as Error).message}`);
    return;
  }
  if (!Array.isArray(members)) {
    errors.push(`${rel} must be an array`);
    return;
  }
  for (const issue of validateMembers(members)) {
    const line = `members.json [${issue.memberId}] ${issue.field}: ${issue.message}`;
    if (issue.level === "error") errors.push(line);
    else warnings.push(line);
  }
}

/**
 * The sitemap must never advertise a page the export did not build.
 *
 * A 404 in a sitemap is worse than an omission: it is a URL submitted to
 * search engines that resolves to nothing. Checked against out/ rather than
 * against the route list, so a page that failed to generate is caught even
 * when its route is still registered.
 */
function checkSitemap() {
  if (!exists("out")) return; // pre-build run; nothing to compare against yet
  const rel = "public/sitemap.xml";
  if (!exists(rel)) {
    errors.push(`Missing ${rel} — run npm run sync`);
    return;
  }
  const xml = fs.readFileSync(path.join(root, rel), "utf8");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
  if (!locs.length) {
    errors.push("sitemap.xml contains no <loc> entries");
    return;
  }
  let missing = 0;
  for (const loc of locs) {
    const route = loc.replace(/^https?:\/\/[^/]+/, "").replace(/^\/|\/$/g, "");
    const file = route
      ? path.join(root, "out", route, "index.html")
      : path.join(root, "out", "index.html");
    if (!fs.existsSync(file)) {
      missing += 1;
      if (missing <= 5) errors.push(`sitemap advertises a page that was not built: /${route}/`);
    }
  }
  if (missing > 5) {
    errors.push(`…and ${missing - 5} more sitemap entries with no built page.`);
  }
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
    // content/ holds year folders of media plus a few named data folders that
    // are deliberately not years. Warning about those trains people to ignore
    // the warning, so the known ones are listed rather than reported.
    const KNOWN_NON_YEAR = ["data", "dharma", "resources", "typed", "_oversized"];
    if (!/^\d{4}$/.test(name) && name !== "Unknown" && !KNOWN_NON_YEAR.includes(name)) {
      warnings.push(`Non-year folder in content/: ${name}`);
    }
  }
}

function main() {
  console.log("Running site validation…");
  checkGenerated();
  checkMembers();
  checkSitemap();
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
