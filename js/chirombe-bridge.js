(function(){
  function set(id,text){var el=document.getElementById(id);if(el)el.textContent=text}
  function note(type,msg){
    if(window.Chirombe&&Chirombe.log)Chirombe.log(type,msg);
    var feed=document.getElementById("feed");
    if(feed){
      var row=document.createElement("div");
      row.textContent=new Date().toLocaleTimeString()+"  "+type+"  "+msg;
      feed.prepend(row);
      while(feed.children.length>120)feed.lastChild.remove();
    }
  }
  window.Chirombe=window.Chirombe||{log:note,version:"1.1"};
  var n=0;
  function boot(src,label,slot){
    try{
      var w=new Worker(src);
      w.onmessage=function(e){
        var d=e.data||{};
        set(slot,(d.msg||label).toString().slice(0,28));
        note(d.type||label,d.msg||"tick");
      };
      n++;
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
  fetch("./data/state.json").then(function(r){return r.ok?r.json():null}).then(function(s){
    if(!s)return;
    set("cb-tick","TICK "+(s.ticks||"1"));
    note("WATCH","scheduled "+(s.updated||""));
  }).catch(function(){});
  fetch("./data/nodes.json").then(function(r){return r.ok?r.json():null}).then(function(g){
    if(g) note("GRAPH",(g.nodes||[]).length+" fabric nodes");
  }).catch(function(){});
  note("BOOT","Chirombe workers attached: "+n);
})();
