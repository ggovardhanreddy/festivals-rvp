import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { HASH_INDEX_PATH } from "./paths";

export type HashIndex = Record<string, string>;

export function loadHashIndex(): HashIndex {
  if (!fs.existsSync(HASH_INDEX_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(HASH_INDEX_PATH, "utf8")) as HashIndex;
  } catch {
    return {};
  }
}

export function saveHashIndex(index: HashIndex): void {
  fs.mkdirSync(path.dirname(HASH_INDEX_PATH), { recursive: true });
  fs.writeFileSync(HASH_INDEX_PATH, JSON.stringify(index, null, 2));
}

export function sha256File(filePath: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}
