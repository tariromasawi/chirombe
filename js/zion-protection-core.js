/**
 * ZIONCORE SQIE v2.0 — HMAC-SHA256 audit + NIM protective feedback.
 * Loaded by the live index via chirombe.js. Does not replace existing UI.
 * HMAC here proves in-session chain integrity. A key shipped in page JS is not a server secret.
 */
(function (g) {
  "use strict";

  class ZionProtectionCore {
    constructor() {
      this.auditChain = [];
      this.nodes = new Map();
      this.secretKey = null;
      this.initialized = false;
    }

    async initializeCore() {
      if (this.initialized && this.secretKey) return;
      if (g.crypto && crypto.subtle) {
        try {
          this.secretKey = await crypto.subtle.generateKey(
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign", "verify"]
          );
        } catch (e) {
          const raw = new TextEncoder().encode("ZIONCORE-SQIE-2.0-SESSION");
          this.secretKey = await crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
        }
      }
      this.initialized = true;
      await this.logAuditEvent("CORE_INITIALIZED", { protectionState: "ARMED" });
    }

    async generateHash(data, previousHash) {
      const payload = JSON.stringify(data) + previousHash;
      if (this.secretKey && crypto.subtle) {
        const sig = await crypto.subtle.sign("HMAC", this.secretKey, new TextEncoder().encode(payload));
        return Array.from(new Uint8Array(sig)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
      }
      var h = 0;
      for (var i = 0; i < payload.length; i++) h = (h * 33 + payload.charCodeAt(i)) >>> 0;
      return ("00000000" + h.toString(16)).slice(-8);
    }

    async logAuditEvent(eventType, payload) {
      if (!this.initialized) await this.initializeCore();
      var previousHash = this.auditChain.length
        ? this.auditChain[this.auditChain.length - 1].hash
        : "0000000000000000000000000000000000000000000000000000000000000000";
      var eventData = { timestamp: new Date().toISOString(), eventType: eventType, payload: payload };
      var hash = await this.generateHash(eventData, previousHash);
      var record = Object.assign({}, eventData, { previousHash: previousHash, hash: hash });
      this.auditChain.push(record);
      if (this.auditChain.length > 400) this.auditChain = this.auditChain.slice(-400);
      if (g.Chirombe && Chirombe.log) Chirombe.log("AUDIT", eventType + " " + String(hash).slice(0, 12));
      var feed = document.getElementById("feed") || document.getElementById("zcca-events");
      if (feed) {
        var row = document.createElement("div");
        row.textContent = eventData.timestamp.slice(11, 19) + "  AUDIT  " + eventType + "  " + String(hash).slice(0, 12);
        feed.prepend(row);
      }
      return record;
    }

    registerNode(id, label, initialResilience) {
      if (initialResilience == null) initialResilience = 1;
      this.nodes.set(id, { id: id, label: label, resilience: initialResilience, vulnerability: 0, connections: [] });
      this.logAuditEvent("NODE_REGISTERED", { id: id, label: label, initialResilience: initialResilience });
    }

    connectNodes(a, b) {
      if (!this.nodes.has(a) || !this.nodes.has(b)) return;
      this.nodes.get(a).connections.push(b);
      this.nodes.get(b).connections.push(a);
      this.logAuditEvent("NODES_CONNECTED", { nodeAId: a, nodeBId: b });
    }

    async executeProtectiveReinforcement(targetNodeId, anomalyImpact) {
      var node = this.nodes.get(targetNodeId);
      if (!node) return null;
      node.vulnerability = Math.min(1, node.vulnerability + anomalyImpact);
      node.resilience = Math.min(1, node.resilience + (1 - node.vulnerability) * 0.85);
      node.vulnerability = Math.max(0, node.vulnerability - 0.5);
      node.connections.forEach(function (id) {
        var n = this.nodes.get(id);
        if (n) n.resilience = Math.min(1, n.resilience + 0.15);
      }, this);
      await this.logAuditEvent("PROTECTIVE_REINFORCEMENT_EXECUTED", {
        targetNodeId: targetNodeId,
        restoredResilience: node.resilience,
        activeVulnerability: node.vulnerability,
        neighborsShielded: node.connections.length
      });
      return { nodeId: targetNodeId, status: "STABILIZED", resilienceIndex: node.resilience };
    }

    snapshot() {
      var out = [];
      this.nodes.forEach(function (n) { out.push({ id: n.id, label: n.label, resilience: +n.resilience.toFixed(3), vulnerability: +n.vulnerability.toFixed(3), links: n.connections.length }); });
      return { nodes: out, auditLength: this.auditChain.length, head: this.auditChain.length ? this.auditChain[this.auditChain.length - 1].hash : null };
    }
  }

  var system = new ZionProtectionCore();
  g.ZionProtectionCore = ZionProtectionCore;
  g.ZionProtect = system;

  function wireFamily(members) {
    if (!members || !members.length) return;
    members.forEach(function (m, i) {
      var id = m.id || ("FAM-" + i);
      if (!system.nodes.has(id)) system.registerNode(id, m.name || m.label || id, 0.92);
    });
    for (var i = 1; i < members.length; i++) {
      var a = members[i - 1].id || ("FAM-" + (i - 1));
      var b = members[i].id || ("FAM-" + i);
      system.connectNodes(a, b);
    }
  }

  system.initializeCore().then(function () {
    fetch("./data/family.json").then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (d && d.members) wireFamily(d.members);
      var ids = Array.from(system.nodes.keys());
      if (ids[0]) system.executeProtectiveReinforcement(ids[0], 0.2);
    }).catch(function () {
      system.registerNode("N1", "Primary Node", 0.95);
      system.registerNode("N2", "Secondary Shield", 0.9);
      system.connectNodes("N1", "N2");
      system.executeProtectiveReinforcement("N1", 0.35);
    });
  });

  window.addEventListener("ZCCA_FAMILY_COVER", function () {
    var ids = Array.from(system.nodes.keys());
    if (ids.length) system.executeProtectiveReinforcement(ids[ids.length - 1], 0.12);
  });

  if (g.ChirombeBus) {
    ChirombeBus.registerCommand("integrity", function () { return system.snapshot(); }, { subsystem: "protect" });
    ChirombeBus.registerCommand("audit", function () { return system.auditChain.slice(-20); }, { subsystem: "protect" });
    ChirombeBus.registerCommand("nim.reinforce", function (args) {
      var id = (args && args.id) || Array.from(system.nodes.keys())[0];
      return system.executeProtectiveReinforcement(id, (args && args.impact) || 0.25);
    }, { subsystem: "nim" });
  }
})(typeof window !== "undefined" ? window : globalThis);
