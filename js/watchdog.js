(function(g){
  function tick(){
    var h=g.ChirombeHealth?ChirombeHealth.snapshot():{status:"UNKNOWN"};
    if(g.ChirombeSystem){
      ChirombeSystem.health=h;
      ChirombeSystem.status=h.status;
    }
    var el=document.getElementById("cb-auto");
    if(el) el.textContent="AUTO "+(h.automation||"UNKNOWN");
  }
  g.ChirombeWatchdog={tick:tick};
  setInterval(tick,15000);
  if(document.readyState!=="loading") tick(); else document.addEventListener("DOMContentLoaded",tick);
})(typeof window!=="undefined"?window:globalThis);
