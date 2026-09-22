(function(){
  const KEY="CHIROMBE_CORE_V1";
  const STRAT=["CLOAK","DECOY","DAMP","DECOUPLE","LOOP-INVERT","REINFORCE","CHOKEPOINT","VALUE-SUBSTITUTE"];
  const PRAYERS=[
    "Mwari ndi Mwari.",
    "Peace, wisdom and protection over this House.",
    "May the ancestors be remembered with dignity.",
    "May Corinna be remembered in love.",
    "May every descendant, named and unnamed, be held in hope.",
    "Mudzimu Unoyera, guide this family toward truth."
  ];
  const FALLBACK=[
    {name:"Chirombe",role:"ANCESTOR",generation:"great-great-grandfather"},
    {name:"Makwengura",role:"ANCESTOR",generation:"great-grandfather"},
    {name:"Masawi",role:"ANCESTOR",generation:"grandfather"},
    {name:"Masarura",role:"ANCESTOR",generation:"grandmother"},
    {name:"Sabastian Karumekangu Masawi",role:"PARENT",generation:"father"},
    {name:"Risto Kasirori Masawi",role:"PARENT",generation:"mother"},
    {name:"HRH Saint Tariro Masawi",role:"CORE",generation:"self"},
    {name:"HRH Tarry Kupakwashe Masawi",role:"CORE",generation:"spouse"},
    {name:"Tenderayi",role:"SIBLING",generation:"brother"},
    {name:"Silent",role:"SIBLING",generation:"brother"},
    {name:"Trymore",role:"SIBLING",generation:"brother"},
    {name:"Charles",role:"SIBLING",generation:"brother"},
    {name:"Tatenda",role:"SIBLING",generation:"brother"},
    {name:"Rhoda",role:"SIBLING",generation:"sister"},
    {name:"Abigail",role:"SIBLING",generation:"sister"},
    {name:"Corinna",role:"SIBLING",generation:"sister",remembrance:true},
    {name:"House of Masawi",role:"HOUSE",generation:"house"},
    {name:"Descendants of the House",role:"DESCENDANT",generation:"future"}
  ];
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return{}}}
  function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
  const C=Object.assign({generation:1,threat:0.18,resilience:0.72,prayerIndex:0,family:[]},load());
  FALLBACK.forEach(function(m){if(!C.family.some(function(x){return x.name===m.name}))C.family.push(m)});
  function note(t,m){if(window.Chirombe&&Chirombe.log)Chirombe.log(t,m)}
  function merge(){
    if(window.CORE){
      CORE.protectedNodes=CORE.protectedNodes||[];
      C.family.forEach(function(m){
        if(!CORE.protectedNodes.some(function(x){return x.name===m.name}))
          CORE.protectedNodes.push({id:"CB-"+m.name,name:m.name,relation:m.generation,level:m.role,authorised:true});
      });
    }
    var list=document.getElementById("familyList")||document.getElementById("protectionList")||document.getElementById("zc-rm-family");
    if(list){
      list.innerHTML="";
      C.family.forEach(function(m){
        var n=document.createElement("div");
        n.textContent=m.name+" · "+m.generation+" · "+(m.remembrance?"REMEMBERED":"PROTECTED");
        list.appendChild(n);
      });
    }
  }
  function pray(){
    var person=C.family[C.prayerIndex%C.family.length];
    var line=PRAYERS[C.prayerIndex%PRAYERS.length];
    C.prayerIndex++;
    note("PRAY","For "+person.name+" — "+line);
    var reading=document.getElementById("zc-rm-reading-text");
    if(reading) reading.textContent="For "+person.name+". "+line;
    save(C);
  }
  function evolve(){
    var person=C.family[C.generation%C.family.length];
    var pick=STRAT[C.generation%STRAT.length];
    C.generation++;
    C.threat=Math.max(0.05,Math.min(0.9,C.threat*0.9+Math.random()*0.15));
    C.resilience=Math.max(0.2,Math.min(0.99,C.resilience+(0.5-C.threat)*0.05));
    note("COVER",person.name+" · "+pick+" · gen "+C.generation);
    save(C);
  }
  window.ChirombeCore={state:C,family:C.family,pray:pray,evolve:evolve};
  merge();
  fetch("./data/family.json").then(function(r){return r.ok?r.json():null}).then(function(d){
    if(!d||!d.members)return;
    d.members.forEach(function(m){
      if(!C.family.some(function(x){return x.name===m.name}))C.family.push(m);
    });
    merge(); save(C); note("FAMILY",C.family.length+" core nodes loaded");
  }).catch(function(){});
  pray(); evolve();
  setInterval(pray,7000);
  setInterval(evolve,12000);
})();
