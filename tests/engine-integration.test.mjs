import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import vm from "vm";
import { spawnSync } from "node:child_process";

test("command bus parses and registers", () => {
  const check = spawnSync(process.execPath, ["--check", "js/command-bus.js"], { encoding: "utf8" });
  assert.equal(check.status, 0, check.stderr);
});

test("engine connects without erasing or deploying", async () => {
  const mem = {};
  const removed = [];
  const context = {
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    Date,
    Math,
    JSON,
    Promise,
    Array,
    Object,
    String,
    Number,
    Error,
    navigator: { onLine: true },
    document: {
      readyState: "complete",
      getElementById() { return null; },
      addEventListener() {},
      createElement() { return { style: {} }; }
    },
    fetch() { return Promise.reject(new Error("offline-test")); },
    localStorage: {
      getItem(k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
      setItem(k, v) { mem[k] = String(v); },
      removeItem(k) { removed.push(k); delete mem[k]; }
    }
  };
  context.window = context;
  context.globalThis = context;
  context.self = context;
  vm.createContext(context);
  const files = [
    "js/boot.js",
    "js/command-bus.js",
    "js/state-store.js",
    "js/audit-chain.js",
    "js/health.js",
    "js/mwarindimwari-covenant.js",
    "js/resonance-engine.js",
    "js/engine/policy.js",
    "js/engine/ledger.js",
    "js/engine/adapters.js",
    "js/engine/chirombe-engine.js"
  ];
  for (const file of files) {
    vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  }
  const engine = context.CHIROMBE_ENGINE;
  const report = await engine.boot();
  assert.equal(report.identity.name, "CHIROMBE_ENGINE");
  assert.equal(report.preservation.destructiveRewrite, "BLOCKED");
  assert.equal(report.externalAIStatus.networkCall, false);
  assert.equal(report.failedComponents, 0);

  const self = engine.selfTest();
  const byName = Object.fromEntries(self.results.map((row) => [row.component, row]));
  assert.equal(byName.CHIROMBE_MEMORY.verdict, "PASS");
  assert.equal(byName.CHIROMBE_BUS.verdict, "PASS");
  assert.equal(byName.CHEP16.verdict, "NOT_AVAILABLE");
  assert.equal(byName.SENTINEL_ENTITY.verdict, "NOT_AVAILABLE");
  assert.equal(byName.CHIROMBE_PATHWAYS.verdict, "NOT_AVAILABLE");
  assert.notEqual(byName.CHEP16.verdict, "FAILURE");

  const chain = context.CHIROMBE_ENGINE_LEDGER.verify();
  assert.equal(chain.ok, true, JSON.stringify(chain.breaks));

  const memWrite = engine.command("MEMORY", { write: true, key: "note", value: "first" });
  const memWrite2 = engine.command("MEMORY", { write: true, key: "note", value: "second" });
  assert.equal(memWrite.ok, true);
  assert.equal(memWrite2.ok, true);
  const read = context.CHIROMBE_ENGINE_ADAPTERS.create(engine).memory;
  const search = engine.command("MEMORY", { search: "first" });
  assert.equal(search.ok, true);
  assert.ok(JSON.stringify(search.result).includes("first"));
  assert.ok(JSON.stringify(engine.command("MEMORY", { search: "second" }).result).includes("second"));

  const blocked = engine.command("MEMORY", { write: true, key: "family", value: [] });
  assert.equal(blocked.result.reason, "LINEAGE_WRITE_BLOCKED");

  const proposal = engine.command("PROPOSE", { summary: "trial", hypothesis: "do not apply" });
  assert.equal(proposal.result.result.applied, false);
  const state = context.ChirombeState.data.engineIntegration.records;
  assert.equal(state.length >= 2, true);

  context.ChirombeCore = { family: [{ name: "HRH Tarry Kupakwashe Masawi", generation: "spouse", role: "CORE" }], pray() {}, evolve() {} };
  context.ZCCA = { getFamily() { return [{ name: "HRH TARRY KUPAKWASHE MASAWI", relation: "son" }]; }, command() {}, activate() {}, protect() {} };
  engine.discover();
  const blood = engine.command("BLOODLINE");
  assert.equal(blood.result.invented, 0);
  assert.equal(blood.result.auditSnapshot.status, "CONFLICTING");
  assert.ok(blood.result.conflicts.length >= 1);

  const evolveApply = context.CHIROMBE_ENGINE_ADAPTERS.create({
    ledger: context.CHIROMBE_ENGINE_LEDGER,
    tasks: [], proposals: [], knowledge: [], builds: [], memoryMirror: [], provider: "NONE", familyJson: null
  }).evolution.apply();
  assert.equal(evolveApply.available, false);
  assert.equal(evolveApply.reason, "NO_BLIND_DEPLOY");

  const ai = engine.command("EXTERNAL_AI", { provider: "GROK" });
  assert.equal(ai.result.result.networkCall, false);
  assert.equal(ai.result.result.credentials, "NOT_STORED");

  assert.deepEqual(removed, []);
  assert.equal(typeof read, "object");
  const artifact = context.CHIROMBE_ENGINE_ARTIFACT;
  assert.equal(artifact.parseable, false);
  assert.equal(artifact.disposition, "PRESERVED_UNEXECUTED");
});
