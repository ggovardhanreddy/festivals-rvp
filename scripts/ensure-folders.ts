import fs from "node:fs";
import path from "node:path";
import { CMS_ALBUMS, isYearDir } from "../lib/cms";

const root = process.cwd();
const contentDir = path.join(root, "content");

function listYearDirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((name) => {
    const full = path.join(dir, name);
    return fs.statSync(full).isDirectory() && (isYearDir(name) || name === "Unknown");
  });
}

const discovered = new Set<string>([
  ...listYearDirs(contentDir),
  ...listYearDirs(path.join(root, "public", "images")),
  String(new Date().getFullYear()),
]);

const years = [...discovered].sort((a, b) => b.localeCompare(a));

for (const dir of [
  "content",
  "generated",
  "originals",
  "inbox",
  "public/images",
  "public/thumbs",
  "public/videos",
  "public/audio",
  "public/docs",
  "public/brand",
  "review/near-duplicates",
  ".tmp",
]) {
  fs.mkdirSync(path.join(root, dir), { recursive: true });
}

for (const year of years) {
  for (const album of CMS_ALBUMS) {
    fs.mkdirSync(path.join(contentDir, year, album), { recursive: true });
    for (const pub of ["images", "thumbs", "videos", "audio", "docs"]) {
      fs.mkdirSync(path.join(root, "public", pub, year, album), {
        recursive: true,
      });
    }
  }
}

console.log(
  `GitHub CMS folders ready for years: ${years.filter((y) => y !== "Unknown").join(", ")}.`,
);
