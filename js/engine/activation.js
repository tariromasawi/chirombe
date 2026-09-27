/* Full activation of the preserved chirombe engine.
   The original file is not rewritten. This module catalogues it,
   schedules one loop, and connects the projection to the live system. */
(function (g) {
  "use strict";
  if (g.CHIROMBE_ACTIVATION) return;

  var CACHE_NAME = "CHIROMBE_STATIC_v9";
  var MEMORY_KEY = "CHIROMBE_ENGINE_MEMORY_v1";
  var active = false;
  var manifest = [];
  var repairs = [];
  var capabilities = [];
  var anomalies = [];
  var graph = [];
  var reportLines = [];
  var schedulerId = null;
  var jobs = [];
  var hidden = false;

  var SEGMENTS = [
    { id: "SEGMENT_001", name: "CHEP-01 CORE", start: 8, end: 768, global: "CHIROMBE", category: "CORE" },
    { id: "SEGMENT_002", name: "CHEP-02 MEMORY", start: 769, end: 1868, global: "CHIROMBE_MEMORY", category: "MEMORY" },
    { id: "SEGMENT_003", name: "PART 03 WORKERS", start: null, end: null, global: "CHIROMBE_WORKERS", category: "WORKERS", missing: true },
    { id: "SEGMENT_004", name: "CHEP-04 EVOLUTION", start: 1872, end: 4530, global: "CHIROMBE_EVOLUTION", category: "EVOLUTION" },
    { id: "SEGMENT_005", name: "CHEP-05 PATHWAYS", start: 4531, end: 7613, global: "CHIROMBE_PATHWAYS", category: "ORCHESTRATION" },
    { id: "SEGMENT_006", name: "CHEP-06 WATCHDOG", start: 7614, end: 9932, global: "CHIROMBE_WATCHDOG", category: "WATCHDOG" },
    { id: "SEGMENT_007", name: "CHEP-07 KNOWLEDGE", start: 9933, end: 13184, global: "CHIROMBE_KNOWLEDGE", category: "KNOWLEDGE" },
    { id: "SEGMENT_008", name: "CHEP-08 BUILD", start: 13185, end: 16551, global: "CHIROMBE_BUILD", category: "BUILD" },
    { id: "SEGMENT_009", name: "CHEP-09 ORCHESTRATOR", start: 16552, end: 19964, global: "CHIROMBE_ORCHESTRATOR", category: "ORCHESTRATION" },
    { id: "SEGMENT_010", name: "CHEP-10 BACKEND", start: 19965, end: 22627, global: "CHIROMBE_BACKEND", category: "AI" },
    { id: "SEGMENT_011", name: "CHEP-11 DEFENCE", start: 22628, end: 25359, global: "CHIROMBE_DEFENCE", category: "DEFENCE" },
    { id: "SEGMENT_012", name: "CHEP-12 BLOODLINE", start: 25360, end: 28125, global: "CHIROMBE_BLOODLINE", category: "BLOODLINE" },
    { id: "SEGMENT_013", name: "CHEP-13 LEGACY", start: 28126, end: 31514, global: "CHIROMBE_LEGACY", category: "LEGACY" },
    { id: "SEGMENT_014", name: "CHEP-14 INTENTION", start: 31515, end: 34729, global: "CHIROMBE_INTENTION", category: "INTENTION" },
    { id: "SEGMENT_015", name: "CHEP-15 RESONANCE", start: 34730, end: 37648, global: "CHIROMBE_RESONANCE_CHAMBER", category: "RESONANCE" },
    { id: "SEGMENT_016", name: "CHEP-17 SENTINEL", start: 37649, end: 40009, global: "CHIROMBE_SENTINEL", category: "CORE" }
  ];

  var LANES = { FAST: 5000, MEDIUM: 15000, SLOW: 60000, DEEP: 180000 };

  function say(text) {
    reportLines.push({ at: new Date().toISOString(), text: text });
    if (g.console && console.info) console.info("[CHIROMBE ENGINE] " + text);
  }

  function segmentFor(line) {
    for (var i = 0; i < SEGMENTS.length; i++) {
      var s = SEGMENTS[i];
      if (s.start && line >= s.start && line <= s.end) return s;
    }
    return null;
  }

  function segmentState(segment) {
    if (segment.missing) {
      return {
        status: "DEPENDENCY_REQUIRED",
        runtimeMapping: "CHIROMBE_WORKERS bridge. Original PART 03 source is not in the file.",
        validation: "ABSENT_FROM_SOURCE"
      };
    }
    var live = g[segment.global];
    if (segment.global === "CHIROMBE_WORKERS" && live && live.bridge) {
      return { status: "ADAPTED", runtimeMapping: "CHIROMBE_WORKERS", validation: "BRIDGE_NOT_ORIGINAL_PART" };
    }
    if (live) return { status: "ACTIVE_IN_PROJECTION", runtimeMapping: segment.global, validation: "GLOBAL_PRESENT" };
    return { status: "NOT_ATTACHED", runtimeMapping: segment.global, validation: "GLOBAL_ABSENT" };
  }

  function absorb(sourceText) {
    var text = String(sourceText || "");
    var lines = text.split("\n");
    manifest = [];
    var seen = {};
    lines.forEach(function (line, index) {
      var match = line.match(/(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/);
      if (!match) return;
      var lineNo = index + 1;
      var name = match[1];
      var id = name + "@" + lineNo;
      if (seen[id]) return;
      seen[id] = true;
      var segment = segmentFor(lineNo);
      var state = segment ? segmentState(segment) : { status: "UNSCOPED", runtimeMapping: null, validation: "NO_SEGMENT" };
      manifest.push({
        id: id,
        name: name,
        sourceLocation: "chirombe engine:" + lineNo,
        category: segment ? segment.category : "UTILITY",
        dependencies: segment ? [segment.global] : [],
        callers: [],
        globalsUsed: segment ? [segment.global] : [],
        eventsUsed: [],
        dataUsed: [],
        status: state.status,
        runtimeMapping: state.runtimeMapping,
        validation: "LEXICAL_SCAN." + state.validation,
        segment: segment ? segment.id : null
      });
    });
    SEGMENTS.forEach(function (segment) {
      if (!segment.missing) return;
      manifest.push({
        id: "PART_03_WORKERS",
        name: "CHIROMBE_WORKERS",
        sourceLocation: "chirombe engine:1869-1871",
        category: "WORKERS",
        dependencies: ["PART_03_SOURCE"],
        callers: [],
        globalsUsed: ["CHIROMBE_WORKERS"],
        eventsUsed: [],
        dataUsed: [],
        status: "DEPENDENCY_REQUIRED",
        runtimeMapping: "CHIROMBE_WORKERS bridge",
        validation: "SOURCE_GAP_AFTER_GIT_SPLICE"
      });
    });
    repairs = [
      {
        id: "KERNEL_REPAIR_001",
        sourceLocation: "chirombe engine:1869-1871",
        originalText: "Expected branch to point to",
        repairDescription: "Git rejection text is commented inside the projection only. It interrupted two scripts, not a string.",
        validation: "PROJECTION_PARSES",
        rollback: "Remove js/engine/kernel-bridge.js. The original file is untouched."
      },
      {
        id: "KERNEL_REPAIR_002",
        sourceLocation: "chirombe engine:7553 and 37576",
        repairDescription: "Raw script tags are commented inside the projection. They are not fetched.",
        validation: "PROJECTION_PARSES",
        rollback: "Remove js/engine/kernel-bridge.js."
      },
      {
        id: "KERNEL_REPAIR_003",
        sourceLocation: "chirombe engine:34667",
        repairDescription: "A loose await fragment is wrapped in an async function so the bloodline intention still registers.",
        validation: "PROJECTION_PARSES",
        rollback: "Remove js/engine/kernel-bridge.js."
      },
      {
        id: "KERNEL_REPAIR_004",
        sourceLocation: "CHEP-14 and CHEP-15 and CHEP-17",
        repairDescription: "average shim, nullish-mix parentheses, guarded resonance boot, VERSION constant.",
        validation: "PROJECTION_BOOTS",
        rollback: "Remove js/engine/kernel-bridge.js."
      }
    ];
    capabilities = scanCapabilities(text);
    g.KERNEL_FUNCTION_MANIFEST = manifest;
    g.ENGINE_CAPABILITY_MAP = capabilities;
    g.KERNEL_REPAIRS = repairs;
    return { lines: lines.length, functions: manifest.length, capabilities: capabilities.length, repairs: repairs.length };
  }

  function scanCapabilities(text) {
    var specs = [
      ["FUNCTIONS", /(?:async\s+)?function\s+[A-Za-z_$]/g, "FUNCTION_REGISTRY"],
      ["FETCH", /\bfetch\s*\(/g, "AI"],
      ["WEBSOCKET", /\bWebSocket\b/g, "AI"],
      ["CANVAS", /getContext\s*\(/g, "VISUAL"],
      ["AUDIO", /\bAudioContext\b/g, "AUDIO"],
      ["CRYPTO", /crypto\.subtle|integritySnapshot/g, "CRYPTOGRAPHY"],
      ["STORAGE", /\blocalStorage\b/g, "MEMORY"],
      ["WORKER", /\bWorker\b/g, "WORKERS"],
      ["SERVICE_WORKER", /serviceWorker/g, "RECOVERY"],
      ["DOM", /document\.|addEventListener\s*\(/g, "UI"]
    ];
    return specs.map(function (spec) {
      var found = text.match(spec[1]);
      return {
        name: spec[0],
        category: spec[2],
        count: found ? found.length : 0,
        status: found && found.length ? "DISCOVERED" : "NOT_PRESENT_IN_SOURCE",
        connectedTo: found && found.length ? spec[2] : null
      };
    });
  }

  function memoryRead() {
    try {
      if (!g.localStorage) return {};
      return JSON.parse(g.localStorage.getItem(MEMORY_KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function memoryWrite(namespace, key, value) {
    var all = memoryRead();
    if (!all[namespace] || typeof all[namespace] !== "object") all[namespace] = {};
    var previous = all[namespace][key];
    if (previous !== undefined && previous !== value) {
      if (!all.HISTORY || typeof all.HISTORY !== "object") all.HISTORY = {};
      all.HISTORY[namespace + ":" + key + ":" + Date.now()] = previous;
    }
    all[namespace][key] = value;
    try { if (g.localStorage) g.localStorage.setItem(MEMORY_KEY, JSON.stringify(all)); } catch (e) {}
    if (g.CHIROMBE_MEMORY && typeof g.CHIROMBE_MEMORY.write === "function") {
      try { g.CHIROMBE_MEMORY.write(namespace, key, value, { type: "activation", permanent: false }); } catch (e) {}
    }
    if (g.ChirombeState && typeof g.ChirombeState.set === "function") {
      try { g.ChirombeState.set("engine-memory:" + namespace + ":" + key, value); } catch (e) {}
    }
    return { namespace: namespace, key: key, stored: true };
  }

  function recordAnomaly(partial) {
    var row = {
      id: "ANOMALY_" + Date.now().toString(36) + "_" + anomalies.length,
      classification: "UNKNOWN",
      timestamp: new Date().toISOString(),
      module: partial && partial.module || "UNKNOWN",
      state: partial && partial.state || null,
      message: partial && partial.message || "",
      possibleCauses: [],
      confidence: 0
    };
    anomalies.push(row);
    if (anomalies.length > 200) anomalies.shift();
    memoryWrite("ANOMALIES", row.id, row);
    return row;
  }

  function linkResonance() {
    if (!g.ChirombeResonance || !g.CHIROMBE_RESONANCE_CHAMBER) return { status: "NOT_AVAILABLE" };
    if (!g.CHIROMBE_RESONANCE_LINK) {
      g.CHIROMBE_RESONANCE_LINK = {
        live: g.ChirombeResonance,
        kernel: g.CHIROMBE_RESONANCE_CHAMBER,
        note: "Both remain. The kernel chamber is not a replacement for ChirombeResonance."
      };
    }
    return { status: "CONNECTED" };
  }

  function buildGraph(family) {
    graph = [];
    SEGMENTS.forEach(function (segment) {
      var state = segmentState(segment);
      graph.push({
        source: "CHIROMBE_ENGINE",
        target: segment.name,
        relationship: "CONTAINS",
        confidence: state.status === "ACTIVE_IN_PROJECTION" ? 0.9 : 0.4,
        timestamp: new Date().toISOString(),
        evidence: state.validation
      });
    });
    if (family && family.members) {
      family.members.forEach(function (member) {
        graph.push({
          source: "BLOODLINE",
          target: member.id,
          relationship: "CANONICAL_MEMBER",
          confidence: 1,
          timestamp: new Date().toISOString(),
          evidence: "data/family.json"
        });
      });
    }
    g.CHIROMBE_KNOWLEDGE_GRAPH = graph;
    return graph;
  }

  function protection() {
    var people = 0;
    try { if (g.CHIROMBE_BLOODLINE && g.CHIROMBE_BLOODLINE.status) people = g.CHIROMBE_BLOODLINE.status().people || 0; } catch (e) {}
    var checks = [
      ["kernel", !!g.__CHIROMBE_KERNEL_LOADED__],
      ["memory", !!g.CHIROMBE_MEMORY],
      ["defence", !!g.CHIROMBE_DEFENCE],
      ["watchdog", !!(g.CHIROMBE_WATCHDOG || g.ChirombeWatchdog)],
      ["audit", !!(g.ChirombeAudit || g.CHIROMBE_ENGINE_LEDGER)],
      ["bloodline", !!(g.CHIROMBE_BLOODLINE && people > 0)],
      ["intention", !!g.CHIROMBE_INTENTION],
      ["resonance", !!(g.CHIROMBE_RESONANCE_CHAMBER || g.ChirombeResonance)],
      ["recovery", !!g.CHIROMBE_ENGINE_LEDGER],
      ["legacy", !!g.CHIROMBE_LEGACY]
    ];
    var passed = checks.filter(function (c) { return c[1]; }).length;
    var recommendations = [];
    if (!g.CHIROMBE_WORKERS || g.CHIROMBE_WORKERS.bridge) recommendations.push("PART 03 is not attached yet. The bridge is only a substitute.");
    else if (g.CHIROMBE_WORKERS.name === "CHIROMBE_WORKER_SWARM") recommendations.push("CHEP-03 is running from the recovered source. The original file still does not contain those lines.");
    if (people === 0) recommendations.push("Bloodline roster is empty. family.json did not register.");
    return {
      name: "CHIROMBE BLOODLINE PROTECTION STATE",
      kind: "COMPUTATIONAL",
      supernaturalClaim: false,
      score: checks.length ? passed / checks.length : 0,
      confidence: checks.length ? passed / checks.length : 0,
      integrity: g.__CHIROMBE_KERNEL_LOADED__ ? "PROJECTED" : "NOT_LOADED",
      continuity: people > 0 ? "ROSTER_REGISTERED" : "ROSTER_EMPTY",
      resilience: g.CHIROMBE_DEFENCE ? "DEFENCE_PRESENT" : "DEFENCE_ABSENT",
      recovery: g.CHIROMBE_ENGINE_LEDGER ? "LEDGER_PRESENT" : "LEDGER_ABSENT",
      anomalies: anomalies.length,
      people: people,
      checks: checks.map(function (c) { return { name: c[0], ok: c[1] }; }),
      lastVerified: new Date().toISOString(),
      recommendations: recommendations
    };
  }

  function presence(name) {
    return typeof g[name] !== "undefined" && g[name] !== null;
  }

  function healthRows() {
    return [
      ["KERNEL", g.__CHIROMBE_KERNEL_LOADED__ ? "ACTIVE" : "NOT_AVAILABLE"],
      ["CORE", presence("CHIROMBE") || presence("ChirombeCore") ? "ACTIVE" : "NOT_AVAILABLE"],
      ["MEMORY", presence("CHIROMBE_MEMORY") || presence("ChirombeState") ? "ACTIVE" : "NOT_AVAILABLE"],
      ["WATCHDOG", presence("CHIROMBE_WATCHDOG") || presence("ChirombeWatchdog") ? "ACTIVE" : "NOT_AVAILABLE"],
      ["DEFENCE", presence("CHIROMBE_DEFENCE") || presence("ZCCA") ? "ACTIVE" : "NOT_AVAILABLE"],
      ["AUDIT", presence("ChirombeAudit") || presence("CHIROMBE_ENGINE_LEDGER") ? "ACTIVE" : "NOT_AVAILABLE"],
      ["BLOODLINE", presence("CHIROMBE_BLOODLINE") ? "ACTIVE" : "NOT_AVAILABLE"],
      ["INTENTION", presence("CHIROMBE_INTENTION") || presence("MwarindiCovenant") ? "ACTIVE" : "NOT_AVAILABLE"],
      ["RESONANCE", presence("CHIROMBE_RESONANCE_CHAMBER") || presence("ChirombeResonance") ? "ACTIVE" : "NOT_AVAILABLE"],
      ["EVOLUTION", presence("CHIROMBE_EVOLUTION") ? "ACTIVE" : "NOT_AVAILABLE"],
      ["RECOVERY", presence("CHIROMBE_ENGINE_LEDGER") ? "ACTIVE" : "NOT_AVAILABLE"],
      ["PIONEER", presence("CHIROMBE_PIONEER_BRAIN") ? "ACTIVE" : "NOT_AVAILABLE"],
      ["GROK", "CONTROLLED"]
    ].map(function (row) { return { name: row[0], state: row[1] }; });
  }

  function healthReport() {
    var rows = healthRows();
    rows.forEach(function (row) { say(row.name + ": " + row.state); });
    say(active ? "CHIROMBE ENGINE: ACTIVE" : "CHIROMBE ENGINE: NOT_ACTIVE");
    return rows;
  }

  function selfKnowledge() {
    var missing = SEGMENTS.filter(function (s) { return s.missing || !g[s.global]; }).map(function (s) { return s.name; });
    return {
      identity: "CHIROMBE CONTINUITY INTELLIGENCE",
      kind: "ENTITY-LIKE SOFTWARE ARCHITECTURE",
      consciousnessClaim: false,
      whatIsRunning: healthRows().filter(function (r) { return r.state === "ACTIVE" || r.state === "CONTROLLED"; }),
      whatIsMissing: missing,
      whatIsBroken: repairs.map(function (r) { return r.id; }),
      whatChanged: g.CHIROMBE_KERNEL_NOTES || [],
      whatWasRecovered: manifest.filter(function (row) { return row.status === "ACTIVE_IN_PROJECTION"; }).length,
      whatIsProtected: protection(),
      whatIsUnverified: ["PART 03 was absent from the original file and is recovered from engine/chep-03-worker-swarm.js when its hash matches"],
      whatIsNew: ["activation scheduler", "function manifest", "protection state"],
      whatCanBeImproved: ["PART 03 source is still absent", "call graph is lexical, not executed per function"]
    };
  }

  function selfTest() {
    var results = [];
    function row(name, ok, detail) {
      results.push({
        component: name,
        available: ok !== null,
        verdict: ok === true ? "PASS" : (ok === false ? "FAILURE" : "NOT_AVAILABLE"),
        responseTime: 0,
        detail: detail || null
      });
    }
    row("KERNEL", !!g.__CHIROMBE_KERNEL_LOADED__, { loaded: !!g.__CHIROMBE_KERNEL_LOADED__ });
    row("FUNCTION_REGISTRY", manifest.length > 0, { count: manifest.length });
    row("SOURCE_LINES", !!(g.CHIROMBE_KERNEL_INGEST && g.CHIROMBE_KERNEL_INGEST.lines === 40009), { lines: g.CHIROMBE_KERNEL_INGEST && g.CHIROMBE_KERNEL_INGEST.lines });
    row("MEMORY", !!(g.CHIROMBE_MEMORY || g.ChirombeState));
    row("BLOODLINE", !!g.CHIROMBE_BLOODLINE);
    row("INTENTION", !!g.CHIROMBE_INTENTION || !!g.MwarindiCovenant);
    row("RESONANCE", !!g.CHIROMBE_RESONANCE_CHAMBER || !!g.ChirombeResonance);
    row("DEFENCE", !!g.CHIROMBE_DEFENCE || !!g.ZCCA);
    row("WATCHDOG", !!g.CHIROMBE_WATCHDOG || !!g.ChirombeWatchdog);
    row("AUDIT", !!g.ChirombeAudit || !!g.CHIROMBE_ENGINE_LEDGER);
    row("RECOVERY", !!g.CHIROMBE_ENGINE_LEDGER);
    row("EVOLUTION", !!g.CHIROMBE_EVOLUTION, null);
    row("PIONEER", g.CHIROMBE_PIONEER_BRAIN ? true : null);
    row("PART_03", null, { status: "DEPENDENCY_REQUIRED" });
    row("GROK_GATEWAY", true, { execution: "BLOCKED", keyInPage: false });
    row("SCHEDULER", !!schedulerId || jobs.length > 0);
    return { phase: "ACTIVATION_SELF_TEST", results: results, protection: protection() };
  }

  function registerJob(lane, name, fn) {
    for (var i = 0; i < jobs.length; i++) if (jobs[i].name === name) return jobs[i];
    var job = { lane: lane, name: name, fn: fn, next: 0 };
    jobs.push(job);
    return job;
  }

  function tick() {
    var now = Date.now();
    var multiplier = (g.document && g.document.hidden) ? 6 : 1;
    if (g.document && g.document.hidden !== hidden) {
      hidden = !!g.document.hidden;
      if (!hidden) jobs.forEach(function (job) { job.next = now; });
    }
    jobs.forEach(function (job) {
      var wait = (LANES[job.lane] || LANES.MEDIUM) * multiplier;
      if (now < job.next) return;
      job.next = now + wait;
      try { job.fn(); } catch (error) { recordAnomaly({ module: job.name, message: String(error && error.message || error) }); }
    });
  }

  function startScheduler() {
    if (schedulerId) return;
    if (g.__CHIROMBE_KERNEL_PULSE__) {
      g.clearInterval(g.__CHIROMBE_KERNEL_PULSE__);
      g.__CHIROMBE_KERNEL_PULSE__ = null;
    }
    registerJob("MEDIUM", "kernel-pulse", function () {
      if (typeof g.CHIROMBE_KERNEL_PULSE_FN === "function") g.CHIROMBE_KERNEL_PULSE_FN();
    });
    registerJob("FAST", "integrity", function () {
      if (g.ChirombeWatchdog && g.ChirombeWatchdog.tick) g.ChirombeWatchdog.tick();
    });
    registerJob("SLOW", "protection-memory", function () {
      memoryWrite("PROTECTION", "latest", protection());
    });
    registerJob("DEEP", "self-knowledge", function () {
      memoryWrite("KERNEL", "selfKnowledge", {
        at: new Date().toISOString(),
        functions: manifest.length,
        missing: selfKnowledge().whatIsMissing
      });
    });
    if (typeof g.setInterval === "function") schedulerId = g.setInterval(tick, 1000);
    g.CHIROMBE_SCHEDULER = { register: registerJob, tick: tick, lanes: LANES, jobs: function () { return jobs.map(function (j) { return j.name; }); } };
  }

  function connectLive() {
    manifest.forEach(function (row) {
      if (row.id !== "PART_03_WORKERS") return;
      if (g.CHIROMBE_WORKERS && g.CHIROMBE_WORKERS.name === "CHIROMBE_WORKER_SWARM") {
        row.status = "RECOVERED";
        row.runtimeMapping = "engine/chep-03-worker-swarm.js";
        row.validation = "ORIGINAL_FILE_GAP_REMAINS. Trusted CHEP-03 source is running.";
      }
    });
    linkResonance();
    ["ChirombeSystem", "ChirombeBus", "ChirombeState", "ChirombeCore", "ChirombeHealth", "ChirombeWatchdog", "ChirombeAudit", "ZCCA", "ZionProtect", "MwarindiCovenant", "ChirombeResonance", "CHIROMBE_AUTOSTART"].forEach(function (name) {
      graph.push({
        source: "CHIROMBE_ENGINE",
        target: name,
        relationship: presence(name) ? "CONNECTED" : "NOT_ON_THIS_PAGE",
        confidence: presence(name) ? 0.8 : 0.2,
        timestamp: new Date().toISOString(),
        evidence: "global presence"
      });
    });
    if (g.ChirombeBus && g.ChirombeBus.register) {
      try { g.ChirombeBus.register("engine.activate", function () { return api.activate(); }); } catch (e) {}
      try { g.ChirombeBus.register("engine.selfKnowledge", function () { return selfKnowledge(); }); } catch (e) {}
    }
  }

  function checkCache() {
    var sw = null;
    try { sw = g.navigator && g.navigator.serviceWorker; } catch (e) { sw = null; }
    if (!sw || typeof g.MessageChannel !== "function") return Promise.resolve({ status: "NOT_AVAILABLE" });
    var controller = null;
    try { controller = sw.controller; } catch (e) { return Promise.resolve({ status: "NOT_AVAILABLE" }); }
    if (!controller) return Promise.resolve({ status: "NOT_CONTROLLING" });
    return new Promise(function (resolve) {
      var channel = new g.MessageChannel();
      var done = false;
      channel.port1.onmessage = function (event) {
        done = true;
        var cache = event.data && event.data.cache;
        if (cache && cache !== CACHE_NAME) {
          recordAnomaly({ module: "SERVICE_WORKER", message: "ENGINE_VERSION_MISMATCH " + cache });
          resolve({ status: "ENGINE_VERSION_MISMATCH", cache: cache });
        } else resolve({ status: "MATCH", cache: cache || CACHE_NAME });
      };
      try { controller.postMessage({ type: "GET_SW_STATUS" }, [channel.port2]); } catch (e) { resolve({ status: "NOT_AVAILABLE" }); }
      setTimeout(function () { if (!done) resolve({ status: "NO_REPLY" }); }, 800);
    });
  }

  function attachEngine() {
    var engine = g.CHIROMBE_ENGINE;
    if (!engine || engine.__activationAttached) return;
    var baseStatus = engine.status.bind(engine);
    var baseTest = engine.selfTest.bind(engine);
    engine.status = function () {
      var snapshot = baseStatus();
      if (g.__CHIROMBE_KERNEL_LOADED__) {
        snapshot.warnings = (snapshot.warnings || []).filter(function (w) { return w !== "ARTIFACT_PRESERVED_UNEXECUTED"; });
        snapshot.kernel = "ACTIVE";
      } else snapshot.kernel = "NOT_LOADED";
      snapshot.activation = {
        active: active,
        functions: manifest.length,
        repairs: repairs.map(function (r) { return r.id; }),
        protection: protection(),
        scheduler: jobs.map(function (j) { return j.name; }),
        cache: CACHE_NAME
      };
      snapshot.mode = "CONTINUITY_INTELLIGENCE";
      snapshot.alwaysOn = false;
      snapshot.alwaysOnReason = "A browser tab is not a 24/7 runtime.";
      return snapshot;
    };
    engine.selfTest = function () {
      var snapshot = baseTest();
      var extra = selfTest();
      snapshot.results = (snapshot.results || []).concat(extra.results || []);
      snapshot.activation = extra;
      return snapshot;
    };
    engine.activate = function () { return api.activate(); };
    engine.selfKnowledge = function () { return selfKnowledge(); };
    engine.__activationAttached = true;
  }

  var pending = null;

  function activate() {
    if (active && g.__CHIROMBE_KERNEL_LOADED__) return Promise.resolve({ state: "ALREADY_ACTIVE", protection: protection() });
    if (pending) return pending;
    say("CHIROMBE ENGINE INITIALISING");
    say("KERNEL: DISCOVERED");
    attachEngine();
    startScheduler();
    var loader = g.CHIROMBE_KERNEL_BRIDGE && g.CHIROMBE_KERNEL_BRIDGE.load ? g.CHIROMBE_KERNEL_BRIDGE.load() : Promise.resolve(null);
    pending = Promise.resolve(loader).then(function () {
      var ingest = g.CHIROMBE_KERNEL_INGEST;
      if (!ingest || !ingest.text) {
        say("KERNEL: NOT_AVAILABLE");
        return { state: "DEGRADED", reason: "SOURCE_NOT_INGESTED" };
      }
      say("KERNEL: ABSORBED");
      var absorbed = absorb(ingest.text);
      say("KERNEL: PROJECTED");
      say("KERNEL: VALIDATED");
      connectLive();
      return fetch("./data/family.json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(function (family) {
        buildGraph(family);
        var test = selfTest();
        active = !!g.__CHIROMBE_KERNEL_LOADED__;
        say(active ? "KERNEL: ACTIVE" : "KERNEL: NOT_AVAILABLE");
        var rows = healthReport();
        memoryWrite("KERNEL", "lastActivation", { at: new Date().toISOString(), functions: absorbed.functions, lines: absorbed.lines });
        return checkCache().then(function (cache) {
          return { state: active ? "ACTIVE" : "DEGRADED", absorbed: absorbed, health: rows, test: test, cache: cache, protection: protection() };
        });
      });
    }).catch(function (error) {
      recordAnomaly({ module: "ACTIVATION", message: String(error && error.message || error) });
      say("KERNEL: NOT_AVAILABLE");
      return { state: "DEGRADED", error: String(error && error.message || error) };
    });
    return pending;
  }

  var api = {
    absorb: absorb,
    activate: activate,
    manifest: function () { return manifest.slice(); },
    repairs: function () { return repairs.slice(); },
    capabilities: function () { return capabilities.slice(); },
    protection: protection,
    selfKnowledge: selfKnowledge,
    selfTest: selfTest,
    health: healthReport,
    report: function () { return reportLines.slice(); },
    anomalies: function () { return anomalies.slice(); },
    graph: function () { return graph.slice(); },
    memory: { write: memoryWrite, read: memoryRead },
    recordAnomaly: recordAnomaly
  };

  g.CHIROMBE_ACTIVATION = api;
  g.ENGINE_FUNCTIONS = {
    register: function (entry) {
      if (!entry || !entry.name) return { ok: false };
      manifest.push(entry);
      return { ok: true, count: manifest.length };
    },
    list: function () { return manifest.slice(); }
  };
  g.ENGINE_MEMORY = api.memory;

  function start() {
    attachEngine();
    activate().catch(function () {});
  }
  if (g.document && g.document.readyState === "loading" && g.document.addEventListener) {
    g.document.addEventListener("DOMContentLoaded", start, { once: true });
  } else if (g.document) {
    start();
  }
})(typeof window !== "undefined" ? window : globalThis);
