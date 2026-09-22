(function(g){
  var chain=[{seq:0,hash:"GENESIS",event:"BOOT"}];
  function head(){return chain[chain.length-1]}
  function append(event,payload){
    var prev=head().hash;
    var rec={seq:chain.length,timestamp:new Date().toISOString(),event:event,payload:payload||null,previousHash:prev,currentHash:btoa(unescape(encodeURIComponent(prev+event+Date.now()))).slice(0,40)};
    chain.push(rec); if(chain.length>400) chain=chain.slice(-400); return rec;
  }
  function verify(){
    for(var i=1;i<chain.length;i++) if(chain[i].previousHash!==chain[i-1].currentHash&&chain[i].previousHash!==chain[i-1].hash) return false;
    return true;
  }
  g.ChirombeAudit={head:head,append:append,verify:verify,export:function(){return chain.slice()}};
})(typeof window!=="undefined"?window:globalThis);
