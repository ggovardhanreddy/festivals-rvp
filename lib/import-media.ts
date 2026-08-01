import fs from "node:fs";
import path from "node:path";
import exifr from "exifr";
import sharp from "sharp";
import type { Album, Media } from "./types";
import { loadHashIndex, saveHashIndex, sha256File } from "./hash-index";
import {
  CATEGORIES,
  CONTENT_DIR,
  IMAGE_EXTS,
  ORIGINALS_DIR,
  PUBLIC_IMAGES_DIR,
  PUBLIC_THUMBS_DIR,
  VIDEO_EXTS,
  categoryLabel,
  detectCategory,
  detectFestival,
  slugify,
  titleCase,
  type Category,
} from "./paths";

export type ImportOptions = {
  sourceDir: string;
  category?: Category | "auto";
  album?: string | "auto";
  keepOriginals?: boolean;
  processImages?: boolean;
};

export type ImportResult = {
  scanned: number;
  imported: number;
  skippedDuplicates: number;
  skippedUnsupported: number;
  unknownYear: number;
  albumsTouched: string[];
  errors: string[];
};

type Captured = {
  date: Date;
  year: string;
  unknownYear: boolean;
};

function walkFiles(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith(".")) continue;
    if (entry.isDirectory()) out.push(...walkFiles(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

function mediaKind(ext: string): "image" | "video" | null {
  if (IMAGE_EXTS.has(ext)) return "image";
  if (VIDEO_EXTS.has(ext)) return "video";
  return null;
}

async function captureDate(filePath: string): Promise<Captured> {
  try {
    const exif = await exifr.parse(filePath, {
      pick: ["DateTimeOriginal", "CreateDate", "MediaCreateDate"],
    });
    const raw =
      exif?.DateTimeOriginal || exif?.CreateDate || exif?.MediaCreateDate;
    if (raw) {
      const date = raw instanceof Date ? raw : new Date(raw);
      if (!Number.isNaN(date.getTime())) {
        return { date, year: String(date.getFullYear()), unknownYear: false };
      }
    }
  } catch {
    /* fall through */
  }

  try {
    const stat = fs.statSync(filePath);
    if (stat.mtime) {
      return {
        date: stat.mtime,
        year: String(stat.mtime.getFullYear()),
        unknownYear: false,
      };
    }
  } catch {
    /* fall through */
  }

  return {
    date: new Date(0),
    year: "Unknown",
    unknownYear: true,
  };
}

function albumFromPath(
  sourceDir: string,
  filePath: string,
  forced?: string | "auto",
): string {
  if (forced && forced !== "auto") return slugify(forced);
  const rel = path.relative(sourceDir, path.dirname(filePath));
  const parts = rel.split(path.sep).filter(Boolean);
  if (parts.length) return slugify(parts[parts.length - 1]!);
  return slugify(path.basename(sourceDir) || "local-import");
}

function categoryFor(
  sourceDir: string,
  filePath: string,
  forced?: Category | "auto",
): Category {
  if (forced && forced !== "auto") return forced;
  const rel = path.relative(sourceDir, path.dirname(filePath));
  const parts = [
    ...rel.split(path.sep).filter(Boolean),
    path.basename(sourceDir),
  ];
  return detectCategory(parts, "festivals");
}

function uniqueDest(dest: string): string {
  if (!fs.existsSync(dest)) return dest;
  const ext = path.extname(dest);
  const base = dest.slice(0, -ext.length);
  let i = 2;
  while (fs.existsSync(`${base}-${i}${ext}`)) i += 1;
  return `${base}-${i}${ext}`;
}

async function processImage(
  sourceFile: string,
  relNoExt: string,
): Promise<{ file: string; thumb: string; width: number; height: number }> {
  const webpRel = `${relNoExt}.webp`;
  const avifRel = `${relNoExt}.avif`;
  const destWebp = path.join(PUBLIC_IMAGES_DIR, webpRel);
  const destAvif = path.join(PUBLIC_IMAGES_DIR, avifRel);
  const thumb = path.join(PUBLIC_THUMBS_DIR, webpRel);
  fs.mkdirSync(path.dirname(destWebp), { recursive: true });
  fs.mkdirSync(path.dirname(thumb), { recursive: true });

  const pipeline = sharp(sourceFile).rotate();
  const meta = await pipeline.clone().metadata();
  await pipeline
    .clone()
    .resize({ width: 2200, withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile(destWebp);
  try {
    await pipeline
      .clone()
      .resize({ width: 2200, withoutEnlargement: true })
      .avif({ quality: 55 })
      .toFile(destAvif);
  } catch {
    /* AVIF optional */
  }
  await pipeline
    .clone()
    .resize({ width: 600, withoutEnlargement: true })
    .webp({ quality: 76 })
    .toFile(thumb);

  return {
    file: `/images/${webpRel.replace(/\\/g, "/")}`,
    thumb: `/thumbs/${webpRel.replace(/\\/g, "/")}`,
    width: meta.width || 0,
    height: meta.height || 0,
  };
}

function copyVideo(
  sourceFile: string,
  relWithExt: string,
): { file: string; thumb: string } {
  const dest = path.join(PUBLIC_IMAGES_DIR, relWithExt);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (!fs.existsSync(dest)) fs.copyFileSync(sourceFile, dest);
  const url = `/images/${relWithExt.replace(/\\/g, "/")}`;
  return { file: url, thumb: url };
}

function readAlbum(
  year: string,
  category: Category,
  albumSlug: string,
): Album {
  const file = path.join(
    CONTENT_DIR,
    year,
    categoryLabel(category),
    albumSlug,
    "metadata.json",
  );
  if (fs.existsSync(file)) {
    const album = JSON.parse(fs.readFileSync(file, "utf8")) as Album;
    album.year = String(album.year);
    album.media = album.media || [];
    return album;
  }
  const festival =
    category === "festivals" ? detectFestival([albumSlug, year]) : undefined;
  return {
    year,
    category: categoryLabel(category),
    slug: albumSlug,
    title: titleCase(albumSlug),
    description:
      year === "Unknown"
        ? "Memories without a capture date — reassign the year when you know it."
        : `Imported memories from ${year}.`,
    published: true,
    order: 0,
    media: [],
    festival,
    personName: category === "birthdays" ? titleCase(albumSlug) : undefined,
  };
}

function writeAlbum(album: Album): void {
  const dir = path.join(
    CONTENT_DIR,
    album.year,
    album.category,
    album.slug,
  );
  fs.mkdirSync(dir, { recursive: true });
  if (album.media[0]) {
    album.cover = album.media.find((m) => m.type === "image")?.thumb || album.media[0].thumb;
  }
  fs.writeFileSync(path.join(dir, "metadata.json"), JSON.stringify(album, null, 2));
}

function ensureYearCategoryFolders(year: string): void {
  for (const category of CATEGORIES) {
    fs.mkdirSync(path.join(PUBLIC_IMAGES_DIR, year, category), {
      recursive: true,
    });
    fs.mkdirSync(path.join(PUBLIC_THUMBS_DIR, year, category), {
      recursive: true,
    });
  }
}

export async function importLocalFolder(
  options: ImportOptions,
): Promise<ImportResult> {
  const sourceDir = path.resolve(options.sourceDir);
  if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
    throw new Error(`Folder not found: ${sourceDir}`);
  }

  const keepOriginals = options.keepOriginals !== false;
  const processImages = options.processImages !== false;
  const hashes = loadHashIndex();
  const albums = new Map<string, Album>();
  const result: ImportResult = {
    scanned: 0,
    imported: 0,
    skippedDuplicates: 0,
    skippedUnsupported: 0,
    unknownYear: 0,
    albumsTouched: [],
    errors: [],
  };

  const files = walkFiles(sourceDir);
  result.scanned = files.length;

  for (const filePath of files) {
    const ext = path.extname(filePath).toLowerCase();
    const kind = mediaKind(ext);
    if (!kind) {
      result.skippedUnsupported += 1;
      continue;
    }

    let hash: string;
    try {
      hash = sha256File(filePath);
    } catch (error) {
      result.errors.push(`${filePath}: ${String(error)}`);
      continue;
    }
    if (hashes[hash]) {
      result.skippedDuplicates += 1;
      continue;
    }

    const captured = await captureDate(filePath);
    if (captured.unknownYear) result.unknownYear += 1;
    const year = captured.year;
    const category = categoryFor(sourceDir, filePath, options.category);
    const albumSlug = albumFromPath(sourceDir, filePath, options.album);
    ensureYearCategoryFolders(year);

    const baseName = slugify(path.basename(filePath, ext)) || "memory";
    const relNoExt = path.join(year, category, albumSlug, baseName);
    const relWithExt = path.join(year, category, albumSlug, `${baseName}${ext}`);

    try {
      if (keepOriginals) {
        const originalDest = uniqueDest(
          path.join(ORIGINALS_DIR, year, category, albumSlug, `${baseName}${ext}`),
        );
        fs.mkdirSync(path.dirname(originalDest), { recursive: true });
        fs.copyFileSync(filePath, originalDest);
      }

      let mediaPaths: {
        file: string;
        thumb: string;
        width?: number;
        height?: number;
      };

      if (kind === "image" && processImages) {
        mediaPaths = await processImage(filePath, relNoExt);
      } else if (kind === "image") {
        const dest = uniqueDest(path.join(PUBLIC_IMAGES_DIR, relWithExt));
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(filePath, dest);
        const publicRel = path
          .relative(PUBLIC_IMAGES_DIR, dest)
          .replace(/\\/g, "/");
        mediaPaths = {
          file: `/images/${publicRel}`,
          thumb: `/images/${publicRel}`,
        };
      } else {
        mediaPaths = copyVideo(filePath, relWithExt);
      }

      const key = `${year}/${category}/${albumSlug}`;
      const album = albums.get(key) || readAlbum(year, category, albumSlug);
      const media: Media = {
        id: hash.slice(0, 16),
        file: mediaPaths.file,
        thumb: mediaPaths.thumb,
        type: kind,
        title: titleCase(baseName),
        date: captured.unknownYear
          ? "unknown"
          : captured.date.toISOString().slice(0, 10),
        tags: [category, year === "Unknown" ? "needs-year" : year],
        favorite: false,
        width: mediaPaths.width,
        height: mediaPaths.height,
      };
      if (!album.media.some((m) => m.id === media.id)) album.media.push(media);
      album.media.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
      albums.set(key, album);
      hashes[hash] = media.file;
      result.imported += 1;
    } catch (error) {
      result.errors.push(`${filePath}: ${String(error)}`);
    }
  }

  for (const album of albums.values()) {
    writeAlbum(album);
    result.albumsTouched.push(
      `${album.year}/${album.category}/${album.slug}`,
    );
  }
  saveHashIndex(hashes);
  return result;
}
