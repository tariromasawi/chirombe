(function(g){
  var THEMES=["peace","wisdom","truth","courage","family","remembrance","healing","hope","unity","justice","resilience","gratitude","guidance","protection","light"];
  function pick(a){return a[Math.floor(Math.random()*a.length)]}
  function compose(seeds,family){
    seeds=seeds||[]; family=family||[];
    var allowed=seeds.filter(function(s){return s.generationAllowed});
    var anchors=seeds.filter(function(s){return s.generationAllowed===false});
    var a=pick(allowed.length?allowed:seeds)||{text:"Mwari ndi Mwari.",tradition:"Masowe / Shona",id:"S01"};
    var b=pick(allowed.length?allowed:seeds)||a;
    var theme=pick(THEMES);
    var names=family.map(function(m){return m.name}).filter(Boolean);
    var memorial=family.filter(function(m){return m.remembrance||m.status==="remembered"}).map(function(m){return m.name});
    var lines=[a.text];
    names.forEach(function(n){
      if(memorial.indexOf(n)>=0) lines.push("In remembrance of "+n+".");
      else lines.push("For "+n+".");
    });
    lines.push("For every future descendant represented as a DESCENDANT-META-NODE.");
    if(b && b.id!==a.id && b.generationAllowed!==false) lines.push(b.translation||b.text);
    lines.push("May "+theme+" travel through every generation of the House of Masawi.");
    var text=lines.join("\n");
    return {
      id:"GEN-"+Date.now().toString(36),
      parentSeeds:[a.id,b.id],
      traditions:[a.tradition,b.tradition].filter(Boolean),
      theme:theme,
      familyNodes:names,
      text:text,
      translation:a.translation||"",
      createdAt:new Date().toISOString(),
      generatorVersion:"LITURGY-1.0",
      generationType:"ORIGINAL_GENERATED_DEVOTIONAL",
      canonicalContentUsed:anchors.slice(0,2).map(function(x){return x.id}),
      note:"Original generated devotional. Not ancient scripture. Traditions remain distinct."
    };
  }
  g.ChirombePrayerComposer={compose:compose,themes:THEMES};
})(typeof window!=="undefined"?window:globalThis);
