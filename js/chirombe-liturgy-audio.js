(function(g){
"use strict";
var current=null, unlocked=false;
function voices(){try{return speechSynthesis.getVoices()||[]}catch(e){return []}}
function choose(){
  var list=voices();
  var prefer=["en-GB","en-US","en"];
  for(var i=0;i<prefer.length;i++){
    for(var j=0;j<list.length;j++) if((list[j].lang||"").indexOf(prefer[i])===0) return list[j];
  }
  return list[0]||null;
}
function unlock(){unlocked=true; try{speechSynthesis.resume()}catch(e){} return unlocked}
function speak(item){
  if(!("speechSynthesis"in g)) return false;
  if(!unlocked) return false;
  if(!item||!item.text) return false;
  try{speechSynthesis.cancel()}catch(e){}
  var u=new SpeechSynthesisUtterance(item.text);
  var v=choose(); if(v) u.voice=v;
  u.rate=(g.CHIROMBE_LITURGY_CONFIG&&g.CHIROMBE_LITURGY_CONFIG.speechRate)||0.88;
  u.pitch=1; u.volume=1;
  u.onstart=function(){g.dispatchEvent(new CustomEvent("CHIROMBE_LITURGY_SPEECH_START",{detail:item}))};
  u.onend=function(){current=null; g.dispatchEvent(new CustomEvent("CHIROMBE_LITURGY_AUDIO_END",{detail:item}))};
  u.onerror=function(){current=null; g.dispatchEvent(new CustomEvent("CHIROMBE_LITURGY_ERROR",{detail:item}))};
  current=u; speechSynthesis.speak(u); return true;
}
g.CHIROMBE_LITURGY_AUDIO={unlock:unlock,speak:speak,pause:function(){try{speechSynthesis.pause()}catch(e){}},resume:function(){try{speechSynthesis.resume()}catch(e){}},stop:function(){try{speechSynthesis.cancel()}catch(e){} current=null},isSpeaking:function(){return !!(g.speechSynthesis&&speechSynthesis.speaking)},getVoices:voices,chooseVoice:choose,unlocked:function(){return unlocked}};
})(typeof window!=="undefined"?window:globalThis);
