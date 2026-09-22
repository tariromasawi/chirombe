/* Addition only. Does not replace index.html markup. */
(function(){
  if(document.getElementById("zc-hmac-nim"))return;
  var box=document.createElement("section");
  box.id="zc-hmac-nim";
  box.style.cssText="margin:16px;padding:16px;border:1px solid #2a4633;border-radius:14px;background:#07110c;color:#e7f4ea;font:13px/1.5 system-ui";
  box.innerHTML='<div style="letter-spacing:.14em;color:#d4b36a">ADDITION · HMAC-SHA256 AUDIT · NIM FEEDBACK</div><p id="zc-hmac-status">arming…</p><pre id="zc-hmac-log" style="max-height:180px;overflow:auto;background:#050806;padding:8px"></pre>';
  (document.body||document.documentElement).appendChild(box);
  function line(t){var el=document.getElementById("zc-hmac-log");if(!el)return;el.textContent=t+"\n"+el.textContent;}
  function ready(){
    var P=window.ZionProtect; if(!P){document.getElementById("zc-hmac-status").textContent="module loading";return;}
    var s=P.snapshot(); document.getElementById("zc-hmac-status").textContent="nodes "+s.nodes.length+" · audit "+s.auditLength+" · head "+(s.head||"").slice(0,16);
    line("integrity ready");
  }
  setTimeout(ready,400); setTimeout(ready,1200);
})();
