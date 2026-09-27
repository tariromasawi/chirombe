import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import vm from "vm";
import crypto from "crypto";

test("CHEP-03 is the missing worker swarm and does not remove the bridge", () => {
  const context = {
    console,
    setTimeout,
    clearTimeout,
    setInterval() { return 1; },
    clearInterval() {},
    CHIROMBE: {
      emit() {},
      registerModule(name, api) { context.registered = { name: name, api: api }; }
    }
  };
  context.globalThis = context;
  context.window = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync("engine/chep-03-worker-swarm.js", "utf8"), context, { filename: "chep-03.js" });
  assert.equal(context.CHIROMBE_WORKERS.name, "CHIROMBE_WORKER_SWARM");
  assert.equal(context.CHIROMBE_WORKERS.version, "1.0.0");
  assert.equal(context.registered.name, "WORKER_SWARM");
  const names = context.CHIROMBE_WORKERS.workers().map((worker) => worker.name);
  assert.equal(names.join(","), "SWARM_HEALTH,SWARM_DISPATCH,SWARM_MEMORY_COMMIT");
  const id = context.CHIROMBE_WORKERS.submit("SWARM_HEALTH", {});
  assert.equal(typeof id, "string");
});

test("Tarry is the son, and the old spouse label is still on the record", () => {
  const family = JSON.parse(fs.readFileSync("data/family.json", "utf8"));
  const tarry = family.members.find((member) => member.id === "FAM-SP-TARRY");
  assert.equal(tarry.name, "HRH Tarry Kupakwashe Masawi");
  assert.deepEqual(tarry.alsoKnownAs, ["Tarry"]);
  assert.equal(tarry.generation, "son");
  assert.equal(tarry.previousGeneration, "spouse");
  assert.equal(tarry.lineageCorrection.personRemoved, false);
  assert.equal(family.members.length, 18);
  const engine = crypto.createHash("sha256").update(fs.readFileSync("chirombe engine")).digest("hex");
  assert.equal(engine, "f1df5408bf0374365fb6149dc35a9b992a5645a671d921e804634f3e2f844ddc");
});

test("a healthy core is not rebuilt", () => {
  const context = {
    console,
    document: null,
    CHIROMBE: { name: "CHIROMBE", version: "1.0.0", registerModule() {} },
    CHIROMBE_WORKERS: { name: "CHIROMBE_WORKER_SWARM", createWorker() {} },
    setTimeout() { return 1; },
    setInterval() { return 1; }
  };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync("js/engine/recovery.js", "utf8"), context, { filename: "recovery.js" });
  return context.CHIROMBE_RECOVERY.rebuild().then((result) => {
    assert.equal(result.state, "INTACT");
    assert.equal(result.rebuilt, undefined);
    assert.equal(context.CHIROMBE.name, "CHIROMBE");
  });
});
