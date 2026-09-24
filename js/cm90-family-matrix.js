(function(g){
"use strict";
if(g.__CM90_FAMILY_ENGINE__)return;g.__CM90_FAMILY_ENGINE__=true;
function boot(){
var canvas=document.getElementById("CM90Canvas");
if(!canvas){
  var host=document.createElement("section");
  host.id="CM90";
  host.innerHTML='<div class="cm90-head"><div><div class="cm90-title">SOKO MUKANYA · FAMILY MATRIX</div></div></div><div class="cm90-canvaswrap"><canvas id="CM90Canvas"></canvas></div>';
  (document.querySelector("main")||document.body).appendChild(host);
  canvas=document.getElementById("CM90Canvas");
}
if(!canvas||!canvas.getContext)return;
var ctx=canvas.getContext("2d");
var $=function(id){return document.getElementById(id)};
var NAMED=[["Makwengura","Great-grandfather","PAST","Zimbabwe — unspecified"],["Masawi","Grandfather","PAST","Zimbabwe — unspecified"],["Masarura","Grandmother","PAST","Zimbabwe — unspecified"],["Sebastian Karumekangu Masawi","Father","PRESENT","Unspecified"],["Risto Kasirori Masawi","Mother","PRESENT","Unspecified"],["HRH Saint Tariro Masawi","Self / Anointed Commander","PRESENT","United Kingdom — unspecified"],["Tenderayi","Brother","PRESENT","Unspecified"],["Silent","Brother","PRESENT","Unspecified"],["Trymore","Brother","PRESENT","Unspecified"],["Charles","Brother","PRESENT","Unspecified"],["Tatenda","Brother","PRESENT","Unspecified"],["Corinna / Corina","Sister — remembrance","PAST","Unspecified"],["Rhodha / Rhoda","Sister","PRESENT","Unspecified"],["Abigail","Sister","PRESENT","Unspecified"],["HRH Tarry Kupakwashe Masawi","Son","PRESENT","United Kingdom — unspecified"],["Kenzi / Kenzie Masawi","Adopted nephew / son","PRESENT","Unspecified"]];
var REGIONS=["Zimbabwe","South Africa","United Kingdom","Southern Africa","Diaspora — unspecified"];
var S={running:true,paused:false,mirror:false,audio:false,frame:0,pulses:0,events:0,threats:0,mirrored:0,nodes:[],edges:[],audioCtx:null};
function rnd(a,b){return a+Math.random()*(b-a)}
NAMED.forEach(function(x,i){S.nodes.push({id:"CM90-"+String(i).padStart(3,"0"),name:x[0],relationship:x[1],phase:x[2],location:x[3],synthetic:false,pulse:rnd(0,6),activity:rnd(.45,.95),resilience:rnd(.65,.98),progress:rnd(.45,.95),connection:rnd(.55,.98),continuity:rnd(.6,.99),radius:4.5,angle:rnd(0,6)});});
for(var i=0;i<84;i++){var phase=["PAST","PRESENT","FUTURE"][Math.floor(i/28)];S.nodes.push({id:"CM90-"+String(16+i).padStart(3,"0"),name:"Lineage Placeholder "+String(i+1).padStart(2,"0"),relationship:phase==="FUTURE"?"Potential future-lineage placeholder":phase==="PAST"?"Ancestral placeholder":"Living-lineage placeholder",phase:phase,location:REGIONS[i%5],synthetic:true,pulse:rnd(0,6),activity:rnd(.2,.85),resilience:rnd(.35,.95),progress:rnd(.2,.9),connection:rnd(.25,.9),continuity:rnd(.3,.95),radius:rnd(2.5,4),angle:rnd(0,6)});}
function edge(a,b,type){if(S.nodes[a]&&S.nodes[b])S.edges.push({a:a,b:b,type:type});}
edge(0,1,"ancestral");edge(1,3,"lineage");edge(2,3,"family");edge(3,5,"lineage");edge(4,5,"family");edge(5,14,"continuity");edge(5,15,"continuity");edge(11,5,"remembrance");[6,7,8,9,10,12,13].forEach(function(i){edge(5,i,"family");});
for(var j=16;j<S.nodes.length;j++){var n=S.nodes[j];if(n.phase==="PAST")edge(j,1,"ancestral");else if(n.phase==="PRESENT")edge(j,5,"present");else edge(j,14,"future");}
function log(msg,type){S.events++;var feed=$("cm90Feed");if(feed){var line=document.createElement("div");line.className="cm90-log";line.textContent="["+new Date().toLocaleTimeString()+"] "+msg;feed.insertBefore(line,feed.firstChild);while(feed.children.length>80)feed.removeChild(feed.lastChild);}var ev=$("cm90Events");if(ev)ev.textContent=String(S.events);}
function setTxt(id,v){var el=$(id);if(el)el.textContent=v;}
function paintStats(){setTxt("cm90Status",S.paused?"PAUSED":S.running?"ACTIVE":"STANDBY");setTxt("cm90Nodes",String(S.nodes.length));setTxt("cm90Named","16");setTxt("cm90Pulse",String(S.pulses));setTxt("cm90Events",String(S.events));setTxt("cm90Threats",String(S.threats));setTxt("cm90Mirror",String(S.mirrored));setTxt("cm90Defence",S.mirror?"MIRROR ACTIVE":"MIRROR STANDBY");setTxt("cm90Shield",S.mirror?"ACTIVE":"READY");setTxt("cm90AudioState",S.audio?"ACTIVE":"OFF");var avg=function(k){return S.nodes.reduce(function(a,n){return a+(n[k]||0);},0)/S.nodes.length;};setTxt("cm90Res",Math.round(avg("resilience")*100)+"%");setTxt("cm90Prog",Math.round(avg("progress")*100)+"%");setTxt("cm90Conn",Math.round(avg("connection")*100)+"%");setTxt("cm90Continuity",Math.round(avg("continuity")*100)+"%");var bar=$("cm90Health");if(bar)bar.style.width=Math.round(avg("resilience")*100)+"%";}
function resize(){var r=canvas.getBoundingClientRect();var d=Math.min(g.devicePixelRatio||1,2);canvas.width=Math.max(1,Math.floor(r.width*d));canvas.height=Math.max(1,Math.floor((r.height||690)*d));ctx.setTransform(d,0,0,d,0,0);}
function layout(w,h){var cols={PAST:w*0.16,PRESENT:w*0.5,FUTURE:w*0.84};["PAST","PRESENT","FUTURE"].forEach(function(p){var arr=S.nodes.filter(function(n){return n.phase===p;});arr.forEach(function(n,i){n.x=cols[p]+Math.sin(n.angle)*18;n.y=(h/(arr.length+1))*(i+1);});});}
function draw(){var w=canvas.clientWidth||900,h=canvas.clientHeight||690;ctx.clearRect(0,0,w,h);layout(w,h);ctx.fillStyle="#7c8da1";ctx.font="700 10px monospace";ctx.fillText("PAST",w*0.16-12,22);ctx.fillText("PRESENT",w*0.5-24,22);ctx.fillText("FUTURE",w*0.84-18,22);if(S.mirror){ctx.fillStyle="rgba(108,168,255,0.06)";ctx.fillRect(0,0,w,h);ctx.fillStyle="#6ca8ff";ctx.fillText("DEFENSIVE MIRROR · LOCAL REFLECTION ONLY",40,44);}S.edges.forEach(function(e,idx){var a=S.nodes[e.a],b=S.nodes[e.b];if(!a||!b)return;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=e.type==="ancestral"?"rgba(215,179,106,0.28)":"rgba(114,214,194,0.18)";ctx.stroke();if(S.running&&!S.paused&&idx%3===0){var t=(S.frame*0.00035+idx*0.037)%1;ctx.beginPath();ctx.fillStyle="#d7b36a";ctx.arc(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,1.6,0,Math.PI*2);ctx.fill();S.pulses++;}});S.nodes.forEach(function(n){if(!S.paused)n.pulse+=0.002+n.activity*0.004;var p=(Math.sin(n.pulse)+1)/2;ctx.beginPath();ctx.fillStyle=n.synthetic?"#4a6a88":(n.phase==="PAST"?"#d7b36a":"#72d6c2");ctx.arc(n.x,n.y,(n.radius||3)*(0.85+p*0.35),0,Math.PI*2);ctx.fill();});}
function loop(){if(S.destroyed)return;S.frame++;if(S.running&&!S.paused&&document.visibilityState==="visible")draw();if(S.frame%30===0)paintStats();requestAnimationFrame(loop);}function audioOn(){try{S.audioCtx=S.audioCtx||new (g.AudioContext||g.webkitAudioContext)();S.audioCtx.resume();[174,196,220,247,261.63].forEach(function(f,i){var o=S.audioCtx.createOscillator(),gn=S.audioCtx.createGain();o.frequency.value=f;o.type="sine";gn.gain.value=0.012;o.connect(gn);gn.connect(S.audioCtx.destination);o.start(S.audioCtx.currentTime+i*0.04);o.stop(S.audioCtx.currentTime+1.2);});S.audio=true;log("Tonal layer armed after user tap");}catch(e){log("Web Audio unavailable");}paintStats();}
function bind(id,fn){var el=$(id);if(el)el.onclick=fn;}
bind("cm90Start",function(){S.running=true;S.paused=false;log("Matrix activated");paintStats();});
bind("cm90Pause",function(){S.paused=!S.paused;log(S.paused?"Pulses paused":"Pulses resumed");paintStats();});
bind("cm90MirrorBtn",function(){S.mirror=!S.mirror;if(S.mirror){S.mirrored++;S.threats++;if(g.CM90PLUS&&CM90PLUS.receive)CM90PLUS.receive({eventId:"CM90-"+Date.now(),type:"synthetic-pattern",source:"matrix"});log("Defensive mirror local isolate/reflect/discard");}paintStats();});
bind("cm90Audio",function(){if(S.audio&&S.audioCtx){S.audio=false;S.audioCtx.suspend();log("Tonal layer off");paintStats();}else audioOn();});
bind("cm90Reset",function(){S.pulses=0;S.events=0;S.threats=0;S.mirrored=0;S.mirror=false;S.paused=false;log("Matrix reset");paintStats();});
g.ChirombeCM90={version:"1.1",identity:"SOKO-MUKANYA",nodes:S.nodes,state:S};
resize();g.addEventListener("resize",resize);paintStats();log("CM90 family matrix engine bound to existing markup");log("16 named nodes + 84 placeholders · simulation only");loop();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,400);});else setTimeout(boot,400);
})(typeof window!=="undefined"?window:globalThis);
