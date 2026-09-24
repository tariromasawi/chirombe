(function(){
  if(window.__chirombeBoot)return;window.__chirombeBoot=true;
  function load(src){var s=document.createElement("script");s.src=src;document.head.appendChild(s);}
  load("./js/boot.js");
  load("./js/command-bus.js");
  load("./js/state-store.js");
  load("./js/audit-chain.js");
  load("./js/health.js");
  load("./js/watchdog.js");
  load("./js/zion-protection-core.js");
  load("./js/index-hmac-nim-addition.js");
  load("./js/chirombe-permissions.js");
  load("./js/liturgy-attach.js");
  load("./js/chirombe-core.js");
  load("./js/chirombe-scripture-library.js");
  load("./js/chirombe-liturgy-queue.js");
  load("./js/chirombe-liturgy-composer.js");
  load("./js/chirombe-liturgy-audio.js");
  load("./js/chirombe-liturgy-engine.js");
  load("./js/chirombe-liturgy-adapter.js");
  load("./js/zcca-attach.js");
  load("./js/chirombe-autostart.js");
  load("./js/soko-mukanya-matrix.js");
  function note(type,msg){var feed=document.getElementById("feed")||document.getElementById("log")||document.getElementById("liveFeed");if(!feed)return;var row=document.createElement("div");row.textContent=new Date().toLocaleTimeString()+"  "+type+"  "+msg;feed.prepend(row);}
  window.Chirombe={log:note,version:"2.6.0"};
  if(!document.getElementById("chirombe-dock")){
    var d=document.createElement("div");d.id="chirombe-dock";d.style.cssText="position:sticky;top:0;z-index:80;display:flex;gap:8px;flex-wrap:wrap;padding:10px 16px;background:#070b12;color:#e9f2ff;font:11px ui-sans-serif";d.innerHTML='<strong style="color:#e5c46a">CHIROMBE-2.6 SOKO</strong><a href="./pioneer.html" style="color:#ffe8a4">pioneer</a><a href="./app.html" style="color:#ffe8a4">core</a>';document.body.insertBefore(d,document.body.firstChild);
  }
  if("serviceWorker"in navigator) navigator.serviceWorker.register("./sw.js").catch(function(){});
})();
