/* CHIROMBE audio living-liturgy bridge
   Connects chirombe-audio-living-liturgy.js to the public page.
   Does not replace Chirombe or ZionCore. Gesture-gated sound. */
(function () {
  "use strict";

  var PAGE = "https://tariromasawi.github.io/chirombe/";
  var BUILD = "bridge-1.0.0";

  function $(id) { return document.getElementById(id); }

  function aliasEngines() {
    var root = window.CHIROMBE || (window.CHIROMBE = {});
    var audio = window.CHIROMBE_AUDIO || root.AudioLivingLiturgy;
    if (audio) {
      window.CHIROMBE_AUDIO = audio;
      window.CHIROMBE_AUDIO_LIVING_LITURGY = audio;
    }
    var tonal = window.CHIROMBE_AUDIO_TONAL_ENGINE
      || root.CHIROMBE_AUDIO_TONAL_ENGINE
      || root.AudioTonalEngine
      || (audio && audio.Tonal);
    if (tonal) {
      window.CHIROMBE_AUDIO_TONAL_ENGINE = tonal;
      window.CHIROMBE_TONAL = window.CHIROMBE_TONAL || tonal;
      if (audio) audio.Tonal = audio.Tonal || tonal;
    }
    var map = {
      CHIROMBE_AUDIO_LITURGY_ENGINE: root.AudioLiturgy || window.CHIROMBE_AUDIO_LITURGY_ENGINE,
      CHIROMBE_AUDIO_TRADITION_LIBRARY: window.CHIROMBE_AUDIO_TRADITION_LIBRARY,
      CHIROMBE_AUDIO_BLOODLINE_ORCHESTRATOR: window.CHIROMBE_AUDIO_BLOODLINE_ORCHESTRATOR,
      CHIROMBE_AUDIO_ENVIRONMENT_ENGINE: window.CHIROMBE_AUDIO_ENVIRONMENT_ENGINE || window.CHIROMBE_AUDIO_ENVIRONMENT,
      CHIROMBE_AUDIO_PERFORMANCE_ENGINE: window.CHIROMBE_AUDIO_PERFORMANCE_ENGINE || window.CHIROMBE_AUDIO_PERFORMANCE,
      CHIROMBE_AUDIO_SAFETY_ENGINE: window.CHIROMBE_AUDIO_SAFETY_ENGINE || window.CHIROMBE_AUDIO_SAFETY,
      CHIROMBE_AUDIO_EVOLUTION_ENGINE: window.CHIROMBE_AUDIO_EVOLUTION_ENGINE || window.CHIROMBE_AUDIO_EVOLUTION,
      CHIROMBE_AUDIO_CONTROL: window.CHIROMBE_AUDIO_CONTROL
    };
    Object.keys(map).forEach(function (key) {
      if (map[key]) window[key] = window[key] || map[key];
    });
    return audio;
  }

  function collectFunctions() {
    var audio = aliasEngines();
    var sources = [
      ["CHIROMBE_AUDIO", audio],
      ["ORCHESTRATOR", audio && audio.LIVING_LITURGY_ORCHESTRATOR],
      ["LITURGY", window.CHIROMBE_AUDIO_LITURGY_ENGINE],
      ["TRADITION", window.CHIROMBE_AUDIO_TRADITION_LIBRARY],
      ["BLOODLINE", window.CHIROMBE_AUDIO_BLOODLINE_ORCHESTRATOR],
      ["TONAL", window.CHIROMBE_AUDIO_TONAL_ENGINE],
      ["ENVIRONMENT", window.CHIROMBE_AUDIO_ENVIRONMENT_ENGINE],
      ["PERFORMANCE", window.CHIROMBE_AUDIO_PERFORMANCE_ENGINE],
      ["SAFETY", window.CHIROMBE_AUDIO_SAFETY_ENGINE],
      ["EVOLUTION", window.CHIROMBE_AUDIO_EVOLUTION_ENGINE],
      ["CONTROL", window.CHIROMBE_AUDIO_CONTROL]
    ];
    var registry = [];
    var seen = Object.create(null);
    sources.forEach(function (pair) {
      var label = pair[0];
      var obj = pair[1];
      if (!obj) return;
      Object.keys(obj).forEach(function (key) {
        if (typeof obj[key] !== "function") return;
        var path = label + "." + key;
        if (seen[path]) return;
        seen[path] = true;
        registry.push({ path: path, engine: label, name: key, fn: obj[key], host: obj });
      });
    });
    registry.sort(function (a, b) { return a.path < b.path ? -1 : 1; });
    return registry;
  }

  function textOf(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (value.text) return String(value.text);
    if (value.prayer) return textOf(value.prayer);
    if (value.line) return String(value.line);
    if (value.message) return String(value.message);
    if (value.declaration) return textOf(value.declaration);
    try { return JSON.stringify(value).slice(0, 420); } catch (e) { return String(value); }
  }

  function publish(line, kind) {
    var text = String(line || "").trim();
    if (!text) return;
    var stamp = new Date().toLocaleTimeString();
    var stream = $("ll-stream");
    if (stream) {
      var row = document.createElement("div");
      row.className = "ll-line";
      row.innerHTML = "<span>" + stamp + "</span> " + text.replace(/[<>&]/g, function (c) {
        return { "<": "<", ">": ">", "&": "&" }[c];
      });
      stream.insertBefore(row, stream.firstChild);
      while (stream.children.length > 18) stream.removeChild(stream.lastChild);
    }
    var prayer = $("zc-rm-prayer-text");
    if (prayer) prayer.textContent = text;
    var display = $("zcsm-prayer-display");
    if (display) display.textContent = text;
    var out = $("broadcastOutput");
    if (out) {
      out.innerHTML = "<div class=\"ll-broadcast\"><strong>LIVING LITURGY · " + (kind || "BROADCAST") + "</strong><p>" +
        text.replace(/[<>&]/g, function (c) { return { "<": "<", ">": ">", "&": "&" }[c]; }) +
        "</p><small>" + PAGE + " · " + stamp + "</small></div>";
    }
    var feed = $("feed");
    if (feed) {
      var item = document.createElement("div");
      item.className = "ll-feed-item";
      item.textContent = "LITURGY · " + text.slice(0, 220);
      feed.insertBefore(item, feed.firstChild);
    }
    var header = $("ca-header-state");
    if (header) header.textContent = kind === "STANDBY" ? "AUDIO STANDBY" : "AUDIO LIVE";
    var badge = $("ll-onair");
    if (badge) badge.textContent = kind === "STANDBY" ? "STANDBY" : "ON AIR";
  }

  function mountPanel() {
    if ($("living-liturgy")) return;
    var main = document.querySelector("main") || document.body;
    var section = document.createElement("section");
    section.id = "living-liturgy";
    section.className = "view";
    section.innerHTML = [
      "<div class=\"hero\"><div>",
      "<h1>Audio / Living Liturgy</h1>",
      "<p>Kernel, liturgy, bloodline, tonal, safety and orchestrator functions from chirombe-audio-living-liturgy.js, broadcasting on this page. Sound starts only after a gesture.</p>",
      "</div><div class=\"actions\">",
      "<button class=\"btn primary\" type=\"button\" id=\"ll-begin\">BEGIN BROADCAST</button>",
      "<button class=\"btn\" type=\"button\" id=\"ll-pause\">PAUSE</button>",
      "<button class=\"btn\" type=\"button\" id=\"ll-stop\">SAFE STOP</button>",
      "</div></div>",
      "<div class=\"grid grid4\">",
      "<div class=\"card metric\"><div class=\"label\">KERNEL</div><div class=\"value\" id=\"ll-kernel\">…</div></div>",
      "<div class=\"card metric\"><div class=\"label\">FUNCTIONS</div><div class=\"value\" id=\"ll-fncount\">0</div></div>",
      "<div class=\"card metric\"><div class=\"label\">BROADCAST</div><div class=\"value\" id=\"ll-onair\">STANDBY</div></div>",
      "<div class=\"card metric\"><div class=\"label\">PHASE</div><div class=\"value\" id=\"ll-phase\">1</div></div>",
      "</div>",
      "<div class=\"card\" style=\"margin-top:16px\"><div class=\"cardHeader\"><strong>Living stream</strong><span id=\"ll-scene\">quiet watch</span></div>",
      "<div class=\"cardBody\"><div id=\"ll-meter\" style=\"height:8px;border-radius:99px;background:#111923;overflow:hidden;margin-bottom:12px\"><i id=\"ll-meter-bar\" style=\"display:block;height:100%;width:12%;background:linear-gradient(90deg,#6ca8ff,#72d6c2,#d7b36a)\"></i></div>",
      "<div id=\"ll-stream\" style=\"max-height:240px;overflow:auto;font:12px/1.55 ui-monospace,monospace\"></div></div></div>",
      "<div class=\"card\" style=\"margin-top:16px\"><div class=\"cardHeader\"><strong>Connected functions</strong><span>invoke any public function</span></div>",
      "<div class=\"cardBody\"><div class=\"field\"><label>Function</label><select id=\"ll-fn\"></select></div>",
      "<div style=\"display:flex;gap:8px;flex-wrap:wrap;margin-top:8px\">",
      "<button class=\"btn\" type=\"button\" id=\"ll-invoke\">INVOKE</button>",
      "<button class=\"btn\" type=\"button\" id=\"ll-next\">NEXT STAGE</button>",
      "<button class=\"btn\" type=\"button\" id=\"ll-voice\">VOICE OFF</button>",
      "</div><pre id=\"ll-result\" style=\"white-space:pre-wrap;margin-top:12px;color:#9fb0c3;font-size:12px\"></pre>",
      "<div id=\"ll-phases\" style=\"display:flex;gap:6px;flex-wrap:wrap;margin-top:12px\"></div>",
      "</div></div>"
    ].join("");
    main.appendChild(section);
  }

  function paintPhases(status) {
    var host = $("ll-phases");
    if (!host) return;
    var phases = [
      ["1 Kernel", !!window.CHIROMBE_AUDIO],
      ["2 Liturgy", !!window.CHIROMBE_AUDIO_LITURGY_ENGINE],
      ["3 Tradition", !!window.CHIROMBE_AUDIO_TRADITION_LIBRARY],
      ["4 Bloodline", !!window.CHIROMBE_AUDIO_BLOODLINE_ORCHESTRATOR],
      ["5 Tonal", !!window.CHIROMBE_AUDIO_TONAL_ENGINE],
      ["6 Environment", !!window.CHIROMBE_AUDIO_ENVIRONMENT_ENGINE],
      ["7 Performance", !!window.CHIROMBE_AUDIO_PERFORMANCE_ENGINE],
      ["8 Safety", !!window.CHIROMBE_AUDIO_SAFETY_ENGINE],
      ["9 Evolution", !!window.CHIROMBE_AUDIO_EVOLUTION_ENGINE],
      ["10 Orchestrator", !!(window.CHIROMBE_AUDIO && window.CHIROMBE_AUDIO.LIVING_LITURGY_ORCHESTRATOR)]
    ];
    host.innerHTML = phases.map(function (p) {
      return "<span style=\"padding:6px 8px;border-radius:99px;border:1px solid " + (p[1] ? "#3d6b52" : "#5a3030") + ";color:" + (p[1] ? "#8ee3a7" : "#ffb4a8") + ";font-size:10px;letter-spacing:.08em\">" + p[0] + "</span>";
    }).join("");
    var live = phases.filter(function (p) { return p[1]; }).length;
    if ($("ll-phase")) $("ll-phase").textContent = live + "/10";
    if ($("ll-kernel")) $("ll-kernel").textContent = status || (window.CHIROMBE_AUDIO ? "ONLINE" : "MISSING");
  }

  function fillSelect(registry) {
    var sel = $("ll-fn");
    if (!sel) return;
    sel.innerHTML = registry.map(function (item) {
      return "<option value=\"" + item.path + "\">" + item.path + "</option>";
    }).join("");
  }

  function defaultArgs(name) {
    if (/prayer|declaration|gratitude|liturgy|narrate|message/i.test(name)) {
      return [{ category: "PROTECTION", language: "en", themes: ["peace", "protection", "wisdom"] }];
    }
    if (/broadcast|announce/i.test(name)) {
      return ["Mwari ndi Mwari. Peace, protection, wisdom and unity remain with this circle.", { category: "PRAYER", priority: 0.7 }];
    }
    if (/scene/i.test(name)) return ["REFLECTION"];
    return [];
  }

  function invokePath(path, registry) {
    var item = registry.filter(function (x) { return x.path === path; })[0];
    if (!item) return { ok: false, error: "NOT_FOUND" };
    try {
      var result = item.fn.apply(item.host, defaultArgs(item.name));
      return { ok: true, result: result };
    } catch (error) {
      return { ok: false, error: error && error.message || String(error) };
    }
  }

  function openCentre() {
    document.querySelectorAll(".nav").forEach(function (n) { n.classList.remove("active"); });
    document.querySelectorAll(".view").forEach(function (v) { v.classList.remove("active"); });
    var btn = $("open-audio-centre");
    if (btn) btn.classList.add("active");
    var view = $("living-liturgy");
    if (view) view.classList.add("active");
    view && view.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function speak(text) {
    if (!window.__llVoice || !window.speechSynthesis || !text) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text.slice(0, 280));
      u.rate = 0.92;
      u.pitch = 0.95;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  function boot() {
    var audio = aliasEngines();
    mountPanel();
    var registry = collectFunctions();
    fillSelect(registry);
    if ($("ll-fncount")) $("ll-fncount").textContent = String(registry.length);
    paintPhases(audio && audio.STATUS);

    var api = {
      BUILD: BUILD,
      page: PAGE,
      registry: registry,
      invoke: function (path) { return invokePath(path, registry); },
      publish: publish,
      open: openCentre
    };
    window.ChirombeLivingLiturgy = api;

    if (audio && typeof audio.connectExternalBus === "function") {
      try { audio.connectExternalBus(); } catch (e) {}
    }
    if (audio && typeof audio.initialise === "function" && audio.STATUS === "INITIALISING") {
      try { audio.initialise(); } catch (e) {}
    }

    publish(
      audio
        ? "Living liturgy kernel connected. " + registry.length + " public functions bound to this page."
        : "Audio kernel missing. chirombe-audio-living-liturgy.js did not register CHIROMBE_AUDIO.",
      audio ? "CONNECTED" : "STANDBY"
    );

    var btn = $("open-audio-centre");
    if (btn && !btn.__llBound) {
      btn.__llBound = true;
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        openCentre();
      });
    }

    var begin = $("ll-begin");
    if (begin) begin.addEventListener("click", function () { api.startBroadcast(true); });
    var pause = $("ll-pause");
    if (pause) pause.addEventListener("click", function () {
      var orch = audio && audio.LIVING_LITURGY_ORCHESTRATOR;
      try { orch && orch.pause && orch.pause(); } catch (e) {}
      try { audio && audio.pause && audio.pause(); } catch (e) {}
      publish("Living liturgy paused.", "PAUSED");
    });
    var stop = $("ll-stop");
    if (stop) stop.addEventListener("click", function () {
      try { audio && audio.safeStop && audio.safeStop("PAGE_SAFE_STOP"); } catch (e) {}
      try { window.CHIROMBE_AUDIO_TONAL_ENGINE && window.CHIROMBE_AUDIO_TONAL_ENGINE.stopAll && window.CHIROMBE_AUDIO_TONAL_ENGINE.stopAll("PAGE_SAFE_STOP"); } catch (e) {}
      if (api.timer) clearInterval(api.timer);
      publish("Safe stop. Broadcast held.", "STANDBY");
    });
    var inv = $("ll-invoke");
    if (inv) inv.addEventListener("click", function () {
      var path = ($("ll-fn") || {}).value;
      var out = invokePath(path, registry);
      var shown = textOf(out.result || out.error);
      if ($("ll-result")) $("ll-result").textContent = path + " → " + shown;
      if (out.ok && shown) publish(shown, path);
    });
    var next = $("ll-next");
    if (next) next.addEventListener("click", function () { api.advance(); });
    var voice = $("ll-voice");
    if (voice) voice.addEventListener("click", function () {
      window.__llVoice = !window.__llVoice;
      voice.textContent = window.__llVoice ? "VOICE ON" : "VOICE OFF";
    });

    var cycle = $("zc-rm-prayer-cycle");
    if (cycle && !cycle.__llBound) {
      cycle.__llBound = true;
      cycle.addEventListener("click", function () { api.advance(); });
    }

    api.compose = function () {
      var liturgy = window.CHIROMBE_AUDIO_LITURGY_ENGINE;
      var packet = null;
      try {
        if (liturgy && typeof liturgy.generateDailyLiturgy === "function") packet = liturgy.generateDailyLiturgy({ language: "en" });
        else if (liturgy && typeof liturgy.generatePrayer === "function") packet = liturgy.generatePrayer({ category: "PROTECTION" });
        else if (audio && typeof audio.createProtectiveDeclaration === "function") packet = audio.createProtectiveDeclaration();
      } catch (e) {
        packet = null;
      }
      var line = textOf(packet) || "Mwari ndi Mwari. May peace, protection, wisdom, unity and strength remain with this protected circle.";
      try {
        if (audio && typeof audio.queueBroadcast === "function") {
          audio.queueBroadcast({ text: line, category: "PRAYER", priority: 0.72, source: BUILD, provenance: "ORIGINAL" });
        }
      } catch (e) {}
      try {
        if (liturgy && typeof liturgy.prepareForBroadcast === "function") liturgy.prepareForBroadcast(packet || line, { type: "PRAYER" });
      } catch (e) {}
      publish(line, "BROADCAST");
      speak(line);
      return line;
    };

    api.advance = function () {
      var orch = audio && audio.LIVING_LITURGY_ORCHESTRATOR;
      try { if (orch && orch.next) orch.next(); } catch (e) {}
      return api.compose();
    };

    api.startBroadcast = async function (gesture) {
      aliasEngines();
      audio = window.CHIROMBE_AUDIO;
      if (!audio) {
        publish("Kernel still missing.", "STANDBY");
        return;
      }
      try { if (gesture && audio.unlockAudio) await audio.unlockAudio(); } catch (e) {}
      try { if (gesture && audio.primeFromGesture) await audio.primeFromGesture(); } catch (e) {}
      var orch = audio.LIVING_LITURGY_ORCHESTRATOR;
      try {
        if (orch && orch.start) await orch.start({ gesture: !!gesture, mode: "LIVING_WATCH" });
        else if (audio.startLivingWatch) audio.startLivingWatch();
      } catch (e) {}
      try {
        var tonal = window.CHIROMBE_AUDIO_TONAL_ENGINE;
        if (gesture && tonal && tonal.playScene) tonal.playScene("REFLECTION", { gain: 0.04 });
      } catch (e) {}
      if ($("ll-scene")) $("ll-scene").textContent = gesture ? "reflection drone" : "text watch";
      api.compose();
      if (api.timer) clearInterval(api.timer);
      api.timer = setInterval(function () { api.advance(); }, 48000);
    };

    var meter = 12;
    function tick() {
      meter += (Math.random() - 0.42) * 6;
      if (meter < 8) meter = 8;
      if (meter > 92) meter = 92;
      var bar = $("ll-meter-bar");
      if (bar) bar.style.width = meter.toFixed(1) + "%";
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    if (window.ChirombeBus && typeof window.ChirombeBus.executeCommand === "function") {
      var prev = window.ChirombeBus.executeCommand;
      window.ChirombeBus.executeCommand = function (cmd) {
        if (String(cmd).toLowerCase().indexOf("liturgy") >= 0 || String(cmd).toLowerCase().indexOf("audio") >= 0) {
          api.startBroadcast(false);
        }
        return prev.apply(this, arguments);
      };
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
