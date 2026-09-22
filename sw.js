const STATIC="CHIROMBE_STATIC_v2";
const DATA="CHIROMBE_DATA_v2";
const CORE=["./","./app.html","./zcca.html","./js/boot.js","./js/command-bus.js","./js/zcca.js","./css/zcca.css","./data/family.json","./data/version.json"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(STATIC).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>![STATIC,DATA,"CHIROMBE_RUNTIME_v2"].includes(k)&&k.indexOf("chirombe")===0).map(k=>caches.delete(k)));await self.clients.claim();})())});
self.addEventListener("fetch",e=>{
  e.respondWith((async()=>{
    try{const n=await fetch(e.request);const cache=await caches.open(DATA);if(e.request.method==="GET")cache.put(e.request,n.clone());return n;}
    catch(err){const h=await caches.match(e.request);if(h)return h;return new Response("offline",{status:503});}
  })());
});
self.addEventListener("message",e=>{
  const t=e.data&&e.data.type;
  if(t==="GET_SW_STATUS"&&e.ports&&e.ports[0]) e.ports[0].postMessage({controller:true,cache:STATIC});
  if(t==="CLEAR_RUNTIME_CACHE") caches.delete("CHIROMBE_RUNTIME_v2");
  if(t==="FORCE_REFRESH") self.skipWaiting();
});
