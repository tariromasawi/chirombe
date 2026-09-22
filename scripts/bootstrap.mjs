import {spawnSync} from "child_process";
console.log("CHIROMBE bootstrap");
let r=spawnSync(process.execPath,["scripts/self-check.mjs"],{stdio:"inherit"});
if(r.status) process.exit(r.status);
r=spawnSync(process.execPath,["scripts/rebuild-state.mjs"],{stdio:"inherit"});
process.exit(r.status||0);
