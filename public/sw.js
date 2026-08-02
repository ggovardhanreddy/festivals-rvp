const CACHE="rvp-youth-msbu823v",BUILD="msbu823v",BASE="";
self.addEventListener("message",e=>{if(e.data&&e.data.type==="SKIP_WAITING")self.skipWaiting()});
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll([BASE+"/",BASE+"/offline/",BASE+"/version.json"]).catch(()=>{})));self.skipWaiting()});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const req=e.request;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  // Always hit network for deploy version + SW itself
  if(url.pathname.endsWith("/version.json")||url.pathname.endsWith("/sw.js")||url.pathname.endsWith("/manifest.webmanifest")){
    e.respondWith(fetch(new Request(req,{cache:"no-store"})).catch(()=>caches.match(req)));
    return;
  }
  const isNav=req.mode==="navigate";
  // Network-first for pages + media so every deploy shows new data/images online
  if(isNav||/\.(?:png|jpe?g|webp|avif|gif|svg|json|html?)(?:\?|$)/i.test(url.pathname)||url.pathname.includes("/media/")||url.pathname.includes("/thumbs/")||url.pathname.includes("/brand/")||url.pathname.includes("/logo/")||url.pathname.includes("/content/")){
    e.respondWith(fetch(req).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return r}).catch(()=>caches.match(req).then(r=>r||(isNav?caches.match(BASE+"/offline/").then(o=>o||caches.match(BASE+"/")):undefined))));
    return;
  }
  e.respondWith(fetch(req).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return r}).catch(()=>caches.match(req)));
});
