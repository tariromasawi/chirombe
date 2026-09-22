postMessage({type:"GRAPH",msg:"graph online"});
setInterval(()=>postMessage({type:"GRAPH",msg:"edges stable"}),20000);
