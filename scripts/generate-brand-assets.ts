import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const brand = path.join(process.cwd(), "public", "brand");
const mark = path.join(brand, "rvp-youth-mark.svg");
const ogSvg = path.join(brand, "og-banner.svg");

async function main() {
  const markBuf = fs.readFileSync(mark);
  const ogBuf = fs.readFileSync(ogSvg);

  await sharp(markBuf).resize(192, 192).png().toFile(path.join(brand, "icon-192.png"));
  await sharp(markBuf).resize(512, 512).png().toFile(path.join(brand, "icon-512.png"));
  await sharp(markBuf)
    .resize(180, 180)
    .png()
    .toFile(path.join(brand, "apple-touch-icon.png"));
  await sharp(markBuf).resize(512, 512).png().toFile(path.join(brand, "splash-icon.png"));
  await sharp(ogBuf).jpeg({ quality: 88 }).toFile(path.join(brand, "og-banner.jpg"));

  console.log("Brand assets generated: icons, splash, OG banner.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
