(function(g){
"use strict";
if(g.__CHIROMBE_PERMISSIONS__)return;g.__CHIROMBE_PERMISSIONS__=true;
var state={microphone:"IDLE",camera:"IDLE",location:"IDLE",motion:"IDLE"};
var handles={stream:null,watch:null};
function set(id,v){state[id]=v;var el=document.getElementById("perm-"+id);if(el)el.textContent=label(id)+" · "+v;if(g.CHIROMBE_AUTOSTART&&g.CHIROMBE_AUTOSTART.hardware){try{var h=g.CHIROMBE_AUTOSTART.hardware();h[id==="location"?"location":id]=v}catch(e){}}if(g.Chirombe&&g.Chirombe.log)g.Chirombe.log("PERM",id+" "+v)}
function label(id){return {microphone:"MIC",camera:"CAM",location:"GPS",motion:"MOTION"}[id]||id}
function publish(kind,data){if(g.CHIROMBE_PIONEER_BUS)g.CHIROMBE_PIONEER_BUS.publish("sense.observation",{kind:kind,data:data,note:"user-granted sensor"},"permissions")}
function bar(){
  if(document.getElementById("chirombe-perm-bar"))return;
  var d=document.createElement("div");
  d.id="chirombe-perm-bar";
  d.style.cssText="position:sticky;top:0;z-index:90;display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:8px 12px;background:#0b1018;color:#d7e7f7;font:12px/1.3 system-ui;border-bottom:1px solid #243044";
  d.innerHTML='<strong style="color:#e8c96b;letter-spacing:.08em">SENSORS</strong>'
    +'<button type="button" id="perm-btn-mic">Enable microphone</button>'
    +'<button type="button" id="perm-btn-cam">Enable camera</button>'
    +'<button type="button" id="perm-btn-gps">Enable location</button>'
    +'<button type="button" id="perm-btn-mot">Enable motion</button>'
    +'<span id="perm-microphone">MIC · IDLE</span>'
    +'<span id="perm-camera">CAM · IDLE</span>'
    +'<span id="perm-location">GPS · IDLE</span>'
    +'<span id="perm-motion">MOTION · IDLE</span>'
    +'<span style="opacity:.65">Safari only asks after you tap. Nothing is requested until then.</span>';
  d.querySelectorAll("button").forEach(function(b){b.style.cssText="background:#152033;color:#e8f4ff;border:1px solid #3a516c;border-radius:8px;padding:7px 10px"});
  var dock=document.getElementById("chirombe-dock");
  if(dock&&dock.parentNode) dock.parentNode.insertBefore(d,dock.nextSibling);
  else document.body.insertBefore(d,document.body.firstChild);
  document.getElementById("perm-btn-mic").onclick=enableMic;
  document.getElementById("perm-btn-cam").onclick=enableCam;
  document.getElementById("perm-btn-gps").onclick=enableGps;
  document.getElementById("perm-btn-mot").onclick=enableMotion;
}
async function enableMic(){
  set("microphone","ASKING");
  try{
    var stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
    handles.stream=handles.stream||stream;
    set("microphone","GRANTED");
    if(g.ChirombeResonance&&g.ChirombeResonance.activate)g.ChirombeResonance.activate();
    publish("microphone",{enabled:true});
  }catch(e){set("microphone","DENIED")}
}
async function enableCam(){
  set("camera","ASKING");
  try{
    var stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:false});
    handles.stream=stream;
    set("camera","GRANTED");
    publish("camera",{enabled:true,tracks:stream.getVideoTracks().length});
  }catch(e){set("camera","DENIED")}
}
function enableGps(){
  if(!navigator.geolocation){set("location","UNAVAILABLE");return}
  set("location","ASKING");
  handles.watch=navigator.geolocation.watchPosition(function(pos){
    set("location","GRANTED");
    publish("location",{accuracy:pos.coords.accuracy,lat:pos.coords.latitude,lon:pos.coords.longitude});
  },function(){set("location","DENIED")},{enableHighAccuracy:false,maximumAge:30000,timeout:10000});
}
async function enableMotion(){
  set("motion","ASKING");
  try{
    if(typeof DeviceMotionEvent!=="undefined"&&typeof DeviceMotionEvent.requestPermission==="function"){
      var p=await DeviceMotionEvent.requestPermission();
      if(p!=="granted"){set("motion","DENIED");return}
    }
    window.addEventListener("devicemotion",function(ev){
      var a=ev.accelerationIncludingGravity||{};
      var mag=Math.sqrt((a.x||0)*(a.x||0)+(a.y||0)*(a.y||0)+(a.z||0)*(a.z||0));
      publish("motion",{magnitude:mag});
    },{passive:true});
    set("motion","GRANTED");
  }catch(e){set("motion","DENIED")}
}
g.CHIROMBE_PERMISSIONS={state:state,enableMic:enableMic,enableCam:enableCam,enableGps:enableGps,enableMotion:enableMotion};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bar);else bar();
})(typeof window!=="undefined"?window:globalThis);
