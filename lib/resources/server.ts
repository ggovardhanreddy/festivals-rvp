/**
 * Build-time loaders for the resource catalog.
 *
 * Separate from ./index for the same reason lib/learning does it: these touch
 * the filesystem, and client components import the helpers from ./index, so
 * keeping them apart is what stops `node:fs` being dragged into a browser
 * bundle.
 *
 * Each path is written out literally rather than passed into a shared helper.
 * A generic `read(rel)` reads better but gives the bundler a fully dynamic
 * path, and Turbopack responds by treating every file in the project as a
 * possible match — 10,814 of them, in this repo — which is both a build
 * slowdown and a warning nobody should have to learn to ignore.
 */
import fs from "node:fs";
import path from "node:path";
import type { CollectorNotification, CollectorRun, Resource, Source } from "./types";

function parseArray<T>(file: string, key: string): T[] {
  try {
    const raw = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>;
    const value = raw[key];
    return Array.isArray(value) ? (value as T[]) : [];
  } catch {
    // An absent catalog is the normal state before the first collector run,
    // and every page must render an honest empty state rather than break.
    return [];
  }
}

export function loadResourceCatalog(): Resource[] {
  return parseArray<Resource>(path.join(process.cwd(), "generated/resources.json"), "resources");
}

export function loadResourceSources(): Source[] {
  return parseArray<Source>(path.join(process.cwd(), "content/resources/sources.json"), "sources");
}

export function loadCollectorRuns(): CollectorRun[] {
  return parseArray<CollectorRun>(path.join(process.cwd(), "generated/resource-runs.json"), "runs");
}

export function loadCollectorNotifications(): CollectorNotification[] {
  return parseArray<CollectorNotification>(
    path.join(process.cwd(), "generated/resource-notifications.json"),
    "notifications",
  );
}
