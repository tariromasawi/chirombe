(function(){
  if(window.__liturgyBoot)return; window.__liturgyBoot=true;
  var seeds=[], family=[], cycle=0, last=null;
  function el(tag,cls,html){var n=document.createElement(tag); if(cls)n.className=cls; if(html)n.innerHTML=html; return n}
  function mount(){
    if(document.getElementById("chirombe-liturgy-matrix")) return document.getElementById("chirombe-liturgy-matrix");
    var s=document.createElement("link"); s.rel="stylesheet"; s.href="./css/liturgy.css"; document.head.appendChild(s);
    var sec=el("section","",""); sec.id="chirombe-liturgy-matrix";
    sec.innerHTML='<header class="lm-head"><b>LITURGY MATRIX</b><span id="lm-audio">AUDIO WAITING FOR ACTIVATION</span></header><canvas id="lm-canvas" width="900" height="220"></canvas><pre id="lm-prayer"></pre><p id="lm-meta"></p><p class="lm-bridge">These traditions are presented respectfully as distinct devotional streams.</p><div class="lm-row"><button id="lm-speak">Speak</button><button id="lm-next">Next prayer</button><button id="lm-compose">Compose</button><button id="lm-drone">Arm drone</button></div>';
    (document.querySelector("main")||document.body).appendChild(sec);
    return sec;
  }
  function draw(){
    var c=document.getElementById("lm-canvas"); if(!c)return;
    var x=c.getContext("2d"); var w=c.width,h=c.height;
    x.fillStyle="rgba(2,4,8,0.35)"; x.fillRect(0,0,w,h);
    x.strokeStyle="rgba(85,230,255,0.35)";
    for(var i=1;i<=4;i++){x.beginPath();x.arc(w/2,h/2,20+i*18+(cycle%12),0,Math.PI*2);x.stroke();}
    x.fillStyle="rgba(212,179,106,0.9)"; x.font="12px Georgia"; x.fillText("Mwari ndi Mwari",24,28);
  }
  function show(p){
    last=p;
    var box=document.getElementById("lm-prayer"); if(box) box.textContent=p.text||"";
    var meta=document.getElementById("lm-meta"); if(meta) meta.textContent=(p.generationType||p.historicalStatus||"")+" · "+(p.theme||"")+" · "+(p.traditions?p.traditions.join(" / "):"");
    draw();
    if(window.ChirombeBus) try{ChirombeBus.executeCommand&&null}catch(e){}
    if(window.ZionProtect&&ZionProtect.logAuditEvent) ZionProtect.logAuditEvent("LITURGY_CYCLE",{id:p.id,theme:p.theme});
    if(window.Chirombe&&Chirombe.log) Chirombe.log("LITURGY",p.theme||"cycle");
  }
  function invocation(){
    var names=family.map(function(m){return m.name});
    var lines=["Mwari ndi Mwari."];
    names.forEach(function(n){
      if(/Corinna/i.test(n)) lines.push("In remembrance of Corinna.");
      else lines.push("For "+n+".");
    });
    lines.push("For every future descendant represented in the House graph.");
    lines.push("May truth, peace, wisdom and love surround every branch.");
    return {id:"INV-BOOT",text:lines.join("\n"),generationType:"FAMILY_INVOCATION",theme:"family",traditions:["Masowe / Shona"]};
  }
  function next(){
    cycle++;
    if(window.ChirombePrayerComposer) show(ChirombePrayerComposer.compose(seeds,family));
    else show(invocation());
  }
  function speak(){
    if(!("speechSynthesis"in window)) return;
    var t=(last&&last.text)||"Mwari ndi Mwari.";
    var u=new SpeechSynthesisUtterance(t); u.rate=0.92; speechSynthesis.cancel(); speechSynthesis.speak(u);
    var a=document.getElementById("lm-audio"); if(a) a.textContent="NARRATION USER-STARTED";
  }
  function boot(){
    mount();
    Promise.all([
      fetch("./data/liturgy-seeds.json").then(function(r){return r.ok?r.json():{seeds:[]}}).catch(function(){return {seeds:[]}}),
      fetch("./data/family.json").then(function(r){return r.ok?r.json():{members:[]}}).catch(function(){return {members:[]}})
    ]).then(function(pair){
      seeds=(pair[0].seeds||[]);
      family=(pair[1].members||[]);
      show(invocation());
    });
    document.getElementById("lm-speak").onclick=speak;
    document.getElementById("lm-next").onclick=next;
    document.getElementById("lm-compose").onclick=next;
    document.getElementById("lm-drone").onclick=function(){
      if(window.ChirombeResonance){
        var s=ChirombeResonance.activate();
        document.getElementById("lm-audio").textContent=s.audio;
      }
    };
    setInterval(function(){ if(!document.hidden) next(); },28000);
  }
  window.CHIROMBE_LITURGY={next:next,speak:speak,invocation:invocation};
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();
})();
