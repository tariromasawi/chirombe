(function(g){
"use strict";
if(g.__CHIROMBE_CLLE_BOOT__)return;g.__CHIROMBE_CLLE_BOOT__=true;
g.CHIROMBE_LITURGY_CONFIG=g.CHIROMBE_LITURGY_CONFIG||{version:"1.0.0",enabled:true,integrationMode:"ADDITIVE",preserveExistingFlow:true,maximumQueueLength:24,minimumQueueLength:6,silenceBetweenItemsMs:900,speechRate:0.88,requireUserGestureForAudio:true,noSupernaturalClaims:true};
var state={version:"CLLE-1.0.0",active:false,paused:false,audioUnlocked:false,speaking:false,currentItem:null,completed:0,composed:0,scripturesRead:0,bloodlinePrayers:0,remembrancePrayers:0,masowePrayers:0,reflections:0,errors:0,recoveries:0,cycle:0,health:"STANDBY",mode:"CONTINUOUS",personIndex:0};
var SEQ=["SCRIPTURE","PRAYER","BLOODLINE","REFLECTION","SCRIPTURE","ORIGINAL","REMEMBRANCE","MASOWE","SCRIPTURE","INTERCESSION"];
function Q(){return g.CHIROMBE_LITURGY_QUEUE}
function C(){return g.CHIROMBE_LITURGY_COMPOSER}
function A(){return g.CHIROMBE_LITURGY_AUDIO}
function emit(name,detail){try{g.dispatchEvent(new CustomEvent(name,{detail:detail||{}}))}catch(e){}}
function render(){
  var st=document.getElementById("clle-status"); if(st) st.textContent=state.health+(state.speaking?" · SPEAKING":"");
  var cur=document.getElementById("clle-current"); if(cur) cur.textContent=state.currentItem?(state.currentItem.title+"\n"+state.currentItem.text):"LIVING LITURGY READY — TAP ACTIVATE";
  var nx=document.getElementById("clle-next"); var n=Q()&&Q().peek(); if(nx) nx.textContent=n?(n.type+" · "+n.title):"—";
  var q=document.getElementById("clle-queue"); if(q&&Q()) q.textContent=String(Q().size());
  var done=document.getElementById("clle-done"); if(done) done.textContent=String(state.completed);
  var au=document.getElementById("clle-audio"); if(au) au.textContent=state.audioUnlocked?(state.speaking?"SPEAKING":"UNLOCKED"):"TAP TO UNLOCK";
}
function make(type){
  if(!C()) return null;
  if(type==="SCRIPTURE"){state.scripturesRead++; return C().scripture()}
  if(type==="BLOODLINE"||type==="INTERCESSION"){state.bloodlinePrayers++; var b=C().bloodline(state.personIndex++); b.type=type==="INTERCESSION"?"INTERCESSION":b.type; return b}
  if(type==="REMEMBRANCE"){state.remembrancePrayers++; var r=C().bloodline(state.personIndex++); r.type="REMEMBRANCE"; return r}
  if(type==="MASOWE"){state.masowePrayers++; return C().masowe()}
  if(type==="ORIGINAL"){state.composed++; return C().original()}
  if(type==="REFLECTION"){state.reflections++; return C().reflection()}
  return C().prayer();
}
function fill(){
  if(!Q()||!C()) return;
  var i=0;
  while(Q().size()<Q().min && i<20){
    var t=SEQ[state.cycle%SEQ.length];
    state.cycle++;
    Q().enqueue(make(t));
    i++;
  }
}
function speakNext(){
  if(!state.active||state.paused) return;
  if(!A()||!A().unlocked()){state.health="STANDBY"; render(); return}
  if(A().isSpeaking()) return;
  fill();
  var item=Q()&&Q().peek();
  if(!item){state.health="COMPOSING"; fill(); item=Q().peek()}
  if(!item){state.health="TEXT_ONLY"; render(); return}
  state.currentItem=item;
  state.speaking=true;
  state.health=item.type==="SCRIPTURE"?"READING SCRIPTURE":"PRAYING";
  render();
  var ok=A().speak(item);
  if(!ok){state.speaking=false; state.health="TEXT_ONLY"; render()}
}
function onEnd(ev){
  var item=ev.detail;
  state.speaking=false;
  if(item&&Q()) Q().markDone(item.id);
  state.completed++;
  state.currentItem=null;
  emit("CHIROMBE_LITURGY_SPEECH_END",item);
  render();
  if(state.active&&!state.paused) setTimeout(speakNext, (g.CHIROMBE_LITURGY_CONFIG.silenceBetweenItemsMs||900));
}
function onErr(){state.errors++; state.speaking=false; state.recoveries++; state.health="RECOVERING"; setTimeout(function(){if(state.active) speakNext()},400)}
function panel(){
  if(document.getElementById("chirombe-liturgy-panel")) return;
  var s=document.createElement("section"); s.id="chirombe-liturgy-panel";
  s.style.cssText="margin:12px;padding:14px;border:1px solid #3a516c;border-radius:14px;background:#0b1018;color:#e8f4ff;font:13px/1.45 system-ui";
  s.innerHTML='<div style="letter-spacing:.14em;color:#e8c96b">LIVING LITURGY ENGINE</div><div id="clle-status">STANDBY</div><pre id="clle-current" style="white-space:pre-wrap;background:#05080d;padding:10px;min-height:72px"></pre><div>NEXT <span id="clle-next">—</span></div><div>QUEUE <span id="clle-queue">0</span> · DONE <span id="clle-done">0</span> · AUDIO <span id="clle-audio">TAP TO UNLOCK</span></div><div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:8px"><button type="button" id="clle-go">Activate living liturgy</button><button type="button" id="clle-pause">Pause</button><button type="button" id="clle-end">End</button><button type="button" id="clle-nextbtn">Next</button><button type="button" id="clle-compose">Compose now</button></div><p style="opacity:.7;font-size:12px">One tap unlocks speech. Then each prayer finishes before the next starts. Browser audio is not 24/7 after Safari closes. Generated lines are original devotionals, not extra Bible verses. Symbolic session only.</p>';
  (document.querySelector("main")||document.body).appendChild(s);
  s.querySelectorAll("button").forEach(function(b){b.style.cssText="background:#152033;color:#e8f4ff;border:1px solid #3a516c;border-radius:8px;padding:8px 10px"});
  document.getElementById("clle-go").onclick=activate;
  document.getElementById("clle-pause").onclick=function(){ if(state.paused) resume(); else pause(); };
  document.getElementById("clle-end").onclick=stop;
  document.getElementById("clle-nextbtn").onclick=function(){ if(A()) A().stop(); state.speaking=false; speakNext(); };
  document.getElementById("clle-compose").onclick=function(){ if(Q()&&C()) Q().enqueue(C().original()); render(); };
}
function activate(){
  state.active=true; state.paused=false;
  if(A()) A().unlock();
  state.audioUnlocked=true;
  fill();
  emit("CHIROMBE_LITURGY_ACTIVATED",{});
  speakNext();
}
function pause(){state.paused=true; state.health="PAUSED"; if(A()) A().pause(); render()}
function resume(){state.paused=false; state.active=true; if(A()) A().resume(); if(!state.speaking) speakNext(); render()}
function stop(){state.active=false; state.paused=false; state.speaking=false; state.health="STANDBY"; if(A()) A().stop(); render()}
function speakNow(){
  if(A()) A().unlock();
  state.audioUnlocked=true;
  var t=document.getElementById("zc-rm-reading-text")||document.getElementById("lm-prayer");
  var text=t&&t.textContent?t.textContent:null;
  if(text&&Q()) Q().enqueue({type:"PRAYER",title:"Speak now",text:text,source:"ui"});
  else if(Q()&&C()) Q().enqueue(C().prayer());
  state.active=true; speakNext();
}
function status(){return JSON.parse(JSON.stringify(state))}
function diagnostics(){
  return {supported:typeof speechSynthesis!=="undefined",active:state.active,paused:state.paused,speaking:state.speaking,queueLength:Q()?Q().size():0,completed:state.completed,generated:state.composed,scriptureCount:state.scripturesRead,bloodlineCount:state.bloodlinePrayers,errors:state.errors,recoveryCount:state.recoveries,voiceCount:A()?A().getVoices().length:0,visibility:document.visibilityState,audioUnlocked:state.audioUnlocked,health:state.health,integration:{chirombeCore:!!g.ChirombeCore,zcca:!!g.ZCCA,zcsm:!!g.ZCSM,pioneer:!!g.CHIROMBE_PIONEER_BRAIN,guardian:!!g.CHIROMBE_GUARDIAN,autostart:!!g.CHIROMBE_AUTOSTART}};
}
g.CHIROMBE_LITURGY={version:"1.0.0",state:state,activate:activate,start:activate,pause:pause,resume:resume,stop:stop,speakNow:speakNow,enqueue:function(i){return Q()&&Q().enqueue(i)},next:speakNext,compose:function(){return C()&&C().original()},composePrayer:function(){return C()&&C().prayer()},nextScripture:function(){return C()&&C().scripture()},prayForNextNode:function(){return C()&&C().bloodline(state.personIndex++)},status:status,diagnostics:diagnostics,clearQueue:function(){if(Q())Q().clearActive()},exportState:status,resetSession:function(){state.completed=0;stop()}};
g.addEventListener("CHIROMBE_LITURGY_AUDIO_END",onEnd);
g.addEventListener("CHIROMBE_LITURGY_ERROR",onErr);
g.addEventListener("CHIROMBE_CORE_PRAYER_EVENT",function(){ if(state.active&&Q()&&C()&&Q().size()<Q().max) Q().enqueue(C().bloodline(state.personIndex++)); });
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){panel();render()}); else {panel();render()}
setInterval(function(){ if(state.active&&!state.paused&&Q()&&Q().size()<Q().min) fill(); if(state.active&&!state.paused&&!state.speaking&&A()&&A().unlocked()) speakNext(); },1000);
})(typeof window!=="undefined"?window:globalThis);
