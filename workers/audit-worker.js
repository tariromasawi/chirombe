let n=0; setInterval(()=>{n++; postMessage({type:"AUDIT",msg:"chain link "+n})},22000);
postMessage({type:"AUDIT",msg:"audit online"});
