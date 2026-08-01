import fs from "node:fs";
import path from "node:path";
import { BUCKET_FOLDERS } from "../lib/paths";

const root = process.cwd();
const years = [
  "2013",
  "2015",
  "2016",
  "2018",
  "2019",
  "2020",
  "2021",
  "2022",
  "2023",
  "2024",
  "2025",
  "2026",
  "Unknown",
];

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

console.log("RVP Youth archive folders ready.");
