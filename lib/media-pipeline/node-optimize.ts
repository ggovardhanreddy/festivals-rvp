/**
 * Node/CI media optimization (Sharp + system FFmpeg).
 * NOT for Cloudflare Workers / Pages Functions.
 */

import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";
import {
  AUDIO_BITRATE,
  AUDIO_INPUT_EXT,
  IMAGE_INPUT_EXT,
  IMAGE_MAX_EDGE,
  IMAGE_MEDIUM_EDGE,
  IMAGE_TARGET_BYTES,
  IMAGE_THUMB_EDGE,
  VIDEO_INPUT_EXT,
  VIDEO_MAX_BYTES,
  VIDEO_MAX_HEIGHT,
  extOfName,
  formatBytes,
} from "./constants";
import {
  extractVideoPosterJpg,
  hasBinary,
  prepareRasterSource,
  sanitizeSvg,
  transcodeToMp4,
} from "../media-convert";

const execFileAsync = promisify(execFile);

export type NodeOptimizeOptions = {
  input: string;
  outDir: string;
  /** Recurse into subfolders (default true). */
  recursive?: boolean;
  /** Skip files that already have fresh outputs. */
  skipExisting?: boolean;
  onProgress?: (msg: string) => void;
};

export type NodeOptimizeItem = {
  source: string;
  kind: "image" | "video" | "audio" | "svg" | "skipped" | "error";
  outputs: string[];
  originalBytes: number;
  outputBytes: number;
  width?: number;
  height?: number;
  durationSec?: number;
  error?: string;
  note?: string;
};

export type NodeOptimizeReport = {
  items: NodeOptimizeItem[];
  totals: {
    files: number;
    ok: number;
    errors: number;
    originalBytes: number;
    outputBytes: number;
  };
};

function walkFiles(root: string, recursive: boolean): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.name.startsWith(".")) continue;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (recursive) walk(full);
      } else if (ent.isFile()) {
        out.push(full);
      }
    }
  };
  if (fs.statSync(root).isFile()) return [root];
  walk(root);
  return out;
}

async function encodeWebpLoop(
  pipeline: ReturnType<typeof sharp>,
  maxEdge: number,
  targetBytes: number,
  dest: string,
  preferPng: boolean,
): Promise<{ bytes: number; width: number; height: number; mime: string }> {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const base = pipeline.rotate().resize({
    width: maxEdge,
    height: maxEdge,
    fit: "inside",
    withoutEnlargement: true,
  });

  if (preferPng) {
    const pngDest = dest.replace(/\.webp$/i, ".png");
    await base.clone().png({ compressionLevel: 9 }).toFile(pngDest);
    const meta = await sharp(pngDest).metadata();
    const bytes = fs.statSync(pngDest).size;
    if (bytes <= targetBytes * 1.5) {
      // Keep caller’s .webp path occupied with a WebP fallback for catalog
      // consistency, and also retain the PNG alongside.
      await sharp(pngDest)
        .webp({ quality: 80, alphaQuality: 90 })
        .toFile(dest);
      return {
        bytes: fs.statSync(dest).size,
        width: meta.width || 0,
        height: meta.height || 0,
        mime: "image/webp",
      };
    }
    try {
      fs.unlinkSync(pngDest);
    } catch {
      /* ignore */
    }
  }

  let quality = 82;
  let lastBytes = Number.POSITIVE_INFINITY;
  for (let i = 0; i < 10; i += 1) {
    await base.clone().webp({ quality, effort: 4 }).toFile(dest);
    lastBytes = fs.statSync(dest).size;
    if (lastBytes <= targetBytes) break;
    quality -= 8;
    if (quality < 40) break;
  }

  // Still over target — shrink edge
  if (lastBytes > targetBytes && quality <= 40) {
    const scale = Math.sqrt(targetBytes / lastBytes);
    const edge = Math.max(640, Math.round(maxEdge * Math.min(1, scale)));
    await sharp(dest)
      .resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 72, effort: 4 })
      .toFile(dest);
    lastBytes = fs.statSync(dest).size;
  }

  const meta = await sharp(dest).metadata();
  return {
    bytes: lastBytes,
    width: meta.width || 0,
    height: meta.height || 0,
    mime: "image/webp",
  };
}

async function optimizeImageFile(
  source: string,
  outDir: string,
  rel: string,
  skipExisting: boolean,
): Promise<NodeOptimizeItem> {
  const originalBytes = fs.statSync(source).size;
  const stem = rel.replace(/\.[^.]+$/, "");
  const fullPath = path.join(outDir, "images", `${stem}.webp`);
  const mediumPath = path.join(outDir, "medium", `${stem}.webp`);
  const thumbPath = path.join(outDir, "thumbs", `${stem}.webp`);

  if (
    skipExisting &&
    fs.existsSync(fullPath) &&
    fs.existsSync(thumbPath) &&
    fs.statSync(fullPath).mtimeMs >= fs.statSync(source).mtimeMs - 1000
  ) {
    return {
      source,
      kind: "image",
      outputs: [fullPath, mediumPath, thumbPath].filter((p) => fs.existsSync(p)),
      originalBytes,
      outputBytes: fs.existsSync(fullPath) ? fs.statSync(fullPath).size : 0,
      note: "skipped (fresh)",
    };
  }

  const cacheKey = Buffer.from(source).toString("base64url").slice(0, 24);
  const prepared = await prepareRasterSource(source, cacheKey);
  const meta = await sharp(prepared.path).metadata();
  const preferPng = Boolean(meta.hasAlpha);

  const full = await encodeWebpLoop(
    sharp(prepared.path),
    IMAGE_MAX_EDGE,
    IMAGE_TARGET_BYTES,
    fullPath,
    preferPng,
  );
  await encodeWebpLoop(
    sharp(prepared.path),
    IMAGE_MEDIUM_EDGE,
    Math.round(IMAGE_TARGET_BYTES * 0.7),
    mediumPath,
    false,
  );
  await encodeWebpLoop(
    sharp(prepared.path),
    IMAGE_THUMB_EDGE,
    Math.round(IMAGE_TARGET_BYTES * 0.25),
    thumbPath,
    false,
  );

  if (prepared.temp) {
    try {
      fs.unlinkSync(prepared.temp);
    } catch {
      /* ignore */
    }
  }

  return {
    source,
    kind: "image",
    outputs: [fullPath, mediumPath, thumbPath],
    originalBytes,
    outputBytes: full.bytes,
    width: full.width,
    height: full.height,
    note: `${formatBytes(originalBytes)} → ${formatBytes(full.bytes)}`,
  };
}

async function ffprobeDuration(file: string): Promise<number | undefined> {
  try {
    const { stdout } = await execFileAsync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        file,
      ],
      { timeout: 30_000 },
    );
    const n = Number(stdout.trim());
    return Number.isFinite(n) ? n : undefined;
  } catch {
    return undefined;
  }
}

async function optimizeVideoFile(
  source: string,
  outDir: string,
  rel: string,
  skipExisting: boolean,
): Promise<NodeOptimizeItem> {
  const originalBytes = fs.statSync(source).size;
  const stem = rel.replace(/\.[^.]+$/, "");
  const dest = path.join(outDir, "videos", `${stem}.mp4`);
  const posterJpg = path.join(outDir, ".tmp", `${stem}-poster.jpg`);
  const posterWebp = path.join(outDir, "posters", `${stem}.webp`);

  if (!(await hasBinary("ffmpeg"))) {
    return {
      source,
      kind: "error",
      outputs: [],
      originalBytes,
      outputBytes: 0,
      error:
        "ffmpeg not found on PATH. Install FFmpeg for video/audio conversion (Workers cannot run it).",
    };
  }

  if (
    skipExisting &&
    fs.existsSync(dest) &&
    fs.statSync(dest).mtimeMs >= fs.statSync(source).mtimeMs - 1000
  ) {
    return {
      source,
      kind: "video",
      outputs: [dest],
      originalBytes,
      outputBytes: fs.statSync(dest).size,
      note: "skipped (fresh)",
    };
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  // Scale to max 1080p while preserving aspect
  try {
    await execFileAsync(
      "ffmpeg",
      [
        "-y",
        "-i",
        source,
        "-vf",
        `scale=-2:'min(${VIDEO_MAX_HEIGHT},ih)'`,
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "23",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        AUDIO_BITRATE,
        "-movflags",
        "+faststart",
        dest,
      ],
      { timeout: 900_000 },
    );
  } catch {
    const ok = await transcodeToMp4(source, dest);
    if (!ok) {
      return {
        source,
        kind: "error",
        outputs: [],
        originalBytes,
        outputBytes: 0,
        error: "ffmpeg video transcode failed",
      };
    }
  }

  let outputBytes = fs.existsSync(dest) ? fs.statSync(dest).size : 0;
  if (outputBytes > VIDEO_MAX_BYTES) {
    // Re-encode harder
    const tmp = `${dest}.small.mp4`;
    try {
      await execFileAsync(
        "ffmpeg",
        [
          "-y",
          "-i",
          dest,
          "-vf",
          "scale=-2:720",
          "-c:v",
          "libx264",
          "-preset",
          "veryfast",
          "-crf",
          "28",
          "-c:a",
          "aac",
          "-b:a",
          "96k",
          "-movflags",
          "+faststart",
          tmp,
        ],
        { timeout: 900_000 },
      );
      if (fs.existsSync(tmp) && fs.statSync(tmp).size < outputBytes) {
        fs.renameSync(tmp, dest);
        outputBytes = fs.statSync(dest).size;
      }
    } catch {
      /* keep first encode */
    }
  }

  const outputs = [dest];
  if (await extractVideoPosterJpg(dest, posterJpg)) {
    fs.mkdirSync(path.dirname(posterWebp), { recursive: true });
    await sharp(posterJpg)
      .resize({ width: IMAGE_THUMB_EDGE, withoutEnlargement: true })
      .webp({ quality: 76 })
      .toFile(posterWebp);
    outputs.push(posterWebp);
    try {
      fs.unlinkSync(posterJpg);
    } catch {
      /* ignore */
    }
  }

  return {
    source,
    kind: "video",
    outputs,
    originalBytes,
    outputBytes,
    durationSec: await ffprobeDuration(dest),
    note: `${formatBytes(originalBytes)} → ${formatBytes(outputBytes)}`,
  };
}

async function optimizeAudioFile(
  source: string,
  outDir: string,
  rel: string,
  skipExisting: boolean,
): Promise<NodeOptimizeItem> {
  const originalBytes = fs.statSync(source).size;
  const stem = rel.replace(/\.[^.]+$/, "");
  const dest = path.join(outDir, "audio", `${stem}.mp3`);

  if (!(await hasBinary("ffmpeg"))) {
    return {
      source,
      kind: "error",
      outputs: [],
      originalBytes,
      outputBytes: 0,
      error: "ffmpeg not found on PATH",
    };
  }

  if (
    skipExisting &&
    fs.existsSync(dest) &&
    fs.statSync(dest).mtimeMs >= fs.statSync(source).mtimeMs - 1000
  ) {
    return {
      source,
      kind: "audio",
      outputs: [dest],
      originalBytes,
      outputBytes: fs.statSync(dest).size,
      note: "skipped (fresh)",
    };
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  try {
    await execFileAsync(
      "ffmpeg",
      [
        "-y",
        "-i",
        source,
        "-vn",
        "-c:a",
        "libmp3lame",
        "-b:a",
        AUDIO_BITRATE,
        "-ac",
        "2",
        dest,
      ],
      { timeout: 300_000 },
    );
  } catch {
    return {
      source,
      kind: "error",
      outputs: [],
      originalBytes,
      outputBytes: 0,
      error: "ffmpeg audio convert failed",
    };
  }

  return {
    source,
    kind: "audio",
    outputs: [dest],
    originalBytes,
    outputBytes: fs.statSync(dest).size,
    durationSec: await ffprobeDuration(dest),
    note: `${formatBytes(originalBytes)} → ${formatBytes(fs.statSync(dest).size)}`,
  };
}

export async function optimizeMediaTree(
  options: NodeOptimizeOptions,
): Promise<NodeOptimizeReport> {
  const recursive = options.recursive !== false;
  const skipExisting = options.skipExisting !== false;
  const input = path.resolve(options.input);
  const outDir = path.resolve(options.outDir);
  fs.mkdirSync(outDir, { recursive: true });

  const files = walkFiles(input, recursive);
  const items: NodeOptimizeItem[] = [];
  const inputRoot = fs.statSync(input).isFile() ? path.dirname(input) : input;

  for (const file of files) {
    const ext = extOfName(file);
    const rel = path.relative(inputRoot, file).replace(/\\/g, "/");
    options.onProgress?.(`Processing ${rel}…`);

    try {
      if (ext === "svg") {
        const dest = path.join(outDir, "images", rel);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        const text = fs.readFileSync(file, "utf8");
        fs.writeFileSync(dest, sanitizeSvg(text));
        items.push({
          source: file,
          kind: "svg",
          outputs: [dest],
          originalBytes: fs.statSync(file).size,
          outputBytes: fs.statSync(dest).size,
          note: "sanitized SVG",
        });
        continue;
      }

      if (IMAGE_INPUT_EXT.has(ext)) {
        items.push(
          await optimizeImageFile(file, outDir, rel, skipExisting),
        );
        continue;
      }
      if (VIDEO_INPUT_EXT.has(ext)) {
        items.push(
          await optimizeVideoFile(file, outDir, rel, skipExisting),
        );
        continue;
      }
      if (AUDIO_INPUT_EXT.has(ext)) {
        items.push(
          await optimizeAudioFile(file, outDir, rel, skipExisting),
        );
        continue;
      }

      items.push({
        source: file,
        kind: "skipped",
        outputs: [],
        originalBytes: fs.statSync(file).size,
        outputBytes: 0,
        note: `unsupported .${ext}`,
      });
    } catch (err) {
      items.push({
        source: file,
        kind: "error",
        outputs: [],
        originalBytes: fs.existsSync(file) ? fs.statSync(file).size : 0,
        outputBytes: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const report: NodeOptimizeReport = {
    items,
    totals: {
      files: items.length,
      ok: items.filter((i) => i.kind !== "error" && i.kind !== "skipped").length,
      errors: items.filter((i) => i.kind === "error").length,
      originalBytes: items.reduce((s, i) => s + i.originalBytes, 0),
      outputBytes: items.reduce((s, i) => s + i.outputBytes, 0),
    },
  };

  fs.writeFileSync(
    path.join(outDir, "manifest.json"),
    JSON.stringify(report, null, 2),
  );
  return report;
}
