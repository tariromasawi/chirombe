/* CHIROMBE ENGINE — integration brain.
   Connects the live system. The preserved "chirombe engine" file is not rewritten.
   kernel-bridge.js builds and runs the executable projection. */
(function (g) {
  "use strict";
  if (g.CHIROMBE_ENGINE && g.CHIROMBE_ENGINE.version) return;

  var VERSION = "1.0.0-integration";
  var started = Date.now();
  var booted = false;
  var bootLog = [];
  var graph = [];
  var tasks = [];
  var proposals = [];
  var knowledge = [];
  var builds = [];
  var memoryMirror = [];
  var provider = "NONE";
  var familyJson = null;
  var lastCycle = null;
  var adapters = null;
  var host = null;
  var bootPromise = null;

  function line(text) {
    bootLog.push({ at: new Date().toISOString(), text: text });
    if (g.console && console.info) console.info("[CHIROMBE ENGINE] " + text);
  }

  function policy() { return g.CHIROMBE_ENGINE_POLICY || {}; }
  function ledger() { return g.CHIROMBE_ENGINE_LEDGER || null; }
  function catalogue() { return g.CHIROMBE_ENGINE_CATALOGUE || []; }

  function ctx() {
    return {
      ledger: ledger(),
      tasks: tasks,
      proposals: proposals,
      knowledge: knowledge,
      builds: builds,
      memoryMirror: memoryMirror,
      provider: provider,
      familyJson: familyJson,
      discover: discover,
      connect: connect,
      analyse: analyse,
      integrity: integrity
    };
  }

  function ensureAdapters() {
    if (adapters) return adapters;
    if (!g.CHIROMBE_ENGINE_ADAPTERS) return null;
    host = ctx();
    adapters = g.CHIROMBE_ENGINE_ADAPTERS.create(host);
    return adapters;
  }

  function edge(source, target, iface, status, confidence) {
    var row = {
      source: source,
      target: target,
      interface: iface,
      status: status,
      confidence: confidence,
      lastVerified: new Date().toISOString(),
      failureCount: status === "FAILED" ? 1 : 0,
      latency: null,
      dependency: target,
      rollbackAvailable: true
    };
    graph.push(row);
    return row;
  }

  function discover() {
    graph = [];
    var rows = catalogue().map(function (entry) {
      return g.CHIROMBE_ENGINE_ADAPTERS.probeEntry(entry);
    });
    rows.forEach(function (row) {
      if (!row.available) return;
      var state = row.healthy ? "DISCOVERED" : "DEGRADED";
      edge("CHIROMBE_ENGINE", row.module, (row.methods || []).join(",") || "object", state, row.compatibility);
    });
    return { phase: "DISCOVERY", components: rows, artifact: g.CHIROMBE_ENGINE_ARTIFACT || null };
  }

  function connect() {
    var found = discover();
    found.components.forEach(function (row) {
      if (!row.available) return;
      row.connection = row.healthy ? "CONNECTED" : "DEGRADED";
      graph.forEach(function (e) {
        if (e.target === row.module && e.status === "DISCOVERED") e.status = "CONNECTED";
      });
    });
    edge("CHIROMBE_ENGINE", "EXTERNAL_AI", "analyse,review,generateProposal", "DISABLED_BY_DESIGN", 1);
    return { phase: "CONNECTION", graph: graph.slice(), components: found.components };
  }

  function verifyInterfaces() {
    var report = connect();
    report.components.forEach(function (row) {
      if (!row.available) return;
      graph.forEach(function (e) {
        if (e.target === row.module && (e.status === "CONNECTED" || e.status === "DISCOVERED")) {
          e.status = row.healthy ? "VERIFIED" : "DEGRADED";
          e.lastVerified = new Date().toISOString();
        }
      });
    });
    report.phase = "HEALTH";
    return report;
  }

  function loadFamily() {
    if (typeof g.fetch !== "function") return Promise.resolve(null);
    return g.fetch("./data/family.json").then(function (r) {
      return r && r.ok ? r.json() : null;
    }).then(function (data) {
      if (data && data.members) {
        familyJson = data;
        if (host) host.familyJson = data;
      }
      return familyJson;
    }).catch(function () { return null; });
  }

  function seedKnowledge() {
    if (knowledge.length) return;
    var items = [
      { status: "KNOWN", confidence: 0.95, category: "architecture", description: "Live browser core is js/*.js plus app.html. The file named 'chirombe engine' is not referenced by any HTML page.", source: "repository-audit", provenance: "file scan 2026-09-27" },
      { status: "KNOWN", confidence: 0.99, category: "integrity", description: "chirombe engine does not parse: a git rejection sentence is spliced at line 1869.", source: "node --check", provenance: "syntax check" },
      { status: "KNOWN", confidence: 0.9, category: "bus", description: "js/command-bus.js was syntactically broken (unclosed registerCommand). A one-brace repair restored the existing bus. No commands were renamed.", source: "repository-audit", provenance: "node --check before and after" },
      { status: "KNOWN", confidence: 1, category: "bloodline", description: "HRH Tarry Kupakwashe Masawi, also known as Tarry, is the son of HRH Saint Tariro Masawi. An earlier spouse label is retained as previousGeneration. No person was removed.", source: "explicit owner statement 2026-09-27", provenance: "data/family.json lineageCorrection" },
      { status: "KNOWN", confidence: 0.85, category: "security", description: "No API keys or private keys were found in repository JavaScript. Zion HMAC key is generated in-session.", source: "repository-audit", provenance: "secret scan" },
      { status: "UNVERIFIED", confidence: 0.4, category: "backend", description: "No production backend URL is configured. Static JSON is the public data surface.", source: "repository-audit", provenance: "docs/ENDPOINTS.md" },
      { status: "KNOWN", confidence: 0.8, category: "duplicate", description: "Family rosters are repeated in data/family.json, ChirombeCore, ZCCA, and several workers. They are preserved, not merged by deletion.", source: "repository-audit", provenance: "file scan" }
    ];
    items.forEach(function (item) { adapters.knowledge.add(item); });
  }

  function seedProposals() {
    if (proposals.length) return;
    adapters.evolution.propose({ summary: "Do not execute the preserved chirombe engine artifact until it is split into parseable modules with a rollback.", hypothesis: "Loading it would throw at line 1869 and could disturb the live pages.", action: "KEEP_PRESERVED" });
    adapters.evolution.propose({ summary: "Missing files named inside the artifact (chirombe-memory.js and the rest) should be created only as adapters around live globals, never as silent replacements.", hypothesis: "The live equivalents already exist under different names.", action: "ADAPTERS_ONLY" });
    adapters.evolution.propose({ summary: "ZionProtectionCore drops audit entries after 400. That conflicts with NO_HISTORY_ERASURE.", hypothesis: "An archive key could hold overflow later.", action: "REVIEW_ONLY" });
    adapters.evolution.propose({ summary: "Tarry is recorded as son. The old spouse label remains on the same record as previousGeneration.", hypothesis: "The owner resolved the conflict. Deleting the old label would hide the correction.", action: "RECORDED" });
  }

  function seedRecovery() {
    var book = ledger();
    if (!book) return;
    if (book.listRecovery().length) return;
    book.recordRecovery({
      state: "ANALYSING",
      target: "chirombe engine",
      reason: "Artifact does not parse. Treated as preserved history, not as lost code.",
      lastKnownHealthy: null,
      proposal: "Split only after a reviewed recovery proposal. Do not replace js/chirombe-core.js."
    });
    book.recordRecovery({
      state: "RECOVERED",
      target: "js/command-bus.js",
      reason: "registerCommand was missing its closing brace, so the bus never parsed.",
      lastKnownHealthy: "intended sibling functions executeCommand and listCommands",
      proposal: "Close the function. Rollback is reverting that one brace, which returns the syntax error."
    });
  }

  function analyse() {
    var observation = [];
    var interpretation = [];
    var hypothesis = [];
    var action = [];
    var art = g.CHIROMBE_ENGINE_ARTIFACT;
    observation.push({ observation: "Artifact parseable=false", evidence: art && art.corruptionMarker });
    interpretation.push({ interpretation: "The mega-file is a historical concatenation, not the live kernel." });
    hypothesis.push({ hypothesis: "Earlier module text may still be recoverable from inside the artifact without deleting it." });
    action.push({ action: "Queue recovery as ANALYSING. Do not rewrite the artifact." });
    if (!g.CHIROMBE_BACKEND && !g.CHIROMBE_MEMORY) {
      observation.push({ observation: "No CHIROMBE_BACKEND and no CHIROMBE_MEMORY global on this page." });
      interpretation.push({ interpretation: "External sync and the historical memory global are unavailable here." });
      hypothesis.push({ hypothesis: "Backend synchronisation, if added later, would need a real endpoint and approval." });
      action.push({ action: "Use ChirombeState or the engine mirror. Do not invent a network." });
    }
    return { observation: observation, interpretation: interpretation, hypothesis: hypothesis, action: action };
  }

  function integrity() {
    var flags = policy();
    var brokenFlag = Object.keys(flags).filter(function (k) {
      return k.indexOf("NO_") === 0 && flags[k] !== true;
    });
    var chain = ledger() ? ledger().verify() : { ok: false, reason: "LEDGER_NOT_AVAILABLE" };
    return {
      policyIntact: brokenFlag.length === 0,
      brokenFlags: brokenFlag,
      journal: chain,
      artifact: g.CHIROMBE_ENGINE_ARTIFACT || null,
      add1: g.CHIROMBE_ENGINE_ADD1 || null,
      artifactLoaded: false,
      blindRewrite: "BLOCKED"
    };
  }

  function verifyArtifact() {
    if (typeof g.fetch !== "function" || !g.crypto || !crypto.subtle) {
      return Promise.resolve({ available: false, reason: "HASH_API_UNAVAILABLE", known: g.CHIROMBE_ENGINE_ARTIFACT || null });
    }
    return g.fetch("./" + encodeURIComponent("chirombe engine")).then(function (r) {
      if (!r.ok) return { available: false, reason: "ARTIFACT_FETCH_FAILED", status: r.status };
      return r.arrayBuffer().then(function (buf) {
        return crypto.subtle.digest("SHA-256", buf).then(function (dig) {
          var hex = Array.prototype.map.call(new Uint8Array(dig), function (b) { return b.toString(16).padStart(2, "0"); }).join("");
          var known = g.CHIROMBE_ENGINE_ARTIFACT;
          return {
            available: true,
            bytes: buf.byteLength,
            sha256: hex,
            matchesAudit: !!(known && hex === known.sha256 && buf.byteLength === known.bytes),
            executed: false
          };
        });
      });
    }).catch(function (e) {
      return { available: false, reason: "ARTIFACT_HASH_FAILED", error: String(e && e.message ? e.message : e) };
    });
  }

  function selfTest() {
    function timed(component, available, healthy, extra, began) {
      return {
        component: component,
        available: !!available,
        healthy: available ? !!healthy : null,
        verdict: !available ? "NOT_AVAILABLE" : (healthy ? "PASS" : "FAILURE"),
        responseTime: Date.now() - began,
        detail: extra || null
      };
    }
    if (!g.CHIROMBE_ENGINE_ADAPTERS) {
      return { phase: "SELF_TEST", results: [timed("CHIROMBE_ENGINE", true, false, { reason: "ADAPTERS_MISSING" }, Date.now())] };
    }
    ensureAdapters();
    var probes = catalogue().map(function (entry) {
      var began = Date.now();
      var row = g.CHIROMBE_ENGINE_ADAPTERS.probeEntry(entry);
      var healthy = row.available && row.healthy;
      if (row.available && row.module === "CHIROMBE_HEALTH" && g.ChirombeHealth) {
        try { g.ChirombeHealth.snapshot(); } catch (e) { healthy = false; row.error = String(e.message || e); }
      }
      if (row.available && row.module === "CHIROMBE_BUS" && g.ChirombeBus) {
        try {
          var bus = g.ChirombeBus.executeCommand("version");
          healthy = !!(bus && bus.ok);
        } catch (e) { healthy = false; }
      }
      if (row.available && row.module === "CHIROMBE_AUDIT" && g.ChirombeAudit) {
        try { healthy = g.ChirombeAudit.verify() !== false; } catch (e) { healthy = false; }
      }
      return timed(row.module, row.available, healthy, { compatibility: row.compatibility, missing: row.missing, note: row.note }, began);
    });
    var beganEngine = Date.now();
    var engineOk = !!(policy().NO_DELETE_BY_DEFAULT && ledger());
    probes.push(timed("CHIROMBE_ENGINE", true, engineOk, { version: VERSION }, beganEngine));
    return { phase: "SELF_TEST", results: probes };
  }

  function countsFrom(test) {
    var connected = 0, degraded = 0, failed = 0, unavailable = 0;
    (test.results || []).forEach(function (row) {
      if (!row.available) unavailable += 1;
      else if (row.verdict === "FAILURE") failed += 1;
      else if (row.detail && row.detail.missing && row.detail.missing.length) degraded += 1;
      else connected += 1;
    });
    return { connected: connected, degraded: degraded, failed: failed, unavailable: unavailable, total: (test.results || []).length };
  }

  function status() {
    ensureAdapters();
    var test = selfTest();
    var c = countsFrom(test);
    var uptime = Date.now() - started;
    return {
      identity: {
        name: "CHIROMBE_ENGINE",
        version: VERSION,
        role: "CENTRAL_INTEGRATION_LAYER",
        architecture: "ENTITY-LIKE SOFTWARE ARCHITECTURE",
        consciousnessClaim: false,
        baselineCommit: "2c26b57a945fada68fc4b013475cdf204a752e9f"
      },
      version: VERSION,
      booted: booted,
      active: booted,
      uptime: uptime,
      componentCount: c.total,
      connectedComponents: c.connected,
      degradedComponents: c.degraded,
      failedComponents: c.failed,
      unavailableComponents: c.unavailable,
      memoryStatus: adapters ? adapters.memory.status() : null,
      workerStatus: adapters ? { logical: adapters.workers.list().logical.length, filesDiscovered: (g.CHIROMBE_ENGINE_WORKER_FILES || []).length, spawned: 0 } : null,
      integrityStatus: integrity(),
      knowledgeStatus: adapters ? adapters.knowledge.status() : null,
      evolutionStatus: adapters ? adapters.evolution.status() : null,
      buildStatus: adapters ? adapters.build.status() : null,
      orchestratorStatus: adapters ? adapters.orchestrator.status() : null,
      bloodlineStatus: adapters ? adapters.bloodline.status() : null,
      intentionStatus: adapters ? { available: !!(g.MwarindiCovenant), invokedSeal: false } : null,
      resonanceStatus: adapters ? { available: !!(g.ChirombeResonance), audioArmedByEngine: false } : null,
      externalAIStatus: adapters ? adapters.externalAI.status() : { provider: "NONE" },
      errors: ledger() ? ledger().listErrors().length : 0,
      warnings: (g.__CHIROMBE_KERNEL_LOADED__ ? [] : ((g.CHIROMBE_ENGINE_ARTIFACT && !g.CHIROMBE_ENGINE_ARTIFACT.parseable) ? ["ARTIFACT_PRESERVED_UNEXECUTED"] : [])),
      pendingProposals: proposals.filter(function (p) { return !p.applied; }).length,
      pendingTests: 0,
      pendingRecovery: ledger() ? ledger().listRecovery().filter(function (r) { return r.state !== "RECOVERED"; }).length : 0,
      lastCycle: lastCycle,
      nextCycle: "MANUAL",
      preservation: {
        mode: "ACTIVE",
        destructiveRewrite: "BLOCKED",
        memoryErasure: "BLOCKED",
        blindDeployment: "BLOCKED"
      }
    };
  }

  function boot() {
    if (booted) return Promise.resolve(status());
    if (bootPromise) return bootPromise;
    line("CHIROMBE ENGINE INITIALISING");
    line("Preservation Mode: ACTIVE");
    line("Destructive Rewrite: BLOCKED");
    line("Memory Erasure: BLOCKED");
    line("Blind Deployment: BLOCKED");
    line("Integrity Monitoring: ACTIVE");
    line("Architecture Discovery: ACTIVE");
    line("Compatibility Layer: ACTIVE");
    line("Recovery Layer: ACTIVE");
    line("Evolution Layer: CONTROLLED");
    line("External AI Gateway: CONTROLLED");
    if (!g.CHIROMBE_ENGINE_POLICY || !g.CHIROMBE_ENGINE_LEDGER || !g.CHIROMBE_ENGINE_ADAPTERS) {
      line("DEGRADED: a dependency script is missing. Engine will not invent it.");
      if (ledger()) ledger().recordError({ MODULE: "CHIROMBE_ENGINE", ERROR_TYPE: "DEPENDENCY", MESSAGE: "policy, ledger, or adapters missing", SEVERITY: "HIGH" });
    }
    line("DISCOVERING COMPONENTS...");
    ensureAdapters();
    if (adapters) discover();
    line("BUILDING CONNECTION GRAPH...");
    if (adapters) connect();
    line("VERIFYING INTERFACES...");
    if (adapters) verifyInterfaces();
    line("RECOVERING MEMORY...");
    seedRecovery();
    if (ledger()) {
      ledger().append({
        operation: "BOOT",
        target: "CHIROMBE_ENGINE",
        reason: "Integration boot. Original chirombe engine file is not rewritten. The kernel projection is activated by kernel-bridge.",
        validation: "PRESERVE",
        result: "READY",
        rollback: "Remove js/engine scripts and engine.html. Live modules stay."
      });
    }
    if (adapters) {
      seedKnowledge();
      seedProposals();
    }
    line("RUNNING SELF-TEST...");
    var test = selfTest();
    var failed = test.results.filter(function (r) { return r.verdict === "FAILURE"; });
    if (failed.length && ledger()) {
      failed.forEach(function (row) {
        ledger().recordError({ MODULE: row.component, ERROR_TYPE: "INTEGRATION", MESSAGE: "self-test failure", SEVERITY: "MEDIUM", CONTEXT: JSON.stringify(row.detail || {}) });
      });
    }
    bootPromise = loadFamily().then(function () {
      lastCycle = new Date().toISOString();
      booted = true;
      line("ENGINE READY");
      line("Self-test failures: " + failed.length + ". Unavailable modules are not failures.");
      return status();
    });
    return bootPromise;
  }

  function safeRegister() {
    if (!g.ChirombeBus || typeof g.ChirombeBus.registerCommand !== "function") return;
    var existing = g.ChirombeBus.listCommands ? g.ChirombeBus.listCommands() : [];
    function add(name, fn) {
      if (existing.indexOf(name) >= 0) {
        if (ledger()) ledger().append({ operation: "CONFLICT", target: name, reason: "ENGINE_INTEGRATION_CONFLICT existing bus command kept", result: "SKIPPED", validation: "NO_OVERWRITE" });
        return;
      }
      g.ChirombeBus.registerCommand(name, fn, { subsystem: "engine" });
    }
    add("engine.status", function () { return status(); });
    add("engine.discover", function () { return discover(); });
    add("engine.selftest", function () { return selfTest(); });
    add("engine.health", function () { return adapters ? adapters.watchdog.status() : { available: false }; });
  }

  function command(name, args) {
    var key = String(name || "").toUpperCase().replace(/[\s-]+/g, "_");
    ensureAdapters();
    var table = {
      STATUS: function () { return status(); },
      DISCOVER: function () { return discover(); },
      CONNECT: function () { return connect(); },
      HEALTH: function () { return adapters.watchdog.status(); },
      INTEGRITY: function (a) {
        if (a && a.verify) return verifyArtifact();
        return integrity();
      },
      MEMORY: function (a) {
        if (a && a.write) return adapters.memory.write(a.key, a.value);
        if (a && a.search) return adapters.memory.search(a.search);
        return adapters.memory.status();
      },
      KNOWLEDGE: function (a) { return a && a.query ? adapters.knowledge.search(a.query) : adapters.knowledge.list(); },
      EVOLUTION: function () { return adapters.evolution.list(); },
      PATHWAYS: function () { return g.CHIROMBE_ENGINE_ADAPTERS.probeEntry({ id: "CHIROMBE_PATHWAYS", global: null, methods: [], optional: true, note: "MISSING_OPTIONAL_COMPONENT" }); },
      BUILD: function () { return adapters.build.status(); },
      ORCHESTRATE: function (a) { return adapters.orchestrator.submit(a || { command: "status" }); },
      BLOODLINE: function () { return adapters.bloodline.status(); },
      INTENTION: function () { return adapters.intention.status(); },
      RESONANCE: function () { return adapters.resonance.status(); },
      RECOVERY: function () { return ledger() ? ledger().listRecovery() : []; },
      ERRORS: function () { return ledger() ? ledger().listErrors() : []; },
      LEARN: function () { return analyse(); },
      SELF_TEST: function () { return selfTest(); },
      EXPORT: function () {
        return {
          status: status(),
          journal: ledger() ? ledger().exportJournal() : [],
          knowledge: knowledge,
          proposals: proposals,
          graph: graph
        };
      },
      AUDIT: function () { return { journal: ledger() ? ledger().verify() : null, chirombeAudit: g.ChirombeAudit ? g.ChirombeAudit.verify() : "NOT_AVAILABLE", bootLog: bootLog.slice() }; },
      PROPOSE: function (a) { return adapters.evolution.propose(a || { summary: "unspecified" }); },
      VERSION: function () { return { version: VERSION, protocol: "CHIROMBE-ENGINE-INTEGRATION", baseline: "2c26b57" }; },
      EXTERNAL_AI: function (a) {
        if (a && a.provider) return adapters.externalAI.configure(a.provider);
        return adapters.externalAI.status();
      }
    };
    if (!table[key]) return { ok: false, error: "UNKNOWN_COMMAND", commands: Object.keys(table) };
    try {
      var result = table[key](args || {});
      if (result && typeof result.then === "function") {
        return result.then(function (r) { return { ok: true, command: key, result: r }; }, function (e) {
          return { ok: false, command: key, error: String(e && e.message ? e.message : e) };
        });
      }
      return { ok: true, command: key, result: result };
    } catch (e) {
      if (ledger()) ledger().recordError({ MODULE: "CHIROMBE_ENGINE", ERROR_TYPE: "RUNTIME", MESSAGE: String(e && e.message ? e.message : e), STACK: e && e.stack ? String(e.stack).slice(0, 500) : "", SEVERITY: "MEDIUM", CONTEXT: key });
      return { ok: false, command: key, error: String(e && e.message ? e.message : e) };
    }
  }

  g.CHIROMBE_ENGINE = {
    version: VERSION,
    boot: boot,
    status: status,
    selfTest: selfTest,
    discover: discover,
    connect: connect,
    command: command,
    verifyArtifact: verifyArtifact,
    bootLog: function () { return bootLog.slice(); },
    graph: function () { return graph.slice(); }
  };

  function start() {
    safeRegister();
    var ready = boot();
    if (g.addEventListener) {
      g.addEventListener("load", function () {
        discover();
        safeRegister();
      });
    }
    return ready;
  }

  if (g.document && g.document.readyState === "loading" && g.document.addEventListener) {
    g.document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})(typeof window !== "undefined" ? window : globalThis);
