/* CHIROMBE ENGINE — policy, catalogue, utilities.
   Additive integration layer. Does not replace any existing module. */
(function (g) {
  "use strict";
  if (g.CHIROMBE_ENGINE_POLICY) return;

  function uid(prefix) {
    return (prefix || "ID") + "-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 1e6).toString(36);
  }

  function hashSync(input) {
    var str = String(input);
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).padStart(8, "0");
  }

  function now() { return new Date().toISOString(); }

  var POLICY = {
    NO_DELETE_BY_DEFAULT: true,
    NO_OVERWRITE_BY_DEFAULT: true,
    NO_BLIND_REWRITE: true,
    NO_BLIND_DEPLOY: true,
    NO_MEMORY_ERASURE: true,
    NO_HISTORY_ERASURE: true,
    NO_SILENT_MIGRATION: true,
    NO_UNVERSIONED_CHANGE: true,
    preservationMode: "ACTIVE",
    destructiveRewrite: "BLOCKED",
    memoryErasure: "BLOCKED",
    blindDeployment: "BLOCKED"
  };

  var CATALOGUE = [
    { id: "CHIROMBE_BUS", global: "ChirombeBus", file: "js/command-bus.js", optional: false, methods: ["registerCommand", "executeCommand", "listCommands"] },
    { id: "CHIROMBE_SYSTEM", global: "ChirombeSystem", file: "js/boot.js", optional: false, methods: [] },
    { id: "CHIROMBE_CORE", global: "ChirombeCore", file: "js/chirombe-core.js", optional: false, methods: ["pray", "evolve"] },
    { id: "CHIROMBE_MEMORY", global: "ChirombeState", file: "js/state-store.js", optional: false, methods: ["load", "save"] },
    { id: "CHIROMBE_HEALTH", global: "ChirombeHealth", file: "js/health.js", optional: false, methods: ["snapshot", "capabilities"] },
    { id: "CHIROMBE_WATCHDOG", global: "ChirombeWatchdog", file: "js/watchdog.js", optional: false, methods: ["tick"] },
    { id: "CHIROMBE_AUDIT", global: "ChirombeAudit", file: "js/audit-chain.js", optional: false, methods: ["head", "append", "verify", "export"] },
    { id: "CHIROMBE_DEFENCE", global: "ZionProtect", file: "js/zion-protection-core.js", optional: true, methods: ["snapshot"] },
    { id: "CHIROMBE_ORCHESTRATOR", global: "CHIROMBE_AUTOSTART", file: "js/chirombe-autostart.js", optional: true, methods: ["status", "discover", "cycle", "start", "stop"] },
    { id: "ZCCA", global: "ZCCA", file: "js/zcca.js", optional: true, methods: ["command", "getFamily", "activate", "protect"] },
    { id: "CHIROMBE_INTENTION", global: "MwarindiCovenant", file: "js/mwarindimwari-covenant.js", optional: true, methods: ["status", "remind", "seal"] },
    { id: "CHIROMBE_RESONANCE", global: "ChirombeResonance", file: "js/resonance-engine.js", optional: true, methods: ["status", "measure", "activate"] },
    { id: "CHIROMBE_GUARDIAN", global: "CHIROMBE_GUARDIAN", file: "js/guardian-matrix.js", optional: true, methods: ["status", "start", "pause"] },
    { id: "CHIROMBE_LITURGY", global: "CHIROMBE_LITURGY", file: "js/liturgy-matrix.js", optional: true, methods: [] },
    { id: "CHIROMBE_PIONEER", global: "CHIROMBE_PIONEER_BRAIN", file: "js/pioneer-brain.js", optional: true, methods: ["status", "discover", "cycle"] },
    { id: "CHIROMBE_LOGGER", global: "Chirombe", file: "js/chirombe.js", optional: true, methods: ["log"] },
    { id: "CHIROMBE_WORKERS", global: "CHIROMBE_WORKERS", file: "workers/", optional: true, methods: ["list"], note: "Spawned by connect-and-play." },
    { id: "CHIROMBE_EVOLUTION", global: null, file: null, optional: true, methods: ["observe", "propose", "sandbox", "score"], note: "MISSING_OPTIONAL_COMPONENT. ChirombeCore.evolve is a different live function and is not replaced." },
    { id: "CHIROMBE_PATHWAYS", global: null, file: null, optional: true, methods: [], note: "MISSING_OPTIONAL_COMPONENT" },
    { id: "CHIROMBE_KNOWLEDGE", global: null, file: null, optional: true, methods: [], note: "MISSING_OPTIONAL_COMPONENT. Engine keeps its own knowledge ledger." },
    { id: "CHIROMBE_BUILD", global: null, file: "engine/headless-runner.mjs", optional: true, methods: [], note: "Node script only. Not a browser global. Not invoked by the engine." },
    { id: "CHIROMBE_BACKEND", global: null, file: null, optional: true, methods: [], note: "MISSING_OPTIONAL_COMPONENT. Public surface is static JSON, not a REST API." },
    { id: "CHIROMBE_BLOODLINE", global: null, file: "data/family.json", optional: true, methods: [], note: "Lineage is data plus ChirombeCore.family / ZCCA. No CHIROMBE_BLOODLINE global." },
    { id: "CHIROMBE_LEGACY", global: null, file: "index.html", optional: true, methods: [], note: "Legacy surface is index.html. No CHIROMBE_LEGACY global." },
    { id: "CHEP16", global: null, file: null, optional: true, methods: [], note: "MISSING_OPTIONAL_COMPONENT" },
    { id: "SENTINEL_ENTITY", global: null, file: null, optional: true, methods: [], note: "MISSING_OPTIONAL_COMPONENT. Pioneer brain is adjacent, not this module." }
  ];

  var WORKER_FILES = [
    "workers/audit-worker.js",
    "workers/cloak-worker.js",
    "workers/covenant-worker.js",
    "workers/decoy-worker.js",
    "workers/discovery-worker.js",
    "workers/evolve-worker.js",
    "workers/family-worker.js",
    "workers/graph-worker.js",
    "workers/prayer-worker.js",
    "workers/pulse-worker.js",
    "workers/threat-worker.js",
    "workers/watch-worker.js"
  ];

  var ARTIFACT = {
    path: "chirombe engine",
    bytes: 728908,
    sha256: "f1df5408bf0374365fb6149dc35a9b992a5645a671d921e804634f3e2f844ddc",
    lines: 40009,
    parseable: false,
    corruptionLine: 1869,
    corruptionMarker: "Expected branch to point to",
    disposition: "PRESERVED_UNEXECUTED",
    partsClaimed: ["01 CORE KERNEL", "02 PERSISTENT EVOLUTIONARY MEMORY", "04", "05", "10 BACKEND"],
    embeddedScriptTagsReferencingMissingFiles: [
      "chirombe-memory.js",
      "chirombe-workers.js",
      "chirombe-evolution.js",
      "chirombe-pathways.js",
      "chirombe-watchdog.js",
      "chirombe-knowledge.js",
      "chirombe-build.js",
      "chirombe-orchestrator.js",
      "chirombe-backend.js",
      "chirombe-defence.js",
      "chirombe-bloodline.js",
      "chirombe-legacy.js",
      "chirombe-intention.js",
      "chirombe-resonance-chamber.js"
    ],
    globalsIfIsolatedPrefixParsed: ["CHIROMBE", "CHIROMBE_CORE", "CHIROMBE_MEMORY"]
  };

  var ADD1 = {
    path: "add 1",
    bytes: 411510,
    sha256: "9054e656d0576ac830c28c80ff3c87cecf52da68f864fcc7c383aa10438c19ae",
    kind: "html-archive",
    doctypeCount: 18,
    disposition: "PRESERVED_UNEXECUTED"
  };

  g.CHIROMBE_ENGINE_POLICY = POLICY;
  g.CHIROMBE_ENGINE_CATALOGUE = CATALOGUE;
  g.CHIROMBE_ENGINE_WORKER_FILES = WORKER_FILES;
  g.CHIROMBE_ENGINE_ARTIFACT = ARTIFACT;
  g.CHIROMBE_ENGINE_ADD1 = ADD1;
  g.CHIROMBE_ENGINE_UTIL = { uid: uid, hashSync: hashSync, now: now };
})(typeof window !== "undefined" ? window : globalThis);
