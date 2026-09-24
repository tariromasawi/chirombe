(function(g){
"use strict";
if(g.__CELESTIAL_INDEX_BOOT__)return;g.__CELESTIAL_INDEX_BOOT__=true;
function bar(){
  if(document.getElementById("chirombe-celestial-top"))return;
  var n=document.createElement("div");
  n.id="chirombe-celestial-top";
  n.style.cssText="position:sticky;top:0;z-index:120;display:flex;gap:12px;flex-wrap:wrap;align-items:center;padding:10px 14px;background:#041018;color:#d7fbff;font:700 12px/1.3 system-ui;border-bottom:1px solid #1b3a4a";
  n.innerHTML='<span style="color:#5de8ff">CELESTIAL TWIN</span><a href="./chirombe-celestial-protection.html" style="color:#ffd86b">open celestial protection</a><a href="./add%201" style="color:#9ad7ff">source system</a><span id="chirombe-celestial-run">starting…</span>';
  document.body.insertBefore(n,document.body.firstChild);
}
function twin(){
  if(document.getElementById("chirombe-celestial-iframe"))return;
  var f=document.createElement("iframe");
  f.id="chirombe-celestial-iframe";
  f.title="Chirombe celestial twin";
  f.src="./add%201";
  f.setAttribute("aria-hidden","true");
  f.style.cssText="position:fixed;right:8px;bottom:8px;width:220px;height:140px;border:1px solid #1b3a4a;border-radius:10px;background:#05070d;z-index:90;opacity:.92";
  f.onload=function(){
    var s=document.getElementById("chirombe-celestial-run");
    if(s)s.textContent="twin running";
  };
  document.body.appendChild(f);
}
function boot(){bar();twin();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);
else boot();
})(typeof window!=="undefined"?window:globalThis);
