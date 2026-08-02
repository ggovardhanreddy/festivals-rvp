import fs from "node:fs";
import path from "node:path";
import type { Suggestion } from "./types";

const SUGGESTIONS_PATH = path.join(
  process.cwd(),
  "content",
  "data",
  "suggestions.json",
);

let cache: Suggestion[] | null = null;

export function loadSuggestionsSeed(): Suggestion[] {
  if (cache) return cache;
  if (!fs.existsSync(SUGGESTIONS_PATH)) {
    cache = [];
    return cache;
  }
  cache = JSON.parse(
    fs.readFileSync(SUGGESTIONS_PATH, "utf8"),
  ) as Suggestion[];
  return cache;
}
