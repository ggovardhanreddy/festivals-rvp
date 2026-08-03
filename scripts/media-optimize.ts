#!/usr/bin/env tsx
/**
 * Batch media optimize (Sharp + system FFmpeg).
 *
 * Usage:
 *   npm run media:optimize -- --input ./inbox --out .tmp/media-optimized
 *   npm run media:optimize -- --input ./photo.heic
 *
 * Workers / Pages Functions cannot run this. Use for local Admin tooling,
 * CI workflow_dispatch, or before `npm run media:migrate:r2`.
 */

import fs from "node:fs";
import path from "node:path";
import { optimizeMediaTree } from "../lib/media-pipeline/node-optimize";
import { formatBytes } from "../lib/media-pipeline/constants";

function arg(flag: string, fallback = ""): string {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] || fallback;
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

async function main() {
  const input = arg("--input") || arg("-i");
  if (!input) {
    console.error(`Usage: npm run media:optimize -- --input <file|dir> [--out <dir>]

Options:
  --input, -i   Source file or directory (required)
  --out, -o     Output directory (default: .tmp/media-optimized)
  --no-recurse  Do not walk subdirectories
  --force       Re-encode even when outputs look fresh

Outputs:
  <out>/images/*.webp   full (≤1920px, target ≤500KB)
  <out>/medium/*.webp   medium (≤1280px)
  <out>/thumbs/*.webp   thumb (≤600px)
  <out>/videos/*.mp4    H.264/AAC ≤1080p
  <out>/audio/*.mp3     128kbps stereo
  <out>/posters/*.webp  video posters
  <out>/manifest.json

Map into CMS/R2:
  Copy images → public/images (or content/<YEAR>/<album>/ then npm run sync)
  Copy thumbs → public/thumbs  (R2: gallery/thumbs/…)
  Copy videos → public/videos  (R2: videos/…)
  Then: npm run media:migrate:r2
`);
    process.exit(1);
  }

  const resolved = path.resolve(input);
  if (!fs.existsSync(resolved)) {
    console.error(`Input not found: ${resolved}`);
    process.exit(1);
  }

  const outDir = path.resolve(
    arg("--out") || arg("-o") || path.join(process.cwd(), ".tmp", "media-optimized"),
  );

  console.log(`Media optimize`);
  console.log(`  input: ${resolved}`);
  console.log(`  out:   ${outDir}`);
  console.log(
    `  note:  Video/audio require system ffmpeg on PATH (not available in Workers).`,
  );

  const report = await optimizeMediaTree({
    input: resolved,
    outDir,
    recursive: !hasFlag("--no-recurse"),
    skipExisting: !hasFlag("--force"),
    onProgress: (msg) => console.log(`  · ${msg}`),
  });

  console.log("");
  console.log(
    `Done — ${report.totals.ok} ok / ${report.totals.errors} errors / ${report.totals.files} files`,
  );
  console.log(
    `Size  — ${formatBytes(report.totals.originalBytes)} → ${formatBytes(report.totals.outputBytes)}`,
  );
  console.log(`Manifest: ${path.join(outDir, "manifest.json")}`);

  for (const item of report.items.filter((i) => i.kind === "error")) {
    console.error(`  ERROR ${item.source}: ${item.error}`);
  }

  if (report.totals.errors > 0) process.exit(2);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
