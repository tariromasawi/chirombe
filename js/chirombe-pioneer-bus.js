(function(g){
"use strict";
if(g.CHIROMBE_PIONEER_BUS) return;
var MAX=200;
var topics={};
var latest={};
function id(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function publish(topic,payload,source){
  var ev={id:id(),topic:topic,timestamp:new Date().toISOString(),source:source||"pioneer",cycle:(g.CHIROMBE_PIONEER_BRAIN&&g.CHIROMBE_PIONEER_BRAIN.state&&g.CHIROMBE_PIONEER_BRAIN.state.cycle)||0,payload:payload};
  topics[topic]=topics[topic]||[];
  topics[topic].unshift(ev);
  if(topics[topic].length>MAX) topics[topic].length=MAX;
  latest[topic]=ev;
  (topics[topic]._subs||[]).forEach(function(fn){try{fn(ev)}catch(e){}});
  return ev;
}
function subscribe(topic,handler){
  topics[topic]=topics[topic]||[];
  topics[topic]._subs=topics[topic]._subs||[];
  topics[topic]._subs.push(handler);
  return function(){topics[topic]._subs=topics[topic]._subs.filter(function(h){return h!==handler})};
}
function history(topic,limit){return (topics[topic]||[]).slice(0,limit||50)}
function snapshot(){var o={}; Object.keys(latest).forEach(function(k){o[k]=latest[k]}); return o}
g.CHIROMBE_PIONEER_BUS={subscribe:subscribe,publish:publish,latest:function(t){return latest[t]||null},history:history,snapshot:snapshot,clear:function(t){if(t){topics[t]=[];delete latest[t]}else{topics={};latest={}}},MAX:MAX};
})(typeof window!=="undefined"?window:globalThis);
