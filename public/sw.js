const CACHE="rvp-youth-mtfvdcr9",BUILD="mtfvdcr9",BASE="";
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
  if(/^\/members\/.+\.(?:webp|avif|jpe?g|png)$/i.test(url.pathname)){
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
  if(isNav||/\.(?:png|jpe?g|webp|avif|gif|svg|json|html?|js|css|mp4|webm|mp3|woff2?)(?:\?|$)/i.test(url.pathname)||url.pathname.includes("/media/")||url.pathname.includes("/thumbs/")||url.pathname.includes("/brand/")||url.pathname.includes("/logo/")||url.pathname.includes("/content/")||url.pathname.includes("/images/")||url.pathname.includes("/videos/")){
    e.respondWith(fetch(req).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return r}).catch(()=>caches.match(req).then(r=>r||(isNav?caches.match(BASE+"/offline/").then(o=>o||caches.match(BASE+"/")):undefined))));
    return;
  }
  e.respondWith(fetch(req).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return r}).catch(()=>caches.match(req)));
});
