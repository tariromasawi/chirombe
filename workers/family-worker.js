const N=["HRH Saint Tariro Masawi","HRH Tarry Kupakwashe Masawi","House of Masawi"];
postMessage({type:"FAMILY",msg:N.length+" core nodes armed"});
setInterval(()=>postMessage({type:"FAMILY",msg:"circle intact · "+N.length}),18000);
