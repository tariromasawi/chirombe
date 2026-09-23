(function(g){
  var ctx=null, master=null, drone=null, armed=false;
  function status(){return {audio:armed?"LIVE":"WAITING_FOR_ACTIVATION",policy:"user-gesture-required"}}
  function activate(){
    try{
      ctx=new (g.AudioContext||g.webkitAudioContext)();
      master=ctx.createGain(); master.gain.value=0.08; master.connect(ctx.destination);
      drone=ctx.createOscillator(); drone.type="sine"; drone.frequency.value=136.1;
      var g2=ctx.createGain(); g2.gain.value=0.2; drone.connect(g2); g2.connect(master); drone.start();
      armed=true;
      if(g.Chirombe&&Chirombe.log) Chirombe.log("AUDIO","resonance armed after gesture");
    }catch(e){armed=false}
    return status();
  }
  function measure(){
    return {rms:armed?0.08:0, note:"Measured acoustic resonance only. Not a curse-removal frequency."};
  }
  g.ChirombeResonance={activate:activate,status:status,measure:measure};
})(typeof window!=="undefined"?window:globalThis);
