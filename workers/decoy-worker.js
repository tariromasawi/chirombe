let d=0; postMessage({type:"DECOY",msg:"decoy field ready"});
setInterval(()=>{d++; postMessage({type:"DECOY",msg:"decoy rotation "+d})},17000);
