(function(g){
"use strict";
var MAX=24, MIN=6, items=[];
function size(){return items.filter(function(x){return !x.completed}).length}
function enqueue(item){
  if(!item||!item.text||!item.type) return false;
  if(size()>=MAX) return false;
  item.id=item.id||("LQ-"+Date.now().toString(36)+Math.random().toString(36).slice(2,5));
  item.createdAt=item.createdAt||new Date().toISOString();
  item.spoken=false; item.completed=false;
  items.push(item); return true;
}
function peek(){for(var i=0;i<items.length;i++) if(!items[i].completed) return items[i]; return null}
function markDone(id){items.forEach(function(x){if(x.id===id){x.completed=true;x.spoken=true}})}
function clearActive(){items=items.filter(function(x){return x.completed}).slice(-40)}
g.CHIROMBE_LITURGY_QUEUE={enqueue:enqueue,peek:peek,markDone:markDone,size:size,min:MIN,max:MAX,all:function(){return items.slice()},clearActive:clearActive};
})(typeof window!=="undefined"?window:globalThis);
