/**
 * Copy logo + festival background heroes; optimize member photos to public/members/.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { slugify } from "../lib/slug";

const HOME = process.env.HOME || "";
const DOWNLOADS = path.join(HOME, "Downloads");
const ROOT = process.cwd();
const BRAND = path.join(ROOT, "public", "brand");
const MEMBERS = path.join(ROOT, "public", "members");

const HEROES: { src: string; dest: string }[] = [
  {
    src: path.join(DOWNLOADS, "Photos/Vinayaka chaviti/Background/vinakyachaviti.jpeg"),
    dest: "vinayaka-hero-v3.webp",
  },
  {
    src: path.join(DOWNLOADS, "Photos/Sankranthi/Background"),
    dest: "sankranthi-hero.webp",
  },
  {
    src: path.join(DOWNLOADS, "Photos/Mathamma /Background/Mathamma.jpeg"),
    dest: "mathamma-hero.webp",
  },
  {
    src: path.join(DOWNLOADS, "Photos/Devapatlamma /Background/devapatlaamma.jpeg"),
    dest: "devapatlamma-hero.webp",
  },
  {
    src: path.join(DOWNLOADS, "Photos/Sreeramanavami/Background/ramanavami.jpeg"),
    dest: "rama-navami-hero.webp",
  },
  {
    src: path.join(DOWNLOADS, "Photos/Fun-Fest/Background/funfest.jpeg"),
    dest: "funfest-hero.webp",
  },
];

async function resolveFile(src: string): Promise<string | null> {
  if (fs.existsSync(src) && fs.statSync(src).isFile()) return src;
  if (fs.existsSync(src) && fs.statSync(src).isDirectory()) {
    const first = fs
      .readdirSync(src)
      .find((n) => !n.startsWith(".") && /\.(jpe?g|png|webp|heic)$/i.test(n));
    return first ? path.join(src, first) : null;
  }
  return null;
}

const MIN_HERO_EDGE = 640;
const MIN_HERO_BYTES = 40_000;

async function toWebp(src: string, dest: string, size = 1920) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(src)
    .rotate()
    .resize({ width: size, height: size, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(dest);
}

async function isUsableHero(src: string): Promise<boolean> {
  try {
    if (fs.statSync(src).size < MIN_HERO_BYTES) return false;
    const meta = await sharp(src).metadata();
    const edge = Math.max(meta.width || 0, meta.height || 0);
    return edge >= MIN_HERO_EDGE;
  } catch {
    return false;
  }
}

async function main() {
  fs.mkdirSync(BRAND, { recursive: true });
  fs.mkdirSync(MEMBERS, { recursive: true });

  // Logo master
  const logoSrc = path.join(DOWNLOADS, "Photos/Logo/logo.png");
  if (fs.existsSync(logoSrc)) {
    const master = path.join(BRAND, "reddivaripalli-logo-master.png");
    fs.copyFileSync(logoSrc, master);
    console.log("Logo master updated:", master);
  } else {
    console.warn("Logo not found:", logoSrc);
  }

  for (const hero of HEROES) {
    const dest = path.join(BRAND, hero.dest);
    const lockedAlias = dest.replace(/\.webp$/i, "-locked.webp");
    // Never overwrite locked brand plates approved in the product
    if (
      hero.dest.includes("-locked") ||
      fs.existsSync(lockedAlias) ||
      fs.existsSync(path.join(BRAND, hero.dest.replace(/\.webp$/i, "-locked.webp")))
    ) {
      console.log("Hero locked — skip ingest:", hero.dest);
      continue;
    }
    const file = await resolveFile(hero.src);
    if (!file) {
      console.warn("Hero missing:", hero.src);
      continue;
    }
    if (!(await isUsableHero(file))) {
      // Keep any existing high-res plate (e.g. vinayaka-hero-source.webp) instead of
      // overwriting with tiny Downloads/Background thumbnails.
      if (fs.existsSync(dest) && (await isUsableHero(dest))) {
        console.warn("Hero skipped (tiny source, kept existing):", hero.dest);
        continue;
      }
      const sourceSibling = dest.replace(/\.webp$/i, "-source.webp");
      if (fs.existsSync(sourceSibling) && (await isUsableHero(sourceSibling))) {
        await toWebp(sourceSibling, dest, 2000);
        console.log("Hero from source plate:", hero.dest);
        continue;
      }
      console.warn("Hero skipped (unusable source):", hero.src);
      continue;
    }
    try {
      await toWebp(file, dest, 2000);
      console.log("Hero:", hero.dest);
    } catch (error) {
      console.warn(`Hero convert failed ${hero.dest}:`, error);
    }
  }

  // Member photos
  const groups: { dir: string; prefix: string }[] = [
    { dir: path.join(DOWNLOADS, "Images/Super Seniors"), prefix: "legacy" },
    { dir: path.join(DOWNLOADS, "Images/Seniors"), prefix: "core" },
    { dir: path.join(DOWNLOADS, "Images/Juniors"), prefix: "nextgen" },
    { dir: path.join(DOWNLOADS, "Images/Roots"), prefix: "legacy" },
    { dir: path.join(DOWNLOADS, "Images/Tree"), prefix: "core" },
    { dir: path.join(DOWNLOADS, "Images/Stems"), prefix: "nextgen" },
    { dir: path.join(DOWNLOADS, "Images/Legacy"), prefix: "legacy" },
    { dir: path.join(DOWNLOADS, "Images/Core"), prefix: "core" },
    { dir: path.join(DOWNLOADS, "Images/NextGen"), prefix: "nextgen" },
  ];

  const map: Record<string, string> = {};
  for (const group of groups) {
    if (!fs.existsSync(group.dir)) continue;
    for (const name of fs.readdirSync(group.dir)) {
      if (name.startsWith(".")) continue;
      const full = path.join(group.dir, name);
      if (!fs.statSync(full).isFile()) continue;
      const base = slugify(path.basename(name, path.extname(name)));
      const destName = `${base}.webp`;
      const dest = path.join(MEMBERS, destName);
      try {
        await sharp(full)
          .rotate()
          .resize({ width: 800, height: 800, fit: "cover" })
          .webp({ quality: 84 })
          .toFile(dest);
        map[base] = `/members/${destName}`;
        console.log("Member:", destName);
      } catch (error) {
        console.warn(`Member failed ${name}:`, error);
      }
    }
  }

  fs.writeFileSync(
    path.join(ROOT, "content", "data", "member-photo-map.json"),
    JSON.stringify(map, null, 2),
  );
  console.log("Wrote member-photo-map.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
