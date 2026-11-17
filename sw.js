/* Шәкірт: офлайн кэш. Нұсқа ауысқанда ескі кэш өшіріледі. */
const V="shakirt-6f512113ad";
const FILES=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png",
 "fonts/geist-latin.woff2","fonts/geist-cyrillic.woff2","fonts/geist-cyrillic-ext.woff2",
 "fonts/geist-mono-latin.woff2","fonts/geist-mono-cyrillic.woff2","fonts/geist-mono-cyrillic-ext.woff2",
 "fonts/caveat-latin.woff2","fonts/caveat-cyrillic.woff2","fonts/caveat-cyrillic-ext.woff2"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET"||new URL(e.request.url).origin!==location.origin) return;
  // бет: алдымен желі (жаңа нұсқа үшін), болмаса кэш; қалғаны: алдымен кэш
  if(e.request.mode==="navigate"){e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put("index.html",c));return r}).catch(()=>caches.match("index.html")));return}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(e.request,c));return res})));
});
