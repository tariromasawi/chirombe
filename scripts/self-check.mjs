import fs from "fs";
import {spawnSync} from "child_process";
const need=["index.html","app.html","engine.html","data/family.json","data/schema.json","sw.js","js/boot.js","js/command-bus.js","js/zcca.js","engine/headless-runner.mjs","js/engine/policy.js","js/engine/ledger.js","js/engine/adapters.js","js/engine/chirombe-engine.js"];
let bad=0;
for(const f of need){if(!fs.existsSync(f)){console.error("missing",f);bad++}else console.log("ok",f)}
JSON.parse(fs.readFileSync("data/family.json","utf8"));
const syntax=["js/command-bus.js","js/engine/policy.js","js/engine/ledger.js","js/engine/adapters.js","js/engine/chirombe-engine.js"];
for(const f of syntax){
  const r=spawnSync(process.execPath,["--check",f],{encoding:"utf8"});
  if(r.status){console.error("syntax",f,r.stderr);bad++}else console.log("syntax",f);
}
process.exit(bad?1:0);
