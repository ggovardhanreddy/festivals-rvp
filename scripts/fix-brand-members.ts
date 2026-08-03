import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const ROOT = process.cwd();
const HOME = process.env.HOME || "";
const BRAND = path.join(ROOT, "public", "brand");
const MEMBERS = path.join(ROOT, "public", "members");

async function toWebp(
  src: string,
  dest: string,
  opts: { width: number; height: number; fit: "cover" | "inside" },
) {
  await sharp(src)
    .rotate()
    .resize({
      width: opts.width,
      height: opts.height,
      fit: opts.fit,
      withoutEnlargement: opts.fit === "inside",
    })
    .webp({ quality: 84 })
    .toFile(dest);
  console.log("wrote", path.relative(ROOT, dest), fs.statSync(dest).size);
}

function heicToJpeg(src: string, dest: string) {
  execFileSync("sips", ["-s", "format", "jpeg", src, "--out", dest]);
}

async function main() {
  fs.mkdirSync(MEMBERS, { recursive: true });

  const heics = [
    [path.join(HOME, "Downloads/Images/Seniors/Rajesh.heic"), "rajesh.webp"],
    [path.join(HOME, "Downloads/Images/Juniors/Akhil.heic"), "akhil.webp"],
    [path.join(HOME, "Downloads/Images/Juniors/Ganu.heic"), "ganu.webp"],
  ] as const;

  const tmp = path.join(ROOT, ".tmp", "member-heic");
  fs.mkdirSync(tmp, { recursive: true });
  for (const [src, destName] of heics) {
    if (!fs.existsSync(src)) continue;
    const jpg = path.join(tmp, `${destName}.jpg`);
    heicToJpeg(src, jpg);
    await toWebp(jpg, path.join(MEMBERS, destName), {
      width: 800,
      height: 800,
      fit: "cover",
    });
  }

  // Locked brand plates are authoritative — never regenerate/overwrite them
  const lockedHeroes = [
    "vinayaka-hero-locked.webp",
    "sankranthi-hero-locked.webp",
    "mathamma-hero-locked.webp",
    "devapatlamma-hero-locked.webp",
    "rama-navami-hero-locked.webp",
    "funfest-hero-locked.webp",
  ];
  for (const name of lockedHeroes) {
    const locked = path.join(BRAND, name);
    if (!fs.existsSync(locked)) continue;
    const alias = name.replace("-locked.webp", ".webp");
    const aliasPath = path.join(BRAND, alias);
    fs.copyFileSync(locked, aliasPath);
    if (name.startsWith("vinayaka")) {
      fs.copyFileSync(locked, path.join(BRAND, "vinayaka-hero-v3.webp"));
      fs.copyFileSync(locked, path.join(BRAND, "vinayaka-hero-v2.webp"));
    }
    console.log("Hero locked — synced alias:", alias);
  }

  // Prefer high-res existing vinayaka assets over tiny Downloads backgrounds
  const vinLocked = path.join(BRAND, "vinayaka-hero-locked.webp");
  if (!fs.existsSync(vinLocked)) {
  const vinJpg = path.join(BRAND, "vinayaka-hero.jpg");
  const vinSrc = path.join(BRAND, "vinayaka-hero-source.webp");
  const vinDest = path.join(BRAND, "vinayaka-hero-v3.webp");
  const vinLegacy = path.join(BRAND, "vinayaka-hero.webp");
  const vinJpgSource = path.join(BRAND, "vinayaka-hero-source.jpg");
  const preferred =
    (fs.existsSync(vinJpgSource) && vinJpgSource) ||
    (fs.existsSync(vinJpg) && vinJpg) ||
    (fs.existsSync(vinSrc) && vinSrc) ||
    null;
  if (preferred) {
    await toWebp(preferred, vinDest, {
      width: 2400,
      height: 1600,
      fit: "inside",
    });
    fs.copyFileSync(vinDest, vinLegacy);
    // Keep v2 alias in sync for any lingering refs
    fs.copyFileSync(vinDest, path.join(BRAND, "vinayaka-hero-v2.webp"));
  }
  }

  // For other festivals: pick largest image from imported content years
  const pickLargest = (dir: string): string | null => {
    if (!fs.existsSync(dir)) return null;
    let best: string | null = null;
    let bestSize = 0;
    const walk = (d: string) => {
      for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
        if (entry.name.startsWith(".")) continue;
        const full = path.join(d, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(jpe?g|png|webp|heic)$/i.test(entry.name)) {
          const size = fs.statSync(full).size;
          if (size > bestSize) {
            bestSize = size;
            best = full;
          }
        }
      }
    };
    walk(dir);
    return best;
  };

  // Sankranthi: prefer largest album photo over the small Downloads background.
  if (!fs.existsSync(path.join(BRAND, "sankranthi-hero-locked.webp"))) {
  {
    let best: string | null = null;
    let bestSize = 0;
    const contentRoot = path.join(ROOT, "content");
    if (fs.existsSync(contentRoot)) {
      for (const year of fs.readdirSync(contentRoot)) {
        const dir = path.join(contentRoot, year, "sankranthi");
        if (!fs.existsSync(dir)) continue;
        const candidate = pickLargest(dir);
        if (!candidate) continue;
        const size = fs.statSync(candidate).size;
        if (size > bestSize) {
          bestSize = size;
          best = candidate;
        }
      }
    }
    const sank = path.join(HOME, "Downloads/Photos/Sankranthi/sankranthi .jpg");
    const src =
      best || (fs.existsSync(sank) && fs.statSync(sank).size > 40_000 ? sank : null);
    if (src) {
      await toWebp(src, path.join(BRAND, "sankranthi-hero.webp"), {
        width: 2000,
        height: 2000,
        fit: "inside",
      });
    }
  }
  }

  const contentHeroes: [string, string][] = [
    ["content", "mathamma-jathara", "mathamma-hero.webp"],
    ["content", "devapatlamma-jathara", "devapatlamma-hero.webp"],
    ["content", "fun-trips", "funfest-hero.webp"],
    ["content", "sri-rama-navami", "rama-navami-hero.webp"],
  ].map(([, bucket, dest]) => {
    const found = pickLargest(path.join(ROOT, "content"));
    // search only that bucket across years
    let best: string | null = null;
    let bestSize = 0;
    for (const year of fs.readdirSync(path.join(ROOT, "content"))) {
      const dir = path.join(ROOT, "content", year, bucket);
      if (!fs.existsSync(dir)) continue;
      const candidate = pickLargest(dir);
      if (!candidate) continue;
      const size = fs.statSync(candidate).size;
      if (size > bestSize) {
        bestSize = size;
        best = candidate;
      }
    }
    return [best || found || "", dest] as [string, string];
  });

  // Fix mapping properly
  const buckets: [string, string][] = [
    ["mathamma-jathara", "mathamma-hero.webp"],
    ["devapatlamma-jathara", "devapatlamma-hero.webp"],
    ["fun-trips", "funfest-hero.webp"],
    ["sri-rama-navami", "rama-navami-hero.webp"],
  ];
  for (const [bucket, destName] of buckets) {
    const lockedName = destName.replace(/\.webp$/i, "-locked.webp");
    if (fs.existsSync(path.join(BRAND, lockedName))) {
      console.log("Hero locked — skip content pick:", destName);
      continue;
    }
    let best: string | null = null;
    let bestSize = 0;
    const contentRoot = path.join(ROOT, "content");
    for (const year of fs.readdirSync(contentRoot)) {
      const dir = path.join(contentRoot, year, bucket);
      if (!fs.existsSync(dir)) continue;
      const candidate = pickLargest(dir);
      if (!candidate) continue;
      const size = fs.statSync(candidate).size;
      if (size > bestSize) {
        bestSize = size;
        best = candidate;
      }
    }
    // Fallback to Downloads Background even if small
    if (!best) {
      console.warn("No content hero for", bucket);
      continue;
    }
    // HEIC may need sips
    let src = best;
    if (/\.heic$/i.test(best)) {
      const jpg = path.join(tmp, `${destName}.jpg`);
      heicToJpeg(best, jpg);
      src = jpg;
    }
    if (/\.(mp4|mov)$/i.test(best)) continue;
    try {
      await toWebp(src, path.join(BRAND, destName), {
        width: 2000,
        height: 2000,
        fit: "inside",
      });
    } catch (error) {
      console.warn("hero failed", destName, error);
    }
  }

  void contentHeroes;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
