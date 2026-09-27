/* CHIROMBE connect-and-play — spawn workers, unlock audio, keep a living tone. */
(function (g) {
  "use strict";
  if (g.__CHIROMBE_CONNECT_AND_PLAY__) return;
  g.__CHIROMBE_CONNECT_AND_PLAY__ = true;

  var VERSION = "1.0.0-live";
  var WORKER_FILES = [
    "audit-worker.js", "cloak-worker.js", "covenant-worker.js", "decoy-worker.js",
    "discovery-worker.js", "evolve-worker.js", "family-worker.js", "graph-worker.js",
    "prayer-worker.js", "pulse-worker.js", "threat-worker.js", "watch-worker.js"
  ];
  var state = {
    version: VERSION,
    workersSpawned: 0,
    workers: {},
    audio: {
      unlocked: false,
      playing: false,
      contextState: "unknown",
      source: "none",
      error: null,
      hz: 220
    },
    gestured: false,
    startedAt: null
  };
  var live = { ctx: null, osc: null, osc2: null, gain: null, keepAlive: null };

  function log(msg) {
    try { if (g.Chirombe && g.Chirombe.log) g.Chirombe.log("LIVE", msg); } catch (e) {}
    try { console.log("[CHIROMBE LIVE]", msg); } catch (e) {}
  }

  function basePath() {
    try {
      var path = g.location.pathname || "/";
      if (path.endsWith(".html")) path = path.slice(0, path.lastIndexOf("/") + 1);
      if (!path.endsWith("/")) path += "/";
      return path;
    } catch (e) { return "./"; }
  }

  function spawnWorkers() {
    if (!g.Worker) {
      log("Web Workers unavailable");
      return;
    }
    var root = basePath() + "workers/";
    WORKER_FILES.forEach(function (file) {
      if (state.workers[file]) return;
      try {
        var worker = new Worker(root + file);
        state.workers[file] = { file: file, worker: worker, status: "SPAWNED", last: null };
        worker.onmessage = function (ev) {
          state.workers[file].last = ev.data || null;
        };
        worker.onerror = function (ev) {
          state.workers[file].status = "ERROR";
          state.workers[file].error = String(ev.message || ev);
        };
        state.workersSpawned += 1;
      } catch (err) {
        state.workers[file] = { file: file, status: "FAILED", error: String(err && err.message || err) };
      }
    });
    g.__CHIROMBE_SPAWNED_WORKERS__ = state.workersSpawned;
    g.CHIROMBE_WORKERS = { status: "SPAWNED", count: state.workersSpawned, files: WORKER_FILES.slice(), list: function () { return state.workers; } };
    g.CHIROMBE_ENGINE_WORKER_SPAWN = state.workers;
    log("workers spawned " + state.workersSpawned + "/" + WORKER_FILES.length);
  }

  function kernel() { return g.CHIROMBE_AUDIO || null; }

  function contextFromKernel() {
    var A = kernel();
    if (!A) return null;
    try {
      if (A.createAudioContext) A.createAudioContext();
      if (A.getAudioContext) return A.getAudioContext();
      return A.context || null;
    } catch (e) { return null; }
  }

  function banner(show, text) {
    var el = document.getElementById("chirombe-audio-live-banner");
    if (!show) {
      if (el) el.remove();
      return;
    }
    if (!el) {
      el = document.createElement("button");
      el.id = "chirombe-audio-live-banner";
      el.type = "button";
      el.setAttribute("data-action", "activate");
      el.style.cssText = "position:fixed;z-index:99999;left:12px;right:12px;bottom:12px;padding:14px 18px;border:1px solid #3dffc1;border-radius:14px;background:#061814;color:#78ffd0;font:600 15px/1.3 ui-sans-serif,system-ui;letter-spacing:.04em;cursor:pointer;box-shadow:0 8px 30px rgba(0,0,0,.45);";
      el.addEventListener("click", function (ev) {
        ev.preventDefault();
        startLiveAudio("banner");
      });
      (document.body || document.documentElement).appendChild(el);
    }
    el.textContent = text || "Tap to start Chirombe audio";
  }

  function markPlaying(source) {
    state.audio.playing = true;
    state.audio.unlocked = true;
    state.audio.source = source;
    state.audio.error = null;
    state.startedAt = state.startedAt || new Date().toISOString();
    banner(false);
    try {
      var badge = document.getElementById("ca-hw-ctx");
      if (badge) badge.textContent = "running";
      var stage = document.getElementById("ca-hw-stage");
      if (stage) stage.textContent = "LIVING TONE";
    } catch (e) {}
  }

  function startFallbackTone() {
    var Ctor = g.AudioContext || g.webkitAudioContext;
    if (!Ctor) throw new Error("WEB_AUDIO_UNAVAILABLE");
    if (!live.ctx) live.ctx = new Ctor();
    var ctx = live.ctx;
    var p = ctx.state === "suspended" ? ctx.resume() : Promise.resolve(ctx.state);
    return p.then(function () {
      if (ctx.state !== "running") throw new Error("AUDIO_CONTEXT_NOT_RUNNING:" + ctx.state);
      if (live.osc) return ctx.state;
      var master = ctx.createGain();
      master.gain.value = 0.08;
      master.connect(ctx.destination);
      var osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 220;
      var osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = 330;
      var g2 = ctx.createGain();
      g2.gain.value = 0.45;
      osc.connect(master);
      osc2.connect(g2);
      g2.connect(master);
      osc.start();
      osc2.start();
      live.osc = osc;
      live.osc2 = osc2;
      live.gain = master;
      state.audio.contextState = ctx.state;
      markPlaying("fallback");
      log("fallback living tone running");
      return ctx.state;
    });
  }

  function startKernelTone() {
    var A = kernel();
    if (!A) return Promise.reject(new Error("KERNEL_UNAVAILABLE"));
    var unlock = A.unlockAudio ? A.unlockAudio() : (A.primeFromGesture ? A.primeFromGesture() : Promise.resolve());
    return Promise.resolve(unlock).then(function () {
      var ctx = contextFromKernel();
      if (!ctx) throw new Error("AUDIO_CONTEXT_UNAVAILABLE");
      return (ctx.state === "suspended" ? ctx.resume() : Promise.resolve(ctx.state)).then(function () {
        if (ctx.state !== "running") throw new Error("AUDIO_CONTEXT_NOT_RUNNING:" + ctx.state);
        try { if (A.ensureKernelRoute) A.ensureKernelRoute(); } catch (e) {}
        try { if (A.recoverFromSafeStop) A.recoverFromSafeStop("LIVE_PLAY"); } catch (e) {}
        try { if (A.setMasterGain) A.setMasterGain(0.42); } catch (e) {}
        try { if (A.startLivingWatch) A.startLivingWatch(); } catch (e) {}
        var buses = A.getBuses ? A.getBuses() : A.buses;
        var toneBus = buses && buses.TONE && buses.TONE.gain;
        var droneBus = buses && buses.DRONE && buses.DRONE.gain;
        var dest = toneBus || droneBus || (A.getMasterGainNode && A.getMasterGainNode()) || ctx.destination;
        if (!live.osc) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(220, ctx.currentTime);
          gain.gain.setValueAtTime(0.07, ctx.currentTime);
          osc.connect(gain);
          gain.connect(dest);
          osc.start();
          var osc2 = ctx.createOscillator();
          var gain2 = ctx.createGain();
          osc2.type = "triangle";
          osc2.frequency.setValueAtTime(330, ctx.currentTime);
          gain2.gain.setValueAtTime(0.03, ctx.currentTime);
          osc2.connect(gain2);
          gain2.connect(dest);
          osc2.start();
          live.osc = osc;
          live.osc2 = osc2;
          live.gain = gain;
          live.ctx = ctx;
          try { if (buses && buses.TONE && buses.TONE.activeNodes) buses.TONE.activeNodes.add(osc); } catch (e) {}
        }
        try {
          var tonal = g.CHIROMBE_AUDIO_TONAL_ENGINE;
          if (tonal && tonal.playDrone) tonal.playDrone({ frequencyHz: 174, durationMs: 60000, amplitude: 0.035 });
          else if (tonal && tonal.playScene) tonal.playScene("PEACE", { durationMs: 20000, amplitude: 0.04 });
        } catch (e) {}
        try {
          var perf = g.CHIROMBE_AUDIO_PERFORMANCE_ENGINE;
          if (perf && perf.refreshVoices) perf.refreshVoices();
        } catch (e) {}
        state.audio.contextState = ctx.state;
        markPlaying("kernel");
        log("kernel living tone running @ " + ctx.sampleRate + "Hz");
        return ctx.state;
      });
    });
  }

  function startLiveAudio(reason) {
    state.gestured = true;
    log("start requested via " + reason);
    return startKernelTone().catch(function (err) {
      state.audio.error = String(err && err.message || err);
      log("kernel start failed: " + state.audio.error);
      return startFallbackTone();
    }).catch(function (err) {
      state.audio.error = String(err && err.message || err);
      state.audio.playing = false;
      banner(true, "Audio blocked — tap again to start sound");
      log("audio start failed: " + state.audio.error);
      return { ok: false, error: state.audio.error };
    });
  }

  function keepAlive() {
    if (live.keepAlive) return;
    live.keepAlive = setInterval(function () {
      var ctx = (kernel() && kernel().getAudioContext && kernel().getAudioContext()) || live.ctx;
      if (ctx) state.audio.contextState = ctx.state;
      if (state.gestured && ctx && ctx.state === "suspended") {
        ctx.resume().then(function () {
          if (ctx.state === "running" && !state.audio.playing) startLiveAudio("resume");
        }).catch(function () {});
      }
      if (state.gestured && !state.audio.playing) startLiveAudio("keepalive");
    }, 4000);
  }

  function armGestures() {
    var armed = false;
    function onFirst(ev) {
      if (armed && state.audio.playing) return;
      armed = true;
      startLiveAudio(ev.type || "gesture");
    }
    ["pointerdown", "touchstart", "click", "keydown"].forEach(function (type) {
      document.addEventListener(type, onFirst, true);
    });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible" && state.gestured) startLiveAudio("visible");
    });
  }

  function connectEngineHooks() {
    try {
      if (g.ChirombeBus && g.ChirombeBus.registerCommand) {
        g.ChirombeBus.registerCommand("audio.live", function () { return startLiveAudio("bus"); }, { subsystem: "audio" });
        g.ChirombeBus.registerCommand("audio.status", function () { return status(); }, { subsystem: "audio" });
        g.ChirombeBus.registerCommand("workers.status", function () { return state.workers; }, { subsystem: "workers" });
      }
    } catch (e) {}
  }

  function status() {
    var ctx = (kernel() && kernel().getAudioContext && kernel().getAudioContext()) || live.ctx;
    if (ctx) state.audio.contextState = ctx.state;
    return {
      version: VERSION,
      workersSpawned: state.workersSpawned,
      workerFiles: WORKER_FILES.length,
      workers: Object.keys(state.workers).map(function (k) {
        var row = state.workers[k];
        return { file: row.file, status: row.status, error: row.error || null };
      }),
      audio: Object.assign({}, state.audio, { contextState: ctx ? ctx.state : state.audio.contextState }),
      gestured: state.gestured,
      startedAt: state.startedAt
    };
  }

  function boot() {
    spawnWorkers();
    connectEngineHooks();
    armGestures();
    keepAlive();
    banner(true, "Tap anywhere to start Chirombe audio");
    log("connect-and-play online");
    setTimeout(function () {
      var ctx = contextFromKernel();
      if (ctx && ctx.state === "running") startLiveAudio("already-running");
    }, 800);
  }

  g.CHIROMBE_LIVE = {
    version: VERSION,
    start: function () { return startLiveAudio("api"); },
    status: status,
    workers: function () { return state.workers; }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})(typeof window !== "undefined" ? window : globalThis);
