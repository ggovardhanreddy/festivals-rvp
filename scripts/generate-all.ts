import fs from "node:fs";
import path from "node:path";
import { publicAlbums, allMedia, years } from "../lib/content";
import { FESTIVALS } from "../lib/site";
import { albumHref } from "../lib/site";

const root = process.cwd();
const url =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://ggovardhanreddy.github.io/festivals-rvp";
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
const albums = publicAlbums();
const media = allMedia();

const routes = [
  "",
  "timeline",
  "festivals",
  "birthdays",
  "search",
  "about",
  "years",
  ...FESTIVALS.map((festival) => `festivals/${festival.slug}`),
  ...years().map((year) => `years/${year}`),
  ...albums.map((album) => albumHref(album).replace(/^\/|\/$/g, "")),
];

fs.writeFileSync(
  path.join(root, "public", "search-index.json"),
  JSON.stringify(
    media.map((item) => ({
      title: item.title,
      date: item.date,
      tags: item.tags,
      album: item.album.title,
      category: item.album.category,
      url: `${base}${albumHref(item.album)}`,
    })),
    null,
    2,
  ),
);

fs.writeFileSync(
  path.join(root, "public", "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes
    .map((route) => `<url><loc>${url}/${route}</loc></url>`)
    .join("")}</urlset>`,
);

fs.writeFileSync(
  path.join(root, "public", "feed.xml"),
  `<?xml version="1.0"?><rss version="2.0"><channel><title>RVP Memories</title><link>${url}</link><description>Sankranthi, Vinayaka Chavithi, and birthday memories</description>${albums
    .map(
      (album) =>
        `<item><title>${album.title}</title><link>${url}${albumHref(album)}</link><description>${album.description}</description></item>`,
    )
    .join("")}</channel></rss>`,
);

fs.writeFileSync(
  path.join(root, "public", "sw.js"),
  `const CACHE="rvp-memories-v2",BASE=${JSON.stringify(base || "")};self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll([BASE+"/",BASE+"/offline/",BASE+"/festivals/",BASE+"/birthdays/"]))));self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||caches.match(BASE+"/offline/"))))});`,
);

console.log(
  `Generated sitemap, search index and RSS for ${albums.length} albums.`,
);
