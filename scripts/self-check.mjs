import fs from "fs";
const need=["index.html","app.html","data/family.json","data/schema.json","sw.js","js/boot.js","js/command-bus.js","js/zcca.js","engine/headless-runner.mjs"];
let bad=0;
for(const f of need){if(!fs.existsSync(f)){console.error("missing",f);bad++}else console.log("ok",f)}
JSON.parse(fs.readFileSync("data/family.json","utf8"));
process.exit(bad?1:0);
