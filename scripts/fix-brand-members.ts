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

  // Prefer high-res existing vinayaka assets over tiny Downloads backgrounds
  const vinJpg = path.join(BRAND, "vinayaka-hero.jpg");
  const vinSrc = path.join(BRAND, "vinayaka-hero-source.webp");
  if (fs.existsSync(vinJpg)) {
    await toWebp(vinJpg, path.join(BRAND, "vinayaka-hero.webp"), {
      width: 2000,
      height: 2000,
      fit: "inside",
    });
  } else if (fs.existsSync(vinSrc)) {
    await toWebp(vinSrc, path.join(BRAND, "vinayaka-hero.webp"), {
      width: 2000,
      height: 2000,
      fit: "inside",
    });
  }

  const sank = path.join(HOME, "Downloads/Photos/Sankranthi/sankranthi .jpg");
  if (fs.existsSync(sank)) {
    await toWebp(sank, path.join(BRAND, "sankranthi-hero.webp"), {
      width: 2000,
      height: 2000,
      fit: "inside",
    });
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
