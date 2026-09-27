import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import vm from "vm";
import crypto from "crypto";
import { spawnSync } from "node:child_process";
import os from "os";
import path from "path";

test("original chirombe engine file is not rewritten", () => {
  const hash = crypto.createHash("sha256").update(fs.readFileSync("chirombe engine")).digest("hex");
  assert.equal(hash, "f1df5408bf0374365fb6149dc35a9b992a5645a671d921e804634f3e2f844ddc");
});

test("kernel projection parses and keeps the preserved splice text", () => {
  const context = {
    console,
    document: { readyState: "complete", addEventListener() {}, getElementById() { return null; }, createElement() { return {}; }, head: { appendChild() {} }, body: { insertBefore() {} } },
    fetch() { return Promise.reject(new Error("no-fetch")); },
    setInterval() { return 1; },
    Worker: function Worker() {}
  };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync("js/engine/kernel-bridge.js", "utf8"), context, { filename: "kernel-bridge.js" });
  const raw = fs.readFileSync("chirombe engine", "utf8");
  const part03 = fs.readFileSync("engine/chep-03-worker-swarm.js", "utf8");
  const prepared = context.CHIROMBE_KERNEL_BRIDGE.sanitize(raw, part03);
  assert.ok(prepared.notes.includes("SPLICE_CONTAINED"));
  assert.ok(prepared.notes.includes("CHEP03_INJECTED_INTO_PROJECTION"));
  assert.ok(prepared.source.includes("PRESERVED_SPLICE_NOT_DELETED"));
  assert.ok(prepared.source.includes("Expected branch to point to"));
  assert.ok(prepared.source.includes("CHIROMBE_WORKER_SWARM"));
  const spliceAt = prepared.source.indexOf("PRESERVED_SPLICE_NOT_DELETED");
  const swarmAt = prepared.source.indexOf("CHIROMBE_WORKER_SWARM");
  const nextAt = prepared.source.indexOf("PROTOCOL: CHEP-04");
  assert.ok(spliceAt < swarmAt && swarmAt < nextAt);
  assert.match(prepared.source, /\/\* PRESERVED_HTML_TAG <script src=/);
  const naked = prepared.source.split("\n").filter((line) => line.includes("<script src=") && !line.includes("PRESERVED_HTML_TAG"));
  assert.equal(naked.length, 0);
  const file = path.join(os.tmpdir(), "chirombe-kernel-projection.js");
  fs.writeFileSync(file, prepared.source);
  const check = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  assert.equal(check.status, 0, check.stderr);
});
