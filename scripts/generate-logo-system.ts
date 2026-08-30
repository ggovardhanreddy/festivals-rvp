/**
 * Reddivaripalli Village logo system
 * Master PNG (banyan / temple / sun lockup) → transparent PNGs + icons.
 * SVG fallbacks kept for legacy references.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "logo");
const BRAND = path.join(process.cwd(), "public", "brand");
const MASTER = path.join(BRAND, "rvp-youth-logo-master.png");

const ORANGE = "#E88B41";
const GREEN = "#8BC367";
const BLUE = "#4A81BF";
const CREAM = "#FFFDF0";

/** One community figure pointing up (head at top), origin at circle center. */
function figure(fill: string, heartFill = "#ffffff") {
  return `    <g fill="${fill}">
      <circle cx="0" cy="-78" r="15.5"/>
      <path d="M-30,-60 C-36,-38 -34,-8 -14,12 L0,24 L14,12 C34,-8 36,-38 30,-60
               L16,-60 C20,-42 18,-16 6,-2 L0,6 L-6,-2 C-18,-16 -20,-42 -16,-60 Z"/>
      <g fill="${heartFill}" opacity="0.95">
        <path transform="translate(0 -48) scale(0.42)" d="M0,6 C0,6 -8,-2 -8,-8 C-8,-12 -5,-14 0,-10 C5,-14 8,-12 8,-8 C8,-2 0,6 0,6Z"/>
        <path transform="translate(0 -34) scale(0.38)" d="M0,6 C0,6 -8,-2 -8,-8 C-8,-12 -5,-14 0,-10 C5,-14 8,-12 8,-8 C8,-2 0,6 0,6Z"/>
        <path transform="translate(0 -21) scale(0.32)" d="M0,6 C0,6 -8,-2 -8,-8 C-8,-12 -5,-14 0,-10 C5,-14 8,-12 8,-8 C8,-2 0,6 0,6Z"/>
      </g>
    </g>`;
}

function communityMark(cx: number, cy: number, scale = 1, mono?: string) {
  const colors = mono
    ? [mono, mono, mono, mono, mono, mono]
    : [ORANGE, GREEN, BLUE, BLUE, BLUE, GREEN];
  const petals = colors
    .map(
      (c, i) =>
        `  <g transform="translate(${cx} ${cy}) scale(${scale}) rotate(${i * 60})">
${figure(c, mono ? "rgba(255,255,255,0.92)" : "#ffffff")}
  </g>`,
    )
    .join("\n");
  return petals;
}

function wrap(vb: string, body: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="RVP Youth">
  <title>RVP Youth</title>
${body}
</svg>
`;
}

function wordmarkHorizontal(fill: string, x = 118, y = 58) {
  return `  <text x="${x}" y="${y}" fill="${fill}" font-family="Montserrat, ui-sans-serif, system-ui, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="34" font-weight="800" letter-spacing="3.2">RVP YOUTH</text>`;
}

function wordmarkStacked(fill: string, x = 100, y1 = 218, y2 = 248) {
  return `  <text x="${x}" y="${y1}" text-anchor="middle" fill="${fill}" font-family="Montserrat, ui-sans-serif, system-ui, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="28" font-weight="800" letter-spacing="4.5">RVP YOUTH</text>`;
}

function write(name: string, svg: string) {
  fs.writeFileSync(path.join(OUT, name), svg);
  console.log("wrote", name);
}

async function makeTransparentMaster() {
  if (!fs.existsSync(MASTER)) {
    console.warn("Master PNG missing — SVG-only generation");
    return null;
  }
  // Knock out solid black studio backdrop (keep dark green foliage / path).
  const { data, info } = await sharp(MASTER)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    // Near-black only — foliage keeps a green channel; path keeps red/brown.
    if (r <= 14 && g <= 14 && b <= 14) {
      data[i + 3] = 0;
    }
  }

  const full = path.join(OUT, "logo-full.png");
  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(full);

  // Trim empty padding, then write full vertical lockup + header mark.
  const trimmed = await sharp(full).trim({ threshold: 4 }).png().toBuffer();
  const tMeta = await sharp(trimmed).metadata();
  const tw = tMeta.width || 800;
  const th = tMeta.height || 800;

  // Vertical lockup (emblem + wordmark + pillars) for hero — tight crop, no letterbox.
  await sharp(trimmed)
    .resize({ width: 900, withoutEnlargement: true })
    .png()
    .toFile(path.join(OUT, "logo-vertical.png"));

  // Header / compact master: circular emblem only (upper ~62% of artwork).
  const emblemH = Math.max(1, Math.floor(th * 0.62));
  const emblem = await sharp(trimmed)
    .extract({ left: 0, top: 0, width: tw, height: emblemH })
    .trim({ threshold: 4 })
    .resize(640, 640, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp(emblem).png().toFile(path.join(OUT, "logo-master.png"));
  await sharp(emblem).png().toFile(path.join(OUT, "logo-mark.png"));

  // WebP delivery copies. The PNGs stay as the archival masters; these are what
  // the site actually loads, so the hero lockup costs tens of KB instead of
  // most of a megabyte.
  await sharp(trimmed)
    .resize({ width: 900, withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(path.join(OUT, "logo-vertical.webp"));
  await sharp(emblem)
    .resize(512, 512, { fit: "inside" })
    .webp({ quality: 90 })
    .toFile(path.join(OUT, "logo-master.webp"));
  await sharp(emblem)
    .resize(192, 192, { fit: "inside" })
    .webp({ quality: 90 })
    .toFile(path.join(OUT, "logo-mark.webp"));
  fs.copyFileSync(MASTER, path.join(OUT, "logo-source.png"));
  return path.join(OUT, "logo-master.png");
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(BRAND, { recursive: true });

  // Mark only (square)
  write(
    "mark.svg",
    wrap("0 0 200 200", communityMark(100, 100, 0.95)),
  );
  write(
    "favicon.svg",
    wrap("0 0 200 200", communityMark(100, 100, 0.95)),
  );

  // Full color vertical (matches master artwork)
  write(
    "logo-vertical.svg",
    wrap(
      "0 0 200 270",
      `${communityMark(100, 100, 0.92)}
${wordmarkStacked(BLUE)}`,
    ),
  );

  // Horizontal lockups
  const hMark = (mono?: string) => communityMark(52, 48, 0.42, mono);

  write(
    "logo.svg",
    wrap("0 0 360 96", `${hMark()}\n${wordmarkHorizontal(BLUE, 112, 58)}`),
  );
  write(
    "logo-glass.svg",
    wrap("0 0 360 96", `${hMark()}\n${wordmarkHorizontal("#F0D7A0", 112, 58)}`),
  );
  write(
    "loading-logo.svg",
    wrap("0 0 360 96", `${hMark()}\n${wordmarkHorizontal(BLUE, 112, 58)}`),
  );
  write(
    "logo-light.svg",
    wrap("0 0 360 96", `${hMark()}\n${wordmarkHorizontal(BLUE, 112, 58)}`),
  );
  write(
    "logo-dark.svg",
    wrap(
      "0 0 360 96",
      `${hMark("#E8EFE9")}\n${wordmarkHorizontal("#E8EFE9", 112, 58)}`,
    ),
  );
  write(
    "logo-gold.svg",
    wrap(
      "0 0 360 96",
      `${hMark("#D4A45A")}\n${wordmarkHorizontal("#D4A45A", 112, 58)}`,
    ),
  );
  write(
    "logo-white.svg",
    wrap(
      "0 0 360 96",
      `${hMark("#FFFFFF")}\n${wordmarkHorizontal("#FFFFFF", 112, 58)}`,
    ),
  );
  write(
    "logo-black.svg",
    wrap(
      "0 0 360 96",
      `${hMark("#111111")}\n${wordmarkHorizontal("#111111", 112, 58)}`,
    ),
  );
  write(
    "logo-transparent.svg",
    wrap("0 0 360 96", `${hMark()}\n${wordmarkHorizontal(BLUE, 112, 58)}`),
  );
  write(
    "logo-horizontal.svg",
    wrap("0 0 360 96", `${hMark()}\n${wordmarkHorizontal(BLUE, 112, 58)}`),
  );
  write(
    "logo-header.svg",
    wrap("0 0 360 96", `${hMark()}\n${wordmarkHorizontal(BLUE, 112, 58)}`),
  );
  write(
    "logo-footer.svg",
    wrap(
      "0 0 360 96",
      `${hMark("#E8EFE9")}\n${wordmarkHorizontal("#E8EFE9", 112, 58)}`,
    ),
  );

  write(
    "monogram.svg",
    wrap(
      "0 0 200 200",
      `${communityMark(100, 100, 0.72)}
  <text x="100" y="188" text-anchor="middle" fill="${BLUE}" font-family="Montserrat, ui-sans-serif, system-ui, Helvetica, Arial, sans-serif" font-size="22" font-weight="800" letter-spacing="2">RVP</text>`,
    ),
  );

  write(
    "badge.svg",
    wrap(
      "0 0 220 220",
      `  <circle cx="110" cy="110" r="108" fill="${CREAM}"/>
${communityMark(110, 100, 0.78)}
  <text x="110" y="205" text-anchor="middle" fill="${BLUE}" font-family="Montserrat, ui-sans-serif, system-ui, Helvetica, Arial, sans-serif" font-size="16" font-weight="800" letter-spacing="2.4">RVP YOUTH</text>`,
    ),
  );

  const emblemMaster = await makeTransparentMaster();
  const iconBuf = emblemMaster
    ? await sharp(emblemMaster)
        .resize(512, 512, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer()
    : await sharp(Buffer.from(fs.readFileSync(path.join(OUT, "mark.svg"))))
        .resize(512, 512)
        .png()
        .toBuffer();

  await sharp(iconBuf).png().toFile(path.join(OUT, "logo.png"));
  await sharp(iconBuf).resize(32, 32).png().toFile(path.join(OUT, "favicon-32x32.png"));
  await sharp(iconBuf).resize(16, 16).png().toFile(path.join(OUT, "favicon-16x16.png"));
  await sharp(iconBuf).resize(48, 48).png().toFile(path.join(OUT, "favicon.ico"));
  await sharp(iconBuf).resize(180, 180).png().toFile(path.join(OUT, "apple-touch-icon.png"));
  await sharp(iconBuf).resize(192, 192).png().toFile(path.join(OUT, "android-icon.png"));
  await sharp(iconBuf).resize(512, 512).png().toFile(path.join(OUT, "app-icon.png"));

  // Social OG banner — dark village atmosphere + new emblem lockup
  const bannerBase = await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: { r: 10, g: 16, b: 14 },
    },
  })
    .png()
    .toBuffer();

  if (fs.existsSync(path.join(OUT, "logo-vertical.png"))) {
    const lockup = await sharp(path.join(OUT, "logo-vertical.png"))
      .resize(520, 560, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
    await sharp(bannerBase)
      .composite([{ input: lockup, gravity: "centre" }])
      .png()
      .toFile(path.join(OUT, "social-banner.png"));
  } else {
    await sharp(bannerBase).png().toFile(path.join(OUT, "social-banner.png"));
  }

  const mirrors: [string, string, "copy" | "jpg"][] = [
    ["logo-light.svg", "rvp-youth-logo-light.svg", "copy"],
    ["logo-dark.svg", "rvp-youth-logo-dark.svg", "copy"],
    ["logo.svg", "rvp-youth-logo.svg", "copy"],
    ["favicon.svg", "rvp-youth-mark.svg", "copy"],
    ["apple-touch-icon.png", "apple-touch-icon.png", "copy"],
    ["android-icon.png", "icon-192.png", "copy"],
    ["app-icon.png", "icon-512.png", "copy"],
    ["social-banner.png", "og-banner.jpg", "jpg"],
  ];
  for (const [from, to, mode] of mirrors) {
    const src = path.join(OUT, from);
    const dest = path.join(BRAND, to);
    if (mode === "jpg") await sharp(src).jpeg({ quality: 90 }).toFile(dest);
    else fs.copyFileSync(src, dest);
  }

  if (fs.existsSync(path.join(OUT, "logo-vertical.png"))) {
    fs.copyFileSync(
      path.join(OUT, "logo-vertical.png"),
      path.join(BRAND, "rvp-youth-logo-vertical.png"),
    );
  }

  fs.copyFileSync(path.join(OUT, "favicon.svg"), path.join(process.cwd(), "public", "favicon.svg"));
  fs.copyFileSync(path.join(OUT, "favicon.ico"), path.join(process.cwd(), "public", "favicon.ico"));
  fs.copyFileSync(
    path.join(OUT, "apple-touch-icon.png"),
    path.join(process.cwd(), "public", "apple-touch-icon.png"),
  );

  console.log("Reddivaripalli Village logo system ready → public/logo/");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
