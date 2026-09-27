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
  load("./js/mwarindimwari-covenant.js");
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
  load("./js/cm90-plus.js");
  load("./js/cm90-family-matrix.js");
  load("./js/cm90-tonal-continuous.js");
  load("./js/celestial-support.js");
  load("./js/celestial-autostart-on-index.js");
  function loadThen(src,next){var s=document.createElement("script");s.src=src;s.onload=next;s.onerror=next;document.head.appendChild(s);}
  loadThen("./chirombe-audio-living-liturgy.js",function(){loadThen("./js/chirombe-audio-install.js",function(){load("./js/chirombe-connect-and-play.js");});});
  function loadOrdered(list){
    var i=0;
    function next(){
      if(i>=list.length)return;
      var s=document.createElement("script");
      s.src=list[i++];
      s.onload=next;
      s.onerror=next;
      document.head.appendChild(s);
    }
    next();
  }
  loadOrdered(["./js/engine/policy.js","./js/engine/ledger.js","./js/engine/adapters.js","./js/engine/chirombe-engine.js","./js/engine/kernel-bridge.js","./js/engine/activation.js","./js/engine/recovery.js"]);
  function note(type,msg){var feed=document.getElementById("feed")||document.getElementById("log")||document.getElementById("liveFeed");if(!feed)return;var row=document.createElement("div");row.textContent=new Date().toLocaleTimeString()+"  "+type+"  "+msg;feed.prepend(row);}
  window.Chirombe={log:note,version:"2.6.7"};
  try { if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(function(){}); } catch (e) {}
  try {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", function (event) {
        var data = event.data || {};
        if (data.type !== "CHIROMBE_SW_UPDATED") return;
        if (data.build && data.build !== window.CHIROMBE_AUDIO_BUILD && !sessionStorage.getItem("chirombe-sw-" + data.build)) {
          sessionStorage.setItem("chirombe-sw-" + data.build, "1");
          location.reload();
        }
      });
    }
  } catch (e) {}
})();
