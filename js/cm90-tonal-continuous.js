(function(g){
"use strict";
if(g.__CM90_TONAL_CONT__)return;g.__CM90_TONAL_CONT__=true;
var FREQS=[174,196,220,247,261.63];
var ctx=null,master=null,oscs=[],armed=false,wanted=false;
function el(id){return document.getElementById(id);}
function setAudioLabels(on){
  ["cm90AudioState","sokoAudioState"].forEach(function(id){var n=el(id);if(n)n.textContent=on?"CONTINUOUS":"OFF";});
  var b=el("cm90Audio");if(b)b.textContent=on?"DISABLE TONAL LAYER":"ENABLE TONAL LAYER";
  var t=el("chirombe-tonal-tap");if(t)t.textContent=on?"TONAL LAYER · LIVE TAP TO STOP":"TAP TO ARM CONTINUOUS TONAL LAYER";
}
function stopAll(){
  oscs.forEach(function(o){try{o.stop();}catch(e){}});oscs=[];
  if(master){try{master.disconnect();}catch(e){}}
  master=null;armed=false;setAudioLabels(false);
}
function startContinuous(){
  try{
    var AC=g.AudioContext||g.webkitAudioContext;if(!AC)return false;
    ctx=ctx||new AC();
    if(ctx.state==="suspended")ctx.resume();
    stopAll();
    master=ctx.createGain();master.gain.value=0.018;master.connect(ctx.destination);
    FREQS.forEach(function(f,i){
      var o=ctx.createOscillator();o.type="sine";o.frequency.value=f;
      var g2=ctx.createGain();g2.gain.value=0.22-i*0.02;
      o.connect(g2);g2.connect(master);o.start();
      oscs.push(o);
    });
    armed=true;wanted=true;setAudioLabels(true);
    if(g.ChirombeCM90&&ChirombeCM90.state)ChirombeCM90.state.audio=true;
    return true;
  }catch(e){return false;}
}
function toggle(){if(armed){wanted=false;stopAll();if(ctx)ctx.suspend();if(g.ChirombeCM90&&ChirombeCM90.state)ChirombeCM90.state.audio=false;}else startContinuous();}
function mountTap(){
  if(el("chirombe-tonal-tap"))return;
  var b=document.createElement("button");
  b.id="chirombe-tonal-tap";
  b.type="button";
  b.textContent="TAP TO ARM CONTINUOUS TONAL LAYER";
  b.style.cssText="position:sticky;top:44px;z-index:90;width:100%;padding:12px;border:0;background:#d7b36a;color:#120c04;font:800 13px/1.2 system-ui;letter-spacing:.08em;cursor:pointer";
  b.onclick=toggle;
  document.body.insertBefore(b,document.body.firstChild);
}
function hookExisting(){
  ["cm90Audio","sokoTone"].forEach(function(id){
    var n=el(id);if(!n)return;
    n.addEventListener("click",function(ev){ev.preventDefault();toggle();},true);
  });
}
document.addEventListener("visibilitychange",function(){
  if(!ctx)return;
  if(document.hidden){if(ctx.state==="running")ctx.suspend();}
  else if(wanted){ctx.resume();if(!armed)startContinuous();}
});
g.CHIROMBE_TONAL={start:startContinuous,stop:function(){wanted=false;stopAll();},toggle:toggle,status:function(){return{armed:armed,wanted:wanted,state:ctx&&ctx.state};}};
function boot(){mountTap();hookExisting();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,500);});else setTimeout(boot,500);
})(typeof window!=="undefined"?window:globalThis);
