(function(){
  if(window.__chirombeBoot)return;window.__chirombeBoot=true;
  function set(id,t){var e=document.getElementById(id);if(e)e.textContent=t}
  function note(type,msg){
    var feed=document.getElementById("feed")||document.getElementById("log");
    if(!feed)return;
    var row=document.createElement("div");
    row.textContent=new Date().toLocaleTimeString()+"  "+type+"  "+msg;
    feed.prepend(row);
    while(feed.children.length>200)feed.lastChild.remove();
  }
  window.Chirombe={log:note,version:"1.4"};
  if(!document.getElementById("chirombe-dock")){
    var dock=document.createElement("div");
    dock.id="chirombe-dock";
    dock.style.cssText="position:sticky;top:0;z-index:80;display:flex;gap:8px;flex-wrap:wrap;padding:10px 16px;border-bottom:1px solid #1c2a3a;background:#070b12;font:11px/1.3 ui-sans-serif,system-ui;color:#e9f2ff";
    dock.innerHTML='<strong style="color:#e5c46a">CHIROMBE</strong><span id="cb-sw">SW</span><span id="cb-family">FAMILY</span><span id="cb-pray">PRAY</span><span id="cb-threat">THREAT</span><span id="cb-evolve">EVOLVE</span>';
    document.body.insertBefore(dock,document.body.firstChild);
  }
  [["./workers/pulse-worker.js","PULSE","cb-sw"],["./workers/watch-worker.js","WATCH","cb-sw"],["./workers/graph-worker.js","GRAPH","cb-sw"],["./workers/discovery-worker.js","DISC","cb-sw"],["./workers/threat-worker.js","THREAT","cb-threat"],["./workers/evolve-worker.js","EVOLVE","cb-evolve"],["./workers/family-worker.js","FAMILY","cb-family"],["./workers/prayer-worker.js","PRAY","cb-pray"],["./workers/cloak-worker.js","CLOAK","cb-evolve"],["./workers/decoy-worker.js","DECOY","cb-threat"],["./workers/audit-worker.js","AUDIT","cb-sw"]].forEach(function(t){
    try{var w=new Worker(t[0]);w.onmessage=function(e){var d=e.data||{};set(t[2],(d.msg||t[1]).toString().slice(0,40));note(d.type||t[1],d.msg||"tick")}}catch(e){}
  });
  if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js").then(function(){set("cb-sw","SW ON")}).catch(function(){set("cb-sw","SW BLOCKED")});
  var s=document.createElement("script");s.src="./js/chirombe-core.js";document.head.appendChild(s);
})();
