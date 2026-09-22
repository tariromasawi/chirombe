(function(g){
  g.ChirombeSystem={
    version:"2.0.0",
    protocol:"CHIROMBE-2.0",
    schemaVersion:2,
    bootId:"BOOT-"+Date.now().toString(36),
    startedAt:new Date().toISOString(),
    status:"LOADING",
    components:{},
    automation:{status:"UNKNOWN"},
    capabilities:{}
  };
  function mark(name,status){g.ChirombeSystem.components[name]=status}
  mark("boot","READY");
  fetch("./data/state.json").then(function(r){return r.ok?r.json():null}).then(function(s){
    if(s){g.ChirombeSystem.automation={status:"LOADED",updated:s.updated,ticks:s.ticks,prayer_for:s.prayer_for}}
    else g.ChirombeSystem.automation={status:"UNKNOWN"};
  }).catch(function(){g.ChirombeSystem.automation={status:"UNKNOWN"}});
  fetch("./data/health.json").then(function(r){return r.ok?r.json():null}).then(function(h){
    if(h) mark("snapshot",h.status||"UNKNOWN");
  }).catch(function(){});
  g.ChirombeSystem.status="READY";
})(typeof window!=="undefined"?window:globalThis);
