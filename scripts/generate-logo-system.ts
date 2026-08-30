/**
 * Reddivaripalli Village logo system.
 *
 * One master artwork in, every delivery format out:
 *
 *   public/brand/reddivaripalli-logo-master.png
 *     -> public/logo/*            site logo, header mark, hero lockup, icons
 *     -> public/brand/*           PWA + Open Graph mirrors
 *     -> app/favicon.ico          root favicon browsers request unprompted
 *
 * The previous system assumed the artwork was an emblem stacked above a
 * wordmark, so it cropped "the top 62%" to make a header mark. The current
 * badge is a single seal — the village scene, the REDDIVARIPALLI banner and the
 * ONE VILLAGE / ONE FAMILY / ONE HERITAGE ring are one piece of art, and
 * slicing it in half produced a header logo with the name cut off. Every
 * output here is the whole badge; only the size and the backing change.
 *
 * Run: npm run brand:logo   (also part of npm run prepare:site)
 */
import fs from "node:fs";
import path from "node:path";
import sharp, { type Color } from "sharp";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "logo");
const BRAND = path.join(ROOT, "public", "brand");
const APP = path.join(ROOT, "app");
const MASTER = path.join(BRAND, "reddivaripalli-logo-master.png");

/** Cream from the badge's inner ring. Icons that cannot be transparent sit on this. */
const CREAM = { r: 255, g: 253, b: 240, alpha: 1 };
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };
/** Deep forest, matching --color-forest, for the social banner. */
const FOREST = { r: 18, g: 38, b: 28 };

function log(name: string) {
  console.log("wrote", name);
}

/**
 * The badge with its transparent margin removed.
 *
 * Trimming first means every later size is computed from the artwork itself,
 * so a re-export with different padding cannot quietly shrink the logo
 * everywhere on the site.
 */
async function loadBadge(): Promise<Buffer> {
  if (!fs.existsSync(MASTER)) {
    throw new Error(
      `Missing brand master at ${path.relative(ROOT, MASTER)}. ` +
        "Drop the approved artwork there and re-run npm run brand:logo.",
    );
  }
  return sharp(MASTER)
    .ensureAlpha()
    .trim({ threshold: 6 })
    .png()
    .toBuffer();
}

/** The badge on a square canvas, with a margin, over an optional flat colour. */
async function square(
  badge: Buffer,
  size: number,
  opts: {
    padding?: number;
    background?: Color;
    flatten?: boolean;
    /** Set false for frames that must stay true-colour (ICO). */
    paletted?: boolean;
  } = {},
): Promise<Buffer> {
  const padding = opts.padding ?? 0;
  const inner = Math.max(1, Math.round(size * (1 - padding * 2)));
  const art = await sharp(badge)
    .resize(inner, inner, { fit: "inside", background: TRANSPARENT })
    .toBuffer();

  let canvas = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: opts.background ?? TRANSPARENT,
    },
  }).composite([{ input: art, gravity: "centre" }]);

  if (opts.flatten) {
    canvas = canvas.flatten({
      background: (opts.background as { r: number; g: number; b: number }) ?? {
        r: 255,
        g: 253,
        b: 240,
      },
    });
  }
  // Palette PNG: the badge is flat illustration, not a photograph, so
  // quantising costs nothing visible and roughly quarters every icon.
  return canvas
    .png({ compressionLevel: 9, palette: opts.paletted !== false })
    .toBuffer();
}

/**
 * A real .ico container holding PNG frames.
 *
 * sharp cannot write ICO, and the previous script wrote a bare 48px PNG under
 * an .ico name. That is not an ICO file: browsers that parse the container
 * strictly get a broken tab icon and fall back to a blank page glyph.
 */
function buildIco(frames: { size: number; png: Buffer }[]): Buffer {
  const count = frames.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  const directory = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;

  frames.forEach((frame, i) => {
    const at = i * 16;
    // 256px is stored as 0 — the field is a single byte.
    directory.writeUInt8(frame.size >= 256 ? 0 : frame.size, at);
    directory.writeUInt8(frame.size >= 256 ? 0 : frame.size, at + 1);
    directory.writeUInt8(0, at + 2); // palette size
    directory.writeUInt8(0, at + 3); // reserved
    directory.writeUInt16LE(1, at + 4); // colour planes
    directory.writeUInt16LE(32, at + 6); // bits per pixel
    directory.writeUInt32LE(frame.png.length, at + 8);
    directory.writeUInt32LE(offset, at + 12);
    offset += frame.png.length;
  });

  return Buffer.concat([header, directory, ...frames.map((f) => f.png)]);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(BRAND, { recursive: true });

  const badge = await loadBadge();
  const meta = await sharp(badge).metadata();
  console.log(`master: ${meta.width}x${meta.height}`);

  // ---- Wordmark lockups -------------------------------------------------
  // Natural aspect ratio. `.brand-logo` sizes by height with width:auto, so
  // the badge must never be squeezed into a square here.
  //
  // Widths are set from how large each one actually renders, doubled for
  // retina. The hero caps at 320 CSS px and the header logo at 42px tall, so
  // shipping a 900px master to both was sending five times the pixels anyone
  // could see — on an illustration this dense that is hundreds of kilobytes.
  const widths: [string, number][] = [
    ["logo-vertical", 640], // homepage hero, max-width 320px
    ["logo-master", 320], // header + footer, 42px tall
    ["logo-mark", 192], // compact contexts
  ];
  for (const [name, width] of widths) {
    const resized = await sharp(badge)
      .resize({ width, withoutEnlargement: true })
      .toBuffer();
    await sharp(resized)
      .png({ compressionLevel: 9, palette: true })
      .toFile(path.join(OUT, `${name}.png`));
    // WebP is what the site actually loads; the PNG stays as the master copy.
    await sharp(resized)
      .webp({ quality: 82 })
      .toFile(path.join(OUT, `${name}.webp`));
    log(`${name}.png + ${name}.webp`);
  }

  // ---- Favicons ---------------------------------------------------------
  // Transparent, so the badge sits on whatever the browser chrome is.
  const faviconSizes = [16, 32, 48];
  const faviconFrames: { size: number; png: Buffer }[] = [];
  for (const size of faviconSizes) {
    const png = await square(badge, size);
    faviconFrames.push({ size, png });
    if (size !== 48) {
      fs.writeFileSync(path.join(OUT, `favicon-${size}x${size}.png`), png);
      log(`favicon-${size}x${size}.png`);
    }
  }
  const ico = buildIco(faviconFrames);
  fs.writeFileSync(path.join(OUT, "favicon.ico"), ico);
  // app/favicon.ico is the Next.js file convention and is what actually serves
  // /favicon.ico, the path browsers request without being told to. A second
  // copy in public/ would target the same URL and only invite the two to drift.
  fs.writeFileSync(path.join(APP, "favicon.ico"), ico);
  log("favicon.ico (16/32/48) → public/logo + app");

  // ---- App icons --------------------------------------------------------
  // iOS ignores transparency and composites on black, so the touch icon is
  // flattened onto the badge's own cream rather than left with an alpha
  // channel it will fill in with something else.
  const appleIcon = await square(badge, 180, {
    padding: 0.06,
    background: CREAM,
    flatten: true,
  });
  fs.writeFileSync(path.join(OUT, "apple-touch-icon.png"), appleIcon);
  fs.writeFileSync(path.join(BRAND, "apple-touch-icon.png"), appleIcon);
  fs.writeFileSync(path.join(ROOT, "public", "apple-touch-icon.png"), appleIcon);
  log("apple-touch-icon.png (180)");

  const android = await square(badge, 192, { padding: 0.05, background: CREAM, flatten: true });
  fs.writeFileSync(path.join(OUT, "android-icon.png"), android);
  fs.writeFileSync(path.join(BRAND, "icon-192.png"), android);
  log("android-icon.png (192)");

  const appIcon = await square(badge, 512, { padding: 0.05, background: CREAM, flatten: true });
  fs.writeFileSync(path.join(OUT, "app-icon.png"), appIcon);
  fs.writeFileSync(path.join(BRAND, "icon-512.png"), appIcon);
  log("app-icon.png (512)");

  // No app/icon.png: layout.tsx declares metadata.icons explicitly, which
  // takes precedence over the file convention, so an icon.png would be copied
  // into the build and then linked by nothing.

  // Maskable icons are cropped to a circle or squircle by the launcher, which
  // would shave the badge's outer ring off. Android's safe zone is the middle
  // 80%, so the artwork is inset further here than in the "any" icon.
  const maskable = await square(badge, 512, {
    padding: 0.12,
    background: CREAM,
    flatten: true,
  });
  fs.writeFileSync(path.join(OUT, "maskable-icon.png"), maskable);
  fs.writeFileSync(path.join(BRAND, "maskable-icon.png"), maskable);
  log("maskable-icon.png (512, 80% safe zone)");

  // ---- Social / Open Graph ---------------------------------------------
  const bannerArt = await sharp(badge)
    .resize({ height: 470, fit: "inside", background: TRANSPARENT })
    .png()
    .toBuffer();
  const banner = await sharp({
    create: { width: 1200, height: 630, channels: 4, background: { ...FOREST, alpha: 1 } },
  })
    .composite([{ input: bannerArt, gravity: "centre" }])
    .flatten({ background: FOREST })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
  fs.writeFileSync(path.join(OUT, "social-banner.png"), banner);
  await sharp(banner).jpeg({ quality: 90 }).toFile(path.join(BRAND, "og-banner.jpg"));
  log("social-banner.png (1200x630) + brand/og-banner.jpg");

  // No archival duplicate is written here: the master already lives at
  // public/brand/reddivaripalli-logo-master.png, and copying two more
  // multi-megabyte versions of it into public/logo/ only made the deploy
  // heavier for a file nothing requests.

  console.log("Reddivaripalli Village logo system ready → public/logo/");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
