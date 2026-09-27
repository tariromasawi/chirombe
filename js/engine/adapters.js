/* CHIROMBE ENGINE — non-destructive adapters.
   Missing methods return { available:false, reason:"METHOD_NOT_AVAILABLE" }.
   Nothing here deletes, resets, or deploys. */
(function (g) {
  "use strict";
  if (g.CHIROMBE_ENGINE_ADAPTERS) return;

  function missing(reason) {
    return { available: false, reason: reason || "METHOD_NOT_AVAILABLE" };
  }

  function present(result) {
    return { available: true, result: result };
  }

  function call(obj, method, args) {
    if (!obj) return missing("MODULE_NOT_AVAILABLE");
    if (typeof obj[method] !== "function") return missing("METHOD_NOT_AVAILABLE");
    try {
      return present(obj[method].apply(obj, args || []));
    } catch (e) {
      return { available: true, failed: true, error: String(e && e.message ? e.message : e) };
    }
  }

  function methodsOf(obj) {
    if (!obj || (typeof obj !== "object" && typeof obj !== "function")) return [];
    var names = [];
    try {
      Object.keys(obj).forEach(function (k) {
        if (typeof obj[k] === "function") names.push(k);
      });
    } catch (e) {}
    return names;
  }

  function probeEntry(entry) {
    var obj = entry.global ? g[entry.global] : null;
    var methods = methodsOf(obj);
    var expected = entry.methods || [];
    var missingMethods = expected.filter(function (name) { return methods.indexOf(name) === -1; });
    var available = !!obj;
    var compatibility = !expected.length ? (available ? 1 : 0) : (expected.length - missingMethods.length) / expected.length;
    var status = !available ? "NOT_AVAILABLE" : (missingMethods.length ? "DEGRADED" : "VERIFIED");
    return {
      module: entry.id,
      global: entry.global,
      file: entry.file || null,
      optional: !!entry.optional,
      available: available,
      methods: methods,
      missing: available ? missingMethods : expected.slice(),
      compatibility: available ? compatibility : 0,
      status: status,
      note: entry.note || "",
      healthy: !available ? null : missingMethods.length === 0
    };
  }

  function create(ctx) {
    var ledger = ctx.ledger;

    function memoryApi() {
      var native = g.CHIROMBE_MEMORY;
      var state = g.ChirombeState;

      function bucket() {
        if (!state || !state.data || typeof state.data !== "object") return null;
        if (!state.data.engineIntegration || typeof state.data.engineIntegration !== "object") {
          state.data.engineIntegration = { createdAt: new Date().toISOString(), records: [] };
        }
        if (!Array.isArray(state.data.engineIntegration.records)) state.data.engineIntegration.records = [];
        return state.data.engineIntegration;
      }

      return {
        read: function (key) {
          if (native && typeof native.read === "function") return call(native, "read", [key]);
          if (native && typeof native.readRecord === "function") return call(native, "readRecord", [key]);
          var box = bucket();
          if (!box) {
            var fallback = ctx.memoryMirror || [];
            if (!key) return present(fallback.slice());
            return present(fallback.filter(function (row) { return row.key === key; }));
          }
          if (!key) return present({ schemaVersion: state.data.schemaVersion, records: box.records.slice(), note: "Original ChirombeState keys are not replaced." });
          return present(box.records.filter(function (row) { return row.key === key; }));
        },
        write: function (key, value) {
          if (key === "family" || key === "members" || key === "lineage") {
            return { available: false, reason: "LINEAGE_WRITE_BLOCKED", requiresExplicitDataOperation: true };
          }
          if (native && typeof native.write === "function") return call(native, "write", [key, value]);
          var row = { key: String(key || "note"), value: value, at: new Date().toISOString(), id: g.CHIROMBE_ENGINE_UTIL.uid("MEM") };
          var box = bucket();
          if (box) {
            box.records.push(row);
            if (typeof state.save === "function") {
              try { state.save(); } catch (e) {}
            }
            return present(row);
          }
          ctx.memoryMirror = ctx.memoryMirror || [];
          ctx.memoryMirror.push(row);
          return present(row);
        },
        search: function (query) {
          if (native && typeof native.search === "function") return call(native, "search", [query]);
          var q = String(query || "").toLowerCase();
          var read = this.read();
          var rows = [];
          if (read.result && Array.isArray(read.result.records)) rows = read.result.records;
          else if (Array.isArray(read.result)) rows = read.result;
          var hits = rows.filter(function (row) {
            return JSON.stringify(row).toLowerCase().indexOf(q) >= 0;
          });
          return present(hits);
        },
        snapshot: function () {
          if (native && typeof native.snapshot === "function") return call(native, "snapshot", []);
          if (native && typeof native.exportState === "function") return call(native, "exportState", []);
          return this.read();
        },
        export: function () { return this.snapshot(); },
        status: function () {
          return {
            nativeGlobal: !!native,
            stateStore: !!state,
            mode: native ? "NATIVE_CHIROMBE_MEMORY" : (state ? "CHIROMBE_STATE_NAMESPACE" : "ENGINE_MIRROR"),
            erasure: "BLOCKED"
          };
        }
      };
    }

    var logicalWorkers = {};

    function defineWorker(spec) {
      if (logicalWorkers[spec.id]) return { created: false, reason: "ALREADY_REGISTERED", worker: logicalWorkers[spec.id] };
      logicalWorkers[spec.id] = {
        id: spec.id,
        name: spec.name || spec.id,
        purpose: spec.purpose || "",
        priority: spec.priority || 5,
        status: "IDLE",
        lastRun: null,
        runCount: 0,
        failureCount: 0,
        health: "UNKNOWN",
        dependencies: spec.dependencies || [],
        fn: spec.fn
      };
      return { created: true, worker: publicWorker(logicalWorkers[spec.id]) };
    }

    function publicWorker(w) {
      return {
        id: w.id, name: w.name, purpose: w.purpose, priority: w.priority,
        status: w.status, lastRun: w.lastRun, runCount: w.runCount,
        failureCount: w.failureCount, health: w.health, dependencies: w.dependencies.slice()
      };
    }

    function runWorker(id, payload) {
      var w = logicalWorkers[id];
      if (!w) return missing("WORKER_NOT_REGISTERED");
      w.status = "RUNNING";
      try {
        var result = w.fn ? w.fn(payload || {}, ctx) : null;
        w.status = "IDLE";
        w.health = "OK";
        w.lastRun = new Date().toISOString();
        w.runCount += 1;
        return { available: true, worker: publicWorker(w), result: result };
      } catch (e) {
        w.status = "FAILED";
        w.health = "FAILED";
        w.failureCount += 1;
        w.lastRun = new Date().toISOString();
        w.runCount += 1;
        if (ledger) ledger.recordError({ MODULE: id, ERROR_TYPE: "RUNTIME", MESSAGE: String(e && e.message ? e.message : e), SEVERITY: "MEDIUM" });
        return { available: true, failed: true, worker: publicWorker(w), error: String(e && e.message ? e.message : e) };
      }
    }

    function ensureEngineWorkers() {
      var specs = [
        { id: "ENGINE_DISCOVERY", purpose: "Compare live globals to the catalogue", priority: 1, fn: function () { return ctx.discover && ctx.discover(); } },
        { id: "ENGINE_CONNECTOR", purpose: "Refresh the connection graph", priority: 1, fn: function () { return ctx.connect && ctx.connect(); } },
        { id: "ENGINE_ANALYST", purpose: "Separate observation from hypothesis", priority: 2, fn: function () { return ctx.analyse && ctx.analyse(); } },
        { id: "ENGINE_MEMORY", purpose: "Report memory adapter status", priority: 2, fn: function () { return memoryApi().status(); } },
        { id: "ENGINE_INTEGRITY", purpose: "Verify the journal chain and policy flags", priority: 1, fn: function () { return ctx.integrity && ctx.integrity(); } },
        { id: "ENGINE_KNOWLEDGE", purpose: "List knowledge items without promoting assumptions", priority: 3, fn: function () { return ctx.knowledge.slice(); } },
        { id: "ENGINE_EVOLUTION", purpose: "List proposals. Does not apply them.", priority: 3, fn: function () { return ctx.proposals.slice(); } },
        { id: "ENGINE_PATHWAY", purpose: "Report pathway module availability", priority: 4, fn: function () { return probeEntry({ id: "CHIROMBE_PATHWAYS", global: null, methods: [], optional: true }); } },
        { id: "ENGINE_BUILD", purpose: "Describe the build gate. Does not deploy.", priority: 3, fn: function () { return buildApi().status(); } },
        { id: "ENGINE_RECOVERY", purpose: "List recovery records", priority: 2, fn: function () { return ledger ? ledger.listRecovery() : []; } },
        { id: "ENGINE_CONTINUITY", purpose: "Report journal continuity", priority: 2, fn: function () { return ledger ? ledger.status() : missing("LEDGER_NOT_AVAILABLE"); } },
        { id: "ENGINE_EXTERNAL_AI", purpose: "Report the external AI gateway", priority: 4, fn: function () { return externalAI().status(); } }
      ];
      specs.forEach(defineWorker);
    }

    function workersApi() {
      ensureEngineWorkers();
      return {
        list: function () {
          return {
            available: true,
            logical: Object.keys(logicalWorkers).map(function (id) { return publicWorker(logicalWorkers[id]); }),
            files: (g.CHIROMBE_ENGINE_WORKER_FILES || []).map(function (file) {
              return { file: file, spawned: false, status: "DISCOVERED", note: "Not started by the engine." };
            }),
            browserWorker: typeof g.Worker === "function"
          };
        },
        run: function (id, payload) { return runWorker(id, payload); },
        register: function (spec) {
          if (!spec || !spec.id) return missing("WORKER_ID_REQUIRED");
          return defineWorker(spec);
        },
        status: function () { return this.list(); }
      };
    }

    function orchestratorApi() {
      return {
        submit: function (objective) {
          var native = g.CHIROMBE_ORCHESTRATOR;
          if (native && typeof native.submit === "function") return call(native, "submit", [objective]);
          var task = {
            id: g.CHIROMBE_ENGINE_UTIL.uid("TASK"),
            objective: objective || "observe",
            timestamp: new Date().toISOString(),
            status: "QUEUED",
            route: g.CHIROMBE_AUTOSTART ? "CHIROMBE_AUTOSTART_OBSERVED" : (g.ChirombeBus ? "CHIROMBE_BUS" : "ENGINE_QUEUE")
          };
          ctx.tasks.push(task);
          if (g.ChirombeBus && typeof g.ChirombeBus.executeCommand === "function" && objective && objective.command) {
            var known = g.ChirombeBus.listCommands ? g.ChirombeBus.listCommands() : [];
            if (known.indexOf(objective.command) >= 0) {
              task.bus = g.ChirombeBus.executeCommand(objective.command, objective.args || {});
              task.status = task.bus && task.bus.ok ? "DONE" : "FAILED";
            } else {
              task.status = "HELD";
              task.reason = "COMMAND_NOT_ON_BUS";
            }
          } else {
            task.status = "RECORDED";
          }
          if (ledger) ledger.append({ operation: "ORCHESTRATE", target: task.id, reason: String(task.objective && task.objective.command || task.objective), result: task.status, validation: "NO_HIJACK" });
          return present(task);
        },
        status: function () {
          return {
            native: !!g.CHIROMBE_ORCHESTRATOR,
            autostart: !!g.CHIROMBE_AUTOSTART,
            bus: !!g.ChirombeBus,
            zccaPresent: !!g.ZCCA,
            zccaInvoked: false,
            tasks: ctx.tasks.length
          };
        }
      };
    }

    function knowledgeApi() {
      return {
        add: function (item) {
          var row = {
            id: (item && item.id) || g.CHIROMBE_ENGINE_UTIL.uid("KNOW"),
            source: (item && item.source) || "CHIROMBE_ENGINE",
            timestamp: new Date().toISOString(),
            category: (item && item.category) || "architecture",
            description: (item && item.description) || "",
            confidence: typeof (item && item.confidence) === "number" ? item.confidence : 0.5,
            provenance: (item && item.provenance) || "observation",
            relationships: (item && item.relationships) || [],
            status: (item && item.status) || "UNVERIFIED"
          };
          if (row.status === "KNOWN" && row.confidence < 0.6) row.status = "UNVERIFIED";
          ctx.knowledge.push(row);
          return present(row);
        },
        search: function (query) {
          var q = String(query || "").toLowerCase();
          return present(ctx.knowledge.filter(function (item) {
            return JSON.stringify(item).toLowerCase().indexOf(q) >= 0;
          }));
        },
        list: function () { return present(ctx.knowledge.slice()); },
        status: function () {
          var counts = { KNOWN: 0, UNKNOWN: 0, CONFLICTING: 0, UNVERIFIED: 0 };
          ctx.knowledge.forEach(function (item) {
            var key = counts.hasOwnProperty(item.status) ? item.status : "UNVERIFIED";
            counts[key] += 1;
          });
          return { items: ctx.knowledge.length, counts: counts, promotion: "ASSUMPTIONS_ARE_NOT_AUTO_FACTS" };
        }
      };
    }

    function evolutionApi() {
      return {
        propose: function (gap) {
          var proposal = {
            id: g.CHIROMBE_ENGINE_UTIL.uid("PROP"),
            timestamp: new Date().toISOString(),
            status: "PROPOSAL",
            gap: gap || "",
            hypothesis: (gap && gap.hypothesis) || "",
            applied: false,
            requiresApproval: true,
            pipeline: ["OBSERVE", "IDENTIFY_GAP", "FORM_HYPOTHESIS", "CREATE_PROPOSAL", "SANDBOX", "TEST", "SCORE", "REVIEW", "APPLY_BLOCKED"]
          };
          ctx.proposals.push(proposal);
          if (ledger) ledger.append({ operation: "PROPOSE", target: proposal.id, reason: String(proposal.gap && proposal.gap.summary || proposal.gap), result: "RECORDED", validation: "NOT_APPLIED" });
          return present(proposal);
        },
        sandbox: function (id) {
          var found = ctx.proposals.filter(function (p) { return p.id === id; })[0];
          if (!found) return missing("PROPOSAL_NOT_FOUND");
          found.sandbox = "DESK_REVIEW_ONLY";
          return present(found);
        },
        score: function (id) {
          var found = ctx.proposals.filter(function (p) { return p.id === id; })[0];
          if (!found) return missing("PROPOSAL_NOT_FOUND");
          found.score = { safety: 1, automaticApply: 0, note: "Scored as review-only." };
          return present(found.score);
        },
        apply: function () {
          return { available: false, reason: "NO_BLIND_DEPLOY", requiresApproval: true, applied: false };
        },
        list: function () { return present(ctx.proposals.slice()); },
        status: function () { return { proposals: ctx.proposals.length, applied: 0, mode: "CONTROLLED" }; }
      };
    }

    function buildApi() {
      return {
        propose: function (requirement) {
          var plan = {
            id: g.CHIROMBE_ENGINE_UTIL.uid("BUILD"),
            timestamp: new Date().toISOString(),
            requirement: requirement || "",
            pipeline: ["REQUIREMENT", "BUILD_PLAN", "CODE_PROPOSAL", "STATIC_VALIDATION", "TEST", "INTEGRITY_CHECK", "PACKAGE", "ROLLBACK_PACKAGE", "HUMAN_APPROVAL", "DEPLOYMENT_BLOCKED"],
            deployed: false,
            headlessRunner: "engine/headless-runner.mjs",
            headlessInvoked: false
          };
          ctx.builds.push(plan);
          return present(plan);
        },
        status: function () {
          return { plans: ctx.builds.length, deployed: 0, blindDeploy: "BLOCKED", runner: "OBSERVED_NOT_RUN" };
        }
      };
    }

    function norm(name) {
      return String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
    }

    function bloodlineApi() {
      function collect() {
        var sources = [];
        if (g.ChirombeCore && Array.isArray(g.ChirombeCore.family)) {
          sources.push({
            source: "ChirombeCore.family",
            kind: "runtime",
            people: g.ChirombeCore.family.map(function (m) {
              return { name: m.name, relation: m.generation || m.role || "", role: m.role || "", status: m.remembrance ? "REMEMBERED" : "KNOWN" };
            })
          });
        }
        if (g.ZCCA && typeof g.ZCCA.getFamily === "function") {
          try {
            var fam = g.ZCCA.getFamily();
            sources.push({
              source: "ZCCA.getFamily",
              kind: "runtime",
              people: (fam || []).map(function (m) {
                return { name: m.name || m.short, relation: m.relation || "", status: m.memorial ? "REMEMBERED" : "KNOWN" };
              })
            });
          } catch (e) {
            sources.push({ source: "ZCCA.getFamily", kind: "runtime", error: String(e.message || e), people: [] });
          }
        }
        if (ctx.familyJson && Array.isArray(ctx.familyJson.members)) {
          sources.push({
            source: "data/family.json",
            kind: "canonical-file",
            people: ctx.familyJson.members.map(function (m) {
              return { name: m.name, relation: m.generation || "", role: m.role || "", id: m.id || "", status: m.remembrance ? "REMEMBERED" : "KNOWN" };
            }),
            links: ctx.familyJson.links || []
          });
        }
        return sources;
      }

      function conflicts(sources) {
        var tarry = [];
        sources.forEach(function (src) {
          (src.people || []).forEach(function (p) {
            if (norm(p.name).indexOf("tarry") >= 0) tarry.push({ source: src.source, name: p.name, relation: p.relation || p.role || "" });
          });
        });
        var relations = tarry.map(function (t) { return norm(t.relation); }).filter(Boolean);
        var unique = relations.filter(function (r, i) { return relations.indexOf(r) === i; });
        var out = [];
        if (unique.length > 1) {
          out.push({
            subject: "HRH Tarry Kupakwashe Masawi",
            status: "CONFLICTING",
            records: tarry,
            action: "NOT_MODIFIED",
            note: "Sources disagree. The engine does not pick a winner and does not rewrite lineage."
          });
        }
        return out;
      }

      return {
        status: function () {
          var sources = collect();
          var count = 0;
          sources.forEach(function (s) { count += (s.people || []).length; });
          return {
            available: sources.length > 0,
            sources: sources.map(function (s) { return { source: s.source, count: (s.people || []).length }; }),
            records: count,
            conflicts: conflicts(sources),
            auditSnapshot: {
              recordedAt: "2026-09-27",
              subject: "HRH Tarry Kupakwashe Masawi",
              alsoKnownAs: ["Tarry"],
              relation: "son",
              of: "HRH Saint Tariro Masawi",
              status: "RESOLVED",
              staleRisk: false,
              action: "CORRECTED_BY_OWNER",
              personRemoved: false,
              records: [
                { source: "data/family.json", relation: "son", previous: "spouse" },
                { source: "js/chirombe-core.js fallback", relation: "son", previous: "spouse" },
                { source: "js/zcca.js", relation: "son" },
                { source: "docs/DATA_MODEL.md", relation: "son" },
                { source: "js/cm90-family-matrix.js", relation: "son" }
              ],
              note: "Owner stated Tarry is his son. The spouse label is kept as previousGeneration. The historical id FAM-SP-TARRY was not deleted."
            },
            invented: 0,
            mode: "READ_ONLY"
          };
        },
        graph: function () {
          var sources = collect();
          var links = [];
          sources.forEach(function (s) {
            (s.links || []).forEach(function (link) {
              links.push({ source: s.source, from: link[0], to: link[1], status: "KNOWN" });
            });
          });
          return present({ links: links, conflicts: conflicts(sources), unknown: links.length ? [] : ["NO_LINK_TABLE_ON_THIS_PAGE"] });
        }
      };
    }

    function intentionApi() {
      return {
        status: function () {
          var covenant = call(g.MwarindiCovenant, "status");
          return {
            covenant: covenant.available ? covenant.result : missing("MODULE_NOT_AVAILABLE"),
            liturgy: g.CHIROMBE_LITURGY ? "PRESENT" : "NOT_AVAILABLE",
            zccaDeclaration: g.ZCCA && g.ZCCA.declaration ? "PRESENT_NOT_INVOKED" : "NOT_AVAILABLE",
            distinction: ["DIGITAL_MEASUREMENT", "COMPUTATIONAL_MODEL", "SYMBOLIC_INTERPRETATION", "SPIRITUAL_BELIEF"]
          };
        },
        remind: function (who) { return call(g.MwarindiCovenant, "remind", [who]); }
      };
    }

    function resonanceApi() {
      return {
        status: function () {
          var st = call(g.ChirombeResonance, "status");
          return {
            module: st.available ? st.result : missing("MODULE_NOT_AVAILABLE"),
            measure: call(g.ChirombeResonance, "measure"),
            claim: "Acoustic and symbolic measurement only. No supernatural causal claim."
          };
        }
      };
    }

    function externalAI() {
      function envelope(type, extra) {
        return {
          requestId: g.CHIROMBE_ENGINE_UTIL.uid("AI"),
          timestamp: new Date().toISOString(),
          provider: ctx.provider || "NONE",
          type: type,
          confidence: 0,
          recommendations: [],
          codeChanges: [],
          risks: ctx.provider && ctx.provider !== "NONE" ? ["PROVIDER_LABEL_ONLY_NO_NETWORK"] : ["NO_PROVIDER_CONFIGURED"],
          dependencies: [],
          tests: [],
          rollbackPlan: "No generation was performed. Nothing to roll back.",
          requiresApproval: true,
          available: false,
          reason: "EXTERNAL_AI_GATEWAY_CONTROLLED",
          networkCall: false,
          note: extra || "Raw model output cannot overwrite repository files."
        };
      }
      return {
        analyse: function () { return envelope("ANALYSIS"); },
        review: function () { return envelope("REVIEW"); },
        generateProposal: function () { return envelope("PROPOSAL"); },
        explain: function () { return envelope("EXPLAIN"); },
        repairProposal: function () { return envelope("REPAIR_PROPOSAL"); },
        validateProposal: function () { return envelope("VALIDATE"); },
        configure: function (provider) {
          var allowed = ["GROK", "OTHER_AI", "LOCAL_MODEL", "NONE"];
          var next = String(provider || "NONE").toUpperCase();
          if (allowed.indexOf(next) < 0) return missing("UNKNOWN_PROVIDER");
          ctx.provider = next;
          return present({ provider: ctx.provider, networkCall: false, credentials: "NOT_STORED" });
        },
        status: function () {
          return { provider: ctx.provider || "NONE", gateway: "CONTROLLED", networkCall: false, credentialsInPage: false };
        }
      };
    }

    function defenceApi() {
      return {
        status: function () {
          var snap = call(g.ZionProtect, "snapshot");
          return {
            zion: snap.available ? snap.result : missing("MODULE_NOT_AVAILABLE"),
            guardian: g.CHIROMBE_GUARDIAN ? "PRESENT" : "NOT_AVAILABLE",
            disabled: false,
            policy: "OBSERVE_VERIFY_ISOLATE_RECOVER_CONTINUE"
          };
        }
      };
    }

    function watchdogApi() {
      return {
        status: function () {
          var health = call(g.ChirombeHealth, "snapshot");
          return {
            watchdog: g.ChirombeWatchdog ? "PRESENT" : "NOT_AVAILABLE",
            tick: g.ChirombeWatchdog && typeof g.ChirombeWatchdog.tick === "function",
            health: health.available ? health.result : missing("MODULE_NOT_AVAILABLE"),
            invokedTick: false
          };
        }
      };
    }

    return {
      probeEntry: probeEntry,
      memory: memoryApi(),
      workers: workersApi(),
      orchestrator: orchestratorApi(),
      knowledge: knowledgeApi(),
      evolution: evolutionApi(),
      build: buildApi(),
      bloodline: bloodlineApi(),
      intention: intentionApi(),
      resonance: resonanceApi(),
      externalAI: externalAI(),
      defence: defenceApi(),
      watchdog: watchdogApi(),
      runWorker: runWorker
    };
  }

  g.CHIROMBE_ENGINE_ADAPTERS = { create: create, probeEntry: probeEntry };
})(typeof window !== "undefined" ? window : globalThis);
