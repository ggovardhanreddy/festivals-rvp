/**
 * Reading and writing the collector's state.
 *
 * Everything lives in JSON files in the repo, which is the whole reason this
 * design works on a statically exported site: the collector commits the
 * catalog, the existing Production Deploy publishes it, and git gives version
 * history and an audit trail for free — §5 wants version history and §12 wants
 * a run history, and `git log` is a better answer than either.
 *
 * Two files are the source of truth for sources:
 *   content/resources/sources.json  — committed, reviewed, the fallback
 *   R2 resources/sources.json       — what the admin UI writes at runtime
 * The live copy wins when present, so an admin can disable a misbehaving
 * source in seconds without waiting for a deploy.
 *
 * Node-only.
 */
import fs from "node:fs";
import path from "node:path";
import type {
  CollectorNotification,
  CollectorRun,
  Resource,
  ResourceCatalog,
  Source,
  SourceRegistry,
} from "@/lib/resources/types";
import { emptyHealth } from "@/lib/resources/types";

const ROOT = process.cwd();
export const SOURCES_FILE = path.join(ROOT, "content", "resources", "sources.json");
export const CATALOG_FILE = path.join(ROOT, "generated", "resources.json");
export const RUNS_FILE = path.join(ROOT, "generated", "resource-runs.json");
export const NOTIFICATIONS_FILE = path.join(ROOT, "generated", "resource-notifications.json");

/** Run reports kept in the repo. §12 shows the latest; older ones are in git. */
const KEEP_RUNS = 20;
const KEEP_NOTIFICATIONS = 200;

function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

function writeJson(file: string, data: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

/**
 * Fill in anything a hand-edited or older source record is missing.
 *
 * The registry is meant to be edited by a person — that is the point of §2 —
 * so a missing `health` block or a dropped field must not crash a run.
 */
export function normalizeSource(raw: Partial<Source> & { id: string; name: string; url: string }): Source {
  return {
    id: raw.id,
    name: raw.name,
    url: raw.url,
    feedUrl: raw.feedUrl,
    type: raw.type ?? "government-education",
    categories: raw.categories?.length ? raw.categories : ["government"],
    method: raw.method ?? "manual",
    // The safe default is the restrictive one. A source that arrives without
    // a licence verdict is treated as unknown, never as permitted.
    licenseStatus: raw.licenseStatus ?? "unknown",
    licenseNote: raw.licenseNote ?? "No licence statement recorded.",
    licenseUrl: raw.licenseUrl,
    attribution: raw.attribution,
    active: raw.active ?? false,
    frequency: raw.frequency ?? "weekly",
    autoPublish: raw.autoPublish ?? false,
    crawlDelaySeconds: raw.crawlDelaySeconds,
    notes: raw.notes,
    health: { ...emptyHealth(), ...(raw.health ?? {}) },
  };
}

export function loadSources(): Source[] {
  const raw = readJson<{ sources?: unknown[] }>(SOURCES_FILE, { sources: [] });
  const list = Array.isArray(raw.sources) ? raw.sources : [];
  const out: Source[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const s = item as Partial<Source>;
    if (!s.id || !s.name || !s.url) continue;
    out.push(normalizeSource(s as Partial<Source> & { id: string; name: string; url: string }));
  }
  return out;
}

export function saveSources(sources: Source[]): void {
  // The _readme block is documentation for whoever opens the file next, so it
  // is preserved across writes rather than being clobbered by the collector.
  const existing = readJson<Record<string, unknown>>(SOURCES_FILE, {});
  const registry: SourceRegistry & { _readme?: unknown } = {
    version: 1,
    updatedAt: new Date().toISOString().slice(0, 10),
    sources,
  };
  if (existing._readme) (registry as Record<string, unknown>)._readme = existing._readme;
  writeJson(SOURCES_FILE, registry);
}

export function loadCatalog(): Resource[] {
  const raw = readJson<{ resources?: Resource[] }>(CATALOG_FILE, { resources: [] });
  return Array.isArray(raw.resources) ? raw.resources : [];
}

export function saveCatalog(resources: Resource[]): void {
  // Sorted so a re-run produces a stable diff: an unchanged catalog must
  // produce an unchanged file, or every run commits noise.
  const sorted = [...resources].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const catalog: ResourceCatalog = {
    version: 1,
    generatedAt: new Date().toISOString(),
    resources: sorted,
  };
  writeJson(CATALOG_FILE, catalog);
}

export function loadRuns(): CollectorRun[] {
  const raw = readJson<{ runs?: CollectorRun[] }>(RUNS_FILE, { runs: [] });
  return Array.isArray(raw.runs) ? raw.runs : [];
}

export function appendRun(run: CollectorRun): void {
  const runs = [run, ...loadRuns()].slice(0, KEEP_RUNS);
  writeJson(RUNS_FILE, { version: 1, runs });
}

export function loadNotifications(): CollectorNotification[] {
  const raw = readJson<{ notifications?: CollectorNotification[] }>(NOTIFICATIONS_FILE, {
    notifications: [],
  });
  return Array.isArray(raw.notifications) ? raw.notifications : [];
}

export function appendNotifications(added: CollectorNotification[]): void {
  if (added.length === 0) return;
  const all = [...added, ...loadNotifications()].slice(0, KEEP_NOTIFICATIONS);
  writeJson(NOTIFICATIONS_FILE, { version: 1, notifications: all });
}

/**
 * Where a hosted file is written on disk before the deploy uploads it.
 *
 * Under public/ so the static export serves it, and under a prefix
 * strip-local-media leaves alone — hosted resources are small (a textbook
 * PDF, not a 200 MB video) and belong in the app shell where they are
 * available even when R2 is unreachable.
 */
export function localFilePath(key: string): string {
  return path.join(ROOT, "public", key);
}

export function writeLocalFile(key: string, body: Buffer): string {
  const target = localFilePath(key);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, body);
  return `/${key}`;
}

export function localFileExists(key: string): boolean {
  return fs.existsSync(localFilePath(key));
}

/** Total bytes of hosted resource files, for the admin dashboard. */
export function hostedBytes(): number {
  const dir = path.join(ROOT, "public", "resources");
  let total = 0;
  const walk = (d: string) => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else {
        try {
          total += fs.statSync(full).size;
        } catch {
          /* a file that vanished mid-walk is not worth failing over */
        }
      }
    }
  };
  walk(dir);
  return total;
}
