import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import exifr from "exifr";
import sharp from "sharp";
import type { Album, BucketKey, FestivalKey, Media } from "./types";
import { loadHashIndex, saveHashIndex, sha256File } from "./hash-index";
import {
  dhashFile,
  findNearDuplicate,
  imageByteSize,
  loadPhashIndex,
  savePhashIndex,
} from "./phash";
import {
  CONTENT_DIR,
  DEFAULT_IMPORT_DIR,
  IMAGE_EXTS,
  ORIGINALS_DIR,
  PUBLIC_IMAGES_DIR,
  PUBLIC_THUMBS_DIR,
  REVIEW_DIR,
  VIDEO_EXTS,
  classifyMedia,
  publicRelFor,
  slugify,
  titleCase,
} from "./paths";

export type ImportOptions = {
  sourceDir?: string;
  keepOriginals?: boolean;
  processImages?: boolean;
};

export type ImportResult = {
  sourceDir: string;
  scanned: number;
  imported: number;
  skippedDuplicates: number;
  nearDuplicatesReview: number;
  skippedUnsupported: number;
  unknownYear: number;
  byBucket: Record<BucketKey, number>;
  albumsTouched: string[];
  errors: string[];
};

type Captured = { date: Date; year: string; unknownYear: boolean };

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
    const raw = exif?.DateTimeOriginal || exif?.CreateDate || exif?.MediaCreateDate;
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
  return { date: new Date(0), year: "Unknown", unknownYear: true };
}

function uniqueDest(dest: string): string {
  if (!fs.existsSync(dest)) return dest;
  const ext = path.extname(dest);
  const base = dest.slice(0, -ext.length);
  let i = 2;
  while (fs.existsSync(`${base}-${i}${ext}`)) i += 1;
  return `${base}-${i}${ext}`;
}

function prepareReadableImage(sourceFile: string, hash: string): string {
  const ext = path.extname(sourceFile).toLowerCase();
  if (ext !== ".heic" && ext !== ".heif") return sourceFile;
  const tmpDir = path.join(process.cwd(), ".tmp", "heic");
  fs.mkdirSync(tmpDir, { recursive: true });
  const out = path.join(tmpDir, `${hash.slice(0, 16)}.jpg`);
  if (fs.existsSync(out) && fs.statSync(out).size > 0) return out;
  try {
    execFileSync("sips", ["-s", "format", "jpeg", sourceFile, "--out", out], {
      stdio: "ignore",
    });
    if (fs.existsSync(out) && fs.statSync(out).size > 0) return out;
  } catch {
    /* try ffmpeg */
  }
  try {
    execFileSync(
      "ffmpeg",
      ["-y", "-i", sourceFile, "-frames:v", "1", "-q:v", "2", out],
      { stdio: "ignore" },
    );
    if (fs.existsSync(out) && fs.statSync(out).size > 0) return out;
  } catch {
    /* fall through */
  }
  return sourceFile;
}

async function processImage(
  sourceFile: string,
  relNoExt: string,
  hash: string,
): Promise<{
  file: string;
  thumb: string;
  width: number;
  height: number;
  blurDataURL: string;
  readable: string;
}> {
  const readable = prepareReadableImage(sourceFile, hash);
  const webpRel = `${relNoExt}.webp`;
  const avifRel = `${relNoExt}.avif`;
  const destWebp = path.join(PUBLIC_IMAGES_DIR, webpRel);
  const destAvif = path.join(PUBLIC_IMAGES_DIR, avifRel);
  const thumb = path.join(PUBLIC_THUMBS_DIR, webpRel);
  fs.mkdirSync(path.dirname(destWebp), { recursive: true });
  fs.mkdirSync(path.dirname(thumb), { recursive: true });

  const pipeline = sharp(readable).rotate();
  const meta = await pipeline.clone().metadata();
  await pipeline
    .clone()
    .resize({ width: 2400, withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(destWebp);
  try {
    await pipeline
      .clone()
      .resize({ width: 2400, withoutEnlargement: true })
      .avif({ quality: 60 })
      .toFile(destAvif);
  } catch {
    /* optional */
  }
  await pipeline
    .clone()
    .resize({ width: 720, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(thumb);

  const blur = await sharp(readable).rotate().resize(24).webp({ quality: 40 }).toBuffer();

  return {
    file: `/images/${webpRel.replace(/\\/g, "/")}`,
    thumb: `/thumbs/${webpRel.replace(/\\/g, "/")}`,
    width: meta.width || 0,
    height: meta.height || 0,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    readable,
  };
}

function copyVideo(sourceFile: string, relWithExt: string) {
  const dest = uniqueDest(path.join(PUBLIC_IMAGES_DIR, relWithExt));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (!fs.existsSync(dest)) fs.copyFileSync(sourceFile, dest);
  const url = `/images/${path.relative(PUBLIC_IMAGES_DIR, dest).replace(/\\/g, "/")}`;
  return { file: url, thumb: url };
}

function albumMeta(input: {
  year: string;
  bucket: BucketKey;
  personName?: string;
  festival?: FestivalKey;
}): {
  category: Album["category"];
  slug: string;
  title: string;
  bucket: BucketKey;
} {
  if (input.bucket === "rvp-birthdays") {
    const slug = slugify(input.personName || "rvp-birthday");
    return {
      category: "Birthdays",
      slug,
      title: titleCase(input.personName || "RVP Birthday"),
      bucket: "rvp-birthdays",
    };
  }
  if (input.bucket === "sankranthi") {
    return {
      category: "Festivals",
      slug: "sankranthi",
      title: `Sankranthi ${input.year}`,
      bucket: "sankranthi",
    };
  }
  if (input.bucket === "vinayaka-chavithi") {
    return {
      category: "Festivals",
      slug: "vinayaka-chavithi",
      title: `Vinayaka Chavithi ${input.year}`,
      bucket: "vinayaka-chavithi",
    };
  }
  if (input.bucket === "mathamma-jathara") {
    return {
      category: "Festivals",
      slug: "mathamma-jathara",
      title: `Mathamma Jathara ${input.year}`,
      bucket: "mathamma-jathara",
    };
  }
  if (input.bucket === "devapatlamma-jathara") {
    return {
      category: "Festivals",
      slug: "devapatlamma-jathara",
      title: `Devapatlamma Jathara ${input.year}`,
      bucket: "devapatlamma-jathara",
    };
  }
  if (input.bucket === "sri-rama-navami") {
    return {
      category: "Festivals",
      slug: "sri-rama-navami",
      title: `Sri Rama Navami ${input.year}`,
      bucket: "sri-rama-navami",
    };
  }
  return {
    category: "Trips",
    slug: "fun-trips",
    title: `Fun Trips ${input.year}`,
    bucket: "fun-trips",
  };
}

function readAlbum(
  year: string,
  category: Album["category"],
  slug: string,
  title: string,
  bucket: BucketKey,
  festival?: FestivalKey,
  personName?: string,
): Album {
  const file = path.join(CONTENT_DIR, year, category, slug, "metadata.json");
  if (fs.existsSync(file)) {
    const album = JSON.parse(fs.readFileSync(file, "utf8")) as Album;
    album.year = String(album.year);
    album.media = album.media || [];
    album.bucket = bucket;
    return album;
  }
  return {
    year,
    category,
    slug,
    title,
    description:
      bucket === "fun-trips"
        ? "Trips and moments — including photos awaiting a more specific festival or birthday home."
        : bucket === "rvp-birthdays"
          ? `Birthday memories for ${personName || title}.`
          : `${title} memories.`,
    published: true,
    order: bucket === "fun-trips" ? 50 : 0,
    media: [],
    bucket,
    festival,
    personName,
  };
}

function writeAlbum(album: Album): void {
  const dir = path.join(CONTENT_DIR, album.year, album.category, album.slug);
  fs.mkdirSync(dir, { recursive: true });
  if (album.media[0]) {
    album.cover =
      album.media.find((m) => m.type === "image")?.thumb || album.media[0].thumb;
  }
  fs.writeFileSync(path.join(dir, "metadata.json"), JSON.stringify(album, null, 2));
}

function pruneMissingHashes() {
  const hashes = loadHashIndex();
  for (const [hash, rel] of Object.entries(hashes)) {
    const publicPath = path.join(process.cwd(), "public", rel.replace(/^\//, ""));
    if (!fs.existsSync(publicPath)) delete hashes[hash];
  }
  saveHashIndex(hashes);
  return hashes;
}

export async function importLocalFolder(
  options: ImportOptions = {},
): Promise<ImportResult> {
  const sourceDir = path.resolve(options.sourceDir || DEFAULT_IMPORT_DIR);
  if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
    throw new Error(`Folder not found: ${sourceDir}`);
  }

  const keepOriginals = options.keepOriginals !== false;
  const processImages = options.processImages !== false;
  const hashes = pruneMissingHashes();
  const phashes = loadPhashIndex();
  const albums = new Map<string, Album>();
  const result: ImportResult = {
    sourceDir,
    scanned: 0,
    imported: 0,
    skippedDuplicates: 0,
    nearDuplicatesReview: 0,
    skippedUnsupported: 0,
    unknownYear: 0,
    byBucket: {
      sankranthi: 0,
      "vinayaka-chavithi": 0,
      "mathamma-jathara": 0,
      "devapatlamma-jathara": 0,
      "sri-rama-navami": 0,
      "rvp-birthdays": 0,
      "fun-trips": 0,
    },
    albumsTouched: [],
    errors: [],
  };

  const files = walkFiles(sourceDir);
  result.scanned = files.length;
  let processed = 0;

  for (const filePath of files) {
    processed += 1;
    if (processed % 25 === 0) {
      console.log(`Import progress ${processed}/${files.length}…`);
    }

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

    const relDir = path.relative(sourceDir, path.dirname(filePath));
    const pathParts = relDir.split(path.sep).filter(Boolean);
    const classification = classifyMedia({
      pathParts,
      fileName: path.basename(filePath),
      date: captured.date,
      unknownYear: captured.unknownYear,
    });
    result.byBucket[classification.bucket] += 1;

    const year = captured.year;
    const meta = albumMeta({
      year,
      bucket: classification.bucket,
      personName: classification.personName,
      festival: classification.festival,
    });
    const personSlug = slugify(classification.personName || "rvp-birthday");
    const baseName = slugify(path.basename(filePath, ext)) || "memory";
    const relNoExt = publicRelFor({
      year,
      bucket: classification.bucket,
      personName: personSlug,
      baseName,
    });
    const relWithExt = `${relNoExt}${ext}`;

    try {
      if (keepOriginals) {
        const originalDest = uniqueDest(path.join(ORIGINALS_DIR, `${relNoExt}${ext}`));
        fs.mkdirSync(path.dirname(originalDest), { recursive: true });
        fs.copyFileSync(filePath, originalDest);
      }

      let mediaPaths: {
        file: string;
        thumb: string;
        width?: number;
        height?: number;
        blurDataURL?: string;
        readable?: string;
      };

      if (kind === "image" && processImages) {
        mediaPaths = await processImage(filePath, relNoExt, hash);

        try {
          const phash = await dhashFile(mediaPaths.readable || filePath);
          const near = findNearDuplicate(phash, phashes, 8);
          if (near) {
            const incomingSize = await imageByteSize(filePath);
            const existingPublic = path.join(
              process.cwd(),
              "public",
              near.path.replace(/^\//, ""),
            );
            const existingSize = await imageByteSize(existingPublic);
            const reviewName = `${year}-${baseName}-${hash.slice(0, 8)}${ext}`;
            const reviewDest = path.join(REVIEW_DIR, reviewName);
            fs.mkdirSync(REVIEW_DIR, { recursive: true });

            if (incomingSize > existingSize) {
              // Keep higher quality incoming in gallery; park previous for review.
              if (fs.existsSync(existingPublic)) {
                fs.copyFileSync(
                  existingPublic,
                  path.join(REVIEW_DIR, `replaced-${path.basename(existingPublic)}`),
                );
              }
              phashes[phash] = mediaPaths.file;
            } else {
              fs.copyFileSync(filePath, reviewDest);
              result.nearDuplicatesReview += 1;
              // Still skip adding a second near-identical gallery item.
              hashes[hash] = near.path;
              continue;
            }
          } else {
            phashes[phash] = mediaPaths.file;
          }
        } catch {
          /* perceptual hash optional if decode fails */
        }
      } else if (kind === "image") {
        const dest = uniqueDest(path.join(PUBLIC_IMAGES_DIR, relWithExt));
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(filePath, dest);
        const publicRel = path.relative(PUBLIC_IMAGES_DIR, dest).replace(/\\/g, "/");
        mediaPaths = {
          file: `/images/${publicRel}`,
          thumb: `/images/${publicRel}`,
        };
      } else {
        mediaPaths = copyVideo(filePath, relWithExt);
      }

      const key = `${year}/${meta.category}/${meta.slug}`;
      const album =
        albums.get(key) ||
        readAlbum(
          year,
          meta.category,
          meta.slug,
          meta.title,
          meta.bucket,
          classification.festival,
          classification.personName ? titleCase(classification.personName) : undefined,
        );

      const media: Media = {
        id: hash.slice(0, 16),
        file: mediaPaths.file,
        thumb: mediaPaths.thumb,
        type: kind,
        title: titleCase(baseName),
        date: captured.unknownYear ? "unknown" : captured.date.toISOString().slice(0, 10),
        tags: [classification.bucket, year === "Unknown" ? "needs-year" : year],
        favorite: false,
        width: mediaPaths.width,
        height: mediaPaths.height,
        blurDataURL: mediaPaths.blurDataURL,
        sha256: hash,
      };
      if (!album.media.some((m) => m.id === media.id)) album.media.push(media);
      album.media.sort(
        (a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title),
      );
      albums.set(key, album);
      hashes[hash] = media.file;
      result.imported += 1;
    } catch (error) {
      result.errors.push(`${path.basename(filePath)}: ${String(error)}`);
    }
  }

  for (const album of albums.values()) {
    writeAlbum(album);
    result.albumsTouched.push(`${album.year}/${album.category}/${album.slug}`);
  }
  saveHashIndex(hashes);
  savePhashIndex(phashes);
  return result;
}
