(function(g){
  function cap(){
    return {
      webWorkers:typeof Worker!=="undefined",
      serviceWorker:"serviceWorker"in navigator,
      indexedDB:!!g.indexedDB,
      cacheAPI:!!g.caches,
      broadcastChannel:typeof BroadcastChannel!=="undefined",
      online:navigator.onLine
    };
  }
  function snapshot(){
    var c=cap();
    var auto="UNKNOWN";
    var age=null;
    if(g.ChirombeSystem&&ChirombeSystem.automation&&ChirombeSystem.automation.updated){
      age=(Date.now()-Date.parse(ChirombeSystem.automation.updated))/60000;
      auto=age<10?"FRESH":age<60?"AGING":age<360?"STALE":"CRITICAL_STALE";
    }
    var status=!c.online?"OFFLINE":(auto==="CRITICAL_STALE"||auto==="STALE"?"DEGRADED":"HEALTHY");
    if(auto==="UNKNOWN"&&c.online) status="DEGRADED";
    return {status:status,automation:auto,ageMinutes:age,caps:c,checkedAt:new Date().toISOString()};
  }
  g.ChirombeHealth={snapshot:snapshot,capabilities:cap};
})(typeof window!=="undefined"?window:globalThis);
