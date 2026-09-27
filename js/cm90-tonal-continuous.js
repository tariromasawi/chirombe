(function(g){
"use strict";
if(g.__CM90_TONAL_CONT__)return;g.__CM90_TONAL_CONT__=true;
var armed=false;
function el(id){return document.getElementById(id);}
function audio(){return g.CHIROMBE_AUDIO||null;}
function tonal(){return g.CHIROMBE_AUDIO_TONAL_ENGINE||(audio()&&audio().Tonal)||null;}
function setAudioLabels(on){
  ["cm90AudioState","sokoAudioState"].forEach(function(id){var n=el(id);if(n)n.textContent=on?"ROUTED":"OFF";});
  var b=el("cm90Audio");if(b)b.textContent=on?"DISABLE TONAL LAYER":"ENABLE TONAL LAYER";
}
function mark(on){
  armed=!!on;
  setAudioLabels(armed);
  if(g.ChirombeCM90&&ChirombeCM90.state)ChirombeCM90.state.audio=armed;
}
async function startThroughKernel(){
  var A=audio();
  if(!A)return {ok:false,reason:"KERNEL_NOT_READY",independentContext:false};
  if(typeof A.recoverFromSafeStop==="function"&&A.state&&A.state.lifecycle==="SAFE_STOP"){
    try{A.recoverFromSafeStop("CM90_TONAL");}catch(e){}
  }
  if(typeof A.unlockAudio==="function"){try{await A.unlockAudio();}catch(e){}}
  var T=tonal();
  if(!T||typeof T.playScene!=="function")return {ok:false,reason:"TONAL_UNAVAILABLE",independentContext:false};
  var result=await T.playScene("PEACE",{durationMs:8000,amplitude:0.04});
  mark(!(result&&result.ok===false));
  return result||{ok:armed,independentContext:false,authority:"CHIROMBE_AUDIO"};
}
function stopThroughKernel(){
  var T=tonal();
  try{if(T&&typeof T.stopScene==="function")T.stopScene();}catch(e){}
  try{if(T&&typeof T.stopAll==="function")T.stopAll("CM90_TONAL_OFF");}catch(e){}
  mark(false);
  return {ok:true,routed:"CHIROMBE_AUDIO",independentContext:false};
}
function toggle(){if(armed)return stopThroughKernel();return startThroughKernel();}
function hookExisting(){
  ["cm90Audio","sokoTone"].forEach(function(id){
    var n=el(id);if(!n||n.__chirombeTonalHook)return;
    n.__chirombeTonalHook=true;
    n.addEventListener("click",function(ev){ev.preventDefault();ev.stopPropagation();toggle();},true);
  });
}
g.CHIROMBE_TONAL={start:startThroughKernel,stop:stopThroughKernel,toggle:toggle,status:function(){return{armed:armed,independentContext:false,authority:"CHIROMBE_AUDIO"};}};
function boot(){hookExisting();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})(typeof window!=="undefined"?window:globalThis);
