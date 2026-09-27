import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import vm from "vm";

function boot() {
  const store = new Map();
  const context = {
    console,
    setInterval,
    clearInterval,
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
      addEventListener() {}
    },
    navigator: { mediaDevices: null, hardwareConcurrency: 2 },
    addEventListener() {},
    dispatchEvent() { return true; }
  };
  context.window = context;
  context.globalThis = context;
  const timers = new Set();
  const timeouts = new Set();
  context.setInterval = function (fn, ms) {
    const id = setInterval(fn, ms);
    timers.add(id);
    return id;
  };
  context.clearInterval = function (id) {
    timers.delete(id);
    clearInterval(id);
  };
  context.setTimeout = function (fn, ms) {
    const id = setTimeout(fn, ms);
    timeouts.add(id);
    return id;
  };
  context.clearTimeout = function (id) {
    timeouts.delete(id);
    clearTimeout(id);
  };
  context.__stopTimers = function () {
    for (const id of timers) clearInterval(id);
    for (const id of timeouts) clearTimeout(id);
    timers.clear();
    timeouts.clear();
  };
  vm.createContext(context);
  try {
    vm.runInContext(fs.readFileSync("chirombe-audio-living-liturgy.js", "utf8"), context, { filename: "chirombe-audio-living-liturgy.js" });
  } catch (error) {
    context.__stopTimers();
    throw error;
  }
  return context;
}

test("parts 9 and 10 extend the existing liturgy kernel", async () => {
  const context = boot();
  try {
  const audio = context.CHIROMBE_AUDIO;
  assert.equal(typeof audio.getStatus, "function");
  assert.equal(typeof audio.emergencyStop, "function");
  assert.equal(typeof audio.startLivingWatch, "function");
  assert.equal(typeof audio.Liturgy.commands.prayer, "function");
  assert.equal(audio.Evolution.VERSION, "9.0.0");
  assert.equal(typeof audio.startLivingLiturgy, "function");
  const status = audio.getStatus();
  assert.equal(status.version, "1.0.0-part1");
  assert.equal(status.livingLiturgy.playbackOnLoad, false);
  assert.equal(status.evolutionLayer.codeRewrite, false);
  const started = await audio.startLivingLiturgy({ mode: "PEACE", people: [{ name: "Named Example", relationship: "explicit" }] });
  assert.equal(started.ok, true);
  assert.equal(started.playbackStarted, false);
  assert.equal(started.microphoneStarted, false);
  assert.equal(audio.master.session.inventedPeople, false);
  const tests = audio.runLivingLiturgyTests();
  assert.equal(tests.ok, true);
  assert.equal(tests.destructive, false);
  const snapshot = await audio.createSnapshot("test");
  assert.equal(snapshot.ok, true);
  const rolled = await audio.rollbackLivingSnapshot(snapshot.snapshot.id);
  assert.equal(rolled.ok, true);
  assert.notEqual(rolled.sourceRewritten, true);
  const stopped = await audio.stopLivingLiturgy();
  assert.equal(stopped.ok, true);
  assert.equal(audio.master.session, null);
  } finally {
    context.__stopTimers();
  }
});
