/* CHIROMBE ENGINE — append-only journal, error registry, recovery records.
   Never deletes historical records. Overflow moves into an archive key. */
(function (g) {
  "use strict";
  if (g.CHIROMBE_ENGINE_LEDGER) return;

  var KEY_J = "CHIROMBE_ENGINE_JOURNAL_V1";
  var KEY_A = "CHIROMBE_ENGINE_JOURNAL_ARCHIVE_V1";
  var KEY_E = "CHIROMBE_ENGINE_ERRORS_V1";
  var KEY_R = "CHIROMBE_ENGINE_RECOVERY_V1";
  var HOT_MAX = 400;
  var memory = {};

  function utilHash(input) {
    if (g.CHIROMBE_ENGINE_UTIL && g.CHIROMBE_ENGINE_UTIL.hashSync) return g.CHIROMBE_ENGINE_UTIL.hashSync(input);
    var str = String(input);
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).padStart(8, "0");
  }

  function uid() {
    return g.CHIROMBE_ENGINE_UTIL ? g.CHIROMBE_ENGINE_UTIL.uid("EVT") : ("EVT-" + Date.now().toString(36));
  }

  function store() {
    try {
      if (g.localStorage && typeof g.localStorage.getItem === "function") return g.localStorage;
    } catch (e) {}
    return null;
  }

  function read(key) {
    var ls = store();
    var raw = null;
    try { raw = ls ? ls.getItem(key) : (memory[key] || null); } catch (e) { raw = memory[key] || null; }
    if (!raw) return [];
    try {
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [{ id: "UNRESOLVED_RECORD", key: key, raw: String(raw).slice(0, 180), status: "UNRESOLVED_RECORD" }];
    }
  }

  function write(key, value) {
    var text = JSON.stringify(value);
    memory[key] = text;
    var ls = store();
    if (!ls) return { persisted: false, reason: "NO_LOCAL_STORAGE" };
    try {
      ls.setItem(key, text);
      return { persisted: true };
    } catch (e) {
      return { persisted: false, reason: "QUOTA_OR_BLOCKED", error: String(e) };
    }
  }

  function append(event) {
    var chain = read(KEY_J).filter(function (row) { return row && row.status !== "UNRESOLVED_RECORD"; });
    var prev = chain.length ? chain[chain.length - 1].currentHash : "GENESIS";
    var parent = chain.length ? chain[chain.length - 1].id : "";
    var body = {
      id: (event && event.id) || uid(),
      timestamp: new Date().toISOString(),
      actor: "CHIROMBE_ENGINE",
      operation: (event && event.operation) || "NOTE",
      target: (event && event.target) || "",
      reason: (event && event.reason) || "",
      beforeHash: (event && event.beforeHash) || "",
      afterHash: (event && event.afterHash) || "",
      validation: (event && event.validation) || "",
      result: (event && event.result) || "",
      rollback: (event && event.rollback) || "",
      parentEvent: (event && event.parentEvent) || parent
    };
    body.previousHash = prev;
    var hashed = {};
    Object.keys(body).forEach(function (k) {
      if (k !== "previousHash" && k !== "currentHash" && k !== "persisted") hashed[k] = body[k];
    });
    body.currentHash = utilHash(prev + JSON.stringify(hashed));
    chain.push(body);
    if (chain.length > HOT_MAX) {
      var archive = read(KEY_A).filter(function (row) { return row && row.id !== "UNRESOLVED_RECORD"; });
      var overflow = chain.slice(0, chain.length - HOT_MAX);
      write(KEY_A, archive.concat(overflow));
      chain = chain.slice(chain.length - HOT_MAX);
    }
    var saved = write(KEY_J, chain);
    body.persisted = saved.persisted;
    return body;
  }

  function verify() {
    var chain = read(KEY_J);
    var breaks = [];
    for (var i = 0; i < chain.length; i++) {
      var row = chain[i];
      if (!row || row.status === "UNRESOLVED_RECORD") {
        breaks.push({ index: i, reason: "UNRESOLVED_RECORD" });
        continue;
      }
      var prev = i === 0 ? "GENESIS" : chain[i - 1].currentHash;
      if (row.previousHash !== prev) breaks.push({ index: i, id: row.id, reason: "PREVIOUS_HASH_MISMATCH" });
      var copy = {};
      Object.keys(row).forEach(function (k) {
        if (k !== "previousHash" && k !== "currentHash" && k !== "persisted") copy[k] = row[k];
      });
      var expect = utilHash(row.previousHash + JSON.stringify(copy));
      if (expect !== row.currentHash) breaks.push({ index: i, id: row.id, reason: "CURRENT_HASH_MISMATCH" });
    }
    return { ok: breaks.length === 0, length: chain.length, breaks: breaks };
  }

  function recordError(err) {
    var list = read(KEY_E).filter(function (row) { return row && row.ERROR_ID; });
    var message = (err && err.MESSAGE) || "unknown";
    var moduleName = (err && err.MODULE) || "CHIROMBE_ENGINE";
    var existing = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].MESSAGE === message && list[i].MODULE === moduleName) existing = list[i];
    }
    var stamp = new Date().toISOString();
    if (existing) {
      existing.LAST_SEEN = stamp;
      existing.COUNT = (existing.COUNT || 1) + 1;
      write(KEY_E, list);
      return existing;
    }
    var row = {
      ERROR_ID: (err && err.ERROR_ID) || uid().replace("EVT", "ERR"),
      MODULE: moduleName,
      TIMESTAMP: stamp,
      ERROR_TYPE: (err && err.ERROR_TYPE) || "UNKNOWN",
      MESSAGE: message,
      STACK: (err && err.STACK) || "",
      CONTEXT: (err && err.CONTEXT) || "",
      SEVERITY: (err && err.SEVERITY) || "LOW",
      FIRST_SEEN: stamp,
      LAST_SEEN: stamp,
      COUNT: 1,
      POSSIBLE_CAUSES: (err && err.POSSIBLE_CAUSES) || [],
      PROPOSED_FIXES: (err && err.PROPOSED_FIXES) || [],
      VALIDATION_STATUS: "UNVERIFIED",
      RESOLUTION_STATUS: "OPEN"
    };
    list.push(row);
    write(KEY_E, list);
    return row;
  }

  function recordRecovery(rec) {
    var list = read(KEY_R).filter(function (row) { return row && row.id; });
    var row = {
      id: (rec && rec.id) || uid().replace("EVT", "REC"),
      timestamp: new Date().toISOString(),
      state: (rec && rec.state) || "DETECTED",
      target: (rec && rec.target) || "",
      reason: (rec && rec.reason) || "",
      lastKnownHealthy: (rec && rec.lastKnownHealthy) || null,
      proposal: (rec && rec.proposal) || "",
      applied: false
    };
    list.push(row);
    write(KEY_R, list);
    return row;
  }

  g.CHIROMBE_ENGINE_LEDGER = {
    append: append,
    verify: verify,
    exportJournal: function () { return read(KEY_J).slice(); },
    exportArchive: function () { return read(KEY_A).slice(); },
    recordError: recordError,
    listErrors: function () { return read(KEY_E).slice(); },
    recordRecovery: recordRecovery,
    listRecovery: function () { return read(KEY_R).slice(); },
    status: function () {
      return {
        journal: read(KEY_J).length,
        archive: read(KEY_A).length,
        errors: read(KEY_E).length,
        recovery: read(KEY_R).length,
        chain: verify(),
        erasure: "BLOCKED"
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
