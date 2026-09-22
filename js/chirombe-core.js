(function(){
  const KEY="CHIROMBE_CORE_V1";
  const STRAT=["CLOAK","DECOY","DAMP","DECOUPLE","LOOP-INVERT","REINFORCE","CHOKEPOINT","VALUE-SUBSTITUTE"];
  const FAMILY=[
    {name:"HRH Saint Tariro Masawi",role:"CORE",relation:"Self"},
    {name:"HRH Tarry Kupakwashe Masawi",role:"CORE",relation:"Spouse"},
    {name:"House of Masawi",role:"HOUSE",relation:"Lineage"}
  ];
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return{}}}
  function save(s){localStorage.setItem(KEY,JSON.stringify(s))}
  const C=Object.assign({generation:1,threat:0.18,resilience:0.72,library:[],family:FAMILY.slice()},load());
  if(!C.family||!C.family.length)C.family=FAMILY.slice();
  FAMILY.forEach(function(m){
    if(!C.family.some(function(x){return x.name===m.name}))C.family.push(m);
  });
  function note(t,m){if(window.Chirombe&&Chirombe.log)Chirombe.log(t,m)}
  function mergeIntoHost(){
    if(window.CORE){
      window.CORE.protectedNodes=window.CORE.protectedNodes||[];
      C.family.forEach(function(m){
        if(!CORE.protectedNodes.some(function(x){return x.name===m.name}))
          CORE.protectedNodes.push({id:"CB-"+m.name,name:m.name,relation:m.relation,level:m.role,authorised:true});
      });
      if(typeof renderAll==="function")try{renderAll()}catch(e){}
    }
    var list=document.getElementById("familyList")||document.getElementById("protectionList")||document.getElementById("zc-rm-family");
    if(list&&!list.dataset.chirombe){
      list.dataset.chirombe="1";
      C.family.forEach(function(m){
        var n=document.createElement("div");
        n.textContent=m.name+" · "+m.role+" · PROTECTED";
        list.appendChild(n);
      });
    }
  }
  function detect(sample){
    var t=Math.max(0.02,Math.min(0.95,(sample||C.threat)*0.85+Math.random()*0.2));
    C.threat=t;
    return t;
  }
  function evolve(){
    var threat=detect();
    var pick=STRAT[Math.floor(Math.random()*STRAT.length)];
    if(threat>0.55) pick=threat>0.75?"CLOAK":"DECOY";
    C.resilience=Math.max(0.2,Math.min(0.99,C.resilience+(0.45-threat)*0.08));
    C.generation++;
    var hyp={id:"EV-"+C.generation,strategy:pick,threat:+threat.toFixed(3),resilience:+C.resilience.toFixed(3),at:new Date().toISOString()};
    C.library.unshift(hyp); C.library=C.library.slice(0,80);
    save(C);
    note("THREAT","score "+hyp.threat);
    note("EVOLVE",pick+" · gen "+C.generation+" · res "+hyp.resilience);
    note("PROTECT",C.family.map(function(f){return f.name}).join(" · "));
    return hyp;
  }
  window.ChirombeCore={state:C,evolve:evolve,family:C.family,detect:detect};
  mergeIntoHost();
  fetch("./data/family.json").then(function(r){return r.ok?r.json():null}).then(function(d){
    if(d&&d.members){
      d.members.forEach(function(m){
        if(!C.family.some(function(x){return x.name===m.name}))C.family.push(m);
      });
      mergeIntoHost(); save(C);
    }
  }).catch(function(){});
  evolve();
  setInterval(evolve,12000);
})();
