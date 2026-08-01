import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { PHASH_INDEX_PATH } from "./paths";

export type PhashIndex = Record<string, string>; // phash -> public file path

export function loadPhashIndex(): PhashIndex {
  if (!fs.existsSync(PHASH_INDEX_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(PHASH_INDEX_PATH, "utf8")) as PhashIndex;
  } catch {
    return {};
  }
}

export function savePhashIndex(index: PhashIndex): void {
  fs.mkdirSync(path.dirname(PHASH_INDEX_PATH), { recursive: true });
  fs.writeFileSync(PHASH_INDEX_PATH, JSON.stringify(index, null, 2));
}

/** Difference hash (dHash) — 8x9 grayscale → 64-bit hex string */
export async function dhashFile(filePath: string): Promise<string> {
  const { data, info } = await sharp(filePath)
    .grayscale()
    .resize(9, 8, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let bits = "";
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width - 1; x += 1) {
      const left = data[y * info.width + x]!;
      const right = data[y * info.width + x + 1]!;
      bits += left < right ? "1" : "0";
    }
  }

  let hex = "";
  for (let i = 0; i < bits.length; i += 4) {
    hex += Number.parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

export function hammingHex(a: string, b: string): number {
  if (a.length !== b.length) return 64;
  let distance = 0;
  for (let i = 0; i < a.length; i += 1) {
    const x = Number.parseInt(a[i]!, 16) ^ Number.parseInt(b[i]!, 16);
    distance += x.toString(2).replace(/0/g, "").length;
  }
  return distance;
}

/** Near-duplicate if Hamming distance is small (visually similar). */
export function findNearDuplicate(
  phash: string,
  index: PhashIndex,
  threshold = 8,
): { hash: string; path: string; distance: number } | null {
  let best: { hash: string; path: string; distance: number } | null = null;
  for (const [hash, filePath] of Object.entries(index)) {
    const distance = hammingHex(phash, hash);
    if (distance <= threshold && (!best || distance < best.distance)) {
      best = { hash, path: filePath, distance };
    }
  }
  return best;
}

export async function imageByteSize(filePath: string): Promise<number> {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}
