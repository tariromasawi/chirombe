import {spawnSync} from "child_process";
const r=spawnSync(process.execPath,["scripts/self-check.mjs"],{encoding:"utf8"});
if(r.status){console.error(r.stdout,r.stderr); process.exit(1)}
console.log("self-check pass");
