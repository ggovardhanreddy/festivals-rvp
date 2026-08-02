/**
 * Build-time media conversion helpers (HEIC → JPEG, video → MP4).
 * Used by sync-cms and import pipelines — not for browser runtime.
 */
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export function stripExtension(filePath: string): string {
  const rawExt = path.extname(filePath);
  return path.basename(filePath, rawExt);
}

/** Sniff common mislabeled Apple media (Live Photo / QT written as .jpg). */
export function sniffMediaKind(
  filePath: string,
): "heic" | "video" | "unknown" {
  try {
    const fd = fs.openSync(filePath, "r");
    const buf = Buffer.alloc(64);
    fs.readSync(fd, buf, 0, 64, 0);
    fs.closeSync(fd);
    const ascii = buf.toString("latin1");
    if (ascii.includes("ftypheic") || ascii.includes("ftypheif") || ascii.includes("ftypmif1")) {
      return "heic";
    }
    if (
      ascii.includes("ftypqt") ||
      ascii.includes("ftypisom") ||
      ascii.includes("ftypmp42") ||
      ascii.includes("ftypM4V") ||
      ascii.includes("moov")
    ) {
      return "video";
    }
  } catch {
    /* ignore */
  }
  return "unknown";
}

export function normalizedExt(filePath: string): string {
  return path.extname(filePath).toLowerCase();
}

export async function hasBinary(cmd: string): Promise<boolean> {
  try {
    await execFileAsync(cmd, ["-version"]);
    return true;
  } catch {
    try {
      await execFileAsync("which", [cmd]);
      return true;
    } catch {
      return false;
    }
  }
}

/** Convert HEIC/HEIF to a JPEG sharp can read (sips → ffmpeg → ImageMagick). */
export async function heicToJpeg(
  source: string,
  outJpeg: string,
): Promise<boolean> {
  fs.mkdirSync(path.dirname(outJpeg), { recursive: true });
  if (fs.existsSync(outJpeg) && fs.statSync(outJpeg).size > 0) {
    return true;
  }

  try {
    await execFileAsync("sips", ["-s", "format", "jpeg", source, "--out", outJpeg], {
      timeout: 120_000,
    });
    if (fs.existsSync(outJpeg) && fs.statSync(outJpeg).size > 0) return true;
  } catch {
    /* try next */
  }

  try {
    await execFileAsync(
      "ffmpeg",
      ["-y", "-i", source, "-frames:v", "1", "-q:v", "2", outJpeg],
      { timeout: 120_000 },
    );
    if (fs.existsSync(outJpeg) && fs.statSync(outJpeg).size > 0) return true;
  } catch {
    /* try next */
  }

  try {
    await execFileAsync("magick", [source, outJpeg], { timeout: 120_000 });
    if (fs.existsSync(outJpeg) && fs.statSync(outJpeg).size > 0) return true;
  } catch {
    /* give up */
  }

  if (fs.existsSync(outJpeg)) {
    try {
      fs.unlinkSync(outJpeg);
    } catch {
      /* ignore */
    }
  }
  return false;
}

/** Prepare a raster source sharp can open. Returns path + optional temp to clean later. */
export async function prepareRasterSource(
  source: string,
  cacheKey: string,
  force = false,
): Promise<{ path: string; temp?: string }> {
  const ext = normalizedExt(source);
  const looksHeic = ext === ".heic" || ext === ".heif";
  if (!looksHeic && !force) {
    return { path: source };
  }

  const tmpDir = path.join(process.cwd(), ".tmp", "heic-sync");
  const out = path.join(tmpDir, `${cacheKey.slice(0, 20)}.jpg`);
  // Force re-convert when retrying mislabeled HEIC saved as .jpg
  if (force && fs.existsSync(out)) {
    try {
      fs.unlinkSync(out);
    } catch {
      /* ignore */
    }
  }
  const ok = await heicToJpeg(source, out);
  if (!ok) return { path: source };
  return { path: out, temp: out };
}

export function isHeifDecodeError(error: unknown): boolean {
  const msg = String(error).toLowerCase();
  return (
    msg.includes("heif:") ||
    msg.includes("iref box") ||
    msg.includes("heic") ||
    msg.includes("libheif") ||
    msg.includes("unsupported image format") ||
    msg.includes("corrupt header")
  );
}

/** Transcode any video to H.264/AAC MP4 for browser playback. */
export async function transcodeToMp4(
  source: string,
  destMp4: string,
): Promise<boolean> {
  fs.mkdirSync(path.dirname(destMp4), { recursive: true });
  if (fs.existsSync(destMp4) && fs.statSync(destMp4).size > 0) {
    const srcMtime = fs.statSync(source).mtimeMs;
    if (fs.statSync(destMp4).mtimeMs >= srcMtime - 1000) return true;
  }
  try {
    await execFileAsync(
      "ffmpeg",
      [
        "-y",
        "-i",
        source,
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
        "-movflags",
        "+faststart",
        destMp4,
      ],
      { timeout: 600_000 },
    );
    return fs.existsSync(destMp4) && fs.statSync(destMp4).size > 0;
  } catch {
    return false;
  }
}

/** Extract a single frame poster as JPEG, then caller can convert to WebP. */
export async function extractVideoPosterJpg(
  source: string,
  destJpg: string,
): Promise<boolean> {
  fs.mkdirSync(path.dirname(destJpg), { recursive: true });
  try {
    await execFileAsync(
      "ffmpeg",
      ["-y", "-ss", "0.5", "-i", source, "-frames:v", "1", "-q:v", "3", destJpg],
      { timeout: 60_000 },
    );
    return fs.existsSync(destJpg) && fs.statSync(destJpg).size > 0;
  } catch {
    try {
      await execFileAsync(
        "ffmpeg",
        ["-y", "-i", source, "-frames:v", "1", "-q:v", "3", destJpg],
        { timeout: 60_000 },
      );
      return fs.existsSync(destJpg) && fs.statSync(destJpg).size > 0;
    } catch {
      return false;
    }
  }
}

/** Strip script/event handlers from SVG before serving. */
export function sanitizeSvg(svgText: string): string {
  return svgText
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}
