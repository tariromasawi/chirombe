const N=["Chirombe","Makwengura","Masawi","Masarura","Sabastian Karumekangu Masawi","Risto Kasirori Masawi","HRH Saint Tariro Masawi","HRH Tarry Kupakwashe Masawi","Tenderayi","Silent","Trymore","Charles","Tatenda","Rhoda","Abigail","Corinna","Descendants"];
const L=["Mwari ndi Mwari","peace over this House","remembered with dignity","held in hope"];
let i=0;
function tick(){const p=N[i%N.length]; const l=L[i%L.length]; i++; postMessage({type:"PRAY",msg:"For "+p+" — "+l})}
tick(); setInterval(tick,6000);
