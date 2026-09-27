/* Loads the preserved "chirombe engine" file as the kernel.
   The original file is not rewritten. Syntax splices are contained
   only in the executable projection. Existing globals are kept. */
(function (g) {
  "use strict";
  if (g.CHIROMBE_KERNEL_BRIDGE) return;

  var PAGE_WORKERS = [
    "workers/pulse-worker.js",
    "workers/watch-worker.js",
    "workers/graph-worker.js",
    "workers/discovery-worker.js",
    "workers/evolve-worker.js",
    "workers/family-worker.js",
    "workers/prayer-worker.js",
    "workers/threat-worker.js",
    "workers/audit-worker.js",
    "workers/cloak-worker.js",
    "workers/decoy-worker.js",
    "workers/covenant-worker.js"
  ];

  function sanitize(source, part03) {
    var text = String(source);
    var notes = [];
    var splice = "})();Expected branch to point to\n\"c39d86f66b64819e711634fec3a4e02c026a44\n66\" but it did not. Pull and try again.";
    if (text.indexOf(splice) < 0) throw new Error("SPLICE_ANCHOR_MISSING");
    text = text.replace(splice, "})();\n/* PRESERVED_SPLICE_NOT_DELETED\nExpected branch to point to\n\"c39d86f66b64819e711634fec3a4e02c026a44\n66\\\" but it did not. Pull and try again.\n*/\n");
    notes.push("SPLICE_CONTAINED");
    var tags = 0;
    text = text.replace(/<script\s+src="[^"]+"><\/script>/g, function (tag) {
      tags += 1;
      return "/* PRESERVED_HTML_TAG " + tag.replace(/\*\//g, "* /") + " */";
    });
    notes.push("HTML_TAGS_CONTAINED:" + tags);
    var awaitAnchor = "})(typeof window !== \"undefined\"\n    ? window\n    : globalThis);const intention = await CHIROMBE_INTENTION.registerIntention({";
    if (text.indexOf(awaitAnchor) < 0) throw new Error("INTENTION_ANCHOR_MISSING");
    text = text.replace(awaitAnchor, "})(typeof window !== \"undefined\"\n    ? window\n    : globalThis);\nvoid (async function () {\n  const intention = await CHIROMBE_INTENTION.registerIntention({");
    var logAnchor = "console.log(intention);/* ================================================================";
    if (text.indexOf(logAnchor) < 0) throw new Error("INTENTION_CLOSE_MISSING");
    text = text.replace(logAnchor, "console.log(intention);\n})();\n/* ================================================================");
    notes.push("INTENTION_FRAGMENT_WRAPPED");
    var intensity = "options.intensity ??\n                        (\n                            intention &&\n                            intention\n                                .symbolicIntensity\n                        ) ||\n                        1";
    var intensityFixed = "options.intensity ??\n                        (\n                            (\n                            intention &&\n                            intention\n                                .symbolicIntensity\n                            ) ||\n                            1\n                        )";
    if (text.indexOf(intensity) < 0) throw new Error("INTENSITY_ANCHOR_MISSING");
    text = text.replace(intensity, intensityFixed);
    var confidence = "options.confidence ??\n                        (\n                            intention &&\n                            intention.confidence\n                        ) ||\n                        0.9";
    var confidenceFixed = "options.confidence ??\n                        (\n                            (\n                            intention &&\n                            intention.confidence\n                            ) ||\n                            0.9\n                        )";
    if (text.indexOf(confidence) < 0) throw new Error("CONFIDENCE_ANCHOR_MISSING");
    text = text.replace(confidence, confidenceFixed);
    notes.push("NULLISH_MIX_PARENTHESISED");
    var strictAnchor = "(function(global){\n\n\"use strict\";\n\n\n/* ================================================================\n   DEPENDENCIES\n   ================================================================ */\n\nconst CORE =\n    global.CHIROMBE ||\n    global.CHIROMBE_CORE ||\n    null;\n\nconst MEMORY =\n    global.CHIROMBE_MEMORY ||\n    null;\n\nconst WORKERS =\n    global.CHIROMBE_WORKERS ||\n    null;\n\nconst PATHWAYS =";
    if (text.indexOf(strictAnchor) < 0) throw new Error("CHEP14_ANCHOR_MISSING");
    text = text.replace(strictAnchor, "(function(global){\n\n\"use strict\";\n\nfunction average(values){\n  if (!values || !values.length) return 0;\n  var total = 0;\n  for (var i = 0; i < values.length; i++) total += Number(values[i]) || 0;\n  return total / values.length;\n}\n\n/* ================================================================\n   DEPENDENCIES\n   ================================================================ */\n\nconst CORE =\n    global.CHIROMBE ||\n    global.CHIROMBE_CORE ||\n    null;\n\nconst MEMORY =\n    global.CHIROMBE_MEMORY ||\n    null;\n\nconst WORKERS =\n    global.CHIROMBE_WORKERS ||\n    null;\n\nconst PATHWAYS =");
    notes.push("AVERAGE_SHIM_FOR_CHEP14");
    var bootAnchor = "    global.CHIROMBE_CHEP15 =\n        ENGINE;\n\n    boot();\n\n})(globalThis);";
    if (text.indexOf(bootAnchor) < 0) throw new Error("CHEP15_BOOT_ANCHOR_MISSING");
    text = text.replace(bootAnchor, "    global.CHIROMBE_CHEP15 =\n        ENGINE;\n\n    try {\n        boot();\n    } catch (error) {\n        console.error(\"[CHEP-15] Boot failure:\", error);\n    }\n\n})(globalThis);");
    notes.push("CHEP15_BOOT_GUARDED");
    var entityAnchor = "(function(global){\n\n\"use strict\";\n\n/* =========================================================================\n   01 — ENTITY IDENTITY\n   ========================================================================= */";
    if (text.indexOf(entityAnchor) < 0) throw new Error("CHEP17_ANCHOR_MISSING");
    text = text.replace(entityAnchor, "(function(global){\n\n\"use strict\";\n\nconst VERSION = \"1.0.0\";\n\n/* =========================================================================\n   01 — ENTITY IDENTITY\n   ========================================================================= */");
    notes.push("CHEP17_VERSION_SHIM");
    if (part03) {
      var marker = "PRESERVED_SPLICE_NOT_DELETED";
      var at = text.indexOf(marker);
      var close = at < 0 ? -1 : text.indexOf("*/", at);
      if (close < 0) throw new Error("PART03_INSERT_MISSING");
      var facade = "try {\n  var __swarm = globalThis.CHIROMBE_WORKERS;\n  if (__swarm && typeof __swarm.createWorker === \"function\") {\n    if (typeof __swarm.register !== \"function\") {\n      __swarm.register = function (a, b, c) {\n        var name, fn, meta;\n        if (a && typeof a === \"object\") { name = a.id || a.name; fn = a.handler || a.worker || a.fn; meta = a; }\n        else { name = a; fn = b; meta = c || {}; }\n        return __swarm.createWorker(String(name), typeof fn === \"function\" ? fn : function () { return { idle: true, name: name }; }, meta || {});\n      };\n      __swarm.registerWorker = __swarm.register;\n    }\n    if (typeof __swarm.status !== \"function\") {\n      __swarm.status = function () {\n        return { protocol: \"CHEP-03\", name: __swarm.name, statistics: __swarm.statistics ? __swarm.statistics() : null, workers: __swarm.workers ? __swarm.workers() : [] };\n      };\n    }\n    if (!__swarm.state) __swarm.state = { protocol: \"CHEP-03\" };\n  }\n} catch (error) {}\n";
      text = text.slice(0, close + 2) + "\n" + String(part03) + "\n" + facade + text.slice(close + 2);
      notes.push("CHEP03_INJECTED_INTO_PROJECTION");
    } else notes.push("CHEP03_NOT_INJECTED");
    return { source: text, notes: notes };
  }

  function installWorkerBridge() {
    if (g.CHIROMBE_WORKERS && g.CHIROMBE_WORKERS.name === "CHIROMBE_WORKER_SWARM") return g.CHIROMBE_WORKERS;
    if (g.CHIROMBE_WORKERS && g.CHIROMBE_WORKERS.register) return g.CHIROMBE_WORKERS;
    var registry = [];
    function adapt(a, b, c) {
      var name, fn, meta;
      if (a && typeof a === "object") {
        name = a.id || a.name || "worker";
        fn = a.handler || a.worker || a.fn;
        meta = a;
      } else {
        name = a;
        fn = b;
        meta = c || {};
      }
      if (typeof fn !== "function") fn = function () { return { ok: true, idle: true, name: name }; };
      if (g.CHIROMBE && typeof g.CHIROMBE.registerWorker === "function") {
        try { return g.CHIROMBE.registerWorker(String(name), fn, meta || {}); } catch (e) {}
      }
      var row = { id: String(name), name: String(name), handler: fn, meta: meta || {}, status: "READY" };
      registry.push(row);
      return row;
    }
    g.CHIROMBE_WORKERS = {
      bridge: true,
      part03: "HELD_UNTIL_CHEP03",
      register: adapt,
      registerWorker: adapt,
      dispatch: function (name, payload) {
        var row = null;
        for (var i = 0; i < registry.length; i++) if (registry[i].name === name) row = registry[i];
        if (!row) return Promise.resolve({ available: false, reason: "WORKER_NOT_REGISTERED" });
        return Promise.resolve().then(function () { return row.handler(payload || {}); });
      },
      cancel: function () { return { cancelled: false, reason: "BRIDGE_DOES_NOT_DELETE" }; },
      status: function () { return { bridge: true, count: registry.length }; },
      state: { bridge: true },
      list: function () { return registry.slice(); }
    };
    g.CHIROMBE_WORKERS_BRIDGE = g.CHIROMBE_WORKERS;
    return g.CHIROMBE_WORKERS;
  }

  function adoptSwarm() {
    var swarm = g.CHIROMBE_WORKERS;
    var bridge = g.CHIROMBE_WORKERS_BRIDGE;
    if (!swarm || swarm.bridge || typeof swarm.createWorker !== "function" || !bridge || !bridge.list) return { adopted: 0 };
    var present = {};
    if (typeof swarm.workers === "function") swarm.workers().forEach(function (worker) { present[worker.name] = true; });
    var adopted = 0;
    bridge.list().forEach(function (row) {
      if (!row || present[row.name] || typeof row.handler !== "function") return;
      try { swarm.createWorker(row.name, row.handler, row.meta || {}); adopted += 1; } catch (e) {}
    });
    if (!bridge.__forwarding) {
      var previous = bridge.register;
      bridge.register = function () {
        var row = previous.apply(bridge, arguments);
        try {
          if (g.CHIROMBE_WORKERS && typeof g.CHIROMBE_WORKERS.createWorker === "function" && row && row.name) {
            g.CHIROMBE_WORKERS.createWorker(row.name, row.handler, row.meta || {});
          }
        } catch (e) {}
        return row;
      };
      bridge.registerWorker = bridge.register;
      bridge.__forwarding = true;
    }
    return { adopted: adopted, swarm: swarm.name || "WORKER_SWARM" };
  }

  function rememberExisting() {
    var names = ["CHIROMBE_GUARDIAN", "Chirombe", "ChirombeCore", "ChirombeBus", "ChirombeResonance", "ZCCA", "ZionProtect", "MwarindiCovenant", "CHIROMBE_AUTOSTART", "CHIROMBE_ENGINE", "CHIROMBE_PIONEER_BRAIN"];
    var saved = {};
    names.forEach(function (name) { if (typeof g[name] !== "undefined") saved[name] = g[name]; });
    return saved;
  }

  function restoreClashes(saved) {
    if (saved.CHIROMBE_GUARDIAN && g.CHIROMBE_GUARDIAN && g.CHIROMBE_GUARDIAN !== saved.CHIROMBE_GUARDIAN) {
      g.CHIROMBE_SENTINEL_GUARDIAN = g.CHIROMBE_GUARDIAN;
      g.CHIROMBE_GUARDIAN = saved.CHIROMBE_GUARDIAN;
    }
    ["Chirombe", "ChirombeCore", "ChirombeBus", "ChirombeResonance", "ZCCA", "ZionProtect", "MwarindiCovenant", "CHIROMBE_AUTOSTART", "CHIROMBE_ENGINE", "CHIROMBE_PIONEER_BRAIN"].forEach(function (name) {
      if (saved[name] && g[name] !== saved[name]) g[name] = saved[name];
    });
  }

  function bar(text) {
    if (!g.document || !g.document.body) return;
    var node = g.document.getElementById("chirombe-kernel-bar");
    if (!node) {
      node = g.document.createElement("div");
      node.id = "chirombe-kernel-bar";
      node.setAttribute("role", "status");
      node.style.cssText = "position:sticky;top:0;z-index:30;display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:7px 12px;background:#07110d;color:#d7f3e4;border-bottom:1px solid #1d3a2c;font:12px/1.35 ui-monospace,monospace;";
      g.document.body.insertBefore(node, g.document.body.firstChild);
    }
    node.textContent = text;
  }

  function journal(operation, result) {
    if (g.CHIROMBE_ENGINE_LEDGER && g.CHIROMBE_ENGINE_LEDGER.append) {
      try {
        g.CHIROMBE_ENGINE_LEDGER.append({ operation: operation, target: "chirombe engine", reason: "kernel projection loaded; original file not rewritten", result: result, validation: "PRESERVE", rollback: "Remove js/engine/kernel-bridge.js script tag." });
      } catch (e) {}
    }
  }

  function spawnPageWorkers() {
    if (!g.Worker || g.__CHIROMBE_PAGE_WORKERS_STARTED__) return g.__CHIROMBE_PAGE_WORKERS__ || [];
    g.__CHIROMBE_PAGE_WORKERS_STARTED__ = true;
    g.__CHIROMBE_PAGE_WORKERS__ = [];
    PAGE_WORKERS.forEach(function (file) {
      try {
        var worker = new g.Worker(file);
        worker.onmessage = function (event) {
          var data = event.data || {};
          g.__CHIROMBE_PAGE_WORKERS_LAST__ = data;
          if (g.CHIROMBE && g.CHIROMBE.setMemory) {
            try { g.CHIROMBE.setMemory("observation:" + (data.type || file), { observation: data, interpretation: "Signal from an existing page worker.", at: Date.now() }); } catch (e) {}
          }
        };
        g.__CHIROMBE_PAGE_WORKERS__.push(file);
      } catch (e) {}
    });
    return g.__CHIROMBE_PAGE_WORKERS__;
  }

  function registerRoster(data) {
    var blood = g.CHIROMBE_BLOODLINE;
    if (!blood || typeof blood.registerPerson !== "function" || !data || !data.members) return { registered: 0 };
    var count = 0;
    data.members.forEach(function (member) {
      try {
        blood.registerPerson({
          id: member.id,
          name: member.name,
          role: member.role || member.generation || "",
          protected: member.protect !== false,
          knowledgeTags: ["CANONICAL_FAMILY_JSON"]
        });
        count += 1;
      } catch (e) {}
    });
    if (typeof blood.registerRelationship === "function" && data.links) {
      data.links.forEach(function (link) {
        try {
          blood.registerRelationship({ from: link[0], to: link[1], type: "RELATED", source: "data/family.json", verified: true, confidence: 1 });
        } catch (e) {}
      });
    }
    return { registered: count, relationships: (data.links || []).length };
  }

  function arm(saved) {
    restoreClashes(saved);
    var swarm = adoptSwarm();
    var state = { kernel: true, sentinel: !!g.CHIROMBE_SENTINEL, bloodline: !!g.CHIROMBE_BLOODLINE, defence: !!g.CHIROMBE_DEFENCE, intention: !!g.CHIROMBE_INTENTION, swarm: swarm };
    if (g.ZCCA && typeof g.ZCCA.activate === "function") {
      try { g.ZCCA.activate(); state.zcca = "ACTIVE"; } catch (e) { state.zcca = "FAILED"; }
    }
    if (g.CHIROMBE_AUTOSTART && typeof g.CHIROMBE_AUTOSTART.start === "function") {
      try { g.CHIROMBE_AUTOSTART.start(); state.autostart = "ACTIVE"; } catch (e) { state.autostart = "FAILED"; }
    }
    if (g.ZionProtect && typeof g.ZionProtect.initializeCore === "function") {
      Promise.resolve(g.ZionProtect.initializeCore()).catch(function () {});
    }
    if (g.MwarindiCovenant && typeof g.MwarindiCovenant.remind === "function") {
      try { g.MwarindiCovenant.remind("house"); } catch (e) {}
    }
    if (g.CHIROMBE_BLOODLINE && typeof g.CHIROMBE_BLOODLINE.start === "function") {
      try { g.CHIROMBE_BLOODLINE.start(); } catch (e) {}
    }
    if (g.CHIROMBE_SENTINEL && typeof g.CHIROMBE_SENTINEL.protect === "function") {
      try { Promise.resolve(g.CHIROMBE_SENTINEL.protect()).catch(function () {}); state.protect = "STARTED"; } catch (e) { state.protect = "FAILED"; }
    }
    if (g.CHIROMBE_DEFENCE && typeof g.CHIROMBE_DEFENCE.start === "function") {
      try { g.CHIROMBE_DEFENCE.start(); } catch (e) {}
    }
    state.pageWorkers = spawnPageWorkers();
    fetch("./data/family.json").then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
      state.roster = registerRoster(data);
      if (g.ZionProtect && data && data.members && typeof g.ZionProtect.registerNode === "function") {
        data.members.forEach(function (member) {
          try {
            if (!g.ZionProtect.nodes || !g.ZionProtect.nodes.has(member.id)) g.ZionProtect.registerNode(member.id, member.name, 0.92);
          } catch (e) {}
        });
      }
      pulse(state);
    }).catch(function () { pulse(state); });
    g.CHIROMBE_KERNEL_PULSE_FN = function () { pulse(state); };
    if (g.CHIROMBE_SCHEDULER && typeof g.CHIROMBE_SCHEDULER.register === "function") {
      g.CHIROMBE_SCHEDULER.register("MEDIUM", "kernel-pulse", function () { pulse(state); });
    } else if (!g.__CHIROMBE_KERNEL_PULSE__) {
      g.__CHIROMBE_KERNEL_PULSE__ = g.setInterval(function () { pulse(state); }, 12000);
    }
    g.CHIROMBE_KERNEL_STATE = state;
    journal("KERNEL_ARMED", "ONLINE");
    return state;
  }

  function pulse(state) {
    var people = 0;
    try {
      if (g.CHIROMBE_BLOODLINE && g.CHIROMBE_BLOODLINE.status) people = g.CHIROMBE_BLOODLINE.status().people || 0;
    } catch (e) {}
    try { if (g.CHIROMBE_SENTINEL && g.CHIROMBE_SENTINEL.cycle) g.CHIROMBE_SENTINEL.cycle(); } catch (e) {}
    try { if (g.CHIROMBE_BLOODLINE && g.CHIROMBE_BLOODLINE.continuityCycle) g.CHIROMBE_BLOODLINE.continuityCycle(); } catch (e) {}
    try { if (g.ChirombeWatchdog && g.ChirombeWatchdog.tick) g.ChirombeWatchdog.tick(); } catch (e) {}
    var canvas = g.document && g.document.getElementById("chirombe-resonance-canvas");
    if (canvas) {
      canvas.style.maxWidth = "280px";
      canvas.style.width = "min(280px, 72vw)";
      canvas.style.height = "auto";
      canvas.style.display = "block";
      canvas.style.margin = "12px";
    }
    var observed = g.__CHIROMBE_PAGE_WORKERS_LAST__ ? (g.__CHIROMBE_PAGE_WORKERS_LAST__.type || "signal") : "quiet";
    bar("CHIROMBE BRAIN ONLINE · bloodline " + people + " · defence " + (g.CHIROMBE_DEFENCE ? "ARMED" : "WAITING") + " · sentinel " + (g.CHIROMBE_SENTINEL ? "GUARDING" : "LOADING") + " · last signal " + observed + " · computational cover, not a physical guarantee");
    state.lastPulse = new Date().toISOString();
    state.people = people;
    g.CHIROMBE_KERNEL_STATE = state;
  }

  function sha256(text) {
    if (!g.crypto || !g.crypto.subtle || typeof TextEncoder === "undefined") return Promise.resolve(null);
    return g.crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(text))).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
    }).catch(function () { return null; });
  }

  function quarantine(name, detail) {
    if (!g.CHIROMBE_QUARANTINE) g.CHIROMBE_QUARANTINE = [];
    g.CHIROMBE_QUARANTINE.push({ name: name, at: new Date().toISOString(), detail: detail || {} });
    journal("QUARANTINE", name);
  }

  function cacheTrusted(path, text) {
    if (!g.caches || typeof Response === "undefined") return;
    g.caches.open("CHIROMBE_TRUSTED_v1").then(function (cache) {
      return cache.put(path, new Response(text));
    }).catch(function () {});
  }

  function readText(url) {
    return fetch(url).then(function (response) {
      if (!response.ok) throw new Error("FETCH_" + response.status);
      return response.text();
    });
  }

  function load() {
    if (g.__CHIROMBE_KERNEL_LOADING__ || g.__CHIROMBE_KERNEL_LOADED__) return g.__CHIROMBE_KERNEL_PROMISE__ || Promise.resolve(g.CHIROMBE_KERNEL_STATE || null);
    g.__CHIROMBE_KERNEL_LOADING__ = true;
    installWorkerBridge();
    var saved = rememberExisting();
    g.__CHIROMBE_KERNEL_PROMISE__ = Promise.all([
      readText("./chirombe%20engine"),
      readText("./engine/chep-03-worker-swarm.js").catch(function () { return null; }),
      readText("./data/trusted-manifest.json").catch(function () { return null; })
    ]).then(function (parts) {
      var raw = parts[0];
      var part03 = parts[1];
      var manifest = null;
      try { manifest = parts[2] ? JSON.parse(parts[2]) : null; } catch (e) { manifest = null; }
      var files = manifest && manifest.files || {};
      return Promise.all([sha256(raw), part03 ? sha256(part03) : Promise.resolve(null)]).then(function (hashes) {
        var engineHash = hashes[0];
        var partHash = hashes[1];
        var expectedEngine = files["chirombe engine"] && files["chirombe engine"].sha256;
        var expectedPart = files["engine/chep-03-worker-swarm.js"] && files["engine/chep-03-worker-swarm.js"].sha256;
        if (expectedEngine && engineHash && engineHash !== expectedEngine) {
          quarantine("chirombe engine", { hash: engineHash, expected: expectedEngine });
          throw new Error("ENGINE_HASH_MISMATCH");
        }
        if (part03 && expectedPart && partHash && partHash !== expectedPart) {
          quarantine("engine/chep-03-worker-swarm.js", { hash: partHash, expected: expectedPart });
          part03 = null;
        }
        g.CHIROMBE_KERNEL_INGEST = { text: raw, lines: raw.split("\n").length, chars: raw.length, original: true, sha256: engineHash };
        if (part03) g.__CHIROMBE_PART03_SOURCE__ = part03;
        var prepared = sanitize(raw, part03);
        g.CHIROMBE_KERNEL_NOTES = prepared.notes;
        cacheTrusted("./chirombe%20engine", raw);
        if (part03) cacheTrusted("./engine/chep-03-worker-swarm.js", part03);
        return new Promise(function (resolve, reject) {
          var blob = new Blob([prepared.source], { type: "text/javascript" });
          var url = URL.createObjectURL(blob);
          var script = document.createElement("script");
          script.src = url;
          script.onload = function () {
            URL.revokeObjectURL(url);
            g.__CHIROMBE_KERNEL_LOADING__ = false;
            g.__CHIROMBE_KERNEL_LOADED__ = true;
            try { resolve(arm(saved)); } catch (error) { reject(error); }
          };
          script.onerror = function () {
            URL.revokeObjectURL(url);
            reject(new Error("KERNEL_SCRIPT_FAILED"));
          };
          document.head.appendChild(script);
        });
      });
    }).catch(function (error) {
      g.__CHIROMBE_KERNEL_LOADING__ = false;
      bar("CHIROMBE BRAIN HELD · " + (error && error.message ? error.message : "load failed") + " · existing modules still running");
      journal("KERNEL_LOAD_FAILED", String(error && error.message || error));
      throw error;
    });
    return g.__CHIROMBE_KERNEL_PROMISE__;
  }

  function rebuild() {
    if (g.CHIROMBE && (g.CHIROMBE.name || g.CHIROMBE.version)) return Promise.resolve({ state: "INTACT", rebuilt: false });
    if (g.__CHIROMBE_REBUILDS__ >= 1) return Promise.resolve({ state: "REBUILD_HELD", reason: "ONE_REBUILD_PER_PAGE" });
    g.__CHIROMBE_REBUILDS__ = (g.__CHIROMBE_REBUILDS__ || 0) + 1;
    quarantine("CHIROMBE", { reason: "ABSENT_OR_UNNAMED" });
    g.__CHIROMBE_KERNEL_LOADING__ = false;
    g.__CHIROMBE_KERNEL_LOADED__ = false;
    g.__CHIROMBE_KERNEL_PROMISE__ = null;
    return load().then(function (state) { return { state: "REBUILT", rebuilt: true, kernel: state }; }, function (error) {
      return { state: "REBUILD_FAILED", rebuilt: false, error: String(error && error.message || error) };
    });
  }

  g.CHIROMBE_KERNEL_BRIDGE = { sanitize: sanitize, installWorkerBridge: installWorkerBridge, load: load, rebuild: rebuild, adoptSwarm: adoptSwarm };

  function start() {
    if (!g.document) return;
    load().catch(function () {});
  }
  if (g.document && g.document.readyState === "loading") g.document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})(typeof window !== "undefined" ? window : globalThis);
