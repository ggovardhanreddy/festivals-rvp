import { mkdir, readdir } from "node:fs/promises";
import sharp from "sharp";
const files = await readdir("content", { recursive: true });
for (const relative of files.map(String).filter((file) => /\/originals\/[^/]+\.(jpg|jpeg|png|webp)$/i.test(file))) {
  const file = `content/${relative}`;
  const target = file.replace("/originals/", "/public/images/").replace(/\.(png|jpeg)$/i, ".jpg");
  const thumb = target.replace("/public/images/", "/public/thumbs/");
  await mkdir(target.slice(0, target.lastIndexOf("/")), {recursive:true});
  await mkdir(thumb.slice(0, thumb.lastIndexOf("/")), {recursive:true});
  await sharp(file).rotate().resize(2400, 2400, {fit:"inside", withoutEnlargement:true}).jpeg({quality:86}).toFile(target);
  await sharp(file).rotate().resize(640, 640, {fit:"inside", withoutEnlargement:true}).jpeg({quality:76}).toFile(thumb);
}
console.log("Image optimization complete.");
