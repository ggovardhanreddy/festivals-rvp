/**
 * Rewrite generated/albums.json media paths to absolute R2 URLs when
 * NEXT_PUBLIC_R2_PUBLIC_URL is set. Safe to run after every sync/build.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToR2Key } from "../lib/media-url";

const ROOT = process.cwd();

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env) || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(ROOT, ".env.local"));
loadEnvFile(path.join(ROOT, ".env"));

const PUBLIC_URL = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "").replace(
  /\/$/,
  "",
);

function rewrite(p?: string) {
  if (!p || /^https?:\/\//i.test(p)) return p;
  if (
    p.includes("/fun-trips/") ||
    p.startsWith("/docs/") ||
    p.includes("/funfest/")
  ) {
    return p;
  }
  if (
    p.startsWith("/images/") ||
    p.startsWith("/thumbs/") ||
    p.startsWith("/videos/") ||
    p.startsWith("/audio/") ||
    p.startsWith("/brand/") ||
    p.startsWith("/members/") ||
    p.startsWith("/logo/") ||
    p.startsWith("/festivals/")
  ) {
    return `${PUBLIC_URL}/${pathToR2Key(p)}`;
  }
  return p;
}

function main() {
  if (!PUBLIC_URL) {
    console.log("NEXT_PUBLIC_R2_PUBLIC_URL unset — albums.json left relative.");
    return;
  }
  const albumsPath = path.join(ROOT, "generated", "albums.json");
  if (!fs.existsSync(albumsPath)) {
    console.warn("generated/albums.json missing — skip R2 rewrite.");
    return;
  }
  const albums = JSON.parse(fs.readFileSync(albumsPath, "utf8")) as Array<{
    cover?: string;
    media?: Array<{
      file?: string;
      thumb?: string;
      poster?: string;
      original?: string;
      fileAvif?: string;
    }>;
  }>;

  for (const album of albums) {
    album.cover = rewrite(album.cover);
    for (const item of album.media || []) {
      item.file = rewrite(item.file);
      item.thumb = rewrite(item.thumb);
      item.poster = rewrite(item.poster);
      item.original = rewrite(item.original);
      item.fileAvif = rewrite(item.fileAvif);
    }
  }

  fs.writeFileSync(albumsPath, JSON.stringify(albums, null, 2));
  fs.writeFileSync(
    path.join(ROOT, "generated", "albums.r2.json"),
    JSON.stringify(albums, null, 2),
  );
  console.log(`albums.json → R2 URLs (${PUBLIC_URL}, ${albums.length} albums)`);
}

main();
