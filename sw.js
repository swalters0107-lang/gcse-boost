const CACHE="levelup10-v02402";
const ASSETS=["./","./index.html","./gcse-boost-b421.css?v=02402","./cloud-auth.css?v=02402","./app.js?v=02402","./fix-v011a29.js?v=011a29","./fix-v011a29-2.js?v=011a292","./cloud-auth.js?v=02402","./manifest.json","./icon-192.png","./icon-512.png","./FRIENDS_BATTLES_DESIGN.md"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 if(e.request.mode==="navigate"){e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put("./index.html",copy));return r}).catch(()=>caches.match("./index.html")));return;}
 e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)));
});
