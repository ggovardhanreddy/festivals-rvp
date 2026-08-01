import fs from "node:fs";
import path from "node:path";
import { publicAlbums, allMedia, years } from "../lib/content";
import { BUCKETS, albumHref } from "../lib/site";

const root = process.cwd();
const url =
  process.env.NEXT_PUBLIC_SITE_URL || "https://ggovardhanreddy.github.io/festivals-rvp";
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
const albums = publicAlbums();
const media = allMedia();

const routes = [
  "",
  "timeline",
  "search",
  "about",
  "years",
  ...BUCKETS.map((b) => b.key),
  ...years().map((year) => `years/${year}`),
  ...BUCKETS.flatMap((b) => years().map((year) => `${b.key}/${year}`)),
  ...albums.map((album) => albumHref(album).replace(/^\/|\/$/g, "")),
];

fs.writeFileSync(
  path.join(root, "public", "search-index.json"),
  JSON.stringify(
    media.map((item) => ({
      title: item.title,
      date: item.date,
      tags: item.tags,
      type: item.type,
      album: item.album.title,
      bucket: item.album.bucket,
      year: item.album.year,
      url: `${base}${albumHref(item.album)}`,
    })),
    null,
    2,
  ),
);

fs.writeFileSync(
  path.join(root, "public", "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[
    ...new Set(routes),
  ]
    .map((route) => `<url><loc>${url}/${route}</loc></url>`)
    .join("")}</urlset>`,
);

fs.writeFileSync(
  path.join(root, "public", "feed.xml"),
  `<?xml version="1.0"?><rss version="2.0"><channel><title>RVP Youth</title><link>${url}</link><description>Premium memory experience</description>${albums
    .map(
      (album) =>
        `<item><title>${album.title}</title><link>${url}${albumHref(album)}</link><description>${album.description}</description></item>`,
    )
    .join("")}</channel></rss>`,
);

fs.writeFileSync(
  path.join(root, "public", "sw.js"),
  `const CACHE="rvp-youth-v2",BASE=${JSON.stringify(base || "")};self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll([BASE+"/",BASE+"/offline/",BASE+"/sankranthi/",BASE+"/vinayaka-chavithi/"]))));self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||caches.match(BASE+"/offline/"))))});`,
);

fs.writeFileSync(
  path.join(root, "public", "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${url}/sitemap.xml\n`,
);

const startUrl = base ? `${base}/` : "/";
const iconBase = base || "";
fs.writeFileSync(
  path.join(root, "public", "manifest.webmanifest"),
  JSON.stringify(
    {
      name: "RVP Youth",
      short_name: "RVP Youth",
      description: "Digital Village Experience - festivals, birthdays, and journeys.",
      start_url: startUrl,
      scope: base || "/",
      display: "standalone",
      background_color: "#0f1a14",
      theme_color: "#1f3d2e",
      icons: [
        {
          src: `${iconBase}/brand/icon-192.png`,
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: `${iconBase}/brand/icon-512.png`,
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    null,
    2,
  ),
);

console.log(`Generated SEO assets for ${albums.length} RVP Youth albums.`);
