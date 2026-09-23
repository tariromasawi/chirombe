(function(){
  if(window.__liturgyBoot)return; window.__liturgyBoot=true;
  var seeds=window.CHIROMBE_LITURGY_SEEDS||[], family=[], last=null;
  function mount(){
    if(document.getElementById("chirombe-liturgy-matrix")) return;
    if(!document.querySelector('link[href*="liturgy.css"]')){var l=document.createElement("link");l.rel="stylesheet";l.href="./css/liturgy.css";document.head.appendChild(l)}
    var sec=document.createElement("section"); sec.id="chirombe-liturgy-matrix";
    sec.innerHTML='<header class="lm-head"><b>LITURGY MATRIX</b><span id="lm-audio">AUDIO WAITING FOR ACTIVATION</span></header><canvas id="lm-canvas" width="900" height="220"></canvas><pre id="lm-prayer"></pre><p id="lm-meta"></p><p class="lm-bridge">These traditions are presented respectfully as distinct devotional streams.</p><div class="lm-row"><button type="button" id="lm-speak">Speak</button><button type="button" id="lm-next">Next prayer</button><button type="button" id="lm-compose">Compose</button><button type="button" id="lm-drone">Arm drone</button></div>';
    (document.querySelector("main")||document.body).appendChild(sec);
    document.getElementById("lm-speak").onclick=speak;
    document.getElementById("lm-next").onclick=next;
    document.getElementById("lm-compose").onclick=next;
    document.getElementById("lm-drone").onclick=function(){if(window.ChirombeResonance){var s=ChirombeResonance.activate();document.getElementById("lm-audio").textContent=s.audio}};
  }
  function draw(){var c=document.getElementById("lm-canvas");if(!c)return;var x=c.getContext("2d");x.fillStyle="rgba(2,4,8,.4)";x.fillRect(0,0,c.width,c.height);x.strokeStyle="rgba(85,230,255,.35)";for(var i=1;i<=4;i++){x.beginPath();x.arc(c.width/2,c.height/2,18+i*20,0,Math.PI*2);x.stroke()}x.fillStyle="#d4b36a";x.font="14px Georgia";x.fillText("Mwari ndi Mwari",24,28)}
  function show(p){last=p;var b=document.getElementById("lm-prayer");if(b)b.textContent=p.text||"";var m=document.getElementById("lm-meta");if(m)m.textContent=(p.generationType||"")+" · "+(p.theme||"")+" · "+((p.traditions||[]).join(" / "));draw();if(window.ZionProtect&&ZionProtect.logAuditEvent)ZionProtect.logAuditEvent("LITURGY_CYCLE",{id:p.id,theme:p.theme});if(window.Chirombe&&Chirombe.log)Chirombe.log("LITURGY",p.theme||"cycle")}
  function invocation(){var names=family.map(function(m){return m.name});var lines=["Mwari ndi Mwari."];names.forEach(function(n){lines.push(/Corinna/i.test(n)?"In remembrance of Corinna.":"For "+n+".")});lines.push("For every future descendant represented as a DESCENDANT-META-NODE.");lines.push("May truth, peace, wisdom and love surround every branch.");return {id:"INV-BOOT",text:lines.join("\n"),generationType:"FAMILY_INVOCATION",theme:"family",traditions:["Masowe / Shona"]}}
  function next(){if(window.ChirombePrayerComposer) show(ChirombePrayerComposer.compose(seeds,family)); else show(invocation())}
  function speak(){if(!("speechSynthesis"in window))return;var u=new SpeechSynthesisUtterance((last&&last.text)||"Mwari ndi Mwari.");u.rate=0.92;speechSynthesis.cancel();speechSynthesis.speak(u);var a=document.getElementById("lm-audio");if(a)a.textContent="NARRATION USER-STARTED"}
  function boot(){
    mount();
    fetch("./data/family.json").then(function(r){return r.ok?r.json():{}}).then(function(d){family=d.members||[];show(invocation())}).catch(function(){show(invocation())});
    fetch("./data/liturgy-seeds.json").then(function(r){return r.ok?r.json():null}).then(function(d){if(d&&d.seeds)seeds=d.seeds}).catch(function(){});
    setInterval(function(){if(!document.hidden)next()},28000);
  }
  window.CHIROMBE_LITURGY={next:next,speak:speak};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
