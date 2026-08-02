import fs from "node:fs";
import path from "node:path";
import type { Development, DevelopmentStatus } from "./types";

const DEVELOPMENTS_PATH = path.join(
  process.cwd(),
  "content",
  "data",
  "developments.json",
);

let cache: Development[] | null = null;

export function loadDevelopments(): Development[] {
  if (cache) return cache;
  if (!fs.existsSync(DEVELOPMENTS_PATH)) {
    cache = [];
    return cache;
  }
  cache = JSON.parse(
    fs.readFileSync(DEVELOPMENTS_PATH, "utf8"),
  ) as Development[];
  return cache;
}

export function developmentsByStatus(
  status?: DevelopmentStatus,
): Development[] {
  const all = loadDevelopments();
  if (!status) return all;
  return all.filter((d) => d.status === status);
}
