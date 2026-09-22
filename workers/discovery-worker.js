postMessage({type:"DISC",msg:"discovery online"});
setInterval(()=>postMessage({type:"DISC",msg:"scan idle"}),25000);
