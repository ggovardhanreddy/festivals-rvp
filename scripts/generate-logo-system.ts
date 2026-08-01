/**
 * RVP Youth — Premium brand identity generator
 * Horizon Crest mark: unity ring + rising sun + growth fork.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "logo");
const BRAND = path.join(process.cwd(), "public", "brand");

function wrap(vb: string, body: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="RVP Youth">
  <title>RVP Youth</title>
${body}
</svg>
`;
}

function defs(id: string) {
  return `  <defs>
    <linearGradient id="${id}" x1="8%" y1="0%" x2="92%" y2="100%">
      <stop offset="0%" stop-color="#1e4fd6"/>
      <stop offset="16%" stop-color="#06b6d4"/>
      <stop offset="32%" stop-color="#10b981"/>
      <stop offset="48%" stop-color="#7c3aed"/>
      <stop offset="64%" stop-color="#ec4899"/>
      <stop offset="80%" stop-color="#d4a45a"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
    <linearGradient id="${id}Shine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.7"/>
      <stop offset="45%" stop-color="#ffffff" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="${id}Bloom" cx="34%" cy="28%" r="68%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>`;
}

function markSolid(stroke: string, accent: string, fillOpacity = 0.12) {
  return `  <circle cx="32" cy="32" r="27" fill="none" stroke="${stroke}" stroke-width="2.4"/>
  <circle cx="32" cy="32" r="22.5" fill="${stroke}" opacity="${fillOpacity}"/>
  <path d="M14 38.5 C18 30.5 24.5 26 32 26 C39.5 26 46 30.5 50 38.5" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M16 40.5 A16 16 0 0 1 48 40.5" fill="${accent}" opacity="0.92"/>
  <path d="M32 40.2 V18.5" stroke="${stroke}" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M32 24.5 L23.5 16.2" stroke="${stroke}" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M32 24.5 L40.5 16.2" stroke="${stroke}" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="32" cy="15.2" r="2.1" fill="${accent}"/>`;
}

function markGlassBody(id: string) {
  return `  <circle cx="32" cy="32" r="29" fill="url(#${id})" opacity="0.16"/>
  <circle cx="32" cy="32" r="27" fill="none" stroke="url(#${id})" stroke-width="2.6"/>
  <circle cx="32" cy="32" r="22.5" fill="url(#${id}Bloom)"/>
  <path d="M14 38.5 C18 30.5 24.5 26 32 26 C39.5 26 46 30.5 50 38.5" fill="none" stroke="url(#${id})" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M16 40.5 A16 16 0 0 1 48 40.5" fill="url(#${id})" opacity="0.92"/>
  <path d="M32 40.2 V18.5" stroke="url(#${id})" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M32 24.5 L23.5 16.2" stroke="url(#${id})" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M32 24.5 L40.5 16.2" stroke="url(#${id})" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="32" cy="15.2" r="2.2" fill="url(#${id})"/>
  <ellipse cx="26" cy="20" rx="10" ry="6" fill="url(#${id}Shine)"/>`;
}

function wordmark(fill: string) {
  return `  <text x="78" y="39" fill="${fill}" font-family="ui-sans-serif, system-ui, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="26" font-weight="700" letter-spacing="1.8">RVP</text>
  <text x="146" y="39" fill="${fill}" font-family="ui-sans-serif, system-ui, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="26" font-weight="500" letter-spacing="2.6">Youth</text>`;
}

function horizontal(mark: string, fill: string) {
  return wrap(
    "0 0 280 64",
    `  <g transform="translate(2 0)">
${mark}
  </g>
${wordmark(fill)}`,
  );
}

function horizontalGlass(id: string) {
  return wrap(
    "0 0 280 64",
    `${defs(id)}
  <g transform="translate(2 0)">
${markGlassBody(id)}
  </g>
${wordmark(`url(#${id})`)}`,
  );
}

function write(name: string, svg: string) {
  fs.writeFileSync(path.join(OUT, name), svg);
  console.log("wrote", name);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(BRAND, { recursive: true });

  write("mark.svg", wrap("0 0 64 64", `${defs("m")}\n${markGlassBody("m")}`));
  write("favicon.svg", wrap("0 0 64 64", `${defs("f")}\n${markGlassBody("f")}`));
  write("logo-glass.svg", horizontalGlass("gl"));
  write("logo.svg", horizontalGlass("p"));
  write("loading-logo.svg", horizontalGlass("ld"));
  write("logo-light.svg", horizontal(markSolid("#1f3d2e", "#8f6a32"), "#13241b"));
  write("logo-dark.svg", horizontal(markSolid("#e8efe9", "#d4a45a", 0.1), "#e8efe9"));
  write("logo-gold.svg", horizontal(markSolid("#8f6a32", "#f0d7a0"), "#8f6a32"));
  write("logo-white.svg", horizontal(markSolid("#ffffff", "#f0d7a0", 0.08), "#ffffff"));
  write("logo-black.svg", horizontal(markSolid("#111111", "#8f6a32"), "#111111"));
  write("logo-transparent.svg", horizontal(markSolid("#1f3d2e", "#c49855"), "#1f3d2e"));
  write("logo-horizontal.svg", horizontal(markSolid("#1f3d2e", "#8f6a32"), "#13241b"));
  write("logo-header.svg", horizontal(markSolid("#1f3d2e", "#8f6a32"), "#13241b"));
  write("logo-footer.svg", horizontal(markSolid("#e8efe9", "#d4a45a", 0.1), "#e8efe9"));

  write(
    "logo-vertical.svg",
    wrap(
      "0 0 64 118",
      `${markSolid("#1f3d2e", "#8f6a32")}
  <text x="32" y="88" text-anchor="middle" fill="#13241b" font-family="ui-sans-serif, system-ui, Helvetica, Arial, sans-serif" font-size="15" font-weight="700" letter-spacing="2.4">RVP</text>
  <text x="32" y="106" text-anchor="middle" fill="#13241b" font-family="ui-sans-serif, system-ui, Helvetica, Arial, sans-serif" font-size="11" font-weight="500" letter-spacing="3.4">YOUTH</text>`,
    ),
  );

  write(
    "monogram.svg",
    wrap(
      "0 0 64 64",
      `${defs("mo")}
  <circle cx="32" cy="32" r="29" fill="url(#mo)" opacity="0.14"/>
  <circle cx="32" cy="32" r="27" fill="none" stroke="url(#mo)" stroke-width="2.5"/>
  <text x="32" y="39" text-anchor="middle" fill="url(#mo)" font-family="ui-sans-serif, system-ui, Helvetica, Arial, sans-serif" font-size="20" font-weight="800" letter-spacing="-0.8">RVP</text>`,
    ),
  );

  write(
    "badge.svg",
    wrap(
      "0 0 128 128",
      `${defs("b")}
  <circle cx="64" cy="64" r="60" fill="#0f1a14"/>
  <circle cx="64" cy="64" r="57" fill="none" stroke="url(#b)" stroke-width="2.8"/>
  <g transform="translate(32 16)">
${markGlassBody("b")}
  </g>
  <text x="64" y="110" text-anchor="middle" fill="#f0d7a0" font-family="ui-sans-serif, system-ui, Helvetica, Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="2.2">RVP YOUTH</text>`,
    ),
  );

  const markBuf = fs.readFileSync(path.join(OUT, "favicon.svg"));
  await sharp(markBuf).resize(512, 512).png().toFile(path.join(OUT, "logo.png"));
  await sharp(markBuf).resize(32, 32).png().toFile(path.join(OUT, "favicon-32x32.png"));
  await sharp(markBuf).resize(16, 16).png().toFile(path.join(OUT, "favicon-16x16.png"));
  await sharp(markBuf).resize(48, 48).png().toFile(path.join(OUT, "favicon.ico"));
  await sharp(markBuf).resize(180, 180).png().toFile(path.join(OUT, "apple-touch-icon.png"));
  await sharp(markBuf).resize(192, 192).png().toFile(path.join(OUT, "android-icon.png"));
  await sharp(markBuf).resize(512, 512).png().toFile(path.join(OUT, "app-icon.png"));

  const bannerSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f1a14"/>
      <stop offset="55%" stop-color="#1f3d2e"/>
      <stop offset="100%" stop-color="#13241b"/>
    </linearGradient>
    <linearGradient id="h" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e4fd6"/>
      <stop offset="25%" stop-color="#06b6d4"/>
      <stop offset="45%" stop-color="#10b981"/>
      <stop offset="65%" stop-color="#7c3aed"/>
      <stop offset="82%" stop-color="#ec4899"/>
      <stop offset="100%" stop-color="#d4a45a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="980" cy="90" r="260" fill="url(#h)" opacity="0.22"/>
  <circle cx="140" cy="540" r="200" fill="#d4a45a" opacity="0.14"/>
  <g transform="translate(130 175) scale(2.6)">
    <circle cx="32" cy="32" r="27" fill="none" stroke="url(#h)" stroke-width="2.4"/>
    <path d="M14 38.5 C18 30.5 24.5 26 32 26 C39.5 26 46 30.5 50 38.5" fill="none" stroke="url(#h)" stroke-width="2.1" stroke-linecap="round"/>
    <path d="M16 40.5 A16 16 0 0 1 48 40.5" fill="url(#h)"/>
    <path d="M32 40.2 V18.5" stroke="url(#h)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M32 24.5 L23.5 16.2" stroke="url(#h)" stroke-width="2.3" stroke-linecap="round"/>
    <path d="M32 24.5 L40.5 16.2" stroke="url(#h)" stroke-width="2.3" stroke-linecap="round"/>
    <circle cx="32" cy="15.2" r="2.1" fill="url(#h)"/>
  </g>
  <text x="380" y="300" fill="#f7f3ea" font-family="Georgia, 'Times New Roman', serif" font-size="92" font-weight="700">RVP Youth</text>
  <text x="380" y="358" fill="#f0d7a0" font-family="ui-sans-serif, system-ui, Helvetica, Arial, sans-serif" font-size="26" letter-spacing="4">DIGITAL VILLAGE EXPERIENCE</text>
</svg>`;
  await sharp(Buffer.from(bannerSvg)).png().toFile(path.join(OUT, "social-banner.png"));

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

  // app/icon convenience — Next may use app/icon.svg; also copy favicon to public root
  fs.copyFileSync(path.join(OUT, "favicon.svg"), path.join(process.cwd(), "public", "favicon.svg"));
  fs.copyFileSync(path.join(OUT, "favicon.ico"), path.join(process.cwd(), "public", "favicon.ico"));
  fs.copyFileSync(
    path.join(OUT, "apple-touch-icon.png"),
    path.join(process.cwd(), "public", "apple-touch-icon.png"),
  );

  console.log("RVP Youth logo system ready → public/logo/");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
