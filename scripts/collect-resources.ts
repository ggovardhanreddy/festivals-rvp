/**
 * The collector CLI. Run by .github/workflows/collect-resources.yml, and by
 * an admin locally with `npm run resources:collect -- --dry-run`.
 *
 *   --tier 6-hourly|12-hourly|daily|weekly|monthly|all
 *   --source <id>       just this one, ignoring the schedule
 *   --dry-run           fetch and classify, write nothing
 *   --force             ignore the schedule
 *   --max <n>           cap candidates per source (default 40)
 *
 * Exit code is 0 whenever the run completed, even with failing sources: a
 * state portal being down is normal operating weather, not a build failure,
 * and a red workflow every time bse.ap.gov.in times out would train everyone
 * to ignore the light. Exit 1 is reserved for the collector itself breaking.
 */
import { istDateKey } from "@/lib/dates";
import { FREQUENCY_HOURS, type CollectorNotification, type CollectorRun, type SourceRunResult } from "@/lib/resources/types";
import { archiveExpired, collectSource, mergeResources } from "@/lib/collector/pipeline";
import {
  appendNotifications,
  appendRun,
  loadCatalog,
  loadSources,
  saveCatalog,
  saveSources,
} from "@/lib/collector/store";
import crypto from "node:crypto";

type Args = {
  tier: string;
  source?: string;
  dryRun: boolean;
  force: boolean;
  max: number;
};

function parseArgs(argv: string[]): Args {
  const args: Args = { tier: "all", dryRun: false, force: false, max: 40 };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--force") args.force = true;
    else if (a === "--tier") args.tier = argv[++i] ?? "all";
    else if (a === "--source") args.source = argv[++i];
    else if (a === "--max") args.max = Math.max(1, Number(argv[++i]) || 40);
  }
  return args;
}

function fmt(n: number): string {
  return n.toString().padStart(3, " ");
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const now = new Date();
  const nowIso = now.toISOString();
  const todayKey = istDateKey(now);

  const allSources = loadSources();
  const catalog = loadCatalog();

  const selected = args.source
    ? allSources.filter((s) => s.id === args.source)
    : args.tier === "all"
      ? allSources
      : allSources.filter((s) => s.frequency === args.tier);

  if (args.source && selected.length === 0) {
    console.error(`No source with id "${args.source}". Known ids: ${allSources.map((s) => s.id).join(", ")}`);
    process.exit(1);
  }

  console.log("Reddivaripalli learning resource collector");
  console.log(`  tier      ${args.tier}${args.source ? ` (single source: ${args.source})` : ""}`);
  console.log(`  mode      ${args.dryRun ? "DRY RUN — nothing will be written" : "live"}`);
  console.log(`  sources   ${selected.length} of ${allSources.length}`);
  console.log(`  catalog   ${catalog.length} existing resources`);
  console.log(`  date      ${todayKey} (Asia/Kolkata)`);

  const notifications: CollectorNotification[] = [];
  const notify = (n: Omit<CollectorNotification, "id" | "at">) => {
    notifications.push({ ...n, id: crypto.randomUUID(), at: nowIso });
  };

  const results: SourceRunResult[] = [];
  let working = catalog;
  const updatedSources = new Map(allSources.map((s) => [s.id, s]));

  for (const source of selected) {
    const dueHours = args.force ? 0 : FREQUENCY_HOURS[source.frequency];
    const { result, resources, source: after } = await collectSource(
      source,
      working,
      { now, dryRun: args.dryRun, notify, log: (m) => console.log(m) },
      {
        dueHours: Number.isFinite(dueHours) ? dueHours : 0,
        force: args.force || Boolean(args.source),
        maxPerSource: args.max,
      },
    );
    results.push(result);
    updatedSources.set(after.id, after);
    if (resources.length > 0) working = mergeResources(working, resources);
  }

  // §11 runs over the WHOLE catalog, not just today's finds: a scholarship
  // collected in June expires in October, on a run that touched no source.
  const { resources: swept, expired } = archiveExpired(working, todayKey, nowIso);
  working = swept;

  const run: CollectorRun = {
    id: crypto.randomUUID(),
    startedAt: nowIso,
    finishedAt: new Date().toISOString(),
    tier: args.source ?? args.tier,
    dryRun: args.dryRun,
    sourcesChecked: results.filter((r) => !r.skipped).length,
    sourcesFailed: results.filter((r) => !r.ok).length,
    newResources: results.reduce((n, r) => n + r.added, 0),
    updatedResources: results.reduce((n, r) => n + r.updated, 0),
    duplicates: results.reduce((n, r) => n + r.duplicates, 0),
    needsReview: working.filter((r) => r.status === "needs-review").length,
    expired: working.filter((r) => r.status === "expired").length,
    results,
  };

  console.log("\n──────────────────────────────────────────────────────────");
  console.log("Resource Collector");
  console.log(`Last Run: ${todayKey}, ${now.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })} IST`);
  console.log(`Sources Checked:   ${fmt(run.sourcesChecked)}`);
  console.log(`New Resources:     ${fmt(run.newResources)}`);
  console.log(`Updated Resources: ${fmt(run.updatedResources)}`);
  console.log(`Duplicates:        ${fmt(run.duplicates)}`);
  console.log(`Needs Review:      ${fmt(run.needsReview)}`);
  console.log(`Newly Expired:     ${fmt(expired)}`);
  console.log(`Failed Sources:    ${fmt(run.sourcesFailed)}`);
  console.log("──────────────────────────────────────────────────────────");

  const skipped = results.filter((r) => r.skipped);
  if (skipped.length > 0) {
    console.log("\nSkipped:");
    for (const r of skipped) console.log(`  ${r.sourceName} — ${r.skipped}`);
  }
  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    console.log("\nFailed:");
    for (const r of failed) console.log(`  ${r.sourceName} — ${r.error}`);
  }

  if (args.dryRun) {
    console.log("\nDry run: catalog, sources, runs and notifications were NOT written.");
    console.log(`Would have written ${working.length} resources (${working.length - catalog.length} net new).`);
    return;
  }

  saveCatalog(working);
  saveSources([...updatedSources.values()]);
  appendRun(run);
  appendNotifications(notifications);
  console.log(`\nWrote ${working.length} resources to generated/resources.json`);
  if (notifications.length > 0) console.log(`${notifications.length} notification(s) raised for the admin.`);
}

main().catch((err) => {
  console.error("Collector failed:", err);
  process.exit(1);
});
