(function(g){
"use strict";
var THEMES=["peace","wisdom","truth","courage","hope","guidance","light","gratitude"];
function family(){
  if(g.ChirombeCore&&g.ChirombeCore.family) return g.ChirombeCore.family;
  return [{name:"House of Masawi"}];
}
function nextPerson(i){var f=family(); return f[(i||0)%f.length]}
function scripture(){
  var s=g.CHIROMBE_SCRIPTURE?g.CHIROMBE_SCRIPTURE.next():{ref:"Psalm 23:1",text:"The Lord is my shepherd; I shall not want.",book:"Psalms"};
  return {type:"SCRIPTURE",title:s.ref,text:s.ref+". "+s.text,source:"KJV public-domain excerpt",target:s.book,priority:2,metadata:{canonical:true}};
}
function bloodline(i){
  var p=nextPerson(i);
  var memorial=/Corinna/i.test(p.name||"")||p.remembrance;
  var text=memorial
    ? ("Mwari ndi Mwari. In remembrance of "+p.name+". May dignity and love remain with this House.")
    : ("Mwari ndi Mwari. For "+p.name+". May peace, wisdom and protection remain with this authorised branch of the House of Masawi.");
  return {type:memorial?"REMEMBRANCE":"INTERCESSION",title:"For "+p.name,text:text,source:"bloodline",target:p.name,priority:3};
}
function masowe(){
  return {type:"MASOWE",title:"Masowe devotional",text:"Mwari ndi Mwari. Mudzimu Unoyera, titungamirire muchokwadi. Rugare, huchenjeri nesimba rezvakanaka ngazvigare paImba yeMasawi.",source:"Masowe / Shona original",target:"House of Masawi",priority:2};
}
function original(theme){
  theme=theme||THEMES[Math.floor(Math.random()*THEMES.length)];
  var text="Mwari ndi Mwari. May "+theme+" travel through every generation of the House of Masawi. May truth stand at every gate. This is an original devotional composition, not scripture.";
  return {type:"ORIGINAL",title:"Original · "+theme,text:text,source:"composer",target:"House of Masawi",priority:1,metadata:{generationType:"ORIGINAL_GENERATED_DEVOTIONAL",theme:theme}};
}
function reflection(){
  return {type:"REFLECTION",title:"Reflection",text:"We pause. Measured sensors remain measurements. Prayer remains prayer. May wisdom increase where fear once stood.",source:"reflection",target:"session",priority:1};
}
function prayer(){
  return {type:"PRAYER",title:"House prayer",text:"Mwari ndi Mwari. May peace, wisdom and protection remain over the House and every descendant branch. May the living be strengthened in truth.",source:"house",target:"House of Masawi",priority:2};
}
g.CHIROMBE_LITURGY_COMPOSER={scripture:scripture,bloodline:bloodline,masowe:masowe,original:original,reflection:reflection,prayer:prayer,family:family,nextPerson:nextPerson};
})(typeof window!=="undefined"?window:globalThis);
