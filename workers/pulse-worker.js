let n=0; setInterval(()=>{n++; postMessage({type:"PULSE",msg:"pulse "+n})},8000);
postMessage({type:"PULSE",msg:"pulse online"});
