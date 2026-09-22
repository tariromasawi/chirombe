(function(){
  const logEl=document.getElementById("log");
  function log(type,msg){
    if(!logEl)return;
    const row=document.createElement("div");
    row.textContent=new Date().toLocaleTimeString()+"  "+type+"  "+msg;
    logEl.prepend(row);
    while(logEl.children.length>80)logEl.lastChild.remove();
  }
  window.Chirombe={log,version:"1.0"};

  function draw(graph){
    const svg=document.getElementById("map");
    if(!svg)return;
    svg.innerHTML="";
    const nodes=graph.nodes||[];
    const edges=graph.edges||[];
    const pos={};
    nodes.forEach((n,i)=>{
      const a=(i/nodes.length)*Math.PI*2;
      pos[n.id]={x:450+Math.cos(a)*280,y:210+Math.sin(a)*140,n};
    });
    edges.forEach(e=>{
      const a=pos[e[0]],b=pos[e[1]]; if(!a||!b)return;
      const l=document.createElementNS("http://www.w3.org/2000/svg","line");
      l.setAttribute("x1",a.x);l.setAttribute("y1",a.y);
      l.setAttribute("x2",b.x);l.setAttribute("y2",b.y);
      l.setAttribute("stroke","#2a4633");
      svg.appendChild(l);
    });
    Object.values(pos).forEach(p=>{
      const c=document.createElementNS("http://www.w3.org/2000/svg","circle");
      c.setAttribute("cx",p.x);c.setAttribute("cy",p.y);c.setAttribute("r",8);
      c.setAttribute("fill",p.n.kind==="core"?"#d4b36a":"#7ee0a8");
      svg.appendChild(c);
      const t=document.createElementNS("http://www.w3.org/2000/svg","text");
      t.setAttribute("x",p.x+10);t.setAttribute("y",p.y+4);
      t.setAttribute("fill","#e7f4ea");t.setAttribute("font-size","11");
      t.textContent=p.n.name; svg.appendChild(t);
    });
    document.getElementById("kNodes").textContent=nodes.length;
    document.getElementById("kEdges").textContent=edges.length;
  }

  fetch("./data/nodes.json").then(r=>r.json()).then(g=>{draw(g);log("GRAPH",g.nodes.length+" nodes / "+g.edges.length+" edges")}).catch(()=>log("GRAPH","nodes.json missing"));
  fetch("./data/state.json").then(r=>r.json()).then(s=>{document.getElementById("kWatch").textContent=s.ticks||s.watch||"ok";log("WATCH","scheduled file "+(s.updated||""))}).catch(()=>{});

  let workers=0;
  if(window.Worker){
    ["workers/pulse-worker.js","workers/watch-worker.js"].forEach(src=>{
      try{const w=new Worker(src);w.onmessage=e=>log(e.data.type||"W",e.data.msg||"tick");workers++}catch(e){}
    });
  }
  document.getElementById("kWorkers").textContent=workers;
  if("serviceWorker"in navigator){
    navigator.serviceWorker.register("./sw.js").then(()=>log("SW","sw.js registered")).catch(()=>log("SW","blocked"));
    navigator.serviceWorker.register("./sw-cache.js").then(()=>log("SW","sw-cache.js registered")).catch(()=>{});
  }
  const scratch=document.getElementById("scratch");
  scratch.value=localStorage.getItem("chirombe.scratch")||"";
  document.getElementById("saveScratch").onclick=()=>{localStorage.setItem("chirombe.scratch",scratch.value);log("SAVE","scratch stored locally")};
  document.getElementById("tick").onclick=()=>log("PULSE","manual pulse");
})();
