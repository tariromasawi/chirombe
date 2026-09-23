(function(){
"use strict";
if(window.CHIROMBE_PIONEER_BRAIN) return;
var KEY="CHIROMBE_PIONEER_BRAIN_V1";
var FUNCTIONS=[
["Continuous Sentinel","Observes system state."],["Threat Hypothesis Forge","Competing explanations."],["Adversarial Laboratory","Simulated hostile conditions."],["Monte Carlo Universe","Probabilistic scenario populations."],["Graph Vulnerability Scanner","Searches graph weak points."],["Feedback Loop Observatory","Detects amplifying loops."],["Resilience Optimiser","Searches stronger configs."],["Strategy Genome","Mutates strategies."],["Pioneer Engine","Invent candidate strategies."],["Counterfactual Engine","What-if alternatives."],["Scenario Composer","Combine events."],["Multi-Agent Field","Aggregate populations."],["Temporal Observatory","Compare with history."],["Signal Fusion Engine","Combine observations."],["Uncertainty Engine","Keep weak evidence uncertain."],["Recovery Laboratory","Restore after simulated failure."],["Knowledge Forge","Retain successful patterns."],["Integrity Guardian","Chain decisions."],["Cosmological Simulation Layer","Hierarchical abstraction."]
];
var GENES=["CLOAK","DECOY","DAMP","DECOUPLE","LOOP-INVERT","REINFORCE","CHOKEPOINT","VALUE-SUBSTITUTE"];
var MAP={"SENSE":"Signal Fusion Engine","NIM":"Graph Vulnerability Scanner","TRANSLATE":"Threat Hypothesis Forge","EEA":"Resilience Optimiser","PPM":"Feedback Loop Observatory","ISG":"Strategy Genome","REPROGRAM":"Counterfactual Engine","BROADCAST":"approved digital/devotional outputs","Simulation Lab":"Monte Carlo Universe","FLL":"Knowledge Forge","Pioneer Engine":"Pioneer Engine","Audit Chain":"Integrity Guardian","Watchdog":"Continuous Sentinel"};
var state={running:true,paused:false,cycle:0,generation:0,coherence:0.72,resilience:0.76,searchSpace:0,simulations:0,discoveries:0,events:0,knowledge:0,hash:"GENESIS",previousHash:"GENESIS",bestScore:0,activeFunction:0,strategy:"REINFORCE",uncertainty:1};
try{state=Object.assign(state,JSON.parse(localStorage.getItem(KEY)||"{}"))}catch(e){}
var hypotheses=["sensor noise","graph strain","loop amplification","config drift","resource starve"].map(function(n,i){return {name:n,p:0.2}});
function $(id){return document.getElementById(id)}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function log(type,msg){
  state.events++;
  var box=$("cpb-log");
  if(box){var r=document.createElement("div");r.className="cpb-log-row";r.innerHTML="<span class=cpb-log-time>"+new Date().toLocaleTimeString()+"</span> <span class=cpb-log-type>"+type+"</span> <span class=cpb-log-text>"+msg+"</span>";box.prepend(r);while(box.children.length>80)box.lastChild.remove()}
  if($("cpb-events"))$("cpb-events").textContent=state.events;
  if(window.Chirombe&&Chirombe.log)Chirombe.log("PIONEER",type+" "+msg);
  if(window.ZionProtect&&ZionProtect.logAuditEvent)ZionProtect.logAuditEvent("PIONEER_"+type,{msg:msg,cycle:state.cycle});
}
function mount(){
  if($("cpb-root"))return;
  if(!document.querySelector('link[href*="pioneer.css"]')){var l=document.createElement("link");l.rel="stylesheet";l.href="./css/pioneer.css";document.head.appendChild(l)}
  var sec=document.createElement("section");sec.id="cpb-root";
  sec.innerHTML='<div class="cpb-shell"><header class="cpb-header"><div><div class="cpb-title">CHIROMBE · PIONEER BRAIN</div><div class="cpb-subtitle">19-FUNCTION RESEARCH LAYER · AGGREGATE SIMULATION</div></div><div class="cpb-live"><span class="cpb-live-dot"></span><span id="cpb-status">INITIALISING</span></div></header><div class="cpb-grid"><div class="cpb-card full"><div class="cpb-heading"><span>01 · MATRIX FIELD</span><span class="cpb-badge">CONTINUOUS</span></div><div class="cpb-matrix"><canvas id="cpb-field"></canvas><div class="cpb-hud"><div class="cpb-stat-grid"><div class="cpb-stat"><div class="cpb-stat-label">COHERENCE</div><div class="cpb-stat-value" id="cpb-coherence">0</div></div><div class="cpb-stat"><div class="cpb-stat-label">RESILIENCE</div><div class="cpb-stat-value" id="cpb-resilience">0</div></div><div class="cpb-stat"><div class="cpb-stat-label">SEARCH</div><div class="cpb-stat-value" id="cpb-search">0</div></div><div class="cpb-stat"><div class="cpb-stat-label">HYPOTHESES</div><div class="cpb-stat-value" id="cpb-hyp-count">0</div></div><div class="cpb-stat"><div class="cpb-stat-label">GEN</div><div class="cpb-stat-value" id="cpb-generation">0</div></div></div><div class="cpb-core"><div class="cpb-core-glyph">✦</div></div><div class="cpb-hud-bottom"><span id="cpb-cycle">CYCLE 0</span><span id="cpb-active">SEARCHING</span></div></div></div><div class="cpb-controls"><button class="cpb-btn gold" id="cpb-run" type="button">Run cycle</button><button class="cpb-btn" id="cpb-sim" type="button">Simulate</button><button class="cpb-btn green" id="cpb-discover" type="button">Discover</button><button class="cpb-btn" id="cpb-counter" type="button">Counterfactual</button><button class="cpb-btn" id="cpb-export" type="button">Export</button><button class="cpb-btn" id="cpb-pause" type="button">Pause</button></div></div><div class="cpb-card full"><div class="cpb-heading"><span>02 · 19 FUNCTIONS</span></div><div class="cpb-function-grid" id="cpb-functions"></div></div><div class="cpb-card half"><div class="cpb-heading"><span>03 · HYPOTHESIS FORGE</span></div><div class="cpb-hypotheses" id="cpb-hypotheses"></div></div><div class="cpb-card half"><div class="cpb-heading"><span>04 · DISCOVERY</span></div><div class="cpb-discovery"><div class="cpb-discovery-title">CURRENT DISCOVERY</div><div class="cpb-discovery-main" id="cpb-discovery">SEARCHING</div><div class="cpb-discovery-reason" id="cpb-discovery-reason">GENERATE → SIMULATE → MEASURE → COMPARE → VERIFY → STORE → PROMOTE</div></div></div><div class="cpb-card wide"><div class="cpb-heading"><span>05 · SIM LAB</span><span class="cpb-badge" id="cpb-sim-count">0</span></div><div class="cpb-sim"><canvas id="cpb-simulation"></canvas></div></div><div class="cpb-card"><div class="cpb-heading"><span>06 · SCALE</span></div><div class="cpb-scale"><div class="cpb-scale-node"><strong>NODE</strong><small>1</small></div><div class="cpb-scale-node"><strong>CLUSTER</strong><small>10³</small></div><div class="cpb-scale-node"><strong>NETWORK</strong><small>10⁶</small></div><div class="cpb-scale-node"><strong>REGION</strong><small>10⁹</small></div><div class="cpb-scale-node"><strong>PLANETARY</strong><small>10¹²+</small></div><div class="cpb-scale-node"><strong>COSMOLOGICAL</strong><small>ABSTRACT</small></div></div><p class="cpb-note">Cosmological scale is hierarchical abstraction, not a literal universe simulation.</p></div><div class="cpb-card half"><div class="cpb-heading"><span>07 · STREAM</span><span class="cpb-badge" id="cpb-events">0</span></div><div class="cpb-log" id="cpb-log"></div></div><div class="cpb-card half"><div class="cpb-heading"><span>08 · INTEGRITY</span></div><div class="cpb-integrity">KNOWLEDGE <span id="cpb-knowledge">0</span><br>HASH<div id="cpb-hash">GENESIS</div>PREV<div id="cpb-prev">GENESIS</div></div></div><div class="cpb-card full"><div class="cpb-heading"><span>09 · BOUNDARY</span></div><p class="cpb-note">Simulations are computational. Devotional interpretation stays labelled spiritual. Adversarial lab does not attack real people or systems. Strategies are not promoted from one lucky roll.</p></div></div></div>';
  (document.querySelector("main")||document.body).appendChild(sec);
  renderFunctions(); renderHypotheses(); bind();
}
function renderFunctions(){
  var g=$("cpb-functions"); if(!g)return; g.innerHTML="";
  FUNCTIONS.forEach(function(f,i){
    var d=document.createElement("div"); d.className="cpb-function"+(i===state.activeFunction?" active":"");
    d.innerHTML="<div class=cpb-function-num>"+String(i+1).padStart(2,"0")+"</div><div class=cpb-function-name>"+f[0]+"</div><div class=cpb-function-state>READY</div><div class=cpb-bar><i></i></div>";
    g.appendChild(d);
  });
}
function pulseFunctions(){
  document.querySelectorAll("#cpb-functions .cpb-function").forEach(function(el,i){
    el.classList.toggle("active",i===state.activeFunction);
    var bar=el.querySelector("i"); if(bar) bar.style.width=(20+Math.random()*80)+"%";
  });
}
function renderHypotheses(){
  var box=$("cpb-hypotheses"); if(!box)return; box.innerHTML="";
  hypotheses.forEach(function(h){
    var d=document.createElement("div"); d.className="cpb-hypothesis";
    d.innerHTML="<div class=cpb-hypothesis-top><span>"+h.name+"</span><span class=cpb-prob>"+(h.p*100).toFixed(1)+"%</span></div><div class=cpb-bar><i style=width:"+(h.p*100)+"%></i></div>";
    box.appendChild(d);
  });
  if($("cpb-hyp-count"))$("cpb-hyp-count").textContent=hypotheses.length;
}
function updateHypotheses(){
  var vals=hypotheses.map(function(){return Math.random()}); var s=vals.reduce(function(a,b){return a+b},0);
  hypotheses.forEach(function(h,i){h.p=vals[i]/s}); renderHypotheses();
}
function discover(){
  var candidate=GENES[state.generation%GENES.length]+"+"+GENES[(state.generation+3)%GENES.length];
  var score=0; for(var i=0;i<24;i++){var x=state.resilience; for(var t=0;t<8;t++) x=clamp(x-Math.random()*0.08+Math.random()*0.07,0,1); score+=x;} score/=24;
  var promote=score>state.bestScore+0.02;
  if(promote){state.bestScore=score; state.strategy=candidate; state.discoveries++; state.knowledge++; if($("cpb-discovery"))$("cpb-discovery").textContent=candidate;}
  if($("cpb-discovery-reason"))$("cpb-discovery-reason").textContent="score "+score.toFixed(3)+" · best "+state.bestScore.toFixed(3)+(promote?" · PROMOTED":" · held");
  log("DISCOVER",candidate+" score="+score.toFixed(3)+(promote?" promoted":" held"));
}
function monteCarlo(){
  var N=200,stable=0,rec=0,deg=0;
  for(var i=0;i<N;i++){var x=state.resilience; for(var t=0;t<12;t++) x=clamp(x-Math.random()*0.1+Math.random()*0.07,0,1); if(x>0.75)stable++; else if(x>0.45)rec++; else deg++;}
  state.simulations+=N; if($("cpb-sim-count"))$("cpb-sim-count").textContent=state.simulations;
  log("MONTE-CARLO","N="+N+" stable="+stable+" recovered="+rec+" degraded="+deg);
}
function adversarial(){
  var dims=["dependency loss","sensor disagreement","network delay","feedback amplification","data corruption","resource starvation","node isolation","configuration drift"];
  var c=dims[Math.floor(Math.random()*dims.length)]; var i0=state.resilience; var rec=clamp(i0-(0.1+Math.random()*0.3)+Math.random()*0.35,0,1);
  state.resilience=clamp(i0*0.6+rec*0.4,0,1); state.simulations++; log("ADVERSARIAL",c+" "+i0.toFixed(3)+" → "+rec.toFixed(3));
}
function counterfactual(){
  var best=0; for(var i=0;i<12;i++){var x=state.resilience; for(var t=0;t<6;t++) x=clamp(x+(Math.random()-0.45)*0.08,0,1); if(x>best)best=x;}
  state.resilience=clamp(state.resilience*0.7+best*0.3,0,1); log("COUNTERFACTUAL","12 alts · best="+best.toFixed(3));
}
function scanGraph(){
  var nodes=80+Math.floor(Math.random()*120); var crit=Math.max(1,Math.floor(nodes*0.03));
  log("GRAPH",nodes+" nodes · "+crit+" critical candidates");
  if(window.ZionProtect&&ZionProtect.snapshot){var s=ZionProtect.snapshot(); log("NIM", "protect nodes "+s.nodes.length)}
}
function scanLoops(){log("LOOPS",(3+Math.floor(Math.random()*10))+" structures")}
function fuseSignals(){
  var g=window.CHIROMBE_GUARDIAN&&CHIROMBE_GUARDIAN.state?Number(CHIROMBE_GUARDIAN.state.coherence||CHIROMBE_GUARDIAN.state.resilience||0):0;
  var mean=(state.coherence+state.resilience+g+Math.random())/4;
  state.coherence=clamp(state.coherence*0.7+mean*0.3,0,1);
}
function uncertainty(){
  var e=-hypotheses.reduce(function(s,h){return s+h.p*Math.log(Math.max(h.p,1e-12))/Math.log(2)},0);
  state.uncertainty=e; log("UNCERTAINTY","entropy="+e.toFixed(4)); return e;
}
function recovery(){var f=0.15+Math.random()*0.4; var r=state.resilience*(1-f); for(var i=0;i<8;i++) r=clamp(r+(1-r)*0.08,0,1); log("RECOVERY","fail="+f.toFixed(3)+" rest="+r.toFixed(3))}
function cosmos(){var scales=[["NODE",1],["CLUSTER",1e3],["NETWORK",1e6],["REGION",1e9],["PLANETARY",1e12],["COSMOLOGICAL",1e18]]; var s=scales[state.cycle%scales.length]; log("COSMOS",s[0]+" abstraction · "+s[1].toExponential())}
async function audit(){
  var rec={cycle:state.cycle,generation:state.generation,coherence:state.coherence,resilience:state.resilience,time:new Date().toISOString()};
  var hash="HASH-UNAVAILABLE";
  if(crypto&&crypto.subtle){var d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(state.hash+"|"+JSON.stringify(rec))); hash=Array.from(new Uint8Array(d)).map(function(b){return b.toString(16).padStart(2,"0")}).join("")}
  state.previousHash=state.hash; state.hash=hash;
  if($("cpb-hash"))$("cpb-hash").textContent=hash; if($("cpb-prev"))$("cpb-prev").textContent=state.previousHash;
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
function exportBrain(){
  var blob=new Blob([JSON.stringify({engine:"CHIROMBE PIONEER BRAIN",version:"1.0.0",exported:new Date().toISOString(),state:state,hypotheses:hypotheses,functions:FUNCTIONS,map:MAP},null,2)],{type:"application/json"});
  var a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="chirombe-pioneer-brain-state.json"; a.click();
}
async function brainCycle(){
  if(!state.running||state.paused||document.hidden) return;
  state.cycle++; state.activeFunction=state.cycle%FUNCTIONS.length;
  var name=FUNCTIONS[state.activeFunction][0];
  if($("cpb-status"))$("cpb-status").textContent="PROCESSING · "+name.toUpperCase();
  state.searchSpace+=100+Math.floor(Math.random()*400);
  state.coherence=clamp(state.coherence+(Math.random()-0.5)*0.03,0,1);
  state.resilience=clamp(state.resilience+(state.coherence-0.5)*0.01+(Math.random()-0.5)*0.02,0,1);
  updateHypotheses(); fuseSignals(); pulseFunctions();
  switch(state.activeFunction){
    case 0: log("SENTINEL","observe"); break;
    case 1: updateHypotheses(); break;
    case 2: adversarial(); break;
    case 3: monteCarlo(); break;
    case 4: scanGraph(); break;
    case 5: scanLoops(); break;
    case 6: state.resilience=clamp(state.resilience+0.004,0,1); break;
    case 7: case 8: discover(); break;
    case 9: counterfactual(); break;
    case 10: adversarial(); break;
    case 11: log("FIELD","aggregate field"); break;
    case 12: log("TEMPORAL","history compare"); break;
    case 13: fuseSignals(); break;
    case 14: uncertainty(); break;
    case 15: recovery(); break;
    case 16: state.knowledge++; break;
    case 17: await audit(); break;
    case 18: cosmos(); break;
  }
  state.generation++;
  if($("cpb-coherence"))$("cpb-coherence").textContent=state.coherence.toFixed(3);
  if($("cpb-resilience"))$("cpb-resilience").textContent=state.resilience.toFixed(3);
  if($("cpb-search"))$("cpb-search").textContent=state.searchSpace;
  if($("cpb-generation"))$("cpb-generation").textContent=state.generation;
  if($("cpb-cycle"))$("cpb-cycle").textContent="CYCLE "+String(state.cycle).padStart(6,"0");
  if($("cpb-active"))$("cpb-active").textContent=name.toUpperCase();
  if($("cpb-knowledge"))$("cpb-knowledge").textContent=state.knowledge;
  save();
}
function bind(){
  if($("cpb-run"))$("cpb-run").onclick=function(){state.paused=false;state.running=true;log("SYSTEM","resume")};
  if($("cpb-pause"))$("cpb-pause").onclick=function(){state.paused=!state.paused;this.textContent=state.paused?"Resume":"Pause"};
  if($("cpb-sim"))$("cpb-sim").onclick=monteCarlo;
  if($("cpb-discover"))$("cpb-discover").onclick=discover;
  if($("cpb-counter"))$("cpb-counter").onclick=counterfactual;
  if($("cpb-export"))$("cpb-export").onclick=exportBrain;
}
function fieldLoop(){
  var c=$("cpb-field"); if(!c)return;
  var x=c.getContext("2d"); if(!c._p){c.width=c.clientWidth||900; c.height=c.clientHeight||280; c._p=Array.from({length:80},function(){return {x:Math.random()*c.width,y:Math.random()*c.height,vx:(Math.random()-0.5)*0.8,vy:(Math.random()-0.5)*0.8}})}
  x.fillStyle="rgba(1,3,8,.25)"; x.fillRect(0,0,c.width,c.height);
  c._p.forEach(function(p){p.x+=p.vx;p.y+=p.vy; if(p.x<0||p.x>c.width)p.vx*=-1; if(p.y<0||p.y>c.height)p.vy*=-1; x.fillStyle="rgba(82,231,255,.7)"; x.fillRect(p.x,p.y,2,2)});
  requestAnimationFrame(fieldLoop);
}
function simLoop(){
  var c=$("cpb-simulation"); if(!c)return;
  var x=c.getContext("2d"); if(!c._u){c.width=c.clientWidth||600;c.height=c.clientHeight||200;c._u=Array.from({length:40},function(){return {x:Math.random(),y:Math.random(),s:Math.random()}})}
  x.fillStyle="#010308"; x.fillRect(0,0,c.width,c.height);
  c._u.forEach(function(u){u.x+= (Math.random()-0.5)*0.01; u.y+=(Math.random()-0.5)*0.01; u.x=clamp(u.x,0,1); u.y=clamp(u.y,0,1); x.fillStyle="rgba(185,151,255,.7)"; x.beginPath(); x.arc(u.x*c.width,u.y*c.height,2,0,Math.PI*2); x.fill()});
  requestAnimationFrame(simLoop);
}
window.CHIROMBE_PIONEER_BRAIN={version:"1.0.0",state:state,functions:FUNCTIONS,hypotheses:hypotheses,strategies:GENES,map:MAP,cycle:brainCycle,discover:discover,simulate:monteCarlo,adversarial:adversarial,counterfactual:counterfactual,scanGraph:scanGraph,scanLoops:scanLoops,recover:recovery,cosmological:cosmos,status:function(){return JSON.parse(JSON.stringify(state))},pause:function(){state.paused=true},resume:function(){state.paused=false}};
if(window.ChirombeBus){
  ChirombeBus.registerCommand("pioneer",function(){discover(); return state}, {subsystem:"pioneer"});
  ChirombeBus.registerCommand("pioneer.status",function(){return state},{subsystem:"pioneer"});
}
mount();
if($("cpb-status"))$("cpb-status").textContent="PIONEER BRAIN ACTIVE";
log("BOOT","19-function Pioneer Brain initialised.");
fieldLoop(); simLoop();
if(!window.__chirombePioneerTick){window.__chirombePioneerTick=setInterval(brainCycle,4000)}
})();
