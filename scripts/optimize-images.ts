import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  IMAGE_EXTS,
  ORIGINALS_DIR,
  PUBLIC_IMAGES_DIR,
  PUBLIC_THUMBS_DIR,
} from "../lib/paths";

async function walk(dir: string): Promise<string[]> {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

async function optimizeFile(filePath: string): Promise<void> {
  const ext = path.extname(filePath).toLowerCase();
  if (!IMAGE_EXTS.has(ext)) return;

  const rel = path.relative(ORIGINALS_DIR, filePath).replace(/\.[^.]+$/, "");
  const dest = path.join(PUBLIC_IMAGES_DIR, `${rel}.webp`);
  const avif = path.join(PUBLIC_IMAGES_DIR, `${rel}.avif`);
  const thumb = path.join(PUBLIC_THUMBS_DIR, `${rel}.webp`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.mkdirSync(path.dirname(thumb), { recursive: true });

  const pipeline = sharp(filePath).rotate();
  await pipeline
    .clone()
    .resize({ width: 2200, withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile(dest);
  try {
    await pipeline
      .clone()
      .resize({ width: 2200, withoutEnlargement: true })
      .avif({ quality: 55 })
      .toFile(avif);
  } catch {
    /* optional */
  }
  await pipeline
    .clone()
    .resize({ width: 600, withoutEnlargement: true })
    .webp({ quality: 76 })
    .toFile(thumb);
  console.log("Optimized", rel);
}

async function main() {
  const files = await walk(ORIGINALS_DIR);
  for (const file of files) {
    try {
      await optimizeFile(file);
    } catch (error) {
      console.warn("Skipped", file, String(error));
    }
  }
}

main();
