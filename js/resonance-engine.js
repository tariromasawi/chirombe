(function(g){
  var armed=false;
  function status(){return {audio:armed?"LIVE":"WAITING_FOR_ACTIVATION",policy:"kernel-context-only"}}
  function activate(){
    try{
      var kernel=g.CHIROMBE_AUDIO;
      if(!kernel||typeof kernel.runHardwareSelfTest!=="function"){
        armed=false;
        return status();
      }
      kernel.runHardwareSelfTest().then(function(report){armed=!!(report&&report.ok);});
      if(g.Chirombe&&Chirombe.log) Chirombe.log("AUDIO","resonance routed through CHIROMBE_AUDIO");
    }catch(e){armed=false}
    return status();
  }
  function measure(){
    var kernel=g.CHIROMBE_AUDIO;
    var path=kernel&&kernel.inspectSignalPath?kernel.inspectSignalPath():null;
    return {rms:path&&path.masterGain||0, note:"Kernel context only. No independent AudioContext."};
  }
  g.ChirombeResonance={activate:activate,status:status,measure:measure};
})(typeof window!=="undefined"?window:globalThis);
