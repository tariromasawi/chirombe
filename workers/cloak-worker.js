postMessage({type:"CLOAK",msg:"cloak lattice ready"});
setInterval(()=>postMessage({type:"CLOAK",msg:"exposure reduced"}),16000);
