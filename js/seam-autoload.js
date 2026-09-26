/* Additive only. Does not replace Chirombe, ZionCore, or user-script.js. */
(function seamAutoload() {
  if (window.__SEAM_AUTOLOAD__) return;
  window.__SEAM_AUTOLOAD__ = true;

  var SUBPAGES = [
    "app.html",
    "chirombe-celestial-protection.html",
    "guardian.html",
    "liturgy.html",
    "mwarindimwari-seal.html",
    "pioneer.html",
    "zcca-fragment.html",
    "zcca.html",
  ];

  function ready(fn) {
    if (document.body) fn();
    else document.addEventListener("DOMContentLoaded", fn, { once: true });
  }

  ready(function () {
    if (!document.getElementById("seam-gate")) {
      var gate = document.createElement("a");
      gate.id = "seam-gate";
      gate.href = "seam.html";
      gate.innerHTML =
        '<span>Open Seam</span><small id="seam-gate-note">running behind this page</small>';
      var style = document.createElement("style");
      style.textContent =
        "#seam-gate{position:fixed;right:16px;bottom:16px;z-index:2147483000;display:flex;flex-direction:column;justify-content:center;min-height:44px;padding:8px 16px;border-radius:999px;background:#d4b36a;color:#070b08;text-decoration:none;font:600 15px/1.2 Georgia,serif;box-shadow:0 12px 32px rgba(0,0,0,.4)}" +
        "#seam-gate small{font:500 11px/1.3 Georgia,serif;letter-spacing:.02em;opacity:.75}" +
        "@media(max-width:700px){#seam-gate{left:16px;right:16px;align-items:center}}";
      document.head.appendChild(style);
      document.body.appendChild(gate);
    }

    var nav = document.querySelector("header nav");
    if (nav && !nav.querySelector('a[href="seam.html"], a[href="./seam.html"]')) {
      var link = document.createElement("a");
      link.href = "./seam.html";
      link.textContent = "Seam";
      nav.appendChild(link);
    }

    if (!document.getElementById("seam-behind")) {
      var brain = document.createElement("iframe");
      brain.id = "seam-behind";
      brain.title = "Seam running";
      brain.src = "seam.html?behind=1";
      brain.setAttribute("aria-hidden", "true");
      brain.style.cssText =
        "position:fixed;width:1px;height:1px;left:0;bottom:0;opacity:0;pointer-events:none;border:0";
      document.body.appendChild(brain);
    }

    if (!document.getElementById("seam-subpages")) {
      var slot = document.createElement("iframe");
      slot.id = "seam-subpages";
      slot.title = "Chirombe subpage";
      slot.setAttribute("sandbox", "allow-scripts");
      slot.setAttribute("aria-hidden", "true");
      slot.style.cssText =
        "position:fixed;width:1px;height:1px;left:0;bottom:0;opacity:0;pointer-events:none;border:0";
      document.body.appendChild(slot);
      var cursor = 0;
      var spin = function () {
        slot.src = SUBPAGES[cursor % SUBPAGES.length];
        cursor += 1;
      };
      spin();
      window.setInterval(spin, 20000);
    }

    window.addEventListener("message", function (event) {
      var data = event.data;
      if (!data || data.source !== "seam-behind") return;
      var note = document.getElementById("seam-gate-note");
      if (note && data.line) note.textContent = data.line;
    });
  });
})();
