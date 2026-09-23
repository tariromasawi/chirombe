(function(){
  if(window.__guardianBoot)return;window.__guardianBoot=true;
  var state={running:true,paused:false,cycle:0,generation:0,coherence:0.74,resilience:0.72,field:0.7,strategy:"REINFORCE"};
  var STRAT=["CLOAK","DECOY","DAMP","DECOUPLE","LOOP-INVERT","REINFORCE","CHOKEPOINT","VALUE-SUBSTITUTE"];
  function mount(){
    if(document.getElementById("chirombe-guardian-brain"))return;
    var sec=document.createElement("section"); sec.id="chirombe-guardian-brain";
    sec.innerHTML='<div class="gb-head"><b>GUARDIAN BRAIN</b><span id="gb-status">ACTIVE</span></div><p id="gb-metrics"></p><div class="gb-row"><button id="gb-pause">Pause</button><button id="gb-sim">Simulate</button><button id="gb-nim">NIM reinforce</button></div><pre id="gb-log"></pre>';
    (document.querySelector("main")||document.body).appendChild(sec);
    document.getElementById("gb-pause").onclick=function(){state.paused=!state.paused;document.getElementById("gb-status").textContent=state.paused?"PAUSED":"ACTIVE"};
    document.getElementById("gb-sim").onclick=sim;
    document.getElementById("gb-nim").onclick=function(){ if(window.ChirombeBus) ChirombeBus.executeCommand("nim.reinforce",{impact:0.2}); log("NIM","reinforce requested"); };
  }
  function log(t,m){
    var el=document.getElementById("gb-log"); if(!el)return;
    el.textContent=new Date().toLocaleTimeString()+"  "+t+"  "+m+"\n"+el.textContent;
    if(window.Chirombe&&Chirombe.log) Chirombe.log(t,m);
  }
  function metrics(){
    var el=document.getElementById("gb-metrics");
    if(el) el.textContent="cycle "+state.cycle+" · gen "+state.generation+" · coh "+state.coherence.toFixed(3)+" · res "+state.resilience.toFixed(3)+" · "+state.strategy;
  }
  function sim(){
    var before=state.resilience;
    var pressure=Math.random()*0.2;
    state.resilience=Math.max(0,Math.min(1,before-pressure+Math.random()*0.16));
    state.strategy=STRAT[state.generation%STRAT.length];
    state.generation++;
    log("SIM", "pressure "+pressure.toFixed(3)+" · res "+before.toFixed(3)+" → "+state.resilience.toFixed(3)+" · "+state.strategy);
    if(window.ZionProtect&&ZionProtect.logAuditEvent) ZionProtect.logAuditEvent("GUARDIAN_SIM",{resilience:state.resilience,strategy:state.strategy});
    if(window.ChirombeBus) try{ChirombeBus.executeCommand("health")}catch(e){}
  }
  function cycle(){
    if(!state.running||state.paused||document.hidden) return;
    state.cycle++;
    state.coherence=Math.max(0,Math.min(1,0.72+Math.sin(state.cycle*0.037)*0.04+Math.random()*0.03));
    state.field=Math.max(0,Math.min(1,0.5+state.coherence*0.25+state.resilience*0.25));
    if(state.cycle%5===0) state.strategy=STRAT[state.cycle%STRAT.length];
    metrics();
    if(state.cycle%4===0) log("GUARD","cycle "+state.cycle+" · "+state.strategy);
  }
  window.CHIROMBE_GUARDIAN={version:"GB-1.0",state:state,start:function(){state.running=true;state.paused=false},pause:function(){state.paused=true},simulate:sim,status:function(){return state}};
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",mount); else mount();
  setInterval(cycle,3000);
  setInterval(function(){if(state.running&&!state.paused)sim()},18000);
})();
