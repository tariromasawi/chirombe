/**
 * Optional worker. Speaks the covenant reminder only.
 * Does not touch family, health, or core status payloads.
 */
var LINE = "Mwari ndi Mwari. Zvapera.";
var ticks = 0;
function pulse() {
  ticks += 1;
  postMessage({
    type: "COVENANT",
    msg: LINE + " · seam holds · tick " + ticks,
    subsystem: "covenant"
  });
}
pulse();
setInterval(pulse, 15000);
