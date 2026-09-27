(function (g) {
  "use strict";
  if (g.__CHIROMBE_AUDIO_INSTALL__) return;
  g.__CHIROMBE_AUDIO_INSTALL__ = true;

  var VERSION = "1.0.0";
  var MODES = ["PROTECTION", "PEACE", "COURAGE", "UNITY", "GRATITUDE", "REMEMBRANCE", "FAMILY_BLESSING", "REFLECTION", "NIGHT_WATCH", "DAWN", "EVENING", "RECOVERY", "ALERT", "SILENT_WATCH", "CLOSING"];
  var SCENE = { FAMILY_BLESSING: "UNITY", SILENT_WATCH: null };
  var ui = { mode: "PEACE", person: "", family: "none", notify: false, feed: [], recoveryAttempts: 0, raf: 0, bound: false };
  var rootEl = null;

  function audio() { return g.CHIROMBE_AUDIO || null; }
  function tonal() { return g.CHIROMBE_AUDIO_TONAL_ENGINE || null; }
  function env() { return g.CHIROMBE_AUDIO_ENVIRONMENT_ENGINE || null; }
  function perf() { return g.CHIROMBE_AUDIO_PERFORMANCE_ENGINE || null; }
  function evo() { return g.CHIROMBE_AUDIO_EVOLUTION || (audio() && audio().Evolution) || null; }
  function safety() { return g.CHIROMBE_AUDIO_SAFETY_ENGINE || null; }

  function $(id) { return rootEl ? rootEl.querySelector(id) : null; }
  function text(id, value) { var n = $(id); if (n) n.textContent = value; }

  function audit(action, detail) {
    try {
      if (g.ChirombeAudit && typeof g.ChirombeAudit.append === "function") g.ChirombeAudit.append(action, detail || {});
    } catch (e) {}
    try {
      var A = audio();
      if (A && typeof A.remember === "function") A.remember(action, detail || {}, 0.4);
    } catch (e) {}
  }

  function pushFeed(type, payload) {
    var line = new Date().toLocaleTimeString() + "  " + String(type || "EVENT");
    ui.feed.unshift(line);
    if (ui.feed.length > 40) ui.feed.pop();
    var box = $("#ca-feed");
    if (box) box.textContent = ui.feed.join("\n");
    if (payload && payload.note) line += "";
  }

  function organ(obj) {
    try { return obj && typeof obj.getStatus === "function" ? obj.getStatus() : { available: !!obj }; }
    catch (e) { return { available: false, error: String(e.message || e) }; }
  }

  function audioHealth() {
    var A = audio();
    if (!A) return { status: "UNAVAILABLE", lifecycle: "UNAVAILABLE", audioContext: "UNAVAILABLE" };
    var life = "UNKNOWN";
    var ctx = "UNAVAILABLE";
    try { life = (A.state && A.state.lifecycle) || "UNKNOWN"; } catch (e) {}
    try {
      var context = A.getAudioContext && A.getAudioContext();
      ctx = context ? context.state : "UNAVAILABLE";
    } catch (e) {}
    var status = "DEGRADED";
    if (!A.getStatus) status = "UNAVAILABLE";
    else if (life === "SAFE_STOP") status = "SAFE_STOP";
    else if (life === "ERROR") status = "ERROR";
    else if (ctx === "running") status = "HEALTHY";
    else if (ctx === "suspended") status = "DEGRADED";
    else if (ctx === "UNAVAILABLE") status = "UNAVAILABLE";
    return { status: status, lifecycle: life, audioContext: ctx, microphone: "OFF" };
  }

  function extendStatus() {
    var A = audio();
    if (!A || A.__audioInstallWrapped || typeof A.getStatus !== "function") return;
    var previous = A.getStatus;
    A.getStatus = function () {
      var base = previous() || {};
      base.kernel = { version: base.version, build: base.build, lifecycle: base.lifecycle };
      var context = null;
      try { context = A.getAudioContext && A.getAudioContext(); } catch (e) {}
      base.audioContext = context ? context.state : (base.audioContext || "UNAVAILABLE");
      base.sampleRate = context ? context.sampleRate : base.sampleRate;
      base.nyquist = context ? context.sampleRate / 2 : base.nyquistHz;
      try { base.buses = A.getBuses ? Object.keys(A.getBuses()) : base.buses; } catch (e) {}
      base.tonal = organ(tonal());
      base.environment = organ(env());
      base.performance = organ(perf());
      base.voice = { available: !!(perf() && perf().supported && perf().supported()), speaking: !!(g.speechSynthesis && g.speechSynthesis.speaking) };
      var mic = base.environment && base.environment.microphone;
      base.microphone = { active: !!(mic && mic.active), state: mic && mic.active ? "ACTIVE" : "OFF", permission: mic && mic.permission || "unknown" };
      base.safety = organ(safety());
      base.liturgy = organ(A.Liturgy);
      base.evolution = base.evolutionLayer || organ(evo());
      base.watchdog = g.ChirombeWatchdog ? "CONNECTED" : "UNAVAILABLE";
      base.health = g.ChirombeHealth ? "CONNECTED" : "UNAVAILABLE";
      base.persistence = { localStorage: (function () { try { return typeof localStorage !== "undefined"; } catch (e) { return false; } })() };
      base.installation = { version: VERSION, independentCm90Context: false, playbackOnLoad: false };
      base.warnings = base.warnings;
      base.errors = base.errors;
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
      return event;
    };
    A.__installEmitWrapped = true;
  }

  async function activate() {
    var A = audio();
    if (!A) return { ok: false, reason: "KERNEL_UNAVAILABLE" };
    ui.recoveryAttempts += 1;
    if (ui.recoveryAttempts > 6) return { ok: false, reason: "RECOVERY_LIMIT" };
    try { if (typeof A.recoverFromSafeStop === "function") A.recoverFromSafeStop("ACTIVATE"); } catch (e) {}
    try { if (typeof A.reset === "function") A.reset(); } catch (e) {}
    var unlocked = false;
    try { unlocked = await A.unlockAudio(); } catch (e) { unlocked = false; }
    var T = tonal();
    try { if (T && typeof T.resume === "function") await T.resume(); } catch (e) {}
    try { if (T && typeof T.initialise === "function") await T.initialise(); } catch (e) {}
    try { if (safety() && typeof safety().arm === "function") safety().arm(); } catch (e) {}
    audit("AUDIO_ACTIVATED", { unlocked: !!unlocked, attempt: ui.recoveryAttempts });
    pushFeed("AUDIO_UNLOCKED");
    render();
    return { ok: true, unlocked: !!unlocked };
  }

  async function emergency(reason) {
    var T = tonal();
    var P = perf();
    var E = env();
    try { if (T && typeof T.safeStop === "function") T.safeStop(reason || "UI_EMERGENCY"); } catch (e) {}
    try { if (P && typeof P.stop === "function") P.stop(); } catch (e) {}
    try { if (g.speechSynthesis) g.speechSynthesis.cancel(); } catch (e) {}
    try { if (E && typeof E.stopMicrophone === "function") E.stopMicrophone(); } catch (e) {}
    var A = audio();
    try { if (A && typeof A.safeStop === "function") A.safeStop(reason || "UI_EMERGENCY"); } catch (e) {}
    try { if (A && typeof A.emergencyStop === "function") A.emergencyStop(reason || "UI_EMERGENCY"); } catch (e) {}
    audit("AUDIO_EMERGENCY_STOP", { reason: reason || "UI" });
    pushFeed("SAFE_STOP");
    render();
    return { ok: true, state: "SAFE_STOP" };
  }

  function sceneFor(mode) {
    if (Object.prototype.hasOwnProperty.call(SCENE, mode)) return SCENE[mode];
    return mode;
  }

  async function startLiturgy() {
    var A = audio();
    if (!A || typeof A.startLivingLiturgy !== "function") return { ok: false, reason: "ORCHESTRATOR_UNAVAILABLE" };
    await activate();
    var people = [];
    if (ui.person) people.push({ id: ui.person, name: ui.personName || ui.person, relationship: "approved-record" });
    var started = await A.startLivingLiturgy({
      mode: ui.mode,
      gesture: true,
      people: people,
      useApprovedFamily: ui.family === "circle",
      intention: ui.mode
    });
    var scene = sceneFor(ui.mode);
    var tone = null;
    if (scene && tonal() && typeof tonal().playScene === "function") {
      try { tone = await tonal().playScene(scene, { durationMs: 20000, amplitude: 0.04 }); } catch (e) { tone = { ok: false, error: String(e.message || e) }; }
    }
    audit("LITURGY_STARTED", { mode: ui.mode, person: ui.person || null, tone: !!(tone && tone.ok) });
    pushFeed("LITURGY_STARTED");
    render();
    return { ok: !!(started && started.ok), started: started, tone: tone, microphoneStarted: false };
  }

  async function control(name) {
    var A = audio();
    if (!A) return { ok: false, reason: "KERNEL_UNAVAILABLE" };
    var fn = A[name];
    if (typeof fn !== "function") return { ok: false, reason: "UNAVAILABLE" };
    var result = await fn();
    audit(name, {});
    render();
    return result;
  }

  async function testTone() {
    await activate();
    var T = tonal();
    if (!T || typeof T.playScene !== "function") return { ok: false, reason: "TONAL_UNAVAILABLE" };
    var scene = sceneFor(ui.mode) || "PEACE";
    var result = await T.playScene(scene, { durationMs: 900, amplitude: 0.05 });
    audit("TEST_TONE", { scene: scene, ok: !!(result && result.ok) });
    pushFeed(result && result.ok ? "TONE_STARTED" : "TONE_REJECTED");
    render();
    return result;
  }

  async function testVoice() {
    var P = perf();
    if (!P || typeof P.speakText !== "function") return { ok: false, reason: "SPEECH_UNAVAILABLE" };
    var result = await P.speakText("CHIROMBE audio system ready.", { rate: 0.92 });
    audit("TEST_VOICE", result || {});
    pushFeed("VOICE_READY");
    render();
    return result;
  }

  async function speakSelected() {
    var P = perf();
    var field = $("#ca-speak-text");
    var textValue = field ? field.value : "";
    if (!P || typeof P.speakText !== "function") return { ok: false, reason: "SPEECH_UNAVAILABLE" };
    return P.speakText(textValue || "CHIROMBE audio system ready.");
  }

  async function enableMic() {
    var E = env();
    if (!E || typeof E.requestMicrophone !== "function") return { ok: false, reason: "MICROPHONE_UNAVAILABLE" };
    var A = audio();
    if (!A || !A.getAudioContext || !A.getAudioContext()) await activate();
    var ok = await E.requestMicrophone();
    audit("MIC_ENABLED", { ok: !!ok });
    pushFeed(ok ? "MIC_ENABLED" : "MIC_DENIED");
    render();
    return { ok: !!ok };
  }

  function disableMic() {
    var E = env();
    try { if (E && typeof E.stopMicrophone === "function") E.stopMicrophone(); } catch (e) {}
    audit("MIC_DISABLED", {});
    pushFeed("MIC_DISABLED");
    render();
    return { ok: true };
  }

  async function testMic() {
    var started = await enableMic();
    if (!started.ok) return started;
    await new Promise(function (resolve) { setTimeout(resolve, 700); });
    var E = env();
    var measured = null;
    try { if (E && typeof E.analyseMicrophone === "function") measured = E.analyseMicrophone(); } catch (e) {}
    disableMic();
    return { ok: true, measured: measured, storedAudio: false };
  }

  function classifyInput() {
    var field = $("#ca-hz");
    var hz = field ? Number(field.value) : NaN;
    var A = audio();
    var result = A && typeof A.validateFrequency === "function" ? A.validateFrequency(hz) : { classification: "UNAVAILABLE", supported: false };
    var nyquist = null;
    try { var c = A && A.getAudioContext && A.getAudioContext(); nyquist = c ? c.sampleRate / 2 : null; } catch (e) {}
    var label = result.classification || result.class || (result.supported ? "AUDIBLE" : "UNSUPPORTED");
    if (nyquist && hz > nyquist) label = "NOT PHYSICALLY TRANSMITTED";
    if (hz >= 1000000) label = "RF FREQUENCY METADATA — NOT PHYSICALLY TRANSMITTED";
    text("#ca-freq-class", label);
    text("#ca-nyquist", nyquist ? String(Math.round(nyquist)) + " Hz" : "UNAVAILABLE");
    audit("FREQUENCY_CLASSIFIED", { hz: hz, label: label });
    return { hz: hz, label: label, result: result };
  }

  function setMode(mode) {
    if (MODES.indexOf(mode) < 0) return { ok: false, reason: "UNKNOWN_MODE" };
    ui.mode = mode;
    var A = audio();
    if (A && A.master && A.master.session) A.master.session.mode = mode;
    try { if (evo() && typeof evo().updatePreference === "function") evo().updatePreference("mode", mode, 0.1, 1); } catch (e) {}
    audit("MODE_SELECTED", { mode: mode });
    render();
    return { ok: true, mode: mode, started: false };
  }

  function feedback(kind, value) {
    try {
      if (evo() && typeof evo().recordObservation === "function") evo().recordObservation("USER_FEEDBACK", { kind: kind, value: value, supernaturalClaim: false });
    } catch (e) {}
    audit("USER_FEEDBACK", { kind: kind, value: value });
    pushFeed("EVOLUTION_OBSERVATION");
    return { ok: true };
  }

  async function evolve() {
    var engine = evo();
    if (!engine || typeof engine.analyseAdaptation !== "function") return { ok: false, reason: "EVOLUTION_UNAVAILABLE" };
    var analysis = await engine.analyseAdaptation();
    pushFeed("EVOLUTION_PROPOSAL");
    render();
    return analysis;
  }

  async function snapshot() {
    var A = audio();
    if (!A || typeof A.createSnapshot !== "function") return { ok: false, reason: "UNAVAILABLE" };
    var result = await A.createSnapshot("ui");
    audit("SNAPSHOT_CREATED", result || {});
    pushFeed("SNAPSHOT_CREATED");
    render();
    return result;
  }

  function diagnostics() {
    var A = audio();
    var rows = [];
    function row(name, result, detail) { rows.push({ name: name, result: result, detail: detail || null }); }
    row("namespace", A ? "PASS" : "FAIL");
    row("kernel", A && typeof A.getStatus === "function" ? "PASS" : "FAIL");
    row("emergency stop", A && typeof A.emergencyStop === "function" ? "PASS" : "FAIL", "not invoked");
    row("safe stop", A && typeof A.safeStop === "function" ? "PASS" : "FAIL", "not invoked");
    row("living watch", A && typeof A.startLivingWatch === "function" ? "PASS" : "FAIL");
    var context = null;
    try { context = A && A.getAudioContext && A.getAudioContext(); } catch (e) {}
    row("Web Audio", (g.AudioContext || g.webkitAudioContext) ? "PASS" : "UNAVAILABLE");
    row("AudioContext", context ? "PASS" : "WARN", context ? context.state : "not created until activation");
    row("buses", A && A.getBuses && Object.keys(A.getBuses()).length >= 8 ? "PASS" : "WARN");
    row("limiter", context ? "PASS" : "WARN", "kernel chain is created with the context");
    row("analyser", A && A.getAnalyser && A.getAnalyser() ? "PASS" : "WARN");
    row("tonal engine", tonal() ? "PASS" : "UNAVAILABLE");
    row("environment engine", env() ? "PASS" : "UNAVAILABLE");
    row("performance engine", perf() ? "PASS" : "UNAVAILABLE");
    row("safety engine", safety() || (A && A.emergencyStop) ? "PASS" : "UNAVAILABLE");
    row("evolution engine", evo() && typeof evo().beginSession === "function" ? "PASS" : "FAIL");
    row("single evolution", evo() && evo().VERSION === "9.0.0" ? "PASS" : "FAIL", evo() && evo().VERSION);
    row("liturgy engine", A && A.Liturgy && A.Liturgy.commands ? "PASS" : "UNAVAILABLE");
    row("bloodline", g.CHIROMBE_AUDIO_BLOODLINE_ORCHESTRATOR ? "PASS" : "UNAVAILABLE");
    row("event bus", g.ChirombeBus ? "PASS" : "UNAVAILABLE");
    row("persistence", (function () { try { return typeof localStorage !== "undefined" ? "PASS" : "UNAVAILABLE"; } catch (e) { return "UNAVAILABLE"; } })());
    row("speech synthesis", (g.speechSynthesis || (perf() && perf().supported && perf().supported())) ? "PASS" : "UNAVAILABLE");
    row("microphone capability", (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ? "PASS" : "UNAVAILABLE", "still off until enabled");
    row("UI bindings", ui.bound ? "PASS" : "FAIL");
    row("CM90 independent context", g.CHIROMBE_TONAL && g.CHIROMBE_TONAL.status && g.CHIROMBE_TONAL.status().independentContext === false ? "PASS" : "WARN");
    var box = $("#ca-diagnostics");
    if (box) box.textContent = rows.map(function (item) { return item.result + "  " + item.name + (item.detail ? "  " + item.detail : ""); }).join("\n");
    audit("AUDIO_DIAGNOSTICS", { rows: rows.length });
    return { ok: rows.every(function (item) { return item.result !== "FAIL"; }), rows: rows };
  }

  function draw() {
    var canvas = $("#ca-visual");
    if (!canvas || !canvas.getContext) return;
    var ctx2d = canvas.getContext("2d");
    var A = audio();
    var analyser = A && A.getAnalyser && A.getAnalyser();
    var context = A && A.getAudioContext && A.getAudioContext();
    var w = canvas.width = canvas.clientWidth || 320;
    var h = canvas.height = 72;
    ctx2d.clearRect(0, 0, w, h);
    ctx2d.fillStyle = "#070b12";
    ctx2d.fillRect(0, 0, w, h);
    if (!analyser || !context || context.state !== "running") {
      ctx2d.fillStyle = "#8190a5";
      ctx2d.font = "12px sans-serif";
      ctx2d.fillText("ANALYSER UNAVAILABLE", 12, 40);
      return;
    }
    var bins = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(bins);
    var step = Math.max(1, Math.floor(bins.length / 64));
    ctx2d.fillStyle = "#4de7ff";
    for (var i = 0; i < 64; i++) {
      var value = bins[i * step] / 255;
      var bh = Math.max(1, value * (h - 8));
      ctx2d.fillRect(8 + i * ((w - 16) / 64), h - 4 - bh, Math.max(2, (w - 16) / 64 - 2), bh);
    }
  }

  function loop() {
    if (document.hidden) { ui.raf = 0; return; }
    draw();
    ui.raf = g.requestAnimationFrame ? g.requestAnimationFrame(loop) : 0;
  }

  function render() {
    if (!rootEl) return;
    var A = audio();
    var status = A && A.getStatus ? A.getStatus() : null;
    var life = status && (status.lifecycle || (status.kernel && status.kernel.lifecycle)) || "UNAVAILABLE";
    var ctxState = status && status.audioContext || "UNAVAILABLE";
    if (ctxState && typeof ctxState === "object") ctxState = "UNAVAILABLE";
    var mic = status && status.microphone && status.microphone.active ? "ACTIVE" : "OFF";
    var evoState = status && status.evolution && (status.evolution.state || status.evolution.status) || "UNAVAILABLE";
    text("#ca-life", String(life));
    text("#ca-ctx", String(ctxState));
    text("#ca-mic", mic);
    text("#ca-evo", String(evoState));
    text("#ca-mode", ui.mode);
    var gain = status && typeof status.masterGain === "number" ? Math.round(status.masterGain * 100) + "%" : "UNAVAILABLE";
    text("#ca-gain", gain);
    var header = document.getElementById("ca-header-state");
    if (header) header.textContent = "AUDIO " + String(life);
    var session = A && A.master && A.master.session;
    text("#ca-session", session ? (session.mode + " · " + session.sessionId) : "NONE");
    var tonalStatus = status && status.tonal;
    text("#ca-scene", (tonalStatus && tonalStatus.currentScene) || "NONE");
    text("#ca-fund", tonalStatus && tonalStatus.currentFundamental ? String(tonalStatus.currentFundamental) + " Hz" : "UNAVAILABLE");
    var envStatus = status && status.environment;
    text("#ca-env-mic", mic);
    text("#ca-env-note", "OBSERVATION. Symbolic interpretation is user-directed, not a detection.");
    if (envStatus && envStatus.microphone) {
      text("#ca-rms", envStatus.analysis && envStatus.analysis.rms != null ? String(envStatus.analysis.rms) : "UNAVAILABLE");
    } else text("#ca-rms", "UNAVAILABLE");
    var evolution = status && status.evolution;
    if (evolution) {
      text("#ca-gen", String(evolution.generation != null ? evolution.generation : "UNAVAILABLE"));
      text("#ca-proposals", evolution.memory ? String(evolution.memory.proposals) : "UNAVAILABLE");
    }
    var buttons = rootEl.querySelectorAll("[data-mode]");
    buttons.forEach(function (button) { button.classList.toggle("is-on", button.getAttribute("data-mode") === ui.mode); });
  }

  function loadVoices() {
    var P = perf();
    var select = $("#ca-voice");
    if (!select || !P || typeof P.refreshVoices !== "function") return;
    var voices = [];
    try { voices = P.refreshVoices() || []; } catch (e) { voices = []; }
    select.textContent = "";
    if (!voices.length) {
      var empty = document.createElement("option");
      empty.textContent = "UNAVAILABLE";
      select.appendChild(empty);
      return;
    }
    voices.forEach(function (voice) {
      var option = document.createElement("option");
      option.value = voice.name || voice.voiceURI || "";
      option.textContent = (voice.name || "voice") + (voice.lang ? " · " + voice.lang : "");
      select.appendChild(option);
    });
  }

  function loadFamily() {
    var select = $("#ca-person");
    if (!select || typeof fetch !== "function") return;
    fetch("./data/family.json").then(function (response) { return response.json(); }).then(function (data) {
      var members = data && Array.isArray(data.members) ? data.members : [];
      members.forEach(function (member) {
        if (!member || !member.name || member.anonymousUntilNamed) return;
        var option = document.createElement("option");
        option.value = member.id || member.name;
        option.textContent = member.name + (member.generation ? " · " + member.generation : "");
        option.dataset.name = member.name;
        select.appendChild(option);
      });
    }).catch(function () {});
  }

  function onClick(event) {
    var button = event.target.closest("button");
    if (!button || !rootEl.contains(button)) return;
    var action = button.getAttribute("data-action");
    var mode = button.getAttribute("data-mode");
    if (mode) { setMode(mode); return; }
    if (action === "activate") activate();
    else if (action === "start") startLiturgy();
    else if (action === "pause") control("pauseLivingLiturgy");
    else if (action === "resume") control("resumeLivingLiturgy");
    else if (action === "stop") control("stopLivingLiturgy");
    else if (action === "emergency") emergency("UI_EMERGENCY");
    else if (action === "tone") testTone();
    else if (action === "voice") testVoice();
    else if (action === "speak") speakSelected();
    else if (action === "mic-on") enableMic();
    else if (action === "mic-off") disableMic();
    else if (action === "mic-test") testMic();
    else if (action === "hz") classifyInput();
    else if (action === "diagnostics") diagnostics();
    else if (action === "evolve") evolve();
    else if (action === "snapshot") snapshot();
    else if (action === "rollback") {
      var A = audio();
      if (A && typeof A.rollbackLivingSnapshot === "function") A.rollbackLivingSnapshot().then(function () { pushFeed("ROLLBACK"); render(); });
    } else if (button.getAttribute("data-feedback")) feedback(button.getAttribute("data-feedback"), button.getAttribute("data-value"));
  }

  function onChange(event) {
    if (event.target.id === "ca-person") {
      ui.person = event.target.value;
      var option = event.target.selectedOptions && event.target.selectedOptions[0];
      ui.personName = option ? (option.dataset.name || option.textContent) : "";
    } else if (event.target.id === "ca-family") ui.family = event.target.value;
    else if (event.target.id === "ca-voice") {
      var P = perf();
      try { if (P && typeof P.setVoice === "function") P.setVoice(event.target.value); } catch (e) {}
      audit("VOICE_SELECTED", { voice: event.target.value });
    } else if (event.target.id === "ca-lang") {
      var engine = perf();
      try { if (engine && typeof engine.setLanguage === "function") engine.setLanguage(event.target.value); } catch (e) {}
    } else if (event.target.id === "ca-notify") ui.notify = !!event.target.checked;
  }

  function markup() {
    var modes = MODES.map(function (mode) {
      return '<button type="button" data-mode="' + mode + '">' + mode.replace(/_/g, " ") + "</button>";
    }).join("");
    return '' +
      '<style>#chirombe-audio-centre{margin:0 0 16px;width:100%;max-width:100vw;overflow:hidden;border:1px solid var(--line,#1c2a3a);border-radius:16px;background:var(--panel,#0b1019);color:var(--text,#e9f2ff);font:13px/1.4 Inter,system-ui,sans-serif}#chirombe-audio-centre *{box-sizing:border-box}#chirombe-audio-centre button{min-height:44px;border:1px solid #334252;background:#111a24;color:inherit;border-radius:10px;padding:8px 10px}#chirombe-audio-centre button.is-on,#chirombe-audio-centre button:focus{border-color:var(--cyan,#4de7ff);outline:2px solid transparent}#chirombe-audio-centre .ca-bar{position:sticky;top:0;z-index:40;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;padding:10px;background:#080d15;border-bottom:1px solid var(--line,#1c2a3a)}#chirombe-audio-centre .ca-stop{background:#3a1218;border-color:#ff5577;font-weight:800}#chirombe-audio-centre .ca-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:10px}#chirombe-audio-centre .ca-card{padding:10px;border-top:1px solid #1c2a3a}#chirombe-audio-centre .ca-k{color:var(--muted,#8190a5);font-size:10px;letter-spacing:.14em}#chirombe-audio-centre .ca-modes{display:flex;flex-wrap:wrap;gap:6px}#chirombe-audio-centre canvas{width:100%;height:72px;display:block;border-radius:8px}#chirombe-audio-centre pre{white-space:pre-wrap;max-height:160px;overflow:auto;background:#05080c;padding:8px;border-radius:8px}#chirombe-audio-centre input,#chirombe-audio-centre select,#chirombe-audio-centre textarea{width:100%;min-height:44px;background:#0d141e;color:inherit;border:1px solid #334252;border-radius:8px;padding:8px}@media(max-width:720px){#chirombe-audio-centre .ca-bar{grid-template-columns:1fr}#chirombe-audio-centre .ca-stop{width:100%}}</style>' +
      '<div class="ca-bar"><div><div class="ca-k">CHIROMBE AUDIO</div><strong id="ca-life">STANDBY</strong> · <span id="ca-ctx">UNAVAILABLE</span> · MIC <span id="ca-mic">OFF</span></div><button type="button" class="ca-stop" data-action="emergency" aria-label="Emergency stop">EMERGENCY STOP</button></div>' +
      '<div class="ca-grid"><button type="button" data-action="activate" aria-label="Activate audio">ACTIVATE AUDIO</button><button type="button" data-action="start" aria-label="Start living liturgy">START LIVING LITURGY</button><button type="button" data-action="pause" aria-label="Pause">PAUSE</button><button type="button" data-action="resume" aria-label="Resume">RESUME</button><button type="button" data-action="stop" aria-label="Stop">STOP</button><button type="button" data-action="tone" aria-label="Test tone">TEST TONE</button><button type="button" data-action="voice" aria-label="Test voice">TEST VOICE</button><button type="button" data-action="mic-on" aria-label="Enable microphone">ENABLE MICROPHONE</button><button type="button" data-action="mic-off" aria-label="Disable microphone">DISABLE MICROPHONE</button></div>' +
      '<div class="ca-card"><div class="ca-k">MASTER</div>GAIN <span id="ca-gain">UNAVAILABLE</span> · EVOLUTION <span id="ca-evo">UNAVAILABLE</span> · MODE <span id="ca-mode">PEACE</span><div class="ca-k">SESSION</div><div id="ca-session">NONE</div></div>' +
      '<details open class="ca-card"><summary>MODE</summary><div class="ca-modes">' + modes + '</div></details>' +
      '<details class="ca-card"><summary>VOICE</summary><label class="ca-k">LANGUAGE</label><select id="ca-lang" aria-label="Language"><option>en-GB</option><option>sn-ZW</option><option>zu-ZA</option><option>xh-ZA</option><option>fr-FR</option><option>pt-PT</option><option>es-ES</option></select><label class="ca-k">VOICE</label><select id="ca-voice" aria-label="Voice"><option>UNAVAILABLE</option></select><label class="ca-k">TEXT</label><textarea id="ca-speak-text" aria-label="Text to speak">CHIROMBE audio system ready.</textarea><button type="button" data-action="speak" aria-label="Speak">SPEAK</button></details>' +
      '<details class="ca-card"><summary>FREQUENCY</summary><div>CURRENT <span id="ca-fund">UNAVAILABLE</span> · SCENE <span id="ca-scene">NONE</span></div><div>CLASS <span id="ca-freq-class">UNAVAILABLE</span> · NYQUIST <span id="ca-nyquist">UNAVAILABLE</span></div><input id="ca-hz" inputmode="decimal" aria-label="Frequency hertz" placeholder="440"><button type="button" data-action="hz" aria-label="Classify frequency">CLASSIFY</button><canvas id="ca-visual" aria-label="Audio spectrum"></canvas></details>' +
      '<details class="ca-card"><summary>ENVIRONMENT</summary><div>MIC <span id="ca-env-mic">OFF</span> · RMS <span id="ca-rms">UNAVAILABLE</span></div><p id="ca-env-note"></p><button type="button" data-action="mic-test" aria-label="Test microphone">TEST MICROPHONE</button></details>' +
      '<details class="ca-card"><summary>FAMILY LITURGY</summary><select id="ca-family" aria-label="Family scope"><option value="none">GENERAL / NO PERSON</option><option value="circle">WHOLE APPROVED CIRCLE</option></select><select id="ca-person" aria-label="Approved person"><option value="">SELECT APPROVED PERSON</option></select></details>' +
      '<details class="ca-card"><summary>EVOLUTION</summary><div>GENERATION <span id="ca-gen">UNAVAILABLE</span> · PROPOSALS <span id="ca-proposals">UNAVAILABLE</span></div><button type="button" data-action="evolve">REVIEW</button><button type="button" data-action="snapshot">SNAPSHOT</button><button type="button" data-action="rollback">ROLLBACK</button><div class="ca-modes"><button type="button" data-feedback="quality" data-value="5">QUALITY</button><button type="button" data-feedback="comfort" data-value="5">COMFORT</button><button type="button" data-feedback="pace" data-value="good">PACE GOOD</button></div></details>' +
      '<details class="ca-card"><summary>DIAGNOSTICS AND EVENTS</summary><button type="button" data-action="diagnostics" aria-label="Run audio diagnostics">RUN AUDIO DIAGNOSTICS</button><pre id="ca-diagnostics">NOT RUN</pre><pre id="ca-feed">NO EVENTS YET</pre></details>';
  }

  function mount() {
    if (document.getElementById("chirombe-audio-centre")) {
      rootEl = document.getElementById("chirombe-audio-centre");
    } else {
      rootEl = document.createElement("section");
      rootEl.id = "chirombe-audio-centre";
      rootEl.setAttribute("aria-label", "CHIROMBE Audio Living Liturgy");
      rootEl.innerHTML = markup();
      var host = document.querySelector("main") || document.body;
      if (host.firstChild) host.insertBefore(rootEl, host.firstChild);
      else host.appendChild(rootEl);
    }
    if (!ui.bound) {
      rootEl.addEventListener("click", onClick);
      rootEl.addEventListener("change", onChange);
      ui.bound = true;
    }
    var opener = document.getElementById("open-audio-centre");
    if (opener && !opener.__audioBound) {
      opener.__audioBound = true;
      opener.addEventListener("click", function () {
        rootEl.open = true;
        var details = rootEl.querySelector("details");
        if (details) details.open = true;
        rootEl.scrollIntoView({ behavior: "smooth", block: "start" });
      });
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
    if (!g.ChirombeBus || typeof g.ChirombeBus.registerCommand !== "function" || g.__CHIROMBE_AUDIO_COMMANDS__) return;
    var commands = {
      "audio.activate": function () { return activate(); },
      "audio.start": function (args) { if (args && args.mode) setMode(args.mode); return startLiturgy(); },
      "audio.pause": function () { return control("pauseLivingLiturgy"); },
      "audio.resume": function () { return control("resumeLivingLiturgy"); },
      "audio.stop": function () { return control("stopLivingLiturgy"); },
      "audio.emergencyStop": function (args) { return emergency(args && args.reason); },
      "audio.speak": function (args) { var P = perf(); return P && P.speakText ? P.speakText((args && args.text) || "CHIROMBE audio system ready.") : { ok: false, reason: "SPEECH_UNAVAILABLE" }; },
      "audio.testTone": function () { return testTone(); },
      "audio.microphone.enable": function () { return enableMic(); },
      "audio.microphone.disable": function () { return disableMic(); },
      "audio.liturgy.start": function () { return startLiturgy(); },
      "audio.liturgy.stop": function () { return control("stopLivingLiturgy"); },
      "audio.evolution.analyse": function () { return evolve(); },
      "audio.evolution.snapshot": function () { return snapshot(); },
      "audio.evolution.rollback": function () { var A = audio(); return A && A.rollbackLivingSnapshot ? A.rollbackLivingSnapshot() : { ok: false }; },
      "audio.diagnostics": function () { return diagnostics(); },
      "audio.status": function () { var A = audio(); return A && A.getStatus ? A.getStatus() : { available: false }; }
    };
    Object.keys(commands).forEach(function (name) {
      try { g.ChirombeBus.registerCommand(name, commands[name], { subsystem: "audio" }); } catch (e) {}
    });
    g.__CHIROMBE_AUDIO_COMMANDS__ = true;
  }

  function listen() {
    ["system.ready", "health.warning", "watchdog.warning", "watchdog.recovery", "security.warning", "ritual.started", "ritual.completed", "family.liturgy.requested", "safe.stop"].forEach(function (name) {
      g.addEventListener(name, function () {
        pushFeed(name);
        if (name === "safe.stop") emergency("BUS_SAFE_STOP");
        else if (ui.notify && name === "security.warning") pushFeed("NOTIFICATION_HELD");
      });
    });
  }

  function boot() {
    var A = audio();
    if (!A || typeof A.getStatus !== "function") return false;
    extendStatus();
    extendHealth();
    wrapEmit();
    registerCommands();
    if (document && document.body) mount();
    else document.addEventListener("DOMContentLoaded", mount);
    listen();
    if (g.ChirombeSystem) g.ChirombeSystem.audio = audioHealth();
    audit("AUDIO_INSTALL_READY", { version: VERSION, autoplay: false, microphone: "OFF" });
    pushFeed("AUDIO_CONTEXT_READY");
    return true;
  }

  g.CHIROMBE_AUDIO_UI = {
    VERSION: VERSION,
    init: boot,
    bind: mount,
    render: render,
    renderStatus: render,
    renderDiagnostics: diagnostics,
    activate: activate,
    emergency: emergency,
    setMode: setMode,
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
