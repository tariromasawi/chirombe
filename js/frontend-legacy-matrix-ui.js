/* CHIROMBE MATRIX UI — visualization only */
(function (g) {
  "use strict";
  if (g.__CHIROMBE_MATRIX_UI__) return;
  g.__CHIROMBE_MATRIX_UI__ = true;
  var reduce = false;
  try { reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) {}
  var hidden = false, raf = 0, t0 = performance.now(), nodes = [], lastSnap = null, selected = null, dpr = 1;
  function adapter() { return g.CHIROMBE_LEGACY_FRONTEND; }
  function fmtUptime(ms) { var s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60); return (h ? h + "h " : "") + (m % 60) + "m " + (s % 60) + "s"; }
  function tone(status) { var n = String(status || "").toUpperCase(); if (n === "READY" || n === "ONLINE" || n === "HEALTHY" || n === "ATTACHED") return "#46f5a4"; if (n === "DEGRADED" || n === "AGING" || n === "STALE" || n === "OPTIONAL") return "#ffb347"; if (n === "FAILED" || n === "UNAVAILABLE" || n === "OFFLINE") return "#ff5c70"; return "#7ee7ff"; }
  function bars(status) { var n = String(status || "").toUpperCase(); if (n === "READY" || n === "ONLINE" || n === "HEALTHY") return 10; if (n === "DEGRADED" || n === "AGING") return 6; if (n === "STALE") return 4; if (n === "OPTIONAL") return 3; if (n === "UNAVAILABLE" || n === "FAILED" || n === "OFFLINE") return 1; return 5; }
  function setText(id, v) { var el = document.getElementById(id); if (el) el.textContent = v == null ? "\u2014" : String(v); }
  function paintTelemetry(snap) {
    setText("mx-sys", snap.frontend); setText("mx-run", snap.runtime); setText("mx-bus", snap.commandBus); setText("mx-state", snap.state); setText("mx-audit", snap.audit); setText("mx-health", snap.health); setText("mx-prot", snap.protection); setText("mx-eng", snap.enginesReady + " / " + snap.enginesTotal); setText("mx-matrix", snap.matrix && snap.matrix.present ? snap.matrix.label : "OPTIONAL / NOT ATTACHED"); setText("mx-uptime", fmtUptime(snap.uptimeMs)); setText("mx-hb", new Date(snap.lastHeartbeat).toISOString().split("T")[1].replace("Z", "").slice(0, 8)); setText("mx-sig", snap.signature); setText("mx-seq", snap.auditHead && snap.auditHead.seq != null ? "SEQ " + snap.auditHead.seq : "\u2014"); setText("mx-verify", snap.auditVerified === true ? "CHAIN HOLDS" : snap.auditVerified === false ? "VERIFY FAILED" : "NOT CHECKED"); setText("mx-event", snap.lastEvent ? (snap.lastEvent.event || "EVENT") : "\u2014"); setText("mx-header-state", snap.health === "HEALTHY" ? "READY" : snap.health);
    var light = document.getElementById("chirombe-status-light"); if (light) light.className = "chirombe-status-light " + (snap.health === "HEALTHY" ? "ready" : snap.health === "DEGRADED" ? "degraded" : "booting");
  }
  function paintHealth(snap) {
    var rows = [["BOOT", snap.runtime],["BUS", snap.commandBus],["STATE", snap.state],["AUDIT", snap.audit],["HEALTH", snap.health],["WATCHDOG", snap.watchdog],["PROTECTION", snap.protection],["MATRIX", snap.matrix && snap.matrix.present ? "READY" : "OPTIONAL"]];
    var box = document.getElementById("mx-health-rows"); if (!box) return; box.innerHTML = "";
    rows.forEach(function (row) { var n = bars(row[1]), line = document.createElement("div"), cells = ""; line.className = "mx-hrow"; for (var i = 0; i < 10; i++) cells += '<i class="' + (i < n ? "on" : "off") + '"></i>'; line.innerHTML = "<span>" + row[0] + "</span><b>" + cells + "</b><em>" + row[1] + "</em>"; box.appendChild(line); });
  }
  function paintAudit(snap) {
    var rail = document.getElementById("mx-audit-rail"); if (!rail) return; rail.innerHTML = ""; var chain = snap.auditChain || [];
    if (!chain.length) { rail.textContent = "NO AUDIT RECORDS"; return; }
    chain.forEach(function (rec, i) { var n = document.createElement("div"); n.className = "mx-aseq"; n.innerHTML = "<strong>SEQ " + (rec.seq != null ? rec.seq : i) + "</strong><span>" + (rec.event || "EVENT") + "</span><small>" + (rec.timestamp || "").slice(11, 19) + "</small>"; rail.appendChild(n); });
    setText("mx-audit-head", snap.auditHead && snap.auditHead.hash ? String(snap.auditHead.hash).slice(0, 18) : "\u2014");
  }
  function paintResonance(snap) {
    var src = document.getElementById("mx-res-src");
    if (snap.resonance && snap.resonance.present) { var st = snap.resonance.status || {}; setText("mx-res-val", "AUDIO " + (st.audio || "WAITING_FOR_ACTIVATION")); if (src) src.textContent = "runtime · ChirombeResonance.status()"; }
    else { setText("mx-res-val", "8 × 10²¹"); if (src) src.textContent = "visualization only · symbolic computational magnitude, not physical energy"; }
    setText("mx-res-note", snap.matrix && snap.matrix.present ? "Divine Matrix attached (read-only)" : "MATRIX ENGINE: OPTIONAL / NOT ATTACHED");
  }
  function paintInspector(id, snap) {
    var panel = document.getElementById("mx-inspect"); if (!panel || !snap || !snap.engines[id]) return; var e = snap.engines[id]; selected = id; panel.hidden = false;
    panel.innerHTML = "<h3>" + e.global + "</h3><dl><dt>source</dt><dd>" + (e.file || "none") + "</dd><dt>global</dt><dd>" + e.global + "</dd><dt>state</dt><dd>" + e.status + "</dd><dt>mode</dt><dd>" + (e.present ? "LIVE GLOBAL" : "ABSENT") + "</dd><dt>dependencies</dt><dd>" + (e.deps && e.deps.length ? e.deps.join(" → ") : "none declared") + "</dd><dt>health</dt><dd>categorical · " + e.status + "</dd></dl><p class='mx-fine'>States are read from window." + e.global + ". No synthetic engine.</p>";
  }
  function layoutNodes(snap, w, h) {
    var ids = Object.keys(snap.engines), cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.34;
    nodes = ids.map(function (id, i) { var a = (-Math.PI / 2) + (i / ids.length) * Math.PI * 2; return { id: id, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, status: snap.engines[id].status, label: snap.engines[id].global.replace(/^CHIROMBE_/, "").replace(/^Chirombe/, "") }; });
  }
  function draw(now) {
    var canvas = document.getElementById("mx-canvas"); if (!canvas) return;
    var ctx = canvas.getContext("2d"), w = canvas.width / dpr, h = canvas.height / dpr, snap = lastSnap, cx = w / 2, cy = h / 2, t = (now - t0) / 1000, health = snap ? snap.health : "UNKNOWN", pulse = reduce ? 0.4 : 0.35 + 0.15 * Math.sin(t * 1.4), latticeColor = tone(health);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    if (!reduce) { ctx.globalAlpha = 0.22; ctx.fillStyle = "#7ee7ff"; ctx.font = "10px ui-monospace,monospace"; var field = [77,99,33,13,21,34,55,89,144,1,10,11], seed = snap && snap.auditHead ? (snap.auditHead.seq || 0) : 0; for (var n = 0; n < 36; n++) { ctx.fillText(String(field[n % field.length]), ((n * 97 + seed * 13 + t * 12) % (w + 40)) - 20, (n * 37 + t * 18) % h); } ctx.globalAlpha = 1; }
    for (var i = 1; i <= 5; i++) { ctx.beginPath(); ctx.strokeStyle = latticeColor; ctx.globalAlpha = 0.08 + i * 0.03; ctx.lineWidth = 1; ctx.arc(cx, cy, (Math.min(w, h) * 0.08) * i + (reduce ? 0 : Math.sin(t + i) * 2), 0, Math.PI * 2); ctx.stroke(); }
    ctx.globalAlpha = 1; var lat = 3, span = Math.min(w, h) * 0.42; ctx.strokeStyle = latticeColor; ctx.globalAlpha = health === "DEGRADED" ? 0.22 : 0.35;
    for (var gx = -lat; gx <= lat; gx++) for (var gy = -lat; gy <= lat; gy++) { var px = cx + gx * (span / lat), py = cy + gy * (span / lat); if (gx < lat) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + span / lat, py + (health === "DEGRADED" && ((gx + gy) % 3 === 0) ? 6 : 0)); ctx.stroke(); } if (gy < lat) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + span / lat); ctx.stroke(); } }
    ctx.globalAlpha = 1;
    if (snap) { layoutNodes(snap, w, h); var map = {}; nodes.forEach(function (nd) { map[nd.id] = nd; }); (snap.graph || []).forEach(function (edge) { var a = map[edge[0]], b = map[edge[1]]; if (!a || !b) return; ctx.beginPath(); ctx.strokeStyle = "rgba(90,210,255,0.28)"; ctx.lineWidth = 1; ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); if (!reduce && !hidden) { var p = (t * 0.35 + edge[0].length * 0.07) % 1; ctx.beginPath(); ctx.fillStyle = "#dffaff"; ctx.arc(a.x + (b.x - a.x) * p, a.y + (b.y - a.y) * p, 1.8, 0, Math.PI * 2); ctx.fill(); } }); nodes.forEach(function (nd) { ctx.beginPath(); ctx.fillStyle = tone(nd.status); ctx.globalAlpha = 0.95; ctx.arc(nd.x, nd.y, selected === nd.id ? 7 : 4.5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 0.55; ctx.font = "9px Inter,system-ui,sans-serif"; ctx.fillStyle = "#c9e7f2"; ctx.textAlign = "center"; ctx.fillText(nd.label.slice(0, 12), nd.x, nd.y + 16); ctx.globalAlpha = 1; }); }
    ctx.beginPath(); ctx.arc(cx, cy, 26 + pulse * 10, 0, Math.PI * 2); ctx.strokeStyle = "#7ee7ff"; ctx.globalAlpha = 0.7; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = 1; ctx.fillStyle = "#e9fbff"; ctx.textAlign = "center"; ctx.font = "700 11px Inter,system-ui,sans-serif"; ctx.fillText("MATRIX", cx, cy - 2); ctx.font = "9px Inter,system-ui,sans-serif"; ctx.fillStyle = "#79a9b8"; ctx.fillText("CORE", cx, cy + 12);
  }
  function loop(now) { if (!hidden) draw(now); raf = requestAnimationFrame(loop); }
  function resize() { var canvas = document.getElementById("mx-canvas"); if (!canvas) return; var rect = canvas.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.max(320, rect.width) * dpr; canvas.height = Math.max(280, rect.height) * dpr; }
  function hit(ev) { var canvas = document.getElementById("mx-canvas"); if (!canvas || !lastSnap) return; var rect = canvas.getBoundingClientRect(), x = ev.clientX - rect.left, y = ev.clientY - rect.top; for (var i = 0; i < nodes.length; i++) { var dx = nodes[i].x - x, dy = nodes[i].y - y; if (dx * dx + dy * dy < 196) { paintInspector(nodes[i].id, lastSnap); return; } } }
  function bindTerminal() {
    var form = document.getElementById("mx-cmd-form"), input = document.getElementById("mx-cmd-input"), out = document.getElementById("mx-cmd-out"), chips = document.getElementById("mx-cmd-chips");
    if (!form || form.getAttribute("data-bound") === "1") return; form.setAttribute("data-bound", "1");
    function run(cmd) { var api = adapter(); if (!api) { if (out) out.textContent = JSON.stringify({ ok: false, error: "ADAPTER_UNAVAILABLE" }, null, 2); return; } var live = api.commands ? api.commands() : []; var result = (live.length && live.indexOf(cmd) === -1) ? { ok: false, error: "LEGACY_UNAVAILABLE", command: cmd } : api.execute(cmd, {}); if (out) out.textContent = "COMMAND   " + cmd + "\nSTATUS    " + (result.ok ? "ACCEPTED" : "REJECTED") + "\nTIMESTAMP " + (result.timestamp || new Date().toISOString()) + "\nRESULT\n" + JSON.stringify(result, null, 2); if (api.log) api.log(cmd + " " + (result.ok ? "COMMAND_ACCEPTED" : result.error), result.ok ? "ok" : "warn", "BUS"); }
    form.addEventListener("submit", function (e) { e.preventDefault(); var cmd = (input.value || "").trim(); if (!cmd) return; run(cmd); input.value = ""; });
    function paintChips(snap) { if (!chips || chips.getAttribute("data-ready") === "1") return; var list = (snap && snap.commands) || []; if (!list.length) return; chips.setAttribute("data-ready", "1"); list.forEach(function (name) { var b = document.createElement("button"); b.type = "button"; b.className = "legacy-cmd"; b.textContent = name; b.addEventListener("click", function () { run(name); }); chips.appendChild(b); }); }
    document.addEventListener("chirombe-legacy-tick", function (ev) { paintChips(ev.detail); });
  }
  function onTick(ev) { lastSnap = ev.detail; paintTelemetry(lastSnap); paintHealth(lastSnap); paintAudit(lastSnap); paintResonance(lastSnap); if (selected) paintInspector(selected, lastSnap); }
  function boot() { resize(); bindTerminal(); document.addEventListener("chirombe-legacy-tick", onTick); var canvas = document.getElementById("mx-canvas"); if (canvas) { canvas.addEventListener("click", hit); canvas.addEventListener("touchstart", function (e) { if (e.changedTouches && e.changedTouches[0]) hit(e.changedTouches[0]); }, { passive: true }); } window.addEventListener("resize", resize); document.addEventListener("visibilitychange", function () { hidden = document.hidden; }); var api = adapter(); if (api && api.snapshot) { lastSnap = api.snapshot(); onTick({ detail: lastSnap }); } raf = requestAnimationFrame(loop); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})(typeof window !== "undefined" ? window : globalThis);
