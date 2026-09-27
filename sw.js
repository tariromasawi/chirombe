const STATIC="CHIROMBE_STATIC_v12";
const DATA="CHIROMBE_DATA_v3";
const BUILD="zero-fault-connect";
const FRESH=["index.html","chirombe-audio-living-liturgy.js","js/chirombe-audio-install.js","js/cm90-tonal-continuous.js","js/soko-mukanya-matrix.js","js/resonance-engine.js","js/chirombe.js","js/chirombe-connect-and-play.js","sw.js"];
const CORE=["./","./app.html","./engine.html","./inspect.html","./zcca.html","./chirombe-audio-living-liturgy.js","./js/chirombe-audio-install.js","./js/chirombe-connect-and-play.js","./js/cm90-tonal-continuous.js","./js/boot.js","./js/command-bus.js","./js/zcca.js","./js/engine/policy.js","./js/engine/ledger.js","./js/engine/adapters.js","./js/engine/chirombe-engine.js","./js/engine/kernel-bridge.js","./js/engine/activation.js","./js/engine/recovery.js","./engine/chep-03-worker-swarm.js","./data/trusted-manifest.json","./css/zcca.css","./data/family.json","./data/version.json"];
function freshRequest(url){
  try{const path=new URL(url).pathname;if(path.endsWith("/"))return true;return FRESH.some(function(name){return path.endsWith("/"+name)||path.endsWith(name);});}
  catch(e){return false;}
}
self.addEventListener("install",e=>{e.waitUntil(caches.open(STATIC).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==STATIC&&k!==DATA).map(k=>caches.delete(k)));await self.clients.claim();const clients=await self.clients.matchAll({type:"window"});clients.forEach(function(client){client.postMessage({type:"CHIROMBE_SW_UPDATED",cache:STATIC,build:BUILD});});})())});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET"||e.request.url.indexOf("http")!==0)return;
  const request=e.request;
  const fresh=request.method==="GET"&&freshRequest(request.url);
  e.respondWith((async()=>{
    try{
      const n=await fetch(request,fresh?{cache:"no-store"}:{});
      if(request.method==="GET"&&n&&n.ok&&n.type!=="opaque"){
        const cache=await caches.open(DATA);
        cache.put(request,n.clone());
      }
      return n;
    }catch(err){
      if(fresh)return new Response("CHIROMBE_ASSET_UNAVAILABLE",{status:504});
      const h=await caches.match(request);if(h)return h;return new Response("offline",{status:503});
    }
  })());
});
self.addEventListener("message",e=>{
  const t=e.data&&e.data.type;
  if(t==="GET_SW_STATUS"&&e.ports&&e.ports[0]) e.ports[0].postMessage({controller:true,cache:STATIC,build:BUILD});
  if(t==="CLEAR_RUNTIME_CACHE") caches.delete(DATA);
  if(t==="FORCE_REFRESH") self.skipWaiting();
});
