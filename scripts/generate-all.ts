import fs from "node:fs";
import path from "node:path";
import { publicAlbums, allMedia, years } from "../lib/content";
import { BUCKETS, albumHref, OFFICIAL_TITLE } from "../lib/site";
import { loadMembers } from "../lib/members";
import { loadEvents } from "../lib/events";
import { loadDevelopments } from "../lib/developments";
import {
  loadDirectorySeed,
  loadHeritageSeed,
  loadPanchayatDocsSeed,
} from "../lib/community";
import { loadVillageHeritage } from "../lib/village-heritage";

const root = process.cwd();
const url =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.reddivaripalli.com";
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
const albums = publicAlbums();
const media = allMedia();

const live = albums.filter((a) => (a.media?.length ?? 0) > 0);
const bucketsWithContent = BUCKETS.filter((b) =>
  live.some((a) => a.bucket === b.key),
);
const routes = [
  "",
  "about",
  "years",
  "events",
  "gallery",
  "developments",
  "suggestions",
  "contact",
  "members",
  "timeline",
  "directory",
  "lost-found",
  "documents",
  "heritage",
  "privacy",
  "terms",
  "rvp-birthdays",
  // Public festival chapters with media (exclude private fun-trips from SEO)
  ...bucketsWithContent
    .filter((b) => b.key !== "fun-trips")
    .map((b) => b.key),
  ...years().map((year) => `years/${year}`),
  ...bucketsWithContent
    .filter((b) => b.key !== "fun-trips")
    .flatMap((b) => {
      const ys = [
        ...new Set(live.filter((a) => a.bucket === b.key).map((a) => a.year)),
      ];
      return ys.map((year) => `${b.key}/${year}`);
    }),
  ...live
    .filter((album) => album.bucket !== "fun-trips")
    .map((album) => albumHref(album).replace(/^\/|\/$/g, "")),
];

const searchIndex = [
  ...media
    .filter((item) => item.album.bucket !== "fun-trips")
    .map((item) => ({
      id: item.id,
      title: item.title,
      date: item.date,
      tags: item.tags,
      type: item.type,
      kind: "media",
      file: item.file,
      thumb: item.thumb,
      poster: item.poster,
      album: item.album.title,
      albumSlug: item.album.slug,
      bucket: item.album.bucket,
      year: item.album.year,
      category: item.album.category,
      url: `${base}${albumHref(item.album)}`,
    })),
  ...loadMembers().map((m) => ({
    title: m.name,
    kind: "member",
    tags: [m.designation, m.group].filter(Boolean) as string[],
    body: m.designation || "Village member",
    url: `${base}/members/`,
  })),
  ...loadDirectorySeed().map((d) => ({
    title: d.name,
    kind: "directory",
    tags: [d.category, d.profession, d.designation].filter(Boolean) as string[],
    body: `${d.profession}${d.designation ? ` · ${d.designation}` : ""}`,
    url: `${base}/directory/`,
  })),
  ...loadEvents().map((e) => ({
    title: e.title,
    date: e.date,
    kind: "event",
    tags: [e.category, e.slug].filter(Boolean) as string[],
    body: e.description,
    url: `${base}${e.slug ? `/${e.slug}/` : "/events/"}`,
  })),
  ...loadDevelopments().map((d) => ({
    title: d.title,
    kind: "development",
    tags: [d.status],
    body: d.description.slice(0, 160),
    url: `${base}/developments/`,
  })),
  ...loadPanchayatDocsSeed().map((d) => ({
    title: d.title,
    date: d.date,
    kind: "document",
    tags: [d.category],
    body: d.description || d.category,
    url: `${base}/documents/`,
  })),
  ...loadHeritageSeed()
    .filter((h) => !h.status || h.status === "approved")
    .map((h) => ({
      title: h.title,
      date: h.date,
      kind: "heritage",
      tags: [h.category],
      body: h.description,
      url: `${base}/heritage/`,
    })),
  ...(() => {
    const vh = loadVillageHeritage();
    return [
      {
        title: vh.title,
        date: "1850-01-01",
        kind: "heritage",
        tags: ["Our Heritage", "History"],
        body: vh.lede,
        url: `${base}/about/`,
      },
      {
        title: "Festivals of Reddivaripalli",
        date: undefined,
        kind: "heritage",
        tags: ["Festivals"],
        body: vh.festivals.items.map((f) => f.name).join(", "),
        url: `${base}/about/#festivals`,
      },
      {
        title: "Sacred Temples of Reddivaripalli",
        date: undefined,
        kind: "heritage",
        tags: ["Temples"],
        body: vh.temples.items.map((t) => t.name).join(", "),
        url: `${base}/about/#temples`,
      },
      {
        title: "In Loving Memory",
        date: undefined,
        kind: "heritage",
        tags: ["Memorial", "Legends"],
        body: [
          ...(vh.memorial.legends || []),
          ...vh.memorial.foreverRemembered,
        ].join("; "),
        url: `${base}/about/#memorial`,
      },
      {
        title: "Farmers — The Backbone of Reddivaripalli",
        date: undefined,
        kind: "heritage",
        tags: ["Farmers"],
        body: vh.farmers.names.join(", "),
        url: `${base}/about/#farmers`,
      },
    ];
  })(),
];

fs.writeFileSync(
  path.join(root, "public", "search-index.json"),
  JSON.stringify(searchIndex, null, 2),
);

const sitemapLastmod = new Date().toISOString().slice(0, 10);
fs.writeFileSync(
  path.join(root, "public", "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[
    ...new Set(routes),
  ]
    .map((route) => {
      const loc = route ? `${url}/${route}/` : `${url}/`;
      const priority = route === "" || route === "about" ? "1.0" : "0.8";
      return `<url><loc>${loc}</loc><lastmod>${sitemapLastmod}</lastmod><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
    })
    .join("")}</urlset>`,
);

fs.writeFileSync(
  path.join(root, "public", "feed.xml"),
  `<?xml version="1.0"?><rss version="2.0"><channel><title>${OFFICIAL_TITLE}</title><link>${url}</link><description>Official digital identity of Reddivaripalli — festivals, heritage, and community</description>${albums
    .map(
      (album) =>
        `<item><title>${album.title}</title><link>${url}${albumHref(album)}</link><description>${album.description}</description></item>`,
    )
    .join("")}</channel></rss>`,
);

const buildId =
  process.env.CF_PAGES_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  Date.now().toString(36);

// Apps poll this file — every deploy gets a new id so data/images refresh
fs.writeFileSync(
  path.join(root, "public", "version.json"),
  JSON.stringify(
    {
      buildId,
      builtAt: new Date().toISOString(),
      site: url,
    },
    null,
    2,
  ),
);

// Cache-bust media URLs in the client after every deploy
fs.writeFileSync(
  path.join(root, "lib", "build-id.ts"),
  `/** Auto-generated by scripts/generate-all.ts — do not edit */\nexport const BUILD_ID = ${JSON.stringify(buildId)};\n`,
);

fs.writeFileSync(
  path.join(root, "public", "sw.js"),
  `const CACHE=${JSON.stringify(`rvp-youth-${buildId}`)},BUILD=${JSON.stringify(buildId)},BASE=${JSON.stringify(base || "")};
async function clearAllCaches(){const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)));}
self.addEventListener("message",e=>{
  const type=e.data&&e.data.type;
  if(type==="SKIP_WAITING")self.skipWaiting();
  if(type==="CLEAR_CACHES")e.waitUntil(clearAllCaches());
});
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll([BASE+"/",BASE+"/offline/",BASE+"/version.json"]).catch(()=>{})));self.skipWaiting()});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const req=e.request;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  // Never cache APIs / version / SW / manifest — always network
  if(url.pathname.includes("/api/")||url.pathname.endsWith("/version.json")||url.pathname.endsWith("/sw.js")||url.pathname.endsWith("/manifest.webmanifest")){
    // Preserve credentials/cookies — do not reconstruct Request
    e.respondWith(fetch(req,{cache:"no-store"}).catch(()=>caches.match(req)));
    return;
  }
  // Fun Fest private media is signed via /api/media — never cache strip-local 404/redirects
  if(url.pathname.includes("/fun-trips/")||url.pathname.includes("/funfest/")){
    e.respondWith(fetch(req,{cache:"no-store"}));
    return;
  }
  // Hashed Next assets are immutable — cache-first so flaky mobile/PWA nets don't blank pages
  if(url.pathname.includes("/_next/static/")){
    e.respondWith(caches.open(CACHE).then(async c=>{
      const hit=await c.match(req);
      if(hit) return hit;
      try{
        const r=await fetch(req);
        if(r&&r.ok) c.put(req,r.clone());
        return r;
      }catch{
        return hit||Response.error();
      }
    }));
    return;
  }
  const isNav=req.mode==="navigate";
  // Network-first for pages + media so every deploy shows new data/images online
  if(isNav||/\\.(?:png|jpe?g|webp|avif|gif|svg|json|html?|js|css|mp4|webm|mp3|woff2?)(?:\\?|$)/i.test(url.pathname)||url.pathname.includes("/media/")||url.pathname.includes("/thumbs/")||url.pathname.includes("/brand/")||url.pathname.includes("/logo/")||url.pathname.includes("/content/")||url.pathname.includes("/images/")||url.pathname.includes("/videos/")){
    e.respondWith(fetch(req).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return r}).catch(()=>caches.match(req).then(r=>r||(isNav?caches.match(BASE+"/offline/").then(o=>o||caches.match(BASE+"/")):undefined))));
    return;
  }
  e.respondWith(fetch(req).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return r}).catch(()=>caches.match(req)));
});
`,
);

fs.writeFileSync(
  path.join(root, "public", "robots.txt"),
  [
    "User-agent: *",
    "Allow: /",
    "Disallow: /fun-trips/",
    "Disallow: /chat/",
    "Disallow: /login/",
    "Disallow: /admin/",
    "Disallow: /settings/",
    "Disallow: /api/",
    "Disallow: /api/media/",
    `Sitemap: ${url}/sitemap.xml`,
    "",
  ].join("\n"),
);

const startUrl = base ? `${base}/` : "/";
const iconBase = base || "";
fs.writeFileSync(
  path.join(root, "public", "manifest.webmanifest"),
  JSON.stringify(
    {
      id: startUrl,
      name: "RVP Youth · Reddivaripalli",
      short_name: "RVP Youth",
      description:
        "Install the Reddivaripalli App for faster access, offline support, and instant notifications.",
      start_url: startUrl,
      scope: base || "/",
      display: "standalone",
      display_override: ["standalone", "fullscreen", "browser"],
      orientation: "any",
      lang: "en",
      dir: "ltr",
      categories: ["lifestyle", "photo", "entertainment"],
      background_color: "#fafaf8",
      theme_color: "#1f3d2e",
      prefer_related_applications: false,
      icons: [
        {
          src: `${iconBase}/logo/android-icon.png`,
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `${iconBase}/logo/android-icon.png`,
          sizes: "192x192",
          type: "image/png",
          purpose: "maskable",
        },
        {
          src: `${iconBase}/logo/app-icon.png`,
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `${iconBase}/logo/app-icon.png`,
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
        {
          src: `${iconBase}/logo/apple-touch-icon.png`,
          sizes: "180x180",
          type: "image/png",
          purpose: "any",
        },
      ],
      shortcuts: [
        {
          name: "Gallery",
          short_name: "Gallery",
          url: `${base}/gallery/`,
          icons: [
            {
              src: `${iconBase}/logo/android-icon.png`,
              sizes: "192x192",
            },
          ],
        },
        {
          name: "Developments",
          short_name: "Developments",
          url: `${base}/developments/`,
          icons: [
            {
              src: `${iconBase}/logo/android-icon.png`,
              sizes: "192x192",
            },
          ],
        },
        {
          name: "Events",
          short_name: "Events",
          url: `${base}/events/`,
          icons: [
            {
              src: `${iconBase}/logo/android-icon.png`,
              sizes: "192x192",
            },
          ],
        },
        {
          name: "Vinayaka Chavithi",
          short_name: "Vinayaka",
          url: `${base}/vinayaka-chavithi/`,
          icons: [
            {
              src: `${iconBase}/logo/android-icon.png`,
              sizes: "192x192",
            },
          ],
        },
      ],
    },
    null,
    2,
  ),
);

console.log(`Generated SEO assets for ${albums.length} RVP Youth albums.`);
