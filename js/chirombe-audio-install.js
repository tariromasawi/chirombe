(function (g) {
  "use strict";
  if (g.__CHIROMBE_AUDIO_INSTALL__) return;
  g.__CHIROMBE_AUDIO_INSTALL__ = true;

  var VERSION = "2.1.0-hardware-path";
  var CACHE = "CHIROMBE_STATIC_v10";
  var MODES = ["GROUNDING", "REFLECTION", "PROTECTION", "GRATITUDE", "REMEMBRANCE", "UNITY", "COURAGE", "PEACE", "NIGHT_WATCH", "DAWN", "EVENING", "SILENT_WATCH", "RECOVERY", "ALERT", "CLOSING", "FAMILY_BLESSING"];
  var SILENT = { SILENT_WATCH: true };
  var PRESETS = [128, 174, 196, 220, 256, 432, 440, 528];
  var ui = { mode: "PEACE", person: "", personName: "", family: "none", adapt: false, feed: [], timeline: [], recoveryAttempts: 0, raf: 0, bound: false, focused: false, hz: 440 };
  var rootEl = null;

  function audio() { return g.CHIROMBE_AUDIO || null; }
  function tonal() { return g.CHIROMBE_AUDIO_TONAL_ENGINE || null; }
  function env() { return g.CHIROMBE_AUDIO_ENVIRONMENT_ENGINE || null; }
  function perf() { return g.CHIROMBE_AUDIO_PERFORMANCE_ENGINE || null; }
  function evo() { return g.CHIROMBE_AUDIO_EVOLUTION || (audio() && audio().Evolution) || null; }
  function safety() { return g.CHIROMBE_AUDIO_SAFETY_ENGINE || null; }
  function $(sel) { return rootEl ? rootEl.querySelector(sel) : null; }
  function text(sel, value) { var n = $(sel); if (n) n.textContent = value == null ? "UNAVAILABLE" : String(value); }
  function bars(amount) {
    var n = Math.max(0, Math.min(10, Math.round(Number(amount) * 10)));
    return "██████████".slice(0, n) + "░░░░░░░░░░".slice(0, 10 - n);
  }

  function audit(action, detail) {
    try { if (g.ChirombeAudit && g.ChirombeAudit.append) g.ChirombeAudit.append(action, detail || {}); } catch (e) {}
    try { if (audio() && audio().remember) audio().remember(action, detail || {}, 0.4); } catch (e) {}
  }

  function pushFeed(type) {
    var line = new Date().toLocaleTimeString() + "  " + String(type || "EVENT") + "  kernel";
    ui.feed.unshift(line);
    ui.timeline.unshift(line);
    if (ui.feed.length > 48) ui.feed.pop();
    if (ui.timeline.length > 24) ui.timeline.pop();
    var box = $("#ca-feed");
    if (box) box.textContent = ui.feed.join("\n");
    var time = $("#ca-timeline");
    if (time) time.textContent = ui.timeline.join("\n");
  }

  function organ(obj) {
    try { return obj && obj.getStatus ? obj.getStatus() : { available: !!obj }; }
    catch (e) { return { available: false, error: String(e.message || e) }; }
  }

  function ceiling() {
    var A = audio();
    var limit = A && A.CONFIG && A.CONFIG.maximumMasterGain;
    var safe = safety() && safety().LIMITS && (safety().LIMITS.maximumMasterGain || safety().LIMITS.maxGain);
    var value = Number(limit || 0.65);
    if (safe && Number(safe) > 0 && Number(safe) < value) value = Number(safe);
    return value;
  }

  function contextNode() {
    try { return audio() && audio().getAudioContext ? audio().getAudioContext() : null; } catch (e) { return null; }
  }

  function analyserNode() {
    try { return audio() && audio().getAnalyser ? audio().getAnalyser() : null; } catch (e) { return null; }
  }

  function measure() {
    var analyser = analyserNode();
    var context = contextNode();
    if (!analyser || !context || context.state !== "running") return null;
    var freq = new Uint8Array(analyser.frequencyBinCount);
    var time = new Uint8Array(analyser.fftSize);
    analyser.getByteFrequencyData(freq);
    analyser.getByteTimeDomainData(time);
    var sum = 0;
    var peak = 0;
    var dominant = 0;
    var dominantBin = 0;
    for (var i = 0; i < freq.length; i++) {
      sum += freq[i];
      if (freq[i] > peak) { peak = freq[i]; dominantBin = i; }
    }
    var rmsSum = 0;
    var dc = 0;
    var clip = false;
    for (var j = 0; j < time.length; j++) {
      var sample = (time[j] - 128) / 128;
      rmsSum += sample * sample;
      dc += sample;
      if (time[j] <= 1 || time[j] >= 254) clip = true;
    }
    dominant = context.sampleRate * dominantBin / analyser.fftSize;
    return {
      freq: freq,
      time: time,
      level: sum / (freq.length * 255),
      peak: peak / 255,
      rms: Math.sqrt(rmsSum / time.length),
      dc: dc / time.length,
      clip: clip,
      dominant: dominant,
      sampleRate: context.sampleRate,
      nyquist: context.sampleRate / 2
    };
  }

  function audioHealth() {
    var A = audio();
    if (!A) return { status: "UNAVAILABLE", lifecycle: "UNAVAILABLE", audioContext: "UNAVAILABLE", microphone: "OFF" };
    var life = "UNKNOWN";
    var ctx = "UNAVAILABLE";
    try { life = (A.state && A.state.lifecycle) || "UNKNOWN"; } catch (e) {}
    try { ctx = contextNode() ? contextNode().state : "UNAVAILABLE"; } catch (e) {}
    var status = "DEGRADED";
    if (life === "SAFE_STOP") status = "SAFE_STOP";
    else if (life === "ERROR") status = "ERROR";
    else if (ctx === "running" || ctx === "suspended") status = ctx === "running" ? "HEALTHY" : "DEGRADED";
    else status = "UNAVAILABLE";
    return { status: status, lifecycle: life, audioContext: ctx, microphone: "OFF" };
  }

  function extendStatus() {
    var A = audio();
    if (!A || A.__audioInstallWrapped || typeof A.getStatus !== "function") return;
    var previous = A.getStatus;
    A.getStatus = function () {
      var base = previous() || {};
      base.kernel = { version: base.version, build: base.build, lifecycle: base.lifecycle };
      var context = contextNode();
      base.audioContext = context ? context.state : (base.audioContext || "UNAVAILABLE");
      base.sampleRate = context ? context.sampleRate : base.sampleRate;
      base.nyquist = context ? context.sampleRate / 2 : base.nyquistHz;
      try { base.buses = A.getBuses ? Object.keys(A.getBuses()) : base.buses; } catch (e) {}
      base.tonal = organ(tonal());
      base.environment = organ(env());
      base.performance = organ(perf());
      var speaking = false;
      try { speaking = !!(g.speechSynthesis && g.speechSynthesis.speaking); } catch (e) {}
      var voiceReady = false;
      try { voiceReady = !!(perf() && perf().supported && perf().supported()); } catch (e) {}
      base.voice = { available: voiceReady, speaking: speaking, state: speaking ? "SPEAKING" : (voiceReady ? "READY" : "UNAVAILABLE") };
      var mic = base.environment && base.environment.microphone;
      base.microphone = { active: !!(mic && mic.active), state: mic && mic.active ? "ACTIVE" : "OFF", permission: (mic && mic.permission) || "unknown" };
      base.safety = organ(safety());
      base.liturgy = organ(A.Liturgy);
      base.evolution = base.evolutionLayer || organ(evo());
      base.watchdog = g.ChirombeWatchdog ? "CONNECTED" : "UNAVAILABLE";
      base.health = g.ChirombeHealth ? "CONNECTED" : "UNAVAILABLE";
      base.persistence = { localStorage: (function () { try { return typeof localStorage !== "undefined"; } catch (e) { return false; } })() };
      base.installation = { version: VERSION, cache: CACHE, independentCm90Context: false, playbackOnLoad: false };
      return base;
    };
    A.__audioInstallWrapped = true;
  }

  function extendHealth() {
    if (!g.ChirombeHealth || g.ChirombeHealth.__audioWrapped || typeof g.ChirombeHealth.snapshot !== "function") return;
    var previous = g.ChirombeHealth.snapshot;
    g.ChirombeHealth.snapshot = function () {
      var base = previous();
      base.audio = audioHealth();
      if ((base.audio.status === "ERROR" || base.audio.status === "SAFE_STOP") && base.status === "HEALTHY") base.status = "DEGRADED";
      return base;
    };
    g.ChirombeHealth.__audioWrapped = true;
  }

  function wrapEmit() {
    var A = audio();
    if (!A || A.__installEmitWrapped || typeof A.emit !== "function") return;
    var previous = A.emit;
    A.emit = function (type) {
      var event = previous.apply(A, arguments);
      pushFeed(type);
      render();
      return event;
    };
    A.__installEmitWrapped = true;
  }

  function savePrefs() {
    try {
      localStorage.setItem("CHIROMBE_AUDIO_UI_PREFS", JSON.stringify({ mode: ui.mode, family: ui.family, adapt: ui.adapt, hz: ui.hz }));
    } catch (e) {}
  }

  function loadPrefs() {
    try {
      var data = JSON.parse(localStorage.getItem("CHIROMBE_AUDIO_UI_PREFS") || "null");
      if (!data) return;
      if (MODES.indexOf(data.mode) >= 0) ui.mode = data.mode;
      if (data.family) ui.family = data.family;
      ui.adapt = !!data.adapt;
      if (data.hz) ui.hz = Number(data.hz);
    } catch (e) {}
  }

  function showPath(diagnostic, stage, extra) {
    var box = $("#ca-path-json");
    var stageNode = $("#ca-hw-stage");
    if (stageNode) stageNode.textContent = stage || "IDLE";
    var payload = { stage: stage || "IDLE", diagnostic: diagnostic || null, extra: extra || null };
    if (box) box.textContent = JSON.stringify(payload, null, 2);
    try { console.log("CHIROMBE_AUDIO_DIAGNOSTIC", payload); } catch (e) {}
  }

  function primeGesture() {
    var A = audio();
    try { if (g.CHIROMBE_AUDIO_SAFETY_ENGINE && g.CHIROMBE_AUDIO_SAFETY_ENGINE.registerUserGesture) g.CHIROMBE_AUDIO_SAFETY_ENGINE.registerUserGesture(); } catch (e) {}
    if (!A || !A.primeFromGesture) return Promise.reject(new Error("AUDIO_CONTEXT_UNAVAILABLE"));
    return Promise.resolve(A.primeFromGesture());
  }

  async function activate() {
    var A = audio();
    if (!A) return { ok: false, reason: "KERNEL_UNAVAILABLE" };
    ui.recoveryAttempts += 1;
    if (ui.recoveryAttempts > 6) return { ok: false, reason: "RECOVERY_LIMIT" };
    var unlocked = false;
    var unlockError = null;
    try { unlocked = await A.unlockAudio(); } catch (e) { unlocked = false; unlockError = e; }
    var ctx = null;
    try { ctx = A.getAudioContext ? A.getAudioContext() : null; } catch (e) {}
    if (!unlocked || !ctx || ctx.state !== "running") {
      var failed = A.inspectSignalPath ? A.inspectSignalPath() : null;
      var reason = (unlockError && unlockError.message) || "AUDIO_CONTEXT_NOT_RUNNING";
      showPath(failed, reason);
      pushFeed(reason);
      render();
      return { ok: false, unlocked: false, reason: reason, diagnostic: failed };
    }
    try { if (A.recoverFromSafeStop) A.recoverFromSafeStop("ACTIVATE"); } catch (e) {}
    try { if (A.ensureKernelRoute) A.ensureKernelRoute(); } catch (e) {}
    if (A.getMasterGainNode && A.getMasterGainNode() && A.getMasterGainNode().gain.value <= 0.001 && A.setMasterGain) {
      try { A.setMasterGain(Math.min(ceiling(), 0.42)); } catch (e) {}
    }
    var T = tonal();
    try { if (T && T.resume) await T.resume(); } catch (e) {}
    try { if (T && T.initialise) await T.initialise(); } catch (e) {}
    try { if (safety() && safety().arm) safety().arm(); } catch (e) {}
    var diagnostic = A.inspectSignalPath ? A.inspectSignalPath() : null;
    if (diagnostic && !(diagnostic.masterGain > 0)) {
      showPath(diagnostic, "MASTER_GAIN_ZERO");
      pushFeed("MASTER_GAIN_ZERO");
      render();
      return { ok: false, reason: "MASTER_GAIN_ZERO", diagnostic: diagnostic };
    }
    audit("AUDIO_ACTIVATED", { unlocked: true, attempt: ui.recoveryAttempts, state: ctx.state });
    pushFeed("AUDIO_UNLOCKED");
    showPath(diagnostic, "CONTEXT RUNNING");
    render();
    return { ok: true, unlocked: true, diagnostic: diagnostic };
  }

  async function emergency(reason) {
    try { if (tonal() && tonal().safeStop) tonal().safeStop(reason || "UI_EMERGENCY"); } catch (e) {}
    try { if (perf() && perf().stop) perf().stop(); } catch (e) {}
    try { if (g.speechSynthesis) g.speechSynthesis.cancel(); } catch (e) {}
    try { if (env() && env().stopMicrophone) env().stopMicrophone(); } catch (e) {}
    var A = audio();
    try { if (A && A.safeStop) A.safeStop(reason || "UI_EMERGENCY"); } catch (e) {}
    try { if (A && A.emergencyStop) A.emergencyStop(reason || "UI_EMERGENCY"); } catch (e) {}
    audit("AUDIO_EMERGENCY_STOP", { reason: reason || "UI" });
    pushFeed("SAFE_STOP");
    render();
    return { ok: true, state: "SAFE_STOP" };
  }

  function sceneFor(mode) {
    if (mode === "FAMILY_BLESSING") return "UNITY";
    if (mode === "GROUNDING") return "GROUNDING";
    if (SILENT[mode]) return null;
    return mode;
  }

  async function startLiturgy() {
    var A = audio();
    if (!A || !A.startLivingLiturgy) return { ok: false, reason: "ORCHESTRATOR_UNAVAILABLE" };
    await activate();
    var people = ui.person ? [{ id: ui.person, name: ui.personName || ui.person, relationship: "approved-record" }] : [];
    var started = await A.startLivingLiturgy({ mode: ui.mode, gesture: true, people: people, useApprovedFamily: ui.family === "circle", intention: ui.mode });
    var scene = sceneFor(ui.mode);
    if (scene && tonal() && tonal().playScene) {
      try { await tonal().playScene(scene, { durationMs: 20000, amplitude: 0.04 }); } catch (e) {}
    }
    audit("LITURGY_STARTED", { mode: ui.mode });
    pushFeed("SESSION_STARTED");
    render();
    return { ok: !!(started && started.ok), started: started, microphoneStarted: false };
  }

  async function control(name) {
    var A = audio();
    if (!A || typeof A[name] !== "function") return { ok: false, reason: "UNAVAILABLE" };
    var result = await A[name]();
    audit(name, {});
    pushFeed(name);
    render();
    return result;
  }

  async function testTone() {
    showPath(null, "TEST REQUESTED");
    var A = audio();
    if (!A || !A.runHardwareSelfTest) {
      showPath(null, "HARDWARE_TEST_UNAVAILABLE");
      return { ok: false, reason: "HARDWARE_TEST_UNAVAILABLE" };
    }
    var result = await A.runHardwareSelfTest();
    var diagnostic = A.inspectSignalPath ? A.inspectSignalPath() : null;
    var stage = (result && result.stages || []).join(" → ") || "TEST FAILED";
    showPath(diagnostic, stage, result);
    pushFeed(result && result.ok ? "TEST COMPLETE" : ((result && result.errors || []).join(",") || "TEST FAILED"));
    render();
    publishSignal(result);
    return result;
  }

  function publishSignal(result) {
    var detected = $("#ca-signal-detected");
    var barsNode = $("#ca-hw-level");
    var note = $("#ca-signal-note");
    var yes = !!(result && result.signalDetected);
    if (detected) detected.textContent = yes ? "YES" : "NO";
    var amount = result && typeof result.rms === "number" ? Math.min(1, result.rms * 8) : 0;
    if (barsNode) barsNode.textContent = bars(amount);
    if (note) {
      if (!result) note.textContent = "";
      else if (yes) note.textContent = "Analyser heard the tone. If the phone stays silent, the failure is downstream of the analyser (mute switch, media volume, or output device).";
      else if ((result.errors || []).indexOf("AUDIO BUS ROUTING FAILURE") >= 0) note.textContent = "AUDIO BUS ROUTING FAILURE — oscillator energy did not reach the kernel analyser.";
      else note.textContent = "No analyser energy while the oscillator was running. The signal is not reaching the analyser. " + ((result.errors || []).join(" | ") || "");
    }
  }

  async function testVoice() {
    var A = audio();
    try { await primeGesture(); } catch (e) {
      showPath(A && A.inspectSignalPath ? A.inspectSignalPath() : null, e.message || "AUDIO_CONTEXT_UNAVAILABLE");
      return { ok: false, reason: e.message || "AUDIO_CONTEXT_UNAVAILABLE", speech: false };
    }
    var ctx = A && A.getAudioContext ? A.getAudioContext() : null;
    if (!ctx || ctx.state !== "running") {
      showPath(A && A.inspectSignalPath ? A.inspectSignalPath() : null, "AUDIO_CONTEXT_NOT_RUNNING");
      return { ok: false, reason: "AUDIO_CONTEXT_NOT_RUNNING", contextState: ctx && ctx.state, speech: false };
    }
    if (!perf() || !perf().speakText) return { ok: false, reason: "SPEECH_UNAVAILABLE", contextState: ctx.state };
    var voices = [];
    try { voices = perf().refreshVoices ? perf().refreshVoices() : []; } catch (e) { voices = []; }
    var selected = null;
    try { selected = perf().getStatus ? perf().getStatus().voice : null; } catch (e) {}
    var result = await perf().speakText("CHIROMBE audio system ready.", { rate: 0.92 });
    var speaking = false;
    try { speaking = !!(g.speechSynthesis && g.speechSynthesis.speaking); } catch (e) {}
    result = result || {};
    result.contextState = ctx.state;
    result.selectedVoice = selected || (voices[0] && voices[0].name) || "UNAVAILABLE";
    result.availableVoices = (voices || []).map(function (voice) { return (voice.name || "voice") + (voice.lang ? " · " + voice.lang : ""); });
    result.speechSynthesisSpeaking = speaking || !!result.ok;
    result.webAudioState = ctx.state;
    if (result.ok && ctx.state === "running") {
      result.output = "SPEECH_SYNTHESIS";
      result.note = "Speech synthesis uses the browser voice output, separate from the Web Audio oscillator bus. If this reports speaking and the phone is silent, that is a speech-output failure, not a Web Audio routing failure.";
    }
    text("#ca-voice-list", result.availableVoices.length ? result.availableVoices.join("\n") : "NO SPEECH VOICES ON THIS DEVICE");
    text("#ca-voice-selected", result.selectedVoice || "UNAVAILABLE");
    showPath(A.inspectSignalPath ? A.inspectSignalPath() : null, result.ok ? "SPEECH REQUESTED" : (result.reason || "SPEECH_FAILED"), result);
    pushFeed(result.ok ? "VOICE_STARTED" : "VOICE_FAILED");
    render();
    return result;
  }

  async function speakSelected() {
    var field = $("#ca-speak-text");
    if (!perf() || !perf().speakText) return { ok: false, reason: "SPEECH_UNAVAILABLE" };
    return perf().speakText((field && field.value) || "CHIROMBE audio system ready.");
  }

  async function enableMic() {
    if (!env() || !env().requestMicrophone) return { ok: false, reason: "MICROPHONE_UNAVAILABLE" };
    if (!contextNode()) await activate();
    var ok = await env().requestMicrophone();
    pushFeed(ok ? "MIC_ENABLED" : "MIC_DENIED");
    render();
    return { ok: !!ok };
  }

  function disableMic() {
    try { if (env() && env().stopMicrophone) env().stopMicrophone(); } catch (e) {}
    pushFeed("MIC_DISABLED");
    render();
    return { ok: true };
  }

  function setMode(mode) {
    if (MODES.indexOf(mode) < 0) return { ok: false, reason: "UNKNOWN_MODE" };
    ui.mode = mode;
    var A = audio();
    if (A && A.master && A.master.session) A.master.session.mode = mode;
    try { if (evo() && evo().updatePreference) evo().updatePreference("mode", mode, 0.1, 1); } catch (e) {}
    savePrefs();
    audit("MODE_SELECTED", { mode: mode });
    render();
    return { ok: true, mode: mode, started: false };
  }

  function setGain(fraction) {
    var A = audio();
    if (!A || !A.setMasterGain) return { ok: false };
    var applied = A.setMasterGain(Math.min(ceiling(), Math.max(0, Number(fraction) || 0)));
    render();
    return { ok: true, applied: applied, ceiling: ceiling() };
  }

  function classifyInput(hz) {
    var A = audio();
    var result = A && A.validateFrequency ? A.validateFrequency(hz) : { classification: "UNAVAILABLE", supported: false };
    var context = contextNode();
    var nyquist = context ? context.sampleRate / 2 : null;
    var label = result.classification || (result.supported ? "AUDIBLE" : "UNSUPPORTED");
    if (nyquist && hz > nyquist) label = "NOT PHYSICALLY TRANSMITTED";
    if (hz >= 1000000) label = "RF METADATA — NOT PHYSICALLY TRANSMITTED";
    try { if (safety() && safety().classifyFrequency) safety().classifyFrequency(hz); } catch (e) {}
    text("#ca-freq-class", label);
    text("#ca-nyquist", nyquist ? Math.round(nyquist) + " Hz" : "UNAVAILABLE");
    ui.hz = hz;
    savePrefs();
    return { hz: hz, label: label, result: result };
  }

  function feedback(kind, value) {
    try { if (evo() && evo().recordObservation) evo().recordObservation("USER_FEEDBACK", { kind: kind, value: value, supernaturalClaim: false }); } catch (e) {}
    pushFeed("EVOLUTION_OBSERVATION");
    return { ok: true };
  }

  async function evolve() {
    if (!evo() || !evo().analyseAdaptation) return { ok: false, reason: "EVOLUTION_UNAVAILABLE" };
    var analysis = await evo().analyseAdaptation();
    pushFeed("EVOLUTION_PROPOSAL");
    render();
    return analysis;
  }

  async function snapshot() {
    var A = audio();
    if (!A || !A.createSnapshot) return { ok: false, reason: "UNAVAILABLE" };
    var result = await A.createSnapshot("command-centre");
    pushFeed("SNAPSHOT");
    render();
    return result;
  }

  function diagnostics() {
    var A = audio();
    var rows = [];
    function row(name, result, detail) { rows.push({ name: name, result: result, detail: detail || null }); }
    row("namespace", A ? "PASS" : "FAIL");
    row("kernel", A && A.getStatus ? "PASS" : "FAIL");
    row("emergency stop", A && A.emergencyStop ? "PASS" : "FAIL", "not invoked");
    row("safe stop", A && A.safeStop ? "PASS" : "FAIL", "not invoked");
    row("living watch", A && A.startLivingWatch ? "PASS" : "FAIL");
    row("next stage", A && A.nextLivingStage ? "PASS" : "FAIL");
    var context = contextNode();
    row("Web Audio", (g.AudioContext || g.webkitAudioContext) ? "PASS" : "UNAVAILABLE");
    row("AudioContext", context ? "PASS" : "WARN", context ? context.state : "not created until activation");
    row("buses", A && A.getBuses && Object.keys(A.getBuses()).length >= 8 ? "PASS" : "WARN");
    row("analyser", analyserNode() ? "PASS" : "WARN");
    row("tonal engine", tonal() ? "PASS" : "UNAVAILABLE");
    row("shared context", tonal() && tonal().getStatus && tonal().getStatus().usesKernelContext ? "PASS" : "WARN");
    row("environment engine", env() ? "PASS" : "UNAVAILABLE");
    row("performance engine", perf() ? "PASS" : "UNAVAILABLE");
    row("safety engine", safety() || (A && A.emergencyStop) ? "PASS" : "UNAVAILABLE");
    row("evolution engine", evo() && evo().beginSession ? "PASS" : "FAIL");
    row("single evolution", evo() && evo().VERSION === "9.0.0" ? "PASS" : "FAIL", evo() && evo().VERSION);
    row("liturgy engine", A && A.Liturgy && A.Liturgy.commands ? "PASS" : "UNAVAILABLE");
    row("orchestrator", A && A.startLivingLiturgy ? "PASS" : "FAIL");
    row("bloodline", g.CHIROMBE_AUDIO_BLOODLINE_ORCHESTRATOR ? "PASS" : "UNAVAILABLE");
    row("event bus", g.ChirombeBus ? "PASS" : "UNAVAILABLE");
    row("persistence", (function () { try { return typeof localStorage !== "undefined" ? "PASS" : "UNAVAILABLE"; } catch (e) { return "UNAVAILABLE"; } })());
    var speech = false;
    try { speech = !!(g.speechSynthesis || (perf() && perf().supported && perf().supported())); } catch (e) {}
    row("speech synthesis", speech ? "PASS" : "UNAVAILABLE");
    row("microphone capability", (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ? "PASS" : "UNAVAILABLE", "still off until enabled");
    row("UI bindings", ui.bound ? "PASS" : "FAIL");
    row("command centre", $("#ca-title") || rootEl ? "PASS" : "FAIL");
    row("CM90 independent context", g.CHIROMBE_TONAL && g.CHIROMBE_TONAL.status && g.CHIROMBE_TONAL.status().independentContext === false ? "PASS" : "WARN");
    row("cache", "PASS", CACHE);
    var box = $("#ca-diagnostics");
    if (box) box.textContent = rows.map(function (item) { return item.result + "  " + item.name + (item.detail ? "  " + item.detail : ""); }).join("\n");
    audit("AUDIO_DIAGNOSTICS", { rows: rows.length });
    return { ok: rows.every(function (item) { return item.result !== "FAIL"; }), rows: rows };
  }

  function draw(canvas, kind, reading) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width = canvas.clientWidth || 320;
    var h = canvas.height = kind === "wave" ? 72 : 96;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#070b12";
    ctx.fillRect(0, 0, w, h);
    if (!reading) {
      ctx.fillStyle = "#8190a5";
      ctx.font = "12px sans-serif";
      ctx.fillText(kind === "wave" ? "WAVEFORM UNAVAILABLE" : "ANALYSER UNAVAILABLE", 12, h / 2);
      return;
    }
    ctx.strokeStyle = "#4de7ff";
    ctx.beginPath();
    if (kind === "wave") {
      var step = Math.max(1, Math.floor(reading.time.length / w));
      for (var x = 0; x < w; x++) {
        var y = (reading.time[x * step] / 255) * h;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
    } else {
      var bins = 64;
      var skip = Math.max(1, Math.floor(reading.freq.length / bins));
      ctx.fillStyle = "#4de7ff";
      for (var i = 0; i < bins; i++) {
        var value = reading.freq[Math.floor(Math.pow(i / bins, 2) * (reading.freq.length - 1))] / 255;
        var bh = Math.max(1, value * (h - 16));
        ctx.fillRect(8 + i * ((w - 16) / bins), h - 8 - bh, Math.max(1, (w - 16) / bins - 2), bh);
      }
    }
    ctx.stroke();
  }

  function renderBuses() {
    var host = $("#ca-buses");
    if (!host) return;
    var buses = {};
    try { buses = (audio() && audio().getBuses && audio().getBuses()) || {}; } catch (e) {}
    var names = ["VOICE", "CHANT", "TONE", "DRONE", "AMBIENCE", "RHYTHM", "RESPONSE", "SPATIAL", "MONITOR", "MASTER"];
    host.textContent = names.map(function (name) {
      var bus = buses[name];
      if (!bus) return name.padEnd(10, " ") + " UNAVAILABLE";
      var level = 0;
      try { level = bus.gain && bus.gain.gain ? bus.gain.gain.value : 0; } catch (e) {}
      var sources = 0;
      try { sources = bus.activeNodes ? bus.activeNodes.size : 0; } catch (e) {}
      var state = level <= 0.001 ? "OFF" : (sources ? "ACTIVE" : "READY");
      return name.padEnd(10, " ") + " " + state.padEnd(10, " ") + " " + bars(Math.min(1, level)) + "  src " + sources;
    }).join("\n");
  }

  function render() {
    if (!rootEl) return;
    var A = audio();
    var status = A && A.getStatus ? A.getStatus() : null;
    var life = (status && (status.lifecycle || (status.kernel && status.kernel.lifecycle))) || "UNAVAILABLE";
    var ctxState = status && typeof status.audioContext === "string" ? status.audioContext : "UNAVAILABLE";
    var mic = status && status.microphone && status.microphone.active ? "ACTIVE" : "OFF";
    var voice = status && status.voice ? status.voice.state : "UNAVAILABLE";
    var evoState = status && status.evolution && (status.evolution.state || status.evolution.status) || "UNAVAILABLE";
    var session = A && A.master && A.master.session;
    text("#ca-kernel", life);
    text("#ca-ctx", ctxState);
    text("#ca-session", session ? "ACTIVE" : "IDLE");
    text("#ca-voice", voice);
    text("#ca-mic", mic);
    text("#ca-safety", life === "SAFE_STOP" ? "SAFE STOP" : "ARMED");
    text("#ca-evo", evoState);
    text("#ca-mode", ui.mode);
    var gain = status && typeof status.masterGain === "number" ? status.masterGain : null;
    text("#ca-gain", gain == null ? "UNAVAILABLE" : Math.round(gain * 100) + "%");
    text("#ca-ceiling", Math.round(ceiling() * 100) + "% MAX");
    var slider = $("#ca-gain-slider");
    if (slider && gain != null && document.activeElement !== slider) slider.value = String(Math.round(gain * 100));
    var header = document.getElementById("ca-header-state");
    if (header) header.textContent = "AUDIO " + life;
    text("#ca-session-detail", session ? (session.sessionId + " · " + (session.stage || "OPENING") + " · " + session.mode) : "NONE");
    var tonalStatus = status && status.tonal;
    text("#ca-scene", (tonalStatus && tonalStatus.currentScene) || "NONE");
    text("#ca-fund", tonalStatus && tonalStatus.currentFundamental ? tonalStatus.currentFundamental + " Hz" : "UNAVAILABLE");
    text("#ca-sample", status && status.sampleRate ? Math.round(status.sampleRate) + " Hz" : "UNAVAILABLE");
    text("#ca-nyquist", status && status.nyquist ? Math.round(status.nyquist) + " Hz" : "UNAVAILABLE");
    var evolution = status && status.evolution;
    text("#ca-gen", evolution && evolution.generation != null ? evolution.generation : "UNAVAILABLE");
    text("#ca-proposals", evolution && evolution.memory ? evolution.memory.proposals : "UNAVAILABLE");
    text("#ca-snapshots", evolution && evolution.memory ? evolution.memory.snapshots : "UNAVAILABLE");
    var proposalBox = $("#ca-proposal-list");
    if (proposalBox) {
      var proposals = (evolution && evolution.recentProposals) || [];
      proposalBox.textContent = proposals.length ? proposals.map(function (item) {
        return (item.type || "PROPOSAL") + "  " + (item.target || "") + "  " + (item.status || "") + "  " + (item.reason || "");
      }).join("\n") : "NO PROPOSALS";
    }
    text("#ca-online", navigator.onLine === false ? "OFFLINE" : "ONLINE");
    text("#ca-cache", CACHE);
    text("#ca-install", VERSION);
    text("#ca-kernel-version", status && status.version ? status.version : "UNAVAILABLE");
    text("#ca-evo-version", evo() && evo().VERSION ? evo().VERSION : "UNAVAILABLE");
    var errors = [];
    try { if (A && A.master && A.master.errors) errors = A.master.errors; } catch (e) {}
    text("#ca-errors", errors.length ? errors[errors.length - 1].message : "NONE");
    var buttons = rootEl.querySelectorAll("[data-mode]");
    for (var i = 0; i < buttons.length; i++) buttons[i].classList.toggle("is-on", buttons[i].getAttribute("data-mode") === ui.mode);
    renderBuses();
    var reading = measure();
    paintHardware(reading);
    if (reading) {
      text("#ca-level", bars(reading.level));
      text("#ca-peak", bars(reading.peak));
      text("#ca-rms", bars(Math.min(1, reading.rms * 4)));
      text("#ca-clip", reading.clip ? "CLIPPING" : "CLEAR");
      text("#ca-dc", Math.abs(reading.dc) > 0.08 ? "OFFSET" : "CLEAR");
      text("#ca-dominant", Math.round(reading.dominant) + " Hz");
    } else {
      text("#ca-level", "ANALYSER UNAVAILABLE");
      text("#ca-peak", "ANALYSER UNAVAILABLE");
      text("#ca-rms", "ANALYSER UNAVAILABLE");
      text("#ca-clip", "UNAVAILABLE");
      text("#ca-dc", "UNAVAILABLE");
      text("#ca-dominant", "UNAVAILABLE");
    }
    draw($("#ca-spectrum"), "spectrum", reading);
    draw($("#ca-wave"), "wave", reading);
  }

  function loop() {
    if (document.hidden) { ui.raf = 0; return; }
    var reading = measure();
    draw($("#ca-spectrum"), "spectrum", reading);
    draw($("#ca-wave"), "wave", reading);
    if (reading) {
      text("#ca-level", bars(reading.level));
      text("#ca-peak", bars(reading.peak));
      text("#ca-rms", bars(Math.min(1, reading.rms * 4)));
      text("#ca-dominant", Math.round(reading.dominant) + " Hz");
      paintHardware(reading);
    }
    ui.raf = g.requestAnimationFrame(loop);
  }

  function paintHardware(reading) {
    var A = audio();
    var path = null;
    try { path = A && A.inspectSignalPath ? A.inspectSignalPath() : null; } catch (e) { path = null; }
    var banner = $("#ca-safe-banner");
    if (banner) banner.hidden = !(path && (path.lifecycle === "SAFE_STOP" || path.safeStopped));
    text("#ca-hw-ctx", path && path.contextState ? String(path.contextState).toUpperCase() : "UNAVAILABLE");
    text("#ca-hw-rate", path && path.sampleRate ? Math.round(path.sampleRate) + " Hz" : "UNAVAILABLE");
    text("#ca-hw-master", path && typeof path.masterGain === "number" ? path.masterGain.toFixed(2) : "UNAVAILABLE");
    text("#ca-hw-tone", path && path.toneBusExists ? ("CONNECTED " + Number(path.toneBusGain).toFixed(2)) : "NOT CONNECTED");
    text("#ca-hw-master-node", path && path.masterGainNodeExists && path.routing && path.routing.masterToLimiter ? "CONNECTED" : "NOT CONNECTED");
    text("#ca-hw-analyser", path && path.analyserExists ? "ACTIVE" : "MISSING");
    text("#ca-hw-destination", path && path.destinationExists && path.routing && path.routing.analyserToDestination ? "ACTIVE" : "MISSING");
    text("#ca-hw-sources", path ? String(path.activeSources) : "0");
    text("#ca-hw-mic", path ? "OFF" : "OFF");
    var mic = "OFF";
    try { mic = env() && env().getStatus && env().getStatus().microphone && env().getStatus().microphone.active ? "ACTIVE" : "OFF"; } catch (e) {}
    text("#ca-hw-mic", mic);
    text("#ca-hw-safety", path && path.lifecycle === "SAFE_STOP" ? "SAFE STOP" : (path && path.safetyState ? path.safetyState : "ARMED"));
    text("#ca-build-kernel", path && path.kernelVersion ? path.kernelVersion : "UNAVAILABLE");
    text("#ca-build-tonal", path && path.tonalVersion ? path.tonalVersion : "UNAVAILABLE");
    text("#ca-build-perf", path && path.performanceVersion ? path.performanceVersion : "UNAVAILABLE");
    text("#ca-build-safety", (safety() && safety().VERSION) || (path && path.safetyState) || "UNAVAILABLE");
    text("#ca-build-evo", path && path.evolutionVersion ? path.evolutionVersion : "UNAVAILABLE");
    text("#ca-build-id", g.CHIROMBE_AUDIO_BUILD || "audio-hw-path");
    text("#ca-commit", "audio-hw-path");
    if (reading) {
      text("#ca-hw-level", bars(Math.min(1, reading.rms * 8)));
      var detected = reading.rms >= 0.002 || reading.peak >= 0.01;
      text("#ca-signal-detected", detected ? "YES" : "NO");
    }
  }

  function loadVoices() {
    var select = $("#ca-voice");
    if (!select || !perf() || !perf().refreshVoices) return;
    var voices = [];
    try { voices = perf().refreshVoices() || []; } catch (e) { voices = []; }
    select.textContent = "";
    if (!voices.length) {
      var empty = document.createElement("option");
      empty.textContent = "UNAVAILABLE ON THIS DEVICE";
      select.appendChild(empty);
      return;
    }
    voices.forEach(function (voice) {
      var option = document.createElement("option");
      option.value = voice.name || "";
      option.textContent = (voice.name || "voice") + (voice.lang ? " · " + voice.lang : "");
      select.appendChild(option);
    });
  }

  function loadFamily() {
    var select = $("#ca-person");
    if (!select || typeof fetch !== "function") return;
    fetch("./data/family.json").then(function (r) { return r.json(); }).then(function (data) {
      (data.members || []).forEach(function (member) {
        if (!member || !member.name || member.anonymousUntilNamed) return;
        var option = document.createElement("option");
        option.value = member.id || member.name;
        option.textContent = member.name + (member.generation ? " · " + member.generation : "");
        option.dataset.name = member.name;
        select.appendChild(option);
      });
    }).catch(function () {});
  }

  function focusCentre(on) {
    ui.focused = !!on;
    if (document.body && document.body.classList) document.body.classList.toggle("chirombe-audio-focus", ui.focused);
    if (rootEl) rootEl.classList.toggle("is-focus", ui.focused);
    if (on && rootEl && rootEl.scrollIntoView) rootEl.scrollIntoView({ block: "start" });
  }

  async function demo() {
    await activate();
    await testTone();
    try { await testVoice(); } catch (e) {}
    pushFeed("DEMONSTRATION");
    return { ok: true, microphoneStarted: false };
  }

  function onClick(event) {
    var button = event.target.closest ? event.target.closest("button") : null;
    if (!button || !rootEl.contains(button)) return;
    var action = button.getAttribute("data-action");
    var mode = button.getAttribute("data-mode");
    var hz = button.getAttribute("data-hz");
    if (mode) { setMode(mode); return; }
    if (hz) { classifyInput(Number(hz)); return; }
    if (button.getAttribute("data-feedback")) { feedback(button.getAttribute("data-feedback"), button.getAttribute("data-value")); return; }
    if (action === "activate" || action === "start" || action === "quick" || action === "tone" || action === "hardware" || action === "routing" || action === "voice" || action === "demo") {
      var primed = primeGesture();
      var run = action === "activate" ? activate : (action === "tone" || action === "hardware" || action === "routing") ? testTone : action === "voice" ? testVoice : action === "demo" ? demo : startLiturgy;
      Promise.resolve(primed).then(function () { return run(); }).catch(function (err) {
        showPath(audio() && audio().inspectSignalPath ? audio().inspectSignalPath() : null, (err && err.message) || "AUDIO_CONTEXT_NOT_RUNNING");
        pushFeed((err && err.message) || "AUDIO_FAILED");
        render();
      });
      return;
    }
    if (action === "pause") control("pauseLivingLiturgy");
    else if (action === "resume") control("resumeLivingLiturgy");
    else if (action === "stop") control("stopLivingLiturgy");
    else if (action === "next") control("nextLivingStage");
    else if (action === "repeat") control("repeatLivingStage");
    else if (action === "emergency") emergency("UI_EMERGENCY");
    else if (action === "speak") { primeGesture(); speakSelected(); }
    else if (action === "voice-pause") { try { if (perf() && perf().pause) perf().pause(); } catch (e) {} }
    else if (action === "voice-resume") { try { if (perf() && perf().resume) perf().resume(); } catch (e) {} }
    else if (action === "voice-cancel") { try { if (perf() && perf().stop) perf().stop(); } catch (e) {} }
    else if (action === "mic-on") enableMic();
    else if (action === "mic-off") disableMic();
    else if (action === "mic-test") enableMic().then(function (started) {
      if (!started.ok) return started;
      return new Promise(function (resolve) { setTimeout(resolve, 700); }).then(disableMic);
    });
    else if (action === "hz") { var field = $("#ca-hz"); classifyInput(field ? Number(field.value) : NaN); }
    else if (action === "scene") { primeGesture(); testTone(); }
    else if (action === "drone") {
      activate().then(function () {
        if (tonal() && tonal().playDrone) return tonal().playDrone({ frequencyHz: ui.hz || 174, durationMs: 8000, amplitude: 0.04 });
        return { ok: false, reason: "DRONE_UNAVAILABLE" };
      });
    }
    else if (action === "drone-stop") { try { if (tonal() && tonal().stopAll) tonal().stopAll("DRONE_STOP"); } catch (e) {} }
    else if (action === "chant") { try { if (perf() && perf().chant) perf().chant("Peace. Courage. Unity."); } catch (e) {} }
    else if (action === "call") { try { if (perf() && perf().callResponse) perf().callResponse({ call: "Peace be spoken." }); } catch (e) {} }
    else if (action === "respond") { try { if (perf() && perf().submitResponse) perf().submitResponse({ text: ($("#ca-response") && $("#ca-response").value) || "" }); } catch (e) {} }
    else if (action === "diagnostics") diagnostics();
    else if (action === "evolve") evolve();
    else if (action === "snapshot") snapshot();
    else if (action === "rollback") { var A = audio(); if (A && A.rollbackLivingSnapshot) A.rollbackLivingSnapshot().then(function () { pushFeed("ROLLBACK"); render(); }); }
    else if (action === "sandbox" || action === "approve" || action === "reject") {
      var idField = $("#ca-proposal-id");
      var id = idField && idField.value;
      var engine = evo();
      if (!engine || !id) return;
      if (action === "sandbox" && engine.sandboxProposal) engine.sandboxProposal(id);
      if (action === "approve" && engine.approveProposal) engine.approveProposal(id, $("#ca-approval") && $("#ca-approval").value);
      if (action === "reject") pushFeed("PROPOSAL_HELD");
    }
    else if (action === "demo") demo();
    else if (action === "focus") focusCentre(true);
    else if (action === "unfocus") focusCentre(false);
    else if (action === "clear-text") { var area = $("#ca-speak-text"); if (area) area.value = ""; }
    else if (action === "adapt") { ui.adapt = !ui.adapt; savePrefs(); text("#ca-adapt", ui.adapt ? "AUTO ADAPT ON" : "AUTO ADAPT OFF"); }
  }

  function onChange(event) {
    if (event.target.id === "ca-person") {
      ui.person = event.target.value;
      var option = event.target.selectedOptions && event.target.selectedOptions[0];
      ui.personName = option ? (option.dataset.name || option.textContent) : "";
    } else if (event.target.id === "ca-family") { ui.family = event.target.value; savePrefs(); }
    else if (event.target.id === "ca-voice") { try { if (perf() && perf().setVoice) perf().setVoice(event.target.value); } catch (e) {} }
    else if (event.target.id === "ca-lang") { try { if (perf() && perf().setLanguage) perf().setLanguage(event.target.value); } catch (e) {} }
    else if (event.target.id === "ca-gain-slider") setGain(Number(event.target.value) / 100);
  }

  function markup() {
    var modes = MODES.map(function (mode) {
      return '<button type="button" data-mode="' + mode + '">' + mode.replace(/_/g, " ") + "</button>";
    }).join("");
    var presets = PRESETS.map(function (hz) {
      return '<button type="button" data-hz="' + hz + '">' + hz + "</button>";
    }).join("");
    return '' +
      '<style>' +
      '#chirombe-audio-centre{margin:0 0 18px;width:100%;max-width:100vw;overflow:hidden;border:1px solid #1c2a3a;border-radius:18px;background:#0b1019;color:#e9f2ff;font:13px/1.35 Inter,system-ui,sans-serif}' +
      '#chirombe-audio-centre *{box-sizing:border-box}' +
      '#chirombe-audio-centre button,#chirombe-audio-centre input,#chirombe-audio-centre select,#chirombe-audio-centre textarea{min-height:44px;border:1px solid #334252;background:#111a24;color:inherit;border-radius:10px;padding:8px 10px}' +
      '#chirombe-audio-centre button{cursor:pointer}' +
      '#chirombe-audio-centre button.is-on{border-color:#4de7ff}' +
      '#chirombe-audio-centre .ca-head{padding:14px 14px 8px}' +
      '#chirombe-audio-centre h2{margin:0;font-size:18px;letter-spacing:.08em}' +
      '#chirombe-audio-centre .ca-k{color:#8190a5;font-size:10px;letter-spacing:.14em}' +
      '#chirombe-audio-centre .ca-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:8px 12px}' +
      '#chirombe-audio-centre .ca-stat{background:#080d15;border:1px solid #1c2a3a;border-radius:10px;padding:8px}' +
      '#chirombe-audio-centre .ca-stat b{display:block;color:#4de7ff}' +
      '#chirombe-audio-centre .ca-strip{position:sticky;top:0;z-index:50;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:10px;background:#080d15ee}' +
      '#chirombe-audio-centre .ca-hw{margin:10px;border:1px solid #4de7ff;background:#071018;padding:10px;font-family:ui-monospace,monospace;white-space:pre-wrap}' +
      '#chirombe-audio-centre .ca-hw button{min-width:44%}' +
      '#chirombe-audio-centre .ca-banner{margin:8px 10px;padding:10px;background:#3a1218;color:#ffd0d8;font-weight:800}' +
      '#chirombe-audio-centre .ca-card{padding:12px;border-top:1px solid #1c2a3a}' +
      '#chirombe-audio-centre .ca-modes{display:flex;flex-wrap:wrap;gap:6px}' +
      '#chirombe-audio-centre canvas{width:100%;height:96px;display:block;background:#070b12;border-radius:8px}' +
      '#chirombe-audio-centre pre{white-space:pre-wrap;max-height:180px;overflow:auto;background:#05080c;padding:8px;border-radius:8px;margin:8px 0}' +
      '#chirombe-audio-centre input[type=range]{width:100%;padding:0}' +
      'body.chirombe-audio-focus main > :not(#chirombe-audio-centre){display:none !important}' +
      'body.chirombe-audio-focus #chirombe-audio-centre{min-height:70vh}' +
      '@media(min-width:800px){#chirombe-audio-centre .ca-stats{grid-template-columns:repeat(4,minmax(0,1fr))}#chirombe-audio-centre .ca-strip{grid-template-columns:repeat(3,minmax(0,1fr))}}' +
      '</style>' +
      '<header class="ca-head"><p class="ca-k">LIVING LITURGY / VOICE / TONAL</p><h2 id="ca-title">CHIROMBE AUDIO COMMAND CENTRE</h2>' +
      '<button type="button" data-action="focus">OPEN COMMAND CENTRE</button> <button type="button" data-action="unfocus">RETURN TO CHIROMBE</button></header>' +
      '<div id="ca-safe-banner" class="ca-banner" hidden>SAFE STOP ACTIVE — TAP ACTIVATE TO RECOVER</div>' +
      '<section class="ca-hw" id="ca-hw-panel" aria-label="CHIROMBE audio hardware status">' +
      '╔══════════════════════════════════╗\n' +
      '║ CHIROMBE AUDIO HARDWARE STATUS   ║\n' +
      '╠══════════════════════════════════╣\n' +
      '║ AudioContext       <b id="ca-hw-ctx">UNAVAILABLE</b>\n' +
      '║ Sample Rate        <b id="ca-hw-rate">UNAVAILABLE</b>\n' +
      '║ Master Gain        <b id="ca-hw-master">UNAVAILABLE</b>\n' +
      '║ TONE Bus           <b id="ca-hw-tone">UNAVAILABLE</b>\n' +
      '║ Master             <b id="ca-hw-master-node">UNAVAILABLE</b>\n' +
      '║ Analyser           <b id="ca-hw-analyser">UNAVAILABLE</b>\n' +
      '║ Destination        <b id="ca-hw-destination">UNAVAILABLE</b>\n' +
      '║ Active Sources     <b id="ca-hw-sources">0</b>\n' +
      '║ Microphone         <b id="ca-hw-mic">OFF</b>\n' +
      '║ Safety             <b id="ca-hw-safety">UNAVAILABLE</b>\n' +
      '╠══════════════════════════════════╣\n' +
      '║ SIGNAL LEVEL <b id="ca-hw-level">░░░░░░░░░░</b>\n' +
      '║ SIGNAL DETECTED: <b id="ca-signal-detected">NO</b>\n' +
      '║ STAGE <b id="ca-hw-stage">IDLE</b>\n' +
      '╠══════════════════════════════════╣\n' +
      '║ <button type="button" data-action="tone">TEST TONE</button> <button type="button" data-action="voice">TEST VOICE</button>\n' +
      '║ <button type="button" data-action="routing">TEST ROUTING</button> <button type="button" data-action="emergency">EMERGENCY</button>\n' +
      '╚══════════════════════════════════╝\n' +
      '<div id="ca-signal-note"></div>' +
      '<div class="ca-k">BUILD <span id="ca-build-id">audio-hw-path</span> · COMMIT <span id="ca-commit">audio-hw-path</span></div>' +
      '<div>KERNEL <span id="ca-build-kernel">UNAVAILABLE</span> · TONAL <span id="ca-build-tonal">UNAVAILABLE</span> · PERFORMANCE <span id="ca-build-perf">UNAVAILABLE</span></div>' +
      '<div>SAFETY <span id="ca-build-safety">UNAVAILABLE</span> · EVOLUTION <span id="ca-build-evo">UNAVAILABLE</span> · CACHE <span id="ca-build-cache">CHIROMBE_STATIC_v10</span></div>' +
      '<div class="ca-k">SELECTED VOICE <span id="ca-voice-selected">UNAVAILABLE</span></div><pre id="ca-voice-list">VOICES NOT QUERIED</pre>' +
      '<pre id="ca-path-json">NO DIAGNOSTIC YET</pre></section>' +
      '<div class="ca-stats">' +
      '<div class="ca-stat"><span class="ca-k">KERNEL</span><b id="ca-kernel">STANDBY</b></div>' +
      '<div class="ca-stat"><span class="ca-k">AUDIO CONTEXT</span><b id="ca-ctx">UNAVAILABLE</b></div>' +
      '<div class="ca-stat"><span class="ca-k">SESSION</span><b id="ca-session">IDLE</b></div>' +
      '<div class="ca-stat"><span class="ca-k">VOICE</span><b id="ca-voice">UNAVAILABLE</b></div>' +
      '<div class="ca-stat"><span class="ca-k">MIC</span><b id="ca-mic">OFF</b></div>' +
      '<div class="ca-stat"><span class="ca-k">SAFETY</span><b id="ca-safety">ARMED</b></div>' +
      '<div class="ca-stat"><span class="ca-k">EVOLUTION</span><b id="ca-evo">UNAVAILABLE</b></div>' +
      '<div class="ca-stat"><span class="ca-k">NETWORK</span><b id="ca-online">UNKNOWN</b></div></div>' +
      '<div class="ca-strip">' +
      '<button type="button" data-action="activate" aria-label="Activate audio">ACTIVATE AUDIO</button>' +
      '<button type="button" data-action="start" aria-label="Start living liturgy">START LIVING LITURGY</button>' +
      '<button type="button" data-action="pause" aria-label="Pause">PAUSE</button>' +
      '<button type="button" data-action="resume" aria-label="Resume">RESUME</button>' +
      '<button type="button" data-action="stop" aria-label="Stop">STOP</button>' +
      '<button type="button" data-action="tone" aria-label="Test tone">TEST TONE</button>' +
      '<button type="button" data-action="voice" aria-label="Test voice">TEST VOICE</button>' +
      '<button type="button" data-action="diagnostics" aria-label="Run audio diagnostics">DIAGNOSTICS</button>' +
      '<button type="button" class="ca-stop" data-action="emergency" aria-label="Emergency stop">EMERGENCY STOP</button></div>' +
      '<section class="ca-card"><div class="ca-k">QUICK START</div><p>Activate, choose a mode, then start. Nothing plays or listens until you tap.</p><button type="button" data-action="quick">QUICK START</button> <button type="button" data-action="demo">DEMONSTRATION</button></section>' +
      '<section class="ca-card"><div class="ca-k">MASTER OUTPUT</div><div>CURRENT <span id="ca-gain">UNAVAILABLE</span> · LIMIT <span id="ca-ceiling">65% MAX</span> · MODE <span id="ca-mode">PEACE</span></div><input id="ca-gain-slider" type="range" min="0" max="65" value="42" aria-label="Master gain"></section>' +
      '<section class="ca-card"><div class="ca-k">LIVE METERS</div><div>MASTER <span id="ca-level">ANALYSER UNAVAILABLE</span></div><div>PEAK <span id="ca-peak">ANALYSER UNAVAILABLE</span></div><div>RMS <span id="ca-rms">ANALYSER UNAVAILABLE</span></div><div>CLIPPING <span id="ca-clip">UNAVAILABLE</span> · DC <span id="ca-dc">UNAVAILABLE</span></div></section>' +
      '<section class="ca-card"><div class="ca-k">LIVE SPECTRUM · 20 Hz TO NYQUIST</div><canvas id="ca-spectrum" aria-label="Live spectrum"></canvas><div>DOMINANT <span id="ca-dominant">UNAVAILABLE</span> · TONE <span id="ca-fund">UNAVAILABLE</span> · RATE <span id="ca-sample">UNAVAILABLE</span> · NYQUIST <span id="ca-nyquist">UNAVAILABLE</span></div><div class="ca-k">LIVE WAVEFORM</div><canvas id="ca-wave" aria-label="Live waveform"></canvas></section>' +
      '<section class="ca-card"><div class="ca-k">AUDIO BUS MATRIX</div><pre id="ca-buses">WAITING FOR KERNEL</pre></section>' +
      '<section class="ca-card"><div class="ca-k">MODE — SELECTING DOES NOT START AUDIO</div><div class="ca-modes">' + modes + '</div></section>' +
      '<details class="ca-card"><summary>VOICE COMMAND DECK</summary><label class="ca-k">LANGUAGE</label><select id="ca-lang" aria-label="Language"><option>en-GB</option><option>sn-ZW</option><option>zu-ZA</option><option>xh-ZA</option><option>fr-FR</option><option>pt-PT</option><option>es-ES</option></select><label class="ca-k">DEVICE VOICE</label><select id="ca-voice" aria-label="Voice"><option>UNAVAILABLE ON THIS DEVICE</option></select><textarea id="ca-speak-text" aria-label="Text to speak">CHIROMBE audio system ready.</textarea><button type="button" data-action="speak">SPEAK</button> <button type="button" data-action="voice-pause">PAUSE</button> <button type="button" data-action="voice-resume">RESUME</button> <button type="button" data-action="voice-cancel">CANCEL</button> <button type="button" data-action="clear-text">CLEAR</button></details>' +
      '<details class="ca-card"><summary>CHANT / CALL AND RESPONSE</summary><p class="ca-k">DEVOTIONAL PRACTICE. NOT A DETECTION.</p><button type="button" data-action="chant">START CHANT</button> <button type="button" data-action="call">CALL</button> <button type="button" data-action="respond">RESPOND</button><textarea id="ca-response" aria-label="Manual response"></textarea><p>Microphone stays off unless you enable it below.</p></details>' +
      '<details class="ca-card" open><summary>LIVING LITURGY SESSION</summary><div id="ca-session-detail">NONE</div><button type="button" data-action="start">START</button> <button type="button" data-action="pause">PAUSE</button> <button type="button" data-action="resume">RESUME</button> <button type="button" data-action="next">NEXT</button> <button type="button" data-action="repeat">REPEAT</button> <button type="button" data-action="stop">STOP</button><div class="ca-k">SESSION TIMELINE</div><pre id="ca-timeline">NO EVENTS YET</pre></details>' +
      '<details class="ca-card"><summary>FREQUENCY AND TONE</summary><div>CLASS <span id="ca-freq-class">UNAVAILABLE</span> · SCENE <span id="ca-scene">NONE</span></div><div class="ca-modes">' + presets + '</div><input id="ca-hz" inputmode="decimal" aria-label="Frequency hertz" placeholder="440"><button type="button" data-action="hz">CLASSIFY</button> <button type="button" data-action="scene">PLAY SCENE</button> <button type="button" data-action="drone">START DRONE</button> <button type="button" data-action="drone-stop">STOP DRONE</button><p class="ca-k">Harmonics are produced inside the tonal engine and stay under its oscillator ceiling. An iPhone speaker is not an RF transmitter.</p></details>' +
      '<details class="ca-card"><summary>ENVIRONMENT AND MICROPHONE</summary><p>MICROPHONE <b id="ca-mic-label">OFF</b></p><button type="button" data-action="mic-on">ENABLE MICROPHONE</button> <button type="button" data-action="mic-off">DISABLE MICROPHONE</button> <button type="button" data-action="mic-test">TEST MICROPHONE</button><p>LOCAL ANALYSIS. NO RECORDING. NO RAW AUDIO STORAGE.</p><button type="button" data-action="adapt" id="ca-adapt">AUTO ADAPT OFF</button><p class="ca-k">Sensor readings are observations. They are not evidence of a spiritual event. SPATIAL PANNER is a browser capability used inside a tone when that tone requests pan. There is no separate spatial transmitter.</p><select id="ca-family" aria-label="Family scope"><option value="none">GENERAL / NO PERSON</option><option value="circle">WHOLE APPROVED CIRCLE</option></select><select id="ca-person" aria-label="Approved person"><option value="">SELECT APPROVED PERSON</option></select></details>' +
      '<details class="ca-card"><summary>SAFETY AND EVOLUTION</summary><p>Gain, frequency, duration, and oscillator ceilings stay inside the kernel. This panel cannot turn them off.</p><div>GENERATION <span id="ca-gen">UNAVAILABLE</span> · PROPOSALS <span id="ca-proposals">UNAVAILABLE</span> · SNAPSHOTS <span id="ca-snapshots">UNAVAILABLE</span></div><pre id="ca-proposal-list">NO PROPOSALS</pre><input id="ca-proposal-id" aria-label="Proposal id" placeholder="proposal id"><input id="ca-approval" aria-label="Approval token" placeholder="approval token"><button type="button" data-action="evolve">ANALYSE</button> <button type="button" data-action="sandbox">SANDBOX</button> <button type="button" data-action="approve">APPROVE</button> <button type="button" data-action="reject">REJECT</button> <button type="button" data-action="snapshot">SNAPSHOT</button> <button type="button" data-action="rollback">ROLLBACK</button><div class="ca-modes"><button type="button" data-feedback="quality" data-value="5">QUALITY</button><button type="button" data-feedback="comfort" data-value="5">COMFORT</button><button type="button" data-feedback="coherence" data-value="5">COHERENCE</button><button type="button" data-feedback="pace" data-value="good">PACE GOOD</button><button type="button" data-feedback="volume" data-value="good">VOLUME GOOD</button></div></details>' +
      '<details class="ca-card"><summary>SYSTEM INSPECTOR</summary><div>INSTALL <span id="ca-install"></span></div><div>CACHE <span id="ca-cache"></span></div><div>KERNEL <span id="ca-kernel-version"></span></div><div>EVOLUTION <span id="ca-evo-version"></span></div><div>LAST ERROR <span id="ca-errors">NONE</span></div><button type="button" data-action="diagnostics">RUN FULL DIAGNOSTIC</button><pre id="ca-diagnostics">NOT RUN</pre><div class="ca-k">LIVE AUDIO EVENT STREAM</div><pre id="ca-feed">NO EVENTS YET</pre></details>';
  }

  function mount() {
    if (document.getElementById("chirombe-audio-centre")) rootEl = document.getElementById("chirombe-audio-centre");
    else {
      rootEl = document.createElement("section");
      rootEl.id = "chirombe-audio-centre";
      rootEl.setAttribute("aria-label", "CHIROMBE Audio Command Centre");
      rootEl.innerHTML = markup();
      var host = document.querySelector("main") || document.body;
      if (host.firstChild) host.insertBefore(rootEl, host.firstChild);
      else host.appendChild(rootEl);
    }
    if (!ui.bound) {
      rootEl.addEventListener("click", onClick);
      rootEl.addEventListener("change", onChange);
      rootEl.addEventListener("input", onChange);
      ui.bound = true;
    }
    var opener = document.getElementById("open-audio-centre");
    if (opener && !opener.__audioBound) {
      opener.__audioBound = true;
      opener.addEventListener("click", function () { focusCentre(true); });
    }
    loadVoices();
    loadFamily();
    render();
    if (!ui.raf && g.requestAnimationFrame) ui.raf = g.requestAnimationFrame(loop);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (ui.raf && g.cancelAnimationFrame) g.cancelAnimationFrame(ui.raf);
        ui.raf = 0;
        try { if (env() && env().stopMicrophone) env().stopMicrophone(); } catch (e) {}
      } else if (!ui.raf && g.requestAnimationFrame) ui.raf = g.requestAnimationFrame(loop);
    });
  }

  function registerCommands() {
    if (!g.ChirombeBus || !g.ChirombeBus.registerCommand || g.__CHIROMBE_AUDIO_COMMANDS__) return;
    var commands = {
      "audio.activate": activate,
      "audio.start": function (args) { if (args && args.mode) setMode(args.mode); return startLiturgy(); },
      "audio.pause": function () { return control("pauseLivingLiturgy"); },
      "audio.resume": function () { return control("resumeLivingLiturgy"); },
      "audio.stop": function () { return control("stopLivingLiturgy"); },
      "audio.emergencyStop": function (args) { return emergency(args && args.reason); },
      "audio.speak": function (args) { return perf() && perf().speakText ? perf().speakText((args && args.text) || "CHIROMBE audio system ready.") : { ok: false, reason: "SPEECH_UNAVAILABLE" }; },
      "audio.testTone": testTone,
      "audio.microphone.enable": enableMic,
      "audio.microphone.disable": disableMic,
      "audio.liturgy.start": startLiturgy,
      "audio.liturgy.stop": function () { return control("stopLivingLiturgy"); },
      "audio.evolution.analyse": evolve,
      "audio.evolution.snapshot": snapshot,
      "audio.evolution.rollback": function () { var A = audio(); return A && A.rollbackLivingSnapshot ? A.rollbackLivingSnapshot() : { ok: false }; },
      "audio.diagnostics": diagnostics,
      "audio.status": function () { var A = audio(); return A && A.getStatus ? A.getStatus() : { available: false }; }
    };
    Object.keys(commands).forEach(function (name) {
      try { g.ChirombeBus.registerCommand(name, commands[name], { subsystem: "audio" }); } catch (e) {}
    });
    g.__CHIROMBE_AUDIO_COMMANDS__ = true;
  }

  function boot() {
    var A = audio();
    if (!A || typeof A.getStatus !== "function") return false;
    loadPrefs();
    extendStatus();
    extendHealth();
    wrapEmit();
    registerCommands();
    if (document.body) mount();
    else document.addEventListener("DOMContentLoaded", mount);
    if (g.ChirombeSystem) g.ChirombeSystem.audio = audioHealth();
    audit("AUDIO_COMMAND_CENTRE_READY", { version: VERSION, cache: CACHE, autoplay: false, microphone: "OFF" });
    pushFeed("AUDIO_COMMAND_CENTRE_READY");
    return true;
  }

  g.CHIROMBE_AUDIO_UI = {
    VERSION: VERSION,
    CACHE: CACHE,
    init: boot,
    bind: mount,
    render: render,
    renderStatus: render,
    renderDiagnostics: diagnostics,
    activate: activate,
    emergency: emergency,
    setMode: setMode,
    focus: focusCentre,
    destroy: function () { if (rootEl && rootEl.parentNode) rootEl.parentNode.removeChild(rootEl); rootEl = null; ui.bound = false; }
  };

  if (!boot()) {
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      if (boot() || tries > 40) clearInterval(timer);
    }, 250);
  }
})(typeof window !== "undefined" ? window : globalThis);
