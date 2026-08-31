import fs from "node:fs";
import path from "node:path";
import { publicAlbums, years } from "../lib/content";
import { BUCKETS, albumHref, OFFICIAL_TITLE } from "../lib/site";
import { buildSearchIndex } from "./build-search-index";
import { indexableRoutes } from "../lib/routes/registry";

const root = process.cwd();
const url =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.reddivaripalli.com";
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
const albums = publicAlbums();

const live = albums.filter((a) => (a.media?.length ?? 0) > 0);
const bucketsWithContent = BUCKETS.filter((b) =>
  live.some((a) => a.bucket === b.key),
);
/**
 * Sitemap routes for Sanatana Dharma, Telugu Culture and the collected
 * resources.
 *
 * The curated pages are unconditional — they have written content and exist in
 * every build. Collected resource pages are added only when PUBLISHED, so the
 * sitemap never advertises a URL the export did not build. Read from JSON
 * rather than importing lib/, so this works before the first collector run.
 */
function knowledgeRoutes(): string[] {
  const out = [
    "dharma",
    "dharma/knowledge",
    "dharma/vedas",
    "dharma/upanishads",
    "dharma/gita",
    "dharma/ramayanam",
    "dharma/mahabharatam",
    "dharma/puranas",
    "dharma/slokas",
    "dharma/music",
    "telugu-culture",
    "telugu-culture/literature",
    "telugu-culture/poetry",
    "telugu-culture/stories",
    "telugu-culture/spiritual",
    "telugu-culture/sri-sri",
    "spiritual-heritage",
  ];
  for (let n = 1; n <= 18; n += 1) out.push(`dharma/gita/${n}`);

  let resources: Array<Record<string, unknown>> = [];
  try {
    const raw = JSON.parse(
      fs.readFileSync(path.join(root, "generated", "resources.json"), "utf8"),
    ) as { resources?: Array<Record<string, unknown>> };
    resources = Array.isArray(raw.resources) ? raw.resources : [];
  } catch {
    return out;
  }
  for (const r of resources.filter((x) => x.status === "published")) {
    const title = String(r.title ?? "");
    const stem = title
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
    const id = String(r.id ?? "");
    out.push(`dharma/resource/${stem || "resource"}-${id.split("-").pop() ?? ""}`);
  }
  return out;
}

const routes = [
  // Static pages come from the route registry, so a new live section is in
  // the sitemap the moment it is registered rather than when someone
  // remembers to add it to a second list here.
  ...indexableRoutes().map((r) => r.path.replace(/^\/|\/$/g, "")),
  // Public festival chapters with media (exclude private fun-trips from SEO)
  ...bucketsWithContent
    .filter((b) => b.key !== "fun-trips")
    .map((b) => b.key),
  ...years().map((year) => `years/${year}`),
  // Learning Center category pages and every PUBLISHED resource page. Held
  // and unreviewed resources have no page, so they get no sitemap entry —
  // the sitemap must never advertise a URL the export did not build.
  ...knowledgeRoutes(),
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

const shard = buildSearchIndex();
fs.writeFileSync(
  path.join(root, "public", "search-index.json"),
  JSON.stringify(shard),
);
console.log(`search index: ${shard.count} documents`);

const sitemapLastmod = new Date().toISOString().slice(0, 10);
fs.writeFileSync(
  path.join(root, "public", "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[
    ...new Set(routes),
  ]
    .map((route) => {
      const loc = route ? `${url}/${route}/` : `${url}/`;
      // Prefer Home + Our Heritage over festival/year album deep pages.
      let priority = "0.6";
      if (route === "" || route === "about") priority = "1.0";
      else if (
        !route.includes("/") &&
        ![
          "vinayaka-chavithi",
          "sankranthi",
          "mathamma-jathara",
          "devapatlamma-jathara",
          "varalakshmi-vratam",
          "dasara",
          "deepavali",
          "ugadi",
          "sri-rama-navami",
        ].includes(route)
      ) {
        priority = "0.8";
      }
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
  // Member portraits are edge-proxied from R2 — never serve a stale cached 404
  if(/^\\/members\\/.+\\.(?:webp|avif|jpe?g|png)$/i.test(url.pathname)){
    e.respondWith(fetch(req,{cache:"no-store"}));
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
      // The badge, the hero and every page title say Reddivaripalli; the
      // installed app said "RVP Youth", so the icon landed on a home screen
      // under a name the site never uses. RVP Youth are the stewards, not the
      // village.
      name: "Reddivaripalli — Heritage · Community · Progress",
      short_name: "Reddivaripalli",
      description:
        "Reddivaripalli village — heritage, people, events, memories and development. Faster access, offline support and reminders.",
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
          // A launcher crops maskable icons to a circle or squircle. Pointing
          // it at the same file as "any" meant the badge's outer ring was
          // shaved off on Android; this one keeps the artwork inside the 80%
          // safe zone on the badge's own cream.
          src: `${iconBase}/logo/maskable-icon.png`,
          sizes: "512x512",
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
