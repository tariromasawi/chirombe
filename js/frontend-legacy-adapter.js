/* CHIROMBE LEGACY FRONTEND ADAPTER
   Presentation bridge only. Does not clone the runtime.
   Does not execute the archived "chirombe engine" artifact. */
(function (g) {
  "use strict";

  if (g.CHIROMBE_LEGACY_FRONTEND && g.CHIROMBE_LEGACY_FRONTEND.__bound) {
    return;
  }

  var VERSION = "1.0.0";
  var UI_PREF_KEY = "CHIROMBE_LEGACY_UI_V1";
  var HEARTBEAT_MS = 5000;
  var ARTIFACT_PATH = "chirombe engine";

  var KNOWN = [
    { id: "boot", global: "ChirombeSystem", file: "js/boot.js" },
    { id: "bus", global: "ChirombeBus", file: "js/command-bus.js" },
    { id: "state", global: "ChirombeState", file: "js/state-store.js" },
    { id: "audit", global: "ChirombeAudit", file: "js/audit-chain.js" },
    { id: "health", global: "ChirombeHealth", file: "js/health.js" },
    { id: "watchdog", global: "ChirombeWatchdog", file: "js/watchdog.js" },
    { id: "protection", global: "ZionProtect", file: "js/zion-protection-core.js" },
    { id: "covenant", global: "MwarindiCovenant", file: "js/mwarindimwari-covenant.js" },
    { id: "zcca", global: "ZCCA", file: "js/zcca.js" },
    { id: "core", global: "ChirombeCore", file: "js/chirombe-core.js" },
    { id: "chirombe", global: "Chirombe", file: "js/chirombe.js" },
    { id: "resonance", global: "ChirombeResonance", file: "js/resonance-engine.js" },
    { id: "autostart", global: "CHIROMBE_AUTOSTART", file: "js/chirombe-autostart.js" },
    { id: "guardian", global: "CHIROMBE_GUARDIAN", file: "js/guardian-matrix.js" },
    { id: "liturgy", global: "CHIROMBE_LITURGY", file: "js/liturgy-matrix.js" },
    { id: "pioneer", global: "CHIROMBE_PIONEER_BRAIN", file: "js/pioneer-brain.js" },
    { id: "engine", global: "CHIROMBE_ENGINE", file: "js/engine/chirombe-engine.js" },
    { id: "matrix", global: "CHIROMBE_DIVINE_MATRIX", file: null }
  ];

  var LIVE_COMMANDS = {
    status: true,
    health: true,
    version: true,
    capabilities: true,
    "family.list": true,
    selftest: true,
    integrity: true,
    audit: true,
    "nim.reinforce": true
  };

  function readyOf(name) {
    var obj = g[name];
    return !!(obj && typeof obj === "object");
  }

  function protectionStatus() {
    if (readyOf("ZionProtect") || readyOf("ZionProtectionCore")) {
      try {
        if (g.ZionProtect && typeof g.ZionProtect.snapshot === "function") {
          var snap = g.ZionProtect.snapshot();
          if (snap && snap.nodes && snap.nodes.length) return "READY";
        }
        return "READY";
      } catch (e) {
        return "DEGRADED";
      }
    }
    return "UNAVAILABLE";
  }

  function engineRegistry() {
    var engines = {};
    var ready = 0;
    KNOWN.forEach(function (row) {
      var present = readyOf(row.global);
      if (present) ready += 1;
      engines[row.id] = {
        global: row.global,
        file: row.file,
        status: present ? "READY" : (row.global === "CHIROMBE_DIVINE_MATRIX" ? "OPTIONAL" : "UNAVAILABLE")
      };
    });
    return { engines: engines, ready: ready, total: KNOWN.length };
  }

  function unifiedStatus() {
    if (g.CHIROMBE_UNIFIED && g.CHIROMBE_UNIFIED.status && g.CHIROMBE_UNIFIED.status !== "BOOT") {
      return g.CHIROMBE_UNIFIED.status;
    }
    if (g.ChirombeSystem && g.ChirombeSystem.status) return g.ChirombeSystem.status;
    if (g.ChirombeHealth && typeof g.ChirombeHealth.snapshot === "function") {
      return g.ChirombeHealth.snapshot().status || "UNKNOWN";
    }
    return readyOf("ChirombeBus") ? "ONLINE" : "UNAVAILABLE";
  }

  function loadUiPrefs() {
    try {
      return JSON.parse(localStorage.getItem(UI_PREF_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function saveUiPrefs(patch) {
    var cur = loadUiPrefs();
    Object.keys(patch || {}).forEach(function (k) { cur[k] = patch[k]; });
    try { localStorage.setItem(UI_PREF_KEY, JSON.stringify(cur)); } catch (e) {}
    return cur;
  }

  function execute(command, payload) {
    if (!LIVE_COMMANDS[command]) {
      return { ok: false, error: "LEGACY_UNAVAILABLE", command: command };
    }
    if (g.ChirombeBus && typeof g.ChirombeBus.executeCommand === "function") {
      return g.ChirombeBus.executeCommand(command, payload || {});
    }
    return { ok: false, error: "COMMAND_BUS_UNAVAILABLE", command: command };
  }

  function healthSnapshot() {
    if (g.ChirombeHealth && typeof g.ChirombeHealth.snapshot === "function") {
      return g.ChirombeHealth.snapshot();
    }
    return { status: "UNAVAILABLE" };
  }

  function auditHead() {
    if (g.ChirombeAudit && typeof g.ChirombeAudit.head === "function") {
      return g.ChirombeAudit.head();
    }
    return null;
  }

  function matrixStatus() {
    if (!g.CHIROMBE_DIVINE_MATRIX) return { present: false };
    try {
      if (typeof g.CHIROMBE_DIVINE_MATRIX.status === "function") {
        return { present: true, status: g.CHIROMBE_DIVINE_MATRIX.status() };
      }
      return { present: true, status: g.CHIROMBE_DIVINE_MATRIX };
    } catch (e) {
      return { present: true, error: String(e) };
    }
  }

  function snapshot() {
    var registry = engineRegistry();
    var health = healthSnapshot();
    var prot = protectionStatus();
    return {
      frontend: "ONLINE",
      runtime: readyOf("ChirombeSystem") || readyOf("CHIROMBE_ENGINE") ? "ONLINE" : "UNAVAILABLE",
      commandBus: readyOf("ChirombeBus") ? "READY" : "UNAVAILABLE",
      state: readyOf("ChirombeState") ? "READY" : "UNAVAILABLE",
      audit: readyOf("ChirombeAudit") ? "READY" : "UNAVAILABLE",
      health: readyOf("ChirombeHealth") ? (health.status || "READY") : "UNAVAILABLE",
      protection: prot,
      enginesReady: registry.ready,
      enginesTotal: registry.total,
      engines: registry.engines,
      unified: unifiedStatus(),
      healthDetail: health,
      auditHead: auditHead(),
      matrix: matrixStatus(),
      artifactProtected: true,
      artifactPath: ARTIFACT_PATH
    };
  }

  function text(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setLight(status) {
    var light = document.getElementById("chirombe-status-light");
    var label = document.getElementById("chirombe-system-status-text");
    if (label) label.textContent = status;
    if (!light) return;
    light.className = "chirombe-status-light";
    var n = String(status || "").toLowerCase();
    if (n === "healthy" || n === "ready" || n === "online") light.classList.add("ready");
    else if (n === "degraded" || n === "aging" || n === "stale") light.classList.add("degraded");
    else if (n === "failed" || n === "unavailable" || n === "offline") light.classList.add("failed");
    else light.classList.add("booting");
  }

  function logLine(message, level) {
    var log = document.getElementById("chirombe-event-log");
    if (!log) return;
    var row = document.createElement("div");
    row.className = "chirombe-log-line";
    var t = new Date().toISOString().split("T")[1].replace("Z", "").slice(0, 12);
    row.innerHTML = '<span class="chirombe-log-time">[' + t + "]</span> " +
      String(level || "info").toUpperCase() + " · " + String(message);
    log.insertBefore(row, log.firstChild);
    while (log.children.length > 80) log.removeChild(log.lastChild);
  }

  function paint(snap) {
    snap = snap || snapshot();
    text("legacy-diag-frontend", snap.frontend);
    text("legacy-diag-runtime", snap.runtime);
    text("legacy-diag-bus", snap.commandBus);
    text("legacy-diag-state", snap.state);
    text("legacy-diag-audit", snap.audit);
    text("legacy-diag-health", snap.health);
    text("legacy-diag-protection", snap.protection);
    text("legacy-diag-engines", snap.enginesReady + " / " + snap.enginesTotal + " READY");
    text("chirombe-metric-system", snap.unified || snap.runtime);
    text("chirombe-metric-engines", String(snap.enginesTotal));
    text("chirombe-metric-ready", String(snap.enginesReady));
    var degraded = 0;
    var failed = 0;
    Object.keys(snap.engines).forEach(function (k) {
      var st = snap.engines[k].status;
      if (st === "UNAVAILABLE") failed += 1;
    });
    text("chirombe-metric-degraded", String(degraded));
    text("chirombe-metric-failed", String(failed));
    var auditLabel = "WAITING";
    if (snap.auditHead) {
      auditLabel = snap.audit === "READY" ? ("SEQ " + (snap.auditHead.seq != null ? snap.auditHead.seq : "?")) : snap.audit;
    } else {
      auditLabel = snap.audit;
    }
    text("chirombe-metric-audit", auditLabel);
    text("legacy-matrix-status", snap.matrix.present ? "PRESENT (read-only)" : "NOT ATTACHED");
    setLight(snap.health === "HEALTHY" || snap.runtime === "ONLINE" ? (snap.health === "HEALTHY" ? "READY" : snap.health) : snap.runtime);
    var list = document.getElementById("legacy-engine-list");
    if (list) {
      list.innerHTML = "";
      Object.keys(snap.engines).forEach(function (id) {
        var e = snap.engines[id];
        var li = document.createElement("li");
        li.textContent = e.global + " — " + e.status + (e.file ? " (" + e.file + ")" : "");
        li.className = "legacy-engine-" + String(e.status).toLowerCase();
        list.appendChild(li);
      });
    }
    return snap;
  }

  function bindCommands() {
    var box = document.getElementById("legacy-command-box");
    if (!box || box.getAttribute("data-bound") === "1") return;
    box.setAttribute("data-bound", "1");
    var live = ["status", "health", "version", "capabilities", "family.list", "selftest", "integrity", "audit"];
    var unavailable = ["divine.matrix.init", "firebase.sync", "artifact.execute"];
    live.forEach(function (name) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "legacy-cmd";
      b.textContent = name;
      b.addEventListener("click", function () {
        var result = execute(name, {});
        logLine(name + " → " + (result.ok ? "ok" : (result.error || "fail")), result.ok ? "ok" : "warn");
        var out = document.getElementById("legacy-command-out");
        if (out) out.textContent = JSON.stringify(result, null, 2);
        paint();
      });
      box.appendChild(b);
    });
    unavailable.forEach(function (name) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "legacy-cmd legacy-cmd-dead";
      b.textContent = name + " · LEGACY / UNAVAILABLE";
      b.addEventListener("click", function () {
        logLine(name + " has no live command equivalent", "warn");
      });
      box.appendChild(b);
    });
  }

  function startHeartbeat() {
    if (g.__CHIROMBE_LEGACY_HEARTBEAT__) return;
    g.__CHIROMBE_LEGACY_HEARTBEAT__ = true;
    function beat() {
      if (!g.CHIROMBE_UNIFIED && !g.ChirombeSystem) {
        text("legacy-diag-runtime", "UNAVAILABLE");
        return;
      }
      paint();
    }
    beat();
    setInterval(beat, HEARTBEAT_MS);
  }

  function refuseArtifact() {
    if (g.__CHIROMBE_ARTIFACT_GUARD__) return;
    g.__CHIROMBE_ARTIFACT_GUARD__ = true;
    var blocked = [ARTIFACT_PATH, "./chirombe engine", "/chirombe engine"];
    var origCreate = document.createElement.bind(document);
    document.createElement = function (tag) {
      var el = origCreate(tag);
      if (String(tag).toLowerCase() === "script") {
        var desc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src");
        if (desc && desc.set) {
          Object.defineProperty(el, "src", {
            configurable: true,
            enumerable: true,
            get: function () { return desc.get.call(el); },
            set: function (v) {
              var s = String(v || "");
              if (blocked.some(function (p) { return s === p || s.indexOf("chirombe%20engine") !== -1 || /chirombe engine$/.test(s); })) {
                console.warn("[CHIROMBE LEGACY] blocked historical artifact load:", s);
                return;
              }
              desc.set.call(el, v);
            }
          });
        }
      }
      return el;
    };
  }

  function attachUnified() {
    var registry = engineRegistry();
    var facade = g.CHIROMBE_UNIFIED && typeof g.CHIROMBE_UNIFIED === "object" ? g.CHIROMBE_UNIFIED : {};
    facade.version = facade.version || VERSION;
    facade.phase = "LEGACY_FRONTEND";
    facade.status = unifiedStatus();
    facade.registry = facade.registry || {};
    facade.registry.engines = registry.engines;
    facade.frontend = "legacy";
    facade.sharedRuntime = true;
    g.CHIROMBE_UNIFIED = facade;
    return facade;
  }

  function noteAuditOnce() {
    if (g.__CHIROMBE_LEGACY_AUDIT_NOTED__) return;
    g.__CHIROMBE_LEGACY_AUDIT_NOTED__ = true;
    if (g.ChirombeAudit && typeof g.ChirombeAudit.append === "function") {
      g.ChirombeAudit.append("LEGACY_FRONTEND_ATTACHED", {
        version: VERSION,
        path: "index-legacy-backup.html"
      });
    }
  }

  var api = {
    version: VERSION,
    __bound: true,
    status: function () { return unifiedStatus(); },
    engines: function () { return engineRegistry().engines; },
    execute: execute,
    snapshot: snapshot,
    health: healthSnapshot,
    audit: function () {
      return g.ChirombeAudit && typeof g.ChirombeAudit.export === "function"
        ? g.ChirombeAudit.export()
        : [];
    },
    paint: paint,
    prefs: { load: loadUiPrefs, save: saveUiPrefs }
  };

  g.CHIROMBE_LEGACY_FRONTEND = api;

  function bootUi() {
    refuseArtifact();
    attachUnified();
    bindCommands();
    noteAuditOnce();
    paint();
    startHeartbeat();
    logLine("Legacy frontend bound to live CHIROMBE runtime. Mwari ndi Mwari.", "ok");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootUi);
  } else {
    bootUi();
  }
})(typeof window !== "undefined" ? window : globalThis);
