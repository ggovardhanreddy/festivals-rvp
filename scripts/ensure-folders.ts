import fs from "node:fs";
import path from "node:path";
import { CATEGORIES } from "../lib/paths";

const root = process.cwd();
const years = ["2023", "2024", "2025", "2026", "Unknown"];

for (const dir of [
  "content",
  "originals",
  "inbox",
  "public/images",
  "public/thumbs",
  ".tmp",
]) {
  fs.mkdirSync(path.join(root, dir), { recursive: true });
}

for (const year of years) {
  for (const category of CATEGORIES) {
    fs.mkdirSync(path.join(root, "public/images", year, category), {
      recursive: true,
    });
    fs.mkdirSync(path.join(root, "public/thumbs", year, category), {
      recursive: true,
    });
  }
}

console.log("Archive folders ready.");
