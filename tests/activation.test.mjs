import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import vm from "vm";
import crypto from "crypto";

function loadActivation() {
  const context = { console, localStorage: { _m: {}, getItem(k) { return this._m[k] || null; }, setItem(k, v) { this._m[k] = String(v); } } };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync("js/engine/activation.js", "utf8"), context, { filename: "activation.js" });
  return context;
}

test("activation absorbs all 40009 lines without rewriting the source", () => {
  const raw = fs.readFileSync("chirombe engine");
  assert.equal(crypto.createHash("sha256").update(raw).digest("hex"), "f1df5408bf0374365fb6149dc35a9b992a5645a671d921e804634f3e2f844ddc");
  const family = crypto.createHash("sha256").update(fs.readFileSync("data/family.json")).digest("hex");
  const context = loadActivation();
  const text = raw.toString("utf8");
  context.CHIROMBE_KERNEL_INGEST = { text: text, lines: text.split("\n").length, chars: text.length };
  const absorbed = context.CHIROMBE_ACTIVATION.absorb(text);
  assert.equal(absorbed.lines, 40009);
  assert.ok(absorbed.functions > 450);
  const gap = context.CHIROMBE_ACTIVATION.manifest().find((row) => row.id === "PART_03_WORKERS");
  assert.equal(gap.status, "DEPENDENCY_REQUIRED");
  assert.equal(context.CHIROMBE_ACTIVATION.repairs()[0].id, "KERNEL_REPAIR_001");
  assert.equal(context.CHIROMBE_ACTIVATION.protection().supernaturalClaim, false);
  const knowledge = context.CHIROMBE_ACTIVATION.selfKnowledge();
  assert.equal(knowledge.consciousnessClaim, false);
  assert.ok(knowledge.whatIsMissing.includes("PART 03 WORKERS"));
  assert.equal(crypto.createHash("sha256").update(fs.readFileSync("data/family.json")).digest("hex"), family);
  assert.equal(context.CHIROMBE_GUARDIAN, undefined);
});

test("a second activate call does not become a second engine", async () => {
  const context = loadActivation();
  context.__CHIROMBE_KERNEL_LOADED__ = true;
  context.CHIROMBE_ACTIVATION.absorb("function sample(){ return 1; }\n");
  const first = context.CHIROMBE_ACTIVATION.activate();
  const second = context.CHIROMBE_ACTIVATION.activate();
  assert.equal(first, second);
  const result = await first;
  assert.equal(result.state, "DEGRADED");
});
