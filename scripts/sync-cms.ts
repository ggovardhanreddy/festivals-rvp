/**
 * GitHub CMS sync — runs on every CI/build.
 *
 * Scans content/<YEAR>/<album>/ for images/videos,
 * optimizes into public/images + public/thumbs,
 * writes generated/albums.json for the site.
 *
 * No upload API. No database. Folders in Git are the CMS.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import exifr from "exifr";
import {
  albumMetaDefaults,
  CMS_ALBUMS,
  CMS_IGNORE_NAMES,
  isCmsAlbum,
  isYearDir,
} from "../lib/cms";
import {
  CONTENT_DIR,
  IMAGE_EXTS,
  PUBLIC_AUDIO_DIR,
  PUBLIC_DOCS_DIR,
  PUBLIC_IMAGES_DIR,
  PUBLIC_THUMBS_DIR,
  PUBLIC_VIDEOS_DIR,
  detectMediaKind,
  mimeForExt,
} from "../lib/paths";
import {
  extractVideoPosterJpg,
  isHeifDecodeError,
  prepareRasterSource,
  sanitizeSvg,
  sniffMediaKind,
  stripExtension,
  transcodeToMp4,
} from "../lib/media-convert";
import { isDisplayableImageUrl } from "../lib/media-formats";
import type { Album, BucketKey, Media } from "../lib/types";
import { titleCase } from "../lib/slug";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const FORCE_REPROCESS = process.env.CMS_FORCE_MEDIA === "1";
const GENERATED_DIR = path.join(process.cwd(), "generated");
const ALBUMS_OUT = path.join(GENERATED_DIR, "albums.json");
const WARNINGS_OUT = path.join(GENERATED_DIR, "sync-warnings.json");
const warnings: string[] = [];

async function hasFfmpeg() {
  try {
    await execFileAsync("ffmpeg", ["-version"]);
    return true;
  } catch {
    return false;
  }
}

type Override = Partial<Album> & { mediaExtras?: Record<string, Partial<Media>> };

function shouldIgnore(name: string) {
  return name.startsWith(".") || CMS_IGNORE_NAMES.has(name.toLowerCase());
}

function listYears() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((name) => {
      if (!isYearDir(name)) return false;
      return fs.statSync(path.join(CONTENT_DIR, name)).isDirectory();
    })
    .sort((a, b) => b.localeCompare(a));
}

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (shouldIgnore(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full));
    else out.push(full);
  }
  return out;
}

function readOverride(albumDir: string): Override {
  const file = path.join(albumDir, "metadata.json");
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as Override;
  } catch {
    return {};
  }
}

async function fileDate(filePath: string, fallbackYear: string) {
  const base = path.basename(filePath);
  const match = base.match(/(20\d{2})[-_]?(\d{2})[-_]?(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;

  // EXIF only when explicitly requested — keeps CI/GitHub CMS sync fast
  if (process.env.CMS_READ_EXIF === "1") {
    try {
      const exif = await exifr.parse(filePath, {
        pick: ["DateTimeOriginal", "CreateDate"],
      });
      const raw = exif?.DateTimeOriginal || exif?.CreateDate;
      if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
        return raw.toISOString().slice(0, 10);
      }
    } catch {
      /* ignore */
    }
  }

  const mtime = fs.statSync(filePath).mtime;
  if (mtime.getFullYear().toString() === fallbackYear) {
    return mtime.toISOString().slice(0, 10);
  }
  return `${fallbackYear}-01-01`;
}

async function optimizeImage(
  source: string,
  relNoExt: string,
  cacheKey: string,
): Promise<{ file: string; thumb: string; width: number; height: number; blurDataURL?: string }> {
  const dest = path.join(PUBLIC_IMAGES_DIR, `${relNoExt}.webp`);
  const avif = path.join(PUBLIC_IMAGES_DIR, `${relNoExt}.avif`);
  const thumb = path.join(PUBLIC_THUMBS_DIR, `${relNoExt}.webp`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.mkdirSync(path.dirname(thumb), { recursive: true });

  const ext = path.extname(source).toLowerCase();
  const sourceStat = fs.statSync(source);
  const destExists = fs.existsSync(dest) && fs.statSync(dest).size > 0;
  const thumbExists = fs.existsSync(thumb) && fs.statSync(thumb).size > 0;

  // Fast path: source already optimized webp and outputs exist (common after CMS seed)
  const alreadyOptimized =
    !FORCE_REPROCESS &&
    ext === ".webp" &&
    destExists &&
    thumbExists &&
    (path.resolve(source) === path.resolve(dest) ||
      fs.statSync(dest).size > 0);

  const destFresh =
    !FORCE_REPROCESS &&
    destExists &&
    thumbExists &&
    fs.statSync(dest).mtimeMs >= sourceStat.mtimeMs - 2000;

  if (!alreadyOptimized && !destFresh) {
    const prepared = await prepareRasterSource(source, cacheKey);
    const raster = prepared.path;

    // If source is webp elsewhere, copy then ensure thumb
    if (ext === ".webp" && path.resolve(source) !== path.resolve(dest)) {
      fs.copyFileSync(source, dest);
      if (!thumbExists) {
        await sharp(dest)
          .resize({ width: 600, withoutEnlargement: true })
          .webp({ quality: 76 })
          .toFile(thumb);
      }
    } else {
      const pipeline = sharp(raster).rotate();
      await pipeline
        .clone()
        .resize({ width: 2200, withoutEnlargement: true })
        .webp({ quality: 84 })
        .toFile(dest);
      try {
        await pipeline
          .clone()
          .resize({ width: 2200, withoutEnlargement: true })
          .avif({ quality: 55 })
          .toFile(avif);
      } catch {
        /* optional */
      }
      await pipeline
        .clone()
        .resize({ width: 600, withoutEnlargement: true })
        .webp({ quality: 76 })
        .toFile(thumb);
    }
  } else if (destExists && !thumbExists) {
    await sharp(dest)
      .resize({ width: 600, withoutEnlargement: true })
      .webp({ quality: 76 })
      .toFile(thumb);
  }

  // Fast path: do not open sharp at all when derivatives already exist
  if (alreadyOptimized || destFresh) {
    return {
      file: `/images/${relNoExt}.webp`.replace(/\\/g, "/"),
      thumb: `/thumbs/${relNoExt}.webp`.replace(/\\/g, "/"),
      width: 0,
      height: 0,
    };
  }

  const meta = await sharp(dest).metadata();
  let blurDataURL: string | undefined;
  try {
    blurDataURL = `data:image/webp;base64,${(
      await sharp(dest).resize(24).webp({ quality: 40 }).toBuffer()
    ).toString("base64")}`;
  } catch {
    /* ignore */
  }

  return {
    file: `/images/${relNoExt}.webp`.replace(/\\/g, "/"),
    thumb: `/thumbs/${relNoExt}.webp`.replace(/\\/g, "/"),
    width: meta.width || 0,
    height: meta.height || 0,
    blurDataURL,
  };
}

function safeName(base: string) {
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "media"
  );
}

function copyFresh(source: string, dest: string) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const srcStat = fs.statSync(source);
  if (
    !fs.existsSync(dest) ||
    fs.statSync(dest).mtimeMs < srcStat.mtimeMs - 1000
  ) {
    fs.copyFileSync(source, dest);
  }
}

/** Prefer favorites, then larger resolution browser-safe images for album covers. */
function pickBestCover(media: Media[]): string | undefined {
  const images = media.filter(
    (item) =>
      item.type === "image" &&
      isDisplayableImageUrl(item.file) &&
      isDisplayableImageUrl(item.thumb || item.file),
  );
  if (!images.length) {
    const poster = media.find((m) => m.poster && isDisplayableImageUrl(m.poster));
    return poster?.poster || media.find((m) => isDisplayableImageUrl(m.thumb))?.thumb;
  }
  let best = images[0]!;
  let bestScore = -1;
  for (const image of images) {
    const area = (image.width || 1200) * (image.height || 800);
    const score = area + (image.favorite ? 10_000_000 : 0);
    if (score > bestScore) {
      bestScore = score;
      best = image;
    }
  }
  return best.file;
}

async function buildMediaFromFile(
  source: string,
  year: string,
  bucket: BucketKey,
  slug: string,
  personName?: string,
): Promise<Media | null> {
  const ext = path.extname(source).toLowerCase();
  let kind = detectMediaKind(ext);
  // iPhone sometimes saves Live Photos / MOV with a .jpg extension
  if (kind === "image") {
    const sniffed = sniffMediaKind(source);
    if (sniffed === "video") kind = "convert-video";
    else if (sniffed === "heic") {
      /* keep image — HEIC path + converters handle decode */
    }
  }
  if (kind === "skip") return null;

  // Use original-case extension when stripping basename (fixes .HEIC / .MOV bugs)
  const base = stripExtension(source);
  const safeBase = safeName(base);
  const relParts = personName
    ? [year, bucket, personName, safeBase]
    : [year, bucket, safeBase];
  const relNoExt = path.join(...relParts);
  const relPosix = relNoExt.replace(/\\/g, "/");

  const stat = fs.statSync(source);
  const sha256 = crypto
    .createHash("sha256")
    .update(`${source}:${stat.size}:${stat.mtimeMs}`)
    .digest("hex");
  const date = await fileDate(source, year);
  const tags = [bucket, year, slug, kind === "convert-video" ? "video" : kind];

  if (kind === "convert-video") {
    const dest = path.join(PUBLIC_VIDEOS_DIR, `${relNoExt}.mp4`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const needsConvert =
      FORCE_REPROCESS ||
      !fs.existsSync(dest) ||
      fs.statSync(dest).size === 0 ||
      fs.statSync(dest).mtimeMs < stat.mtimeMs - 1000;

    if (needsConvert) {
      if (!(await hasFfmpeg())) {
        warnings.push(
          `Unsupported video needs conversion (install ffmpeg): ${path.relative(process.cwd(), source)}`,
        );
        return null;
      }
      const ok = await transcodeToMp4(source, dest);
      if (!ok) {
        warnings.push(`Video conversion failed for ${source}`);
        return null;
      }
    }

    const poster = path.join(PUBLIC_THUMBS_DIR, `${relNoExt}.webp`);
    if ((!fs.existsSync(poster) || FORCE_REPROCESS) && (await hasFfmpeg())) {
      try {
        const jpg = poster.replace(/\.webp$/, ".jpg");
        if (await extractVideoPosterJpg(dest, jpg)) {
          await sharp(jpg)
            .resize({ width: 800, withoutEnlargement: true })
            .webp({ quality: 76 })
            .toFile(poster);
          fs.unlinkSync(jpg);
        }
      } catch {
        /* optional poster */
      }
    }
    return {
      id: sha256.slice(0, 16),
      file: `/videos/${relPosix}.mp4`,
      thumb: fs.existsSync(poster) ? `/thumbs/${relPosix}.webp` : "/brand/icon-512.png",
      poster: fs.existsSync(poster) ? `/thumbs/${relPosix}.webp` : undefined,
      type: "video",
      title: titleCase(safeBase),
      date,
      tags,
      mime: "video/mp4",
      original: `/videos/${relPosix}${ext}`,
      sha256,
    };
  }

  if (kind === "video") {
    const dest = path.join(PUBLIC_VIDEOS_DIR, `${relNoExt}${ext}`);
    copyFresh(source, dest);
    const poster = path.join(PUBLIC_THUMBS_DIR, `${relNoExt}.webp`);
    if ((!fs.existsSync(poster) || FORCE_REPROCESS) && (await hasFfmpeg())) {
      try {
        const jpg = poster.replace(/\.webp$/, ".jpg");
        if (await extractVideoPosterJpg(source, jpg)) {
          await sharp(jpg)
            .resize({ width: 800, withoutEnlargement: true })
            .webp({ quality: 76 })
            .toFile(poster);
          fs.unlinkSync(jpg);
        }
      } catch {
        /* optional */
      }
    }
    return {
      id: sha256.slice(0, 16),
      file: `/videos/${relPosix}${ext}`,
      thumb: fs.existsSync(poster) ? `/thumbs/${relPosix}.webp` : "/brand/icon-512.png",
      poster: fs.existsSync(poster) ? `/thumbs/${relPosix}.webp` : undefined,
      type: "video",
      title: titleCase(safeBase),
      date,
      tags,
      mime: mimeForExt(ext),
      sha256,
    };
  }

  if (kind === "audio") {
    const dest = path.join(PUBLIC_AUDIO_DIR, `${relNoExt}${ext}`);
    copyFresh(source, dest);
    return {
      id: sha256.slice(0, 16),
      file: `/audio/${relPosix}${ext}`,
      thumb: "/brand/icon-512.png",
      type: "audio",
      title: titleCase(safeBase),
      date,
      tags,
      mime: mimeForExt(ext),
      sha256,
    };
  }

  if (kind === "document") {
    const dest = path.join(PUBLIC_DOCS_DIR, `${relNoExt}${ext}`);
    copyFresh(source, dest);
    return {
      id: sha256.slice(0, 16),
      file: `/docs/${relPosix}${ext}`,
      thumb: "/brand/icon-512.png",
      type: "document",
      title: titleCase(safeBase),
      date,
      tags,
      mime: mimeForExt(ext),
      original: `/docs/${relPosix}${ext}`,
      sha256,
    };
  }

  // Images — SVG sanitize + copy; ICO copy; raster optimize (HEIC via sips/ffmpeg)
  if (ext === ".svg") {
    const dest = path.join(PUBLIC_IMAGES_DIR, `${relNoExt}${ext}`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const raw = fs.readFileSync(source, "utf8");
    fs.writeFileSync(dest, sanitizeSvg(raw));
    return {
      id: sha256.slice(0, 16),
      file: `/images/${relPosix}${ext}`,
      thumb: `/images/${relPosix}${ext}`,
      type: "image",
      title: titleCase(safeBase),
      date,
      tags,
      mime: mimeForExt(ext),
      sha256,
    };
  }

  if (ext === ".ico") {
    const dest = path.join(PUBLIC_IMAGES_DIR, `${relNoExt}${ext}`);
    copyFresh(source, dest);
    return {
      id: sha256.slice(0, 16),
      file: `/images/${relPosix}${ext}`,
      thumb: `/images/${relPosix}${ext}`,
      type: "image",
      title: titleCase(safeBase),
      date,
      tags,
      mime: mimeForExt(ext),
      sha256,
    };
  }

  try {
    const optimized = await optimizeImage(source, relNoExt, sha256);
    const avifPath = path.join(PUBLIC_IMAGES_DIR, `${relNoExt}.avif`);
    return {
      id: sha256.slice(0, 16),
      file: optimized.file,
      thumb: optimized.thumb,
      fileAvif: fs.existsSync(avifPath) ? `/images/${relPosix}.avif` : undefined,
      type: "image",
      title: titleCase(safeBase),
      date,
      tags,
      width: optimized.width,
      height: optimized.height,
      blurDataURL: optimized.blurDataURL,
      mime: "image/webp",
      sha256,
    };
  } catch (error) {
    // HEIC/HEIF or mislabeled HEIC (.jpg that is actually HEIF) → convert then retry
    if (ext === ".heic" || ext === ".heif" || isHeifDecodeError(error)) {
      try {
        const prepared = await prepareRasterSource(source, sha256, true);
        if (prepared.path !== source) {
          // Write webp derivatives from the converted JPEG path
          const dest = path.join(PUBLIC_IMAGES_DIR, `${relNoExt}.webp`);
          const thumb = path.join(PUBLIC_THUMBS_DIR, `${relNoExt}.webp`);
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.mkdirSync(path.dirname(thumb), { recursive: true });
          await sharp(prepared.path)
            .rotate()
            .resize({ width: 2200, withoutEnlargement: true })
            .webp({ quality: 84 })
            .toFile(dest);
          await sharp(prepared.path)
            .rotate()
            .resize({ width: 600, withoutEnlargement: true })
            .webp({ quality: 76 })
            .toFile(thumb);
          const meta = await sharp(dest).metadata();
          return {
            id: sha256.slice(0, 16),
            file: `/images/${relPosix}.webp`,
            thumb: `/thumbs/${relPosix}.webp`,
            type: "image",
            title: titleCase(safeBase),
            date,
            tags,
            width: meta.width || 0,
            height: meta.height || 0,
            mime: "image/webp",
            sha256,
          };
        }
      } catch (retryError) {
        warnings.push(
          `Image optimize failed (${ext}): ${source} — ${String(error)} / retry ${String(retryError)}`,
        );
        if (ext === ".heic" || ext === ".heif" || isHeifDecodeError(error)) {
          return null;
        }
      }
    }
    warnings.push(`Image optimize failed (${ext}): ${source} — ${String(error)}`);
    // Do not publish raw HEIC/HEIF — browsers cannot display them reliably
    if (ext === ".heic" || ext === ".heif") {
      return null;
    }
    const dest = path.join(PUBLIC_IMAGES_DIR, `${relNoExt}${ext}`);
    copyFresh(source, dest);
    return {
      id: sha256.slice(0, 16),
      file: `/images/${relPosix}${ext}`,
      thumb: `/images/${relPosix}${ext}`,
      type: "image",
      title: titleCase(safeBase),
      date,
      tags,
      mime: mimeForExt(ext),
      sha256,
    };
  }
}

async function buildAlbumFromDir(
  year: string,
  bucket: BucketKey,
  albumDir: string,
  slug: string,
  personName?: string,
): Promise<Album | null> {
  const files = walkFiles(albumDir).filter((file) => {
    // For root birthday album, skip files inside person subdirs (handled separately)
    if (bucket === "rvp-birthdays" && slug === "rvp-birthdays") {
      const rel = path.relative(albumDir, file);
      if (rel.includes(path.sep)) return false;
    }
    return true;
  });

  // Also include direct children only for non-nested; walkFiles already nested.
  // Re-filter birthday root:
  const mediaFiles =
    bucket === "rvp-birthdays" && slug === "rvp-birthdays"
      ? fs
          .readdirSync(albumDir)
          .filter((name) => !shouldIgnore(name))
          .map((name) => path.join(albumDir, name))
          .filter((full) => fs.statSync(full).isFile())
      : files;

  if (!mediaFiles.length) {
    // Fallback: use already-optimized public images if present
    const publicDir = personName
      ? path.join(PUBLIC_IMAGES_DIR, year, bucket, personName)
      : path.join(PUBLIC_IMAGES_DIR, year, bucket);
    if (fs.existsSync(publicDir)) {
      const publicFiles = walkFiles(publicDir).filter((f) =>
        IMAGE_EXTS.has(path.extname(f).toLowerCase()),
      );
      if (!publicFiles.length) return null;
      const override = readOverride(albumDir);
      const media: Media[] = [];
      for (const file of publicFiles) {
        const ext = path.extname(file);
        const base = path.basename(file, ext);
        const rel = path.relative(PUBLIC_IMAGES_DIR, file).replace(/\\/g, "/");
        const thumbRel = rel.replace(/\.[^.]+$/, ".webp");
        const thumbPath = path.join(PUBLIC_THUMBS_DIR, thumbRel);
        media.push({
          id: crypto.createHash("sha256").update(rel).digest("hex").slice(0, 16),
          file: `/images/${rel}`,
          thumb: fs.existsSync(thumbPath)
            ? `/thumbs/${thumbRel}`
            : `/images/${rel}`,
          type: "image",
          title: titleCase(base),
          date: await fileDate(file, year),
          tags: [bucket, year, slug],
        });
      }
      media.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
      const defaults = albumMetaDefaults(year, bucket, slug);
      return {
        ...defaults,
        ...override,
        year,
        bucket,
        slug,
        media,
        cover: override.cover || pickBestCover(media),
        published: override.published ?? true,
      };
    }
    return null;
  }

  const override = readOverride(albumDir);
  const media: Media[] = [];
  const seenNames = new Set<string>();
  for (const file of mediaFiles) {
    const base = path.basename(file).toLowerCase();
    if (seenNames.has(base)) {
      warnings.push(`Duplicate filename skipped in ${albumDir}: ${base}`);
      continue;
    }
    seenNames.add(base);
    try {
      const ext = path.extname(file).toLowerCase();
      if (
        ext === ".heic" ||
        ext === ".heif" ||
        [".mov", ".m4v", ".mkv", ".avi", ".3gp", ".mpeg", ".mpg"].includes(ext)
      ) {
        console.log(`    convert ${path.relative(process.cwd(), file)}`);
      }
      const item = await buildMediaFromFile(file, year, bucket, slug, personName);
      if (item) {
        const extra = override.mediaExtras?.[item.id];
        media.push(extra ? { ...item, ...extra } : item);
      }
    } catch (error) {
      warnings.push(`Corrupt or unreadable media: ${file} — ${String(error)}`);
      console.warn("Skipped", file, String(error));
    }
  }
  if (!media.length) return null;
  media.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
  const defaults = albumMetaDefaults(year, bucket, slug);
  return {
    ...defaults,
    ...override,
    year,
    bucket,
    slug,
    media,
    cover: override.cover || pickBestCover(media),
    published: override.published ?? true,
  };
}

async function syncYear(year: string): Promise<Album[]> {
  const yearDir = path.join(CONTENT_DIR, year);
  const albums: Album[] = [];

  for (const bucket of CMS_ALBUMS) {
    const albumDir = path.join(yearDir, bucket);
    if (!fs.existsSync(albumDir) || !fs.statSync(albumDir).isDirectory()) continue;

    if (bucket === "rvp-birthdays") {
      const rootAlbum = await buildAlbumFromDir(
        year,
        bucket,
        albumDir,
        "rvp-birthdays",
      );
      if (rootAlbum) albums.push(rootAlbum);

      for (const entry of fs.readdirSync(albumDir, { withFileTypes: true })) {
        if (!entry.isDirectory() || shouldIgnore(entry.name)) continue;
        const personDir = path.join(albumDir, entry.name);
        const personAlbum = await buildAlbumFromDir(
          year,
          bucket,
          personDir,
          entry.name.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
          entry.name,
        );
        if (personAlbum) albums.push(personAlbum);
      }
      continue;
    }

    const album = await buildAlbumFromDir(year, bucket, albumDir, bucket);
    if (album) albums.push(album);
  }

  // Ignore unknown sibling folders (except legacy handled by migration)
  for (const entry of fs.readdirSync(yearDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || shouldIgnore(entry.name)) continue;
    if (!isCmsAlbum(entry.name) && !["festivals", "birthdays", "trips"].includes(entry.name.toLowerCase())) {
      console.warn(`Ignoring non-album folder: content/${year}/${entry.name}`);
    }
  }

  return albums;
}

async function main() {
  console.log("Syncing GitHub CMS content…");
  const years = listYears();
  const albums: Album[] = [];

  for (const year of years) {
    console.log(`  ${year}…`);
    const yearAlbums = await syncYear(year);
    albums.push(...yearAlbums);
    console.log(`  ${year}: ${yearAlbums.length} album(s)`);
  }

  albums.sort((a, b) => b.year.localeCompare(a.year) || a.order - b.order);
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
  fs.writeFileSync(ALBUMS_OUT, JSON.stringify(albums, null, 2));
  fs.writeFileSync(WARNINGS_OUT, JSON.stringify(warnings, null, 2));
  const counts = { image: 0, video: 0, audio: 0, document: 0 };
  for (const album of albums) {
    for (const item of album.media) counts[item.type] += 1;
  }
  console.log(`Wrote ${albums.length} albums → generated/albums.json`);
  console.log(
    `Media: ${counts.image} images, ${counts.video} videos, ${counts.audio} audio, ${counts.document} docs`,
  );
  if (warnings.length) {
    console.warn(`${warnings.length} warning(s) → generated/sync-warnings.json`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
