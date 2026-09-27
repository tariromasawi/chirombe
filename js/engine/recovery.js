/* Rebuilds Chirombe from hash-pinned files.
   A bad copy is quarantined. A healthy core is not replaced.
   This cannot defend a host that rewrites both the files and the pin. */
(function (g) {
  "use strict";
  if (g.CHIROMBE_RECOVERY) return;

  function quarantine(name, detail) {
    if (!g.CHIROMBE_QUARANTINE) g.CHIROMBE_QUARANTINE = [];
    var row = { name: name, at: new Date().toISOString(), detail: detail || {} };
    g.CHIROMBE_QUARANTINE.push(row);
    if (g.CHIROMBE_ENGINE_LEDGER && g.CHIROMBE_ENGINE_LEDGER.append) {
      try {
        g.CHIROMBE_ENGINE_LEDGER.append({
          operation: "QUARANTINE",
          target: name,
          reason: "Untrusted or missing material. Previous records were not deleted.",
          result: "HELD",
          validation: "NO_ERASE",
          rollback: "Leave the quarantine list. Do not execute the bad bytes."
        });
      } catch (e) {}
    }
    return row;
  }

  function coreIntact() {
    return !!(g.CHIROMBE && (g.CHIROMBE.name || g.CHIROMBE.version || g.CHIROMBE.registerModule));
  }

  function swarmIntact() {
    return !!(g.CHIROMBE_WORKERS && g.CHIROMBE_WORKERS.name === "CHIROMBE_WORKER_SWARM" && typeof g.CHIROMBE_WORKERS.createWorker === "function");
  }

  function restoreSwarm() {
    if (swarmIntact()) return Promise.resolve({ state: "INTACT", rebuilt: false });
    if (!coreIntact()) return Promise.resolve({ state: "HELD", reason: "CORE_ABSENT" });
    if (!g.__CHIROMBE_PART03_SOURCE__) return Promise.resolve({ state: "HELD", reason: "NO_TRUSTED_PART03" });
    if (g.__CHIROMBE_SWARM_REBUILDS__ >= 1) return Promise.resolve({ state: "REBUILD_HELD", reason: "ONE_SWARM_REBUILD_PER_PAGE" });
    g.__CHIROMBE_SWARM_REBUILDS__ = 1;
    if (!g.document || typeof Blob === "undefined" || !g.URL) return Promise.resolve({ state: "HELD", reason: "NO_DOCUMENT" });
    var previous = g.CHIROMBE_WORKERS || null;
    if (previous) quarantine("CHIROMBE_WORKERS", { replaced: false, held: true, name: previous.name || "UNNAMED" });
    return new Promise(function (resolve) {
      var blob = new Blob([g.__CHIROMBE_PART03_SOURCE__], { type: "text/javascript" });
      var url = g.URL.createObjectURL(blob);
      var script = g.document.createElement("script");
      script.src = url;
      script.onload = function () {
        g.URL.revokeObjectURL(url);
        if (g.CHIROMBE_KERNEL_BRIDGE && g.CHIROMBE_KERNEL_BRIDGE.adoptSwarm) g.CHIROMBE_KERNEL_BRIDGE.adoptSwarm();
        resolve({ state: swarmIntact() ? "REBUILT" : "REBUILD_FAILED", rebuilt: swarmIntact() });
      };
      script.onerror = function () {
        g.URL.revokeObjectURL(url);
        if (previous) g.CHIROMBE_WORKERS = previous;
        resolve({ state: "REBUILD_FAILED" });
      };
      (g.document.head || g.document.body).appendChild(script);
    });
  }

  function rebuild() {
    if (coreIntact() && swarmIntact()) return Promise.resolve({ state: "INTACT", core: true, swarm: true });
    var swarm = restoreSwarm();
    if (!coreIntact() && g.CHIROMBE_KERNEL_BRIDGE && g.CHIROMBE_KERNEL_BRIDGE.rebuild) {
      return g.CHIROMBE_KERNEL_BRIDGE.rebuild();
    }
    return swarm;
  }

  function inspect() {
    if (g.__CHIROMBE_KERNEL_LOADING__ || !g.__CHIROMBE_KERNEL_LOADED__) {
      var waiting = { core: "BOOTING", swarm: "BOOTING", recovery: "WAITING_FOR_BOOT", at: new Date().toISOString() };
      g.CHIROMBE_RECOVERY_STATUS = waiting;
      if (!g.__CHIROMBE_RECOVERY_WAIT__ && g.setTimeout && (g.__CHIROMBE_RECOVERY_TRIES__ || 0) < 8) {
        g.__CHIROMBE_RECOVERY_WAIT__ = true;
        g.__CHIROMBE_RECOVERY_TRIES__ = (g.__CHIROMBE_RECOVERY_TRIES__ || 0) + 1;
        g.setTimeout(function () {
          g.__CHIROMBE_RECOVERY_WAIT__ = false;
          inspect();
        }, 3000);
      }
      return waiting;
    }
    var report = { core: coreIntact() ? "INTACT" : "MISSING", swarm: swarmIntact() ? "INTACT" : "MISSING", at: new Date().toISOString() };
    if (report.core === "MISSING" || report.swarm === "MISSING") report.recovery = "SCHEDULED";
    else report.recovery = "NOT_REQUIRED";
    g.CHIROMBE_RECOVERY_STATUS = report;
    if (report.recovery === "SCHEDULED") rebuild();
    return report;
  }

  function start() {
    if (g.CHIROMBE_SCHEDULER && g.CHIROMBE_SCHEDULER.register) {
      g.CHIROMBE_SCHEDULER.register("SLOW", "trusted-rebuild", inspect);
    } else if (!g.__CHIROMBE_RECOVERY_TIMER__ && g.setInterval) {
      g.__CHIROMBE_RECOVERY_TIMER__ = g.setInterval(inspect, 20000);
    }
    setTimeout(inspect, 2500);
  }

  g.CHIROMBE_RECOVERY = { rebuild: rebuild, inspect: inspect, quarantine: quarantine, coreIntact: coreIntact, swarmIntact: swarmIntact };

  if (g.document && g.document.readyState === "loading" && g.document.addEventListener) {
    g.document.addEventListener("DOMContentLoaded", start, { once: true });
  } else if (g.document) start();
})(typeof window !== "undefined" ? window : globalThis);
