(function(g){
"use strict";
if(g.__CELESTIAL_SUPPORT__)return;g.__CELESTIAL_SUPPORT__=true;
var workers=[];
function health(t){var n=document.getElementById("celestial-health");if(n)n.textContent=t;}
function spawnWorker(name){
  try{
    var src="self.onmessage=function(e){var n=0;function tick(){n++;self.postMessage({name:'"+name+"',ticks:n,t:Date.now()});setTimeout(tick,4000);}tick();};";
    var w=new Worker(URL.createObjectURL(new Blob([src],{type:"text/javascript"})));
    w.onmessage=function(ev){if(ev.data&&ev.data.ticks%5===1)health(ev.data.name+" · ticks "+ev.data.ticks);};
    w.postMessage({start:true});
    workers.push({name:name,w:w});
  }catch(err){}
}
["discovery","normalization","evidence","graph","continuity","restoration","monitoring","mirror"].forEach(spawnWorker);
if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js").catch(function(){});
try{
  var ch=new BroadcastChannel("CHIROMBE_BUS");
  ch.postMessage({type:"CELESTIAL_SUPPORT_ONLINE",at:Date.now(),workers:workers.length});
  g.CHIROMBE_CELESTIAL={workers:workers,channel:ch,status:function(){return{workers:workers.length,online:true};}};
}catch(err){
  g.CHIROMBE_CELESTIAL={workers:workers,status:function(){return{workers:workers.length,online:true};}};
}
health("support online · "+workers.length+" workers");
})(typeof window!=="undefined"?window:globalThis);
