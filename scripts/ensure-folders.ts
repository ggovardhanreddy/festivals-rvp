import fs from "node:fs";
import path from "node:path";
import { BUCKET_FOLDERS } from "../lib/paths";

const root = process.cwd();

function listYearDirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((name) => {
    const full = path.join(dir, name);
    if (!fs.statSync(full).isDirectory()) return false;
    if (name === "Unknown") return true;
    return /^\d{4}$/.test(name);
  });
}

const discovered = new Set<string>([
  ...listYearDirs(path.join(root, "content")),
  ...listYearDirs(path.join(root, "public", "images")),
  String(new Date().getFullYear()),
  "Unknown",
]);

const years = [...discovered].sort((a, b) => b.localeCompare(a));

for (const dir of [
  "content",
  "originals",
  "inbox",
  "public/images",
  "public/thumbs",
  "public/brand",
  "review/near-duplicates",
  ".tmp",
]) {
  fs.mkdirSync(path.join(root, dir), { recursive: true });
}

for (const year of years) {
  for (const bucket of BUCKET_FOLDERS) {
    fs.mkdirSync(path.join(root, "public/images", year, bucket), {
      recursive: true,
    });
    fs.mkdirSync(path.join(root, "public/thumbs", year, bucket), {
      recursive: true,
    });
  }
}

console.log(
  `RVP Youth archive folders ready for years: ${years.filter((y) => y !== "Unknown").join(", ")}.`,
);
