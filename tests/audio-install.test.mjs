import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import vm from "vm";

function element() {
  const el = {
    id: "",
    innerHTML: "",
    firstChild: null,
    children: [],
    style: {},
    dataset: {},
    classList: { toggle() {} },
    setAttribute(name, value) { el[name] = value; },
    getAttribute(name) { return el[name]; },
    appendChild(child) { el.children.push(child); el.firstChild = el.children[0]; return child; },
    insertBefore(child) { return el.appendChild(child); },
    addEventListener() {},
    removeChild() {},
    contains() { return true; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    scrollIntoView() {}
  };
  return el;
}

function boot() {
  const store = new Map();
  const timers = new Set();
  const context = {
    console,
    setTimeout,
    clearTimeout,
    crypto,
    TextEncoder,
    CustomEvent,
    localStorage: {
      getItem(key) { return store.has(key) ? store.get(key) : null; },
      setItem(key, value) { store.set(key, String(value)); }
    },
    document: {
      visibilityState: "visible",
      hidden: false,
      body: null,
      addEventListener() {},
      getElementById() { return null; },
      querySelector() { return null; },
      createElement() { return element(); }
    },
    navigator: { mediaDevices: null, hardwareConcurrency: 2 },
    addEventListener() {},
    dispatchEvent() { return true; }
  };
  context.document.body = element();
  context.window = context;
  context.globalThis = context;
  context.setInterval = function (fn, ms) {
    const id = setInterval(fn, ms);
    timers.add(id);
    return id;
  };
  context.clearInterval = function (id) {
    timers.delete(id);
    clearInterval(id);
  };
  context.__stopTimers = function () {
    for (const id of timers) clearInterval(id);
    timers.clear();
  };
  vm.createContext(context);
  const files = [
    "js/command-bus.js",
    "js/health.js",
    "js/audit-chain.js",
    "chirombe-audio-living-liturgy.js",
    "js/cm90-tonal-continuous.js",
    "js/chirombe-audio-install.js"
  ];
  try {
    files.forEach(function (file) {
      vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
    });
  } catch (error) {
    context.__stopTimers();
    throw error;
  }
  return context;
}

test("the main page loads one audio organ and does not keep a second CM90 context", () => {
  const index = fs.readFileSync("index.html", "utf8").slice(0, fs.readFileSync("index.html", "utf8").indexOf("</html>"));
  const boot = fs.readFileSync("js/chirombe.js", "utf8");
  const tonal = fs.readFileSync("js/cm90-tonal-continuous.js", "utf8");
  const matrix = fs.readFileSync("js/cm90-family-matrix.js", "utf8");
  const liturgy = fs.readFileSync("chirombe-audio-living-liturgy.js", "utf8");
  assert.match(index, /id="open-audio-centre"/);
  assert.match(index, /id="ca-header-state"/);
  assert.match(boot, /chirombe-audio-install\.js/);
  assert.doesNotMatch(tonal, /new AC\(/);
  assert.doesNotMatch(tonal, /createOscillator/);
  assert.doesNotMatch(tonal, /\.destination/);
  assert.doesNotMatch(matrix, /webkitAudioContext/);
  assert.doesNotMatch(liturgy, /Audio Evolution 9A loaded/);
  assert.match(liturgy, /usesKernelContext/);
  assert.match(liturgy, /recoverFromSafeStop/);
  assert.match(liturgy, /nextLivingStage/);
  assert.doesNotMatch(index, /new AC\(/);
  assert.doesNotMatch(index, /webkitAudioContext/);
  assert.match(liturgy, /runHardwareSelfTest/);
  assert.match(liturgy, /AUDIO_CONTEXT_NOT_RUNNING/);
  assert.doesNotMatch(fs.readFileSync("js/soko-mukanya-matrix.js", "utf8"), /webkitAudioContext/);
  assert.doesNotMatch(fs.readFileSync("js/resonance-engine.js", "utf8"), /new \(g\.AudioContext/);
  assert.match(fs.readFileSync("js/chirombe-audio-install.js", "utf8"), /CHIROMBE AUDIO HARDWARE STATUS/);
  assert.match(fs.readFileSync("sw.js", "utf8"), /CHIROMBE_STATIC_v10/);
  assert.match(fs.readFileSync("sw.js", "utf8"), /cache:"no-store"/);
  assert.match(fs.readFileSync("js/engine/activation.js", "utf8"), /CHIROMBE_STATIC_v10/);
  assert.match(fs.readFileSync("js/seam-autoload.js", "utf8"), /max-width:42vw/);
  assert.doesNotMatch(fs.readFileSync("js/seam-autoload.js", "utf8"), /z-index:2147483000/);
});

test("installation binds the kernel, one evolution API, and emergency stop", async () => {
  const context = boot();
  try {
    const audio = context.CHIROMBE_AUDIO;
    assert.equal(typeof audio.getAudioContext, "function");
    assert.equal(typeof audio.recoverFromSafeStop, "function");
    assert.equal(audio.Evolution.VERSION, "9.0.0");
    assert.equal(typeof audio.Evolution.beginSession, "function");
    assert.equal(context.CHIROMBE_AUDIO_EVOLUTION.VERSION, "9.0.0");
    assert.equal(context.CHIROMBE_TONAL.status().independentContext, false);
    assert.equal(context.__CHIROMBE_AUDIO_COMMANDS__, true);
    assert.ok(context.ChirombeBus.listCommands().includes("audio.emergencyStop"));
    assert.ok(context.ChirombeBus.listCommands().includes("audio.activate"));
    const status = audio.getStatus();
    assert.equal(status.version, "1.0.0-part1");
    assert.equal(status.installation.playbackOnLoad, false);
    assert.equal(status.installation.independentCm90Context, false);
    assert.equal(status.microphone.active, false);
    const health = context.ChirombeHealth.snapshot();
    assert.equal(health.audio.microphone, "OFF");
    const stopped = await context.CHIROMBE_AUDIO_UI.emergency("TEST");
    assert.equal(stopped.state, "SAFE_STOP");
    assert.equal(audio.recoverFromSafeStop("TEST"), true);
    const report = context.CHIROMBE_AUDIO_UI.renderDiagnostics();
    assert.equal(report.rows.some(function (row) { return row.name === "emergency stop" && row.result === "PASS"; }), true);
    assert.equal(report.rows.some(function (row) { return row.result === "FAIL"; }), false);
  } finally {
    context.__stopTimers();
  }
});
