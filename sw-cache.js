const C="chirombe-v1";
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(["./","./index.html","./js/chirombe.js","./data/nodes.json"])));
});
self.addEventListener("fetch",e=>{
  e.respondWith(caches.match(e.request).then(h=>h||fetch(e.request)));
});
