(function(g){
"use strict";
function wrap(){
  if(!g.ChirombeCore||typeof g.ChirombeCore.pray!=="function"||g.__CLLE_PRAY_ADAPTER__) return;
  g.__CLLE_PRAY_ADAPTER__=true;
  var original=g.ChirombeCore.pray;
  g.ChirombeCore.pray=function(){
    var result=original.apply(this,arguments);
    try{g.dispatchEvent(new CustomEvent("CHIROMBE_CORE_PRAYER_EVENT",{detail:{source:"ChirombeCore",timestamp:Date.now()}}))}catch(e){}
    return result;
  };
}
wrap(); setTimeout(wrap,800); setTimeout(wrap,2500);
var speak=document.getElementById("speakBtn")||document.getElementById("lm-speak");
if(speak&&!speak.dataset.clle){
  speak.dataset.clle="1";
  speak.addEventListener("click",function(){ if(g.CHIROMBE_LITURGY) g.CHIROMBE_LITURGY.speakNow(); });
}
})(typeof window!=="undefined"?window:globalThis);
