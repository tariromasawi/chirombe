(function(){
  if(window.__chirombeBoot)return;window.__chirombeBoot=true;
  function set(id,t){var e=document.getElementById(id);if(e)e.textContent=t}
  function note(type,msg){
    var feed=document.getElementById("feed")||document.getElementById("log");
    if(!feed)return;
    var row=document.createElement("div");
    row.textContent=new Date().toLocaleTimeString()+"  "+type+"  "+msg;
    feed.prepend(row);
    while(feed.children.length>160)feed.lastChild.remove();
  }
  window.Chirombe={log:note,version:"1.3"};
  if(!document.getElementById("chirombe-dock")){
    var dock=document.createElement("div");
    dock.id="chirombe-dock";
    dock.style.cssText="position:sticky;top:0;z-index:80;display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:10px 16px;border-bottom:1px solid #1c2a3a;background:#070b12;font:11px/1.3 ui-sans-serif,system-ui;letter-spacing:.06em;color:#e9f2ff";
    dock.innerHTML='<strong style="color:#e5c46a">CHIROMBE</strong><span id="cb-sw">SW</span><span id="cb-pulse">PULSE</span><span id="cb-watch">WATCH</span><span id="cb-graph">GRAPH</span><span id="cb-disc">DISC</span><span id="cb-threat">THREAT</span><span id="cb-evolve">EVOLVE</span><span id="cb-family">FAMILY</span><span id="cb-tick">TICK</span>';
    document.body.insertBefore(dock,document.body.firstChild);
  }
  var TASKS=[
    ["./workers/pulse-worker.js","PULSE","cb-pulse"],
    ["./workers/watch-worker.js","WATCH","cb-watch"],
    ["./workers/graph-worker.js","GRAPH","cb-graph"],
    ["./workers/discovery-worker.js","DISC","cb-disc"],
    ["./workers/threat-worker.js","THREAT","cb-threat"],
    ["./workers/evolve-worker.js","EVOLVE","cb-evolve"],
    ["./workers/family-worker.js","FAMILY","cb-family"],
    ["./workers/cloak-worker.js","CLOAK","cb-pulse"],
    ["./workers/decoy-worker.js","DECOY","cb-watch"],
    ["./workers/audit-worker.js","AUDIT","cb-tick"]
  ];
  TASKS.forEach(function(t){
    try{
      var w=new Worker(t[0]);
      w.onmessage=function(e){
        var d=e.data||{};
        set(t[2],(d.msg||t[1]).toString().slice(0,36));
        note(d.type||t[1],d.msg||"tick");
        if(d.type==="THREAT"&&window.ChirombeCore)ChirombeCore.detect(d.score);
        if(d.type==="EVOLVE"&&window.ChirombeCore)ChirombeCore.evolve();
      };
    }catch(err){set(t[2],"blocked")}
  });
  if("serviceWorker"in navigator){
    navigator.serviceWorker.register("./sw.js").then(function(reg){
      set("cb-sw","SW CTRL");
      if(reg.active)reg.active.postMessage({task:"protect",circle:"House of Masawi"});
    }).catch(function(){set("cb-sw","SW BLOCKED")});
  }
  fetch("./data/state.json").then(function(r){return r.ok?r.json():null}).then(function(s){if(s)set("cb-tick","TICK "+(s.ticks||1))}).catch(function(){});
  note("BOOT","10 tasked workers + 1 controlling service worker");
})();
