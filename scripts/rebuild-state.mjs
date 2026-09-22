import {spawnSync} from "child_process";
const r=spawnSync(process.execPath,["engine/headless-runner.mjs"],{stdio:"inherit"});
process.exit(r.status||0);
