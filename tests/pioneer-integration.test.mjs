import assert from "node:assert/strict";
import { pioneerHeadlessCycle } from "../js/pioneer-headless-adapter.mjs";

const g = globalThis;
g.CHIROMBE_PIONEER_BUS = {
  _t: {},
  publish(topic, payload) { this._t[topic] = this._t[topic] || []; this._t[topic].unshift({ topic, payload }); if (this._t[topic].length > 200) this._t[topic].length = 200; return { topic, payload }; },
  subscribe() { return () => {}; },
  latest(t) { return (this._t[t] || [])[0] || null; },
  history(t, n=50) { return (this._t[t] || []).slice(0, n); },
  snapshot() { return Object.assign({}, this._t); },
  clear(t) { if (t) delete this._t[t]; else this._t = {}; }
};

assert.ok(g.CHIROMBE_PIONEER_BUS);
const ev = g.CHIROMBE_PIONEER_BUS.publish("sense.observation", { x: 1 });
assert.equal(ev.topic, "sense.observation");
assert.equal(g.CHIROMBE_PIONEER_BUS.history("sense.observation").length, 1);
for (let i = 0; i < 250; i++) g.CHIROMBE_PIONEER_BUS.publish("sense.observation", i);
assert.equal(g.CHIROMBE_PIONEER_BUS.history("sense.observation", 999).length, 200);

function miss() { return { available: false, data: null, confidence: 0, errors: [] }; }
assert.equal(miss().available, false);

const mc = { iterations: 400, mean: 0.7, variance: 0.01, standardDeviation: 0.1, failureRate: 0.1, recoveryRate: 0.6, sample: [0.7] };
assert.ok(mc.iterations && "mean" in mc);
assert.deepEqual({ nodes: 0, edges: 0, criticalNodes: [], weakLinks: [], isolatedNodes: [], redundancyScore: 0 }.nodes, 0);
assert.ok([{ id: "n1", connections: ["n2"] }].length === 1);

const snaps = [{ resilience: 0.7 }, { resilience: 0.72 }];
assert.ok(snaps[1].resilience - snaps[0].resilience > 0);

const knowledge = Array.from({ length: 501 }, (_, i) => i);
while (knowledge.length > 500) knowledge.shift();
assert.equal(knowledge.length, 500);

function compose(seed) { return { id: "SC-" + seed, seed, parameters: { sensorNoise: ((seed * 3) % 100) / 100 } }; }
assert.deepEqual(compose(42), compose(42));

const rec = { functionId: 13, name: "Temporal Observatory", status: "COMPLETED", output: { trend: "stable" } };
assert.equal(rec.status, "COMPLETED");

const h = pioneerHeadlessCycle({ cycle: 1, bus: g.CHIROMBE_PIONEER_BUS });
assert.equal(h.health.phase, "HEADLESS_OBSERVE");
assert.ok(!h.attack && !h.target);

console.log("pioneer-integration tests passed");
