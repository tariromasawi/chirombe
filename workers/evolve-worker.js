const S=["CLOAK","DECOY","DAMP","DECOUPLE","LOOP-INVERT","REINFORCE","CHOKEPOINT","VALUE-SUBSTITUTE"];
let g=1;
function tick(){const pick=S[Math.floor(Math.random()*S.length)]; postMessage({type:"EVOLVE",msg:pick+" gen "+(++g)})}
postMessage({type:"EVOLVE",msg:"evolve online"}); setInterval(tick,14000);
