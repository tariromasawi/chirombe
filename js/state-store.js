(function(g){
  var KEY="CHIROMBE_STATE_V2";
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return{}}}
  function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
  var st=Object.assign({schemaVersion:2,systemVersion:"2.0.0",lastBoot:new Date().toISOString(),migrationHistory:["v1-v2"]},load());
  save(st);
  g.ChirombeState={load:load,save:function(){save(st)},data:st};
})(typeof window!=="undefined"?window:globalThis);
