(function(g){
"use strict";
function miss(source){return {available:false,source:source,timestamp:new Date().toISOString(),data:null,confidence:0,errors:[]}}
function ok(source,data,c){return {available:true,source:source,timestamp:new Date().toISOString(),data:data,confidence:c==null?0.5:c,errors:[]}}
function readSense(){
  if(typeof g.sense==="function"){try{return ok("sense",g.sense(),0.6)}catch(e){return {available:false,source:"sense",timestamp:new Date().toISOString(),data:null,confidence:0,errors:[String(e)]}}}
  if(g.ChirombeResonance&&typeof g.ChirombeResonance.measure==="function"){var m=g.ChirombeResonance.measure(); return ok("ChirombeResonance",m,m&&m.rms?0.4:0.1)}
  return miss("sense");
}
function readTranslate(){ if(typeof g.translate==="function"){try{return ok("translate",g.translate(),0.5)}catch(e){return miss("translate")}} return miss("translate") }
function readNIM(){
  if(typeof g.runNIM==="function"){try{return ok("runNIM",g.runNIM(),0.5)}catch(e){return miss("runNIM")}}
  if(g.ZionProtect&&typeof g.ZionProtect.snapshot==="function"){var s=g.ZionProtect.snapshot(); return ok("ZionProtect",{nodes:s.nodes||[],auditLength:s.auditLength},0.7)}
  return miss("nim");
}
function readEEA(){ if(typeof g.runEEA==="function"){try{return ok("runEEA",g.runEEA(),0.5)}catch(e){return miss("runEEA")}} return miss("eea") }
function readPPM(){ if(typeof g.runPPM==="function"){try{return ok("runPPM",g.runPPM(),0.5)}catch(e){return miss("ppm")}} return miss("ppm") }
function readISG(){ if(typeof g.generateStrategies==="function"){try{return ok("generateStrategies",g.generateStrategies(),0.5)}catch(e){return miss("isg")}} if(g.CHIROMBE_PIONEER_BRAIN&&g.CHIROMBE_PIONEER_BRAIN.strategies) return ok("pioneer.strategies",g.CHIROMBE_PIONEER_BRAIN.strategies,0.4); return miss("isg") }
function readReprogram(){ if(typeof g.reprogram==="function"){try{return ok("reprogram",g.reprogram(),0.5)}catch(e){return miss("reprogram")}} return miss("reprogram") }
function readSimulation(){ if(typeof g.runSimulation==="function") return ok("runSimulation",{callable:true},0.3); if(g.CHIROMBE_PIONEER_BRAIN&&g.CHIROMBE_PIONEER_BRAIN.state) return ok("pioneer.state",{simulations:g.CHIROMBE_PIONEER_BRAIN.state.simulations},0.4); return miss("simulation") }
function readFeedback(){ if(typeof g.feedback==="function"){try{return ok("feedback",g.feedback(),0.4)}catch(e){return miss("feedback")}} return miss("feedback") }
function readGuardian(){ if(g.CHIROMBE_GUARDIAN&&typeof g.CHIROMBE_GUARDIAN.status==="function") return ok("CHIROMBE_GUARDIAN",g.CHIROMBE_GUARDIAN.status(),0.7); return miss("guardian") }
function readProtection(){ if(g.ZionProtect&&typeof g.ZionProtect.snapshot==="function") return ok("ZionProtect",g.ZionProtect.snapshot(),0.8); return miss("protection") }
function readHealth(){ if(g.ChirombeHealth&&typeof g.ChirombeHealth.snapshot==="function") return ok("ChirombeHealth",g.ChirombeHealth.snapshot(),0.6); if(g.CHIROMBE_AUTOSTART&&typeof g.CHIROMBE_AUTOSTART.status==="function") return ok("CHIROMBE_AUTOSTART",g.CHIROMBE_AUTOSTART.status(),0.6); return miss("health") }
function readAudit(){ if(g.ChirombeAudit&&typeof g.ChirombeAudit.head==="function") return ok("ChirombeAudit",g.ChirombeAudit.head(),0.6); if(g.ZionProtect&&g.ZionProtect.snapshot) return ok("ZionProtect.audit",{head:(g.ZionProtect.snapshot().head||"")},0.5); return miss("audit") }
g.CHIROMBE_PIONEER_ADAPTERS={readSense:readSense,readTranslate:readTranslate,readNIM:readNIM,readEEA:readEEA,readPPM:readPPM,readISG:readISG,readReprogram:readReprogram,readSimulation:readSimulation,readFeedback:readFeedback,readGuardian:readGuardian,readProtection:readProtection,readHealth:readHealth,readAudit:readAudit};
})(typeof window!=="undefined"?window:globalThis);
