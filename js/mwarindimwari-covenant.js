/**
 * MWARINDIMWARI covenant module
 * Additive only. Does not replace ChirombeBus.executeCommand results
 * for existing commands. Registers new commands if the bus is present.
 */
(function (g) {
  var NAME = "MWARINDIMWARI";
  var FORMULA =
    "DREAM-SEAL-ALL-PLAY-EFFECT-ACTIVATE-SEAM-END-LOCK-ACTIVATE-ZVAPERA";
  var LINE = "Mwari ndi Mwari. Zvapera.";
  var KEY = "MWARINDIMWARI_COVENANT_V1";

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch (e) {
      return {};
    }
  }
  function save(s) {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch (e) {}
  }

  var state = Object.assign(
    {
      sealed: false,
      reminders: 0,
      last: null,
      hash: null
    },
    load()
  );

  function note(type, msg) {
    if (g.Chirombe && typeof Chirombe.log === "function") {
      Chirombe.log(type, msg);
    }
  }

  function snapshot() {
    return {
      name: NAME,
      formula: FORMULA,
      line: LINE,
      sealed: !!state.sealed,
      reminders: state.reminders,
      last: state.last,
      kind: "symbolic-covenant",
      note: "Reminder of the dream lock. Not a change to core Chirombe output."
    };
  }

  function remind(who) {
    state.reminders += 1;
    state.last = new Date().toISOString();
    save(state);
    var msg =
      LINE +
      " · lock within the lock · seam holds · " +
      (who || "house");
    note("COVENANT", msg);
    return snapshot();
  }

  function seal() {
    state.sealed = true;
    state.last = new Date().toISOString();
    save(state);
    note("COVENANT", "SEAL remembered. " + LINE);
    return snapshot();
  }

  g.MwarindiCovenant = {
    status: snapshot,
    remind: remind,
    seal: seal,
    formula: FORMULA,
    line: LINE
  };

  if (g.ChirombeBus && typeof ChirombeBus.registerCommand === "function") {
    ChirombeBus.registerCommand(
      "covenant.status",
      function () {
        return snapshot();
      },
      { subsystem: "covenant" }
    );
    ChirombeBus.registerCommand(
      "covenant.remind",
      function (args) {
        return remind(args && args.who);
      },
      { subsystem: "covenant" }
    );
    ChirombeBus.registerCommand(
      "covenant.seal",
      function () {
        return seal();
      },
      { subsystem: "covenant" }
    );
  }

  note("COVENANT", "MWARINDIMWARI module attached (additive)");
})(typeof window !== "undefined" ? window : globalThis);
