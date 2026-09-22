(function(g){
  var cmds={};
  function registerCommand(name,handler,meta){cmds[name]={handler:handler,meta:meta||{}};
  function executeCommand(name,args){
    var t=Date.now(); var rec=cmds[name];
    if(!rec) return {ok:false,command:name,timestamp:new Date().toISOString(),duration:0,error:"unknown command",subsystem:"bus"};
    try{
      var result=rec.handler(args||{});
      return {ok:true,command:name,timestamp:new Date().toISOString(),duration:Date.now()-t,result:result,subsystem:(rec.meta&&rec.meta.subsystem)||"bus"};
    }catch(e){
      return {ok:false,command:name,timestamp:new Date().toISOString(),duration:Date.now()-t,error:String(e),subsystem:"bus"};
    }
  }
  function listCommands(){return Object.keys(cmds)}
  g.ChirombeBus={registerCommand:registerCommand,executeCommand:executeCommand,listCommands:listCommands};
  registerCommand("version",function(){return {protocol:"CHIROMBE-2.0",schemaVersion:2}},{subsystem:"core"});
  registerCommand("capabilities",function(){return {workers:!!g.Worker,sw:"serviceWorker"in navigator,idb:!!g.indexedDB,bc:!!g.BroadcastChannel}},{subsystem:"core"});
  registerCommand("status",function(){return g.ChirombeSystem||{status:"booting"}},{subsystem:"core"});
  registerCommand("family.list",function(){return (g.ChirombeCore&&ChirombeCore.family)||[]},{subsystem:"family"});
  registerCommand("health",function(){return g.ChirombeHealth?ChirombeHealth.snapshot():{status:"UNKNOWN"}},{subsystem:"health"});
  registerCommand("selftest",function(){return {ok:true,checks:["bus"]}},{subsystem:"test"});
})(typeof window!=="undefined"?window:globalThis);
