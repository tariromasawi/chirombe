(function(){
  if(window.__chirombeBoot)return;window.__chirombeBoot=true;
  function set(id,t){var e=document.getElementById(id);if(e)e.textContent=t}
  function note(type,msg){
    var feed=document.getElementById("feed")||document.getElementById("log");
    if(!feed)return;
    var row=document.createElement("div");
    row.textContent=new Date().toLocaleTimeString()+"  "+type+"  "+msg;
    feed.prepend(row);
    while(feed.children.length>120)feed.lastChild.remove();
  }
  window.Chirombe={log:note,version:"1.2"};
  if(!document.getElementById("chirombe-dock")){
    var dock=document.createElement("div");
    dock.id="chirombe-dock";
    dock.style.cssText="position:sticky;top:0;z-index:50;display:flex;gap:10px;flex-wrap:wrap;align-items:center;padding:10px 16px;border-bottom:1px solid #1c2a3a;background:#070b12;font:12px/1.3 ui-sans-serif,system-ui;letter-spacing:.08em;color:#e9f2ff";
    dock.innerHTML='<strong style="color:#e5c46a">CHIROMBE</strong><span id="cb-sw">SW —</span><span id="cb-pulse">PULSE —</span><span id="cb-watch">WATCH —</span><span id="cb-graph">GRAPH —</span><span id="cb-disc">DISC —</span><span id="cb-tick">TICK —</span>';
    document.body.insertBefore(dock,document.body.firstChild);
  }
  function boot(src,label,slot){
    try{
      var w=new Worker(src);
      w.onmessage=function(e){var d=e.data||{};set(slot,(d.msg||label).slice(0,32));note(d.type||label,d.msg||"tick")};
    }catch(err){set(slot,"blocked")}
  }
  if(window.Worker){
    boot("./workers/pulse-worker.js","PULSE","cb-pulse");
    boot("./workers/watch-worker.js","WATCH","cb-watch");
    boot("./workers/graph-worker.js","GRAPH","cb-graph");
    boot("./workers/discovery-worker.js","DISC","cb-disc");
  }
  if("serviceWorker"in navigator){
    navigator.serviceWorker.register("./sw.js").then(function(){set("cb-sw","SW ON")}).catch(function(){set("cb-sw","SW BLOCKED")});
    navigator.serviceWorker.register("./sw-cache.js").catch(function(){});
  }
  fetch("./data/state.json").then(function(r){return r.ok?r.json():null}).then(function(s){if(s){set("cb-tick","TICK "+(s.ticks||1));note("WATCH","scheduled "+(s.updated||""))}}).catch(function(){});
  note("BOOT","workers attached to pasted command centre");
})();
