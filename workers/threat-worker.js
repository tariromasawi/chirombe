function score(){return +(0.05+Math.random()*0.7).toFixed(3)}
function tick(){const s=score(); postMessage({type:"THREAT",score:s,msg:"pattern "+s})}
tick(); setInterval(tick,11000);
