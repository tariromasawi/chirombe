const N=["Chirombe","Makwengura","Masawi","Masarura","Sabastian Karumekangu Masawi","Risto Kasirori Masawi","HRH Saint Tariro Masawi","HRH Tarry Kupakwashe Masawi","Tenderayi","Silent","Trymore","Charles","Tatenda","Rhoda","Abigail","Corinna","House of Masawi","Descendants"];
let i=0;
function tick(){const p=N[i%N.length]; i++; postMessage({type:"FAMILY",msg:"cover "+p})}
tick(); setInterval(tick,4000);
