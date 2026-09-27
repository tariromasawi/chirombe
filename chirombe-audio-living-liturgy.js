/* ============================================================================
   CHIROMBE AUDIO LIVING LITURGY
   PART 1 — AUDIO KERNEL / CONTINUOUS AWARENESS FOUNDATION
   ----------------------------------------------------------------------------
   Purpose:
     Establish the permanent architectural foundation for CHIROMBE's
     intelligent audio subsystem.

   Design principles:
     - Existing CHIROMBE modules are preserved.
     - Audio operates as a connected organ of the wider system.
     - Browser capabilities are detected rather than assumed.
     - Audio decisions are observable and auditable.
     - Generated spiritual/liturgical material is clearly distinguished from
       sourced religious material.
     - Environmental anomalies are observations, not proof of supernatural
       causes.
     - Frequency requests are checked against actual hardware capabilities.
     - Evolution follows OBSERVE -> PROPOSE -> VALIDATE -> COMMIT -> VERSION.
     - No arbitrary generated code is executed by this subsystem.
     - No browser-side API credentials are required.
     - Audio output is bounded by safety governors.
     - Persistent state is versioned and recoverable where browser storage
       permits it.
 ============================================================================ */

(() => {
  "use strict";

  const VERSION = "1.0.0-part1";
  const BUILD = "CHIROMBE-AUDIO-LIVING-LITURGY";
  const CREATED_AT = new Date().toISOString();

  /* ------------------------------------------------------------------------
     01. GLOBAL NAMESPACE
     ------------------------------------------------------------------------ */

  const root =
    window.CHIROMBE ||
    (window.CHIROMBE = {});

  const existing = root.AudioLivingLiturgy || {};

  const AUDIO = root.AudioLivingLiturgy = Object.assign(existing, {
    VERSION,
    BUILD,
    CREATED_AT,
    STATUS: "INITIALISING",
    KERNEL: "ONLINE",
    MODE: "DORMANT"
  });

  window.CHIROMBE_AUDIO = AUDIO;
  window.CHIROMBE_AUDIO_LIVING_LITURGY = AUDIO;

  /* ------------------------------------------------------------------------
     02. UNIQUE IDENTIFIERS
     ------------------------------------------------------------------------ */

  const randomPart = () =>
    Math.random().toString(36).slice(2, 10);

  const makeId = prefix =>
    `${prefix}-${Date.now().toString(36)}-${randomPart()}`;

  const SESSION_ID = makeId("AUDIO");

  AUDIO.SESSION_ID = SESSION_ID;

  /* ------------------------------------------------------------------------
     03. INTERNAL CONFIGURATION
     ------------------------------------------------------------------------ */

  const CONFIG = {
    storageKey: "CHIROMBE_AUDIO_LIVING_LITURGY_STATE_V1",
    journalKey: "CHIROMBE_AUDIO_LIVING_LITURGY_JOURNAL_V1",

    persistenceIntervalMs: 15000,
    telemetryIntervalMs: 5000,
    schedulerResolutionMs: 100,

    maxJournalEntries: 1000,
    maxBroadcastQueue: 250,
    maxMemoryEntries: 2000,

    defaultMasterGain: 0.42,
    maximumMasterGain: 0.65,

    defaultToneGain: 0.08,
    maximumToneGain: 0.18,

    defaultVoiceRate: 0.92,
    defaultVoicePitch: 1.0,

    minimumFrequencyHz: 20,
    maximumAudibleFrequencyHz: 20000,

    emergencyStopReleaseMs: 80,

    repeatWindowMs: 30 * 60 * 1000,

    heartbeatMs: 5000,

    enablePersistence: true,
    enableTelemetry: true,
    enableAutomaticBroadcast: true,
    enableEvolutionPersistence: true,

    microphoneDefault: false,

    spiritualInterpretationMode: "SYMBOLIC_AND_USER_DIRECTED",

    evolutionPolicy: {
      observe: true,
      propose: true,
      validate: true,
      sandbox: true,
      commit: true,
      automaticBlindRewrite: false
    }
  };

  AUDIO.CONFIG = CONFIG;

  /* ------------------------------------------------------------------------
     04. LIFECYCLE STATES
     ------------------------------------------------------------------------ */

  const STATES = Object.freeze({
    DORMANT: "DORMANT",
    INITIALISING: "INITIALISING",
    READY: "READY",
    LISTENING: "LISTENING",
    COMPOSING: "COMPOSING",
    SPEAKING: "SPEAKING",
    TONAL: "TONAL",
    RITUAL: "RITUAL",
    MONITORING: "MONITORING",
    PAUSED: "PAUSED",
    RECOVERING: "RECOVERING",
    SAFE_STOP: "SAFE_STOP",
    ERROR: "ERROR"
  });

  AUDIO.STATES = STATES;

  /* ------------------------------------------------------------------------
     05. MASTER STATE
     ------------------------------------------------------------------------ */

  const state = {
    version: VERSION,
    sessionId: SESSION_ID,

    lifecycle: STATES.INITIALISING,

    createdAt: CREATED_AT,
    lastHeartbeat: null,
    lastPersisted: null,

    livingWatch: false,
    broadcastEnabled: false,

    currentSection: null,
    currentPerson: null,

    currentMode: "DAILY_PROTECTION",

    currentVoice: null,
    currentLanguage: "en",

    currentTone: null,
    currentFrequencyHz: null,

    masterGain: CONFIG.defaultMasterGain,

    audioContextState: "unavailable",

    sampleRate: null,
    channelCount: null,
    nyquistHz: null,

    microphoneEnabled: false,

    activeNodes: 0,

    queueLength: 0,
    memoryEntries: 0,

    eventsObserved: 0,
    broadcastsIssued: 0,
    broadcastsSuppressed: 0,

    warnings: 0,
    errors: 0,

    lastEvent: null,
    lastBroadcast: null,

    systemHealth: "UNKNOWN",

    persistenceAvailable: false,

    capabilities: {},

    evolution: {
      currentRevision: 0,
      lastProposal: null,
      lastCommit: null,
      permanentStateVersion: 0
    }
  };

  AUDIO.state = state;

  /* ------------------------------------------------------------------------
     06. SAFE SERIALISATION
     ------------------------------------------------------------------------ */

  function safeClone(value) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (_) {
      return {
        unserialisable: true,
        type: typeof value
      };
    }
  }

  function timestamp() {
    return new Date().toISOString();
  }

  /* ------------------------------------------------------------------------
     07. INTERNAL EVENT BUS
     ------------------------------------------------------------------------ */

  const listeners = new Map();

  function on(eventName, handler) {
    if (typeof handler !== "function") return () => {};

    if (!listeners.has(eventName)) {
      listeners.set(eventName, new Set());
    }

    listeners.get(eventName).add(handler);

    return () => {
      const set = listeners.get(eventName);
      if (set) set.delete(handler);
    };
  }

  function emit(eventName, payload = {}) {
    const event = {
      id: makeId("EVT"),
      name: eventName,
      timestamp: timestamp(),
      sessionId: SESSION_ID,
      payload: safeClone(payload)
    };

    state.eventsObserved += 1;
    state.lastEvent = event;

    const set = listeners.get(eventName);

    if (set) {
      for (const handler of [...set]) {
        try {
          handler(event);
        } catch (error) {
          internalLog(
            "ERROR",
            "EVENT_HANDLER_FAILURE",
            {
              eventName,
              error: String(error)
            }
          );
        }
      }
    }

    return event;
  }

  AUDIO.on = on;
  AUDIO.emit = emit;

  /* ------------------------------------------------------------------------
     08. EXTERNAL CHIROMBE EVENT BUS CONNECTION
     ------------------------------------------------------------------------ */

  function connectExternalBus() {
    const candidates = [
      window.ChirombeBus,
      window.CHIROMBE_BUS,
      root.Bus
    ];

    for (const bus of candidates) {
      if (!bus) continue;

      try {
        if (typeof bus.on === "function") {
          bus.on("*", externalEvent => {
            receiveSystemEvent(
              "CHIROMBE_BUS",
              externalEvent
            );
          });

          AUDIO.externalBus = bus;

          internalLog(
            "INFO",
            "EXTERNAL_BUS_CONNECTED",
            {
              busType: "on(*)"
            }
          );

          return true;
        }

        if (typeof bus.subscribe === "function") {
          bus.subscribe("*", externalEvent => {
            receiveSystemEvent(
              "CHIROMBE_BUS",
              externalEvent
            );
          });

          AUDIO.externalBus = bus;

          internalLog(
            "INFO",
            "EXTERNAL_BUS_CONNECTED",
            {
              busType: "subscribe(*)"
            }
          );

          return true;
        }
      } catch (error) {
        internalLog(
          "WARN",
          "EXTERNAL_BUS_CONNECTION_FAILED",
          {
            error: String(error)
          }
        );
      }
    }

    internalLog(
      "INFO",
      "EXTERNAL_BUS_NOT_AVAILABLE",
      {
        fallback: "INTERNAL_AUDIO_EVENT_BUS"
      }
    );

    return false;
  }

  function receiveSystemEvent(source, payload) {
    const event = emit("SYSTEM_EVENT_OBSERVED", {
      source,
      payload
    });

    ingestIntoBroadcastMatrix(event);

    return event;
  }

  AUDIO.receiveSystemEvent = receiveSystemEvent;

  /* ------------------------------------------------------------------------
     09. LOGGING / AUDIT ADAPTER
     ------------------------------------------------------------------------ */

  function internalLog(level, eventName, data = {}) {
    const record = {
      id: makeId("LOG"),
      timestamp: timestamp(),
      level,
      event: eventName,
      sessionId: SESSION_ID,
      data: safeClone(data)
    };

    try {
      if (window.ChirombeAudit &&
          typeof window.ChirombeAudit.append === "function") {

        window.ChirombeAudit.append({
          source: BUILD,
          ...record
        });
      }
    } catch (_) {
      // Audit failure must not crash audio.
    }

    emit("AUDIO_LOG", record);

    return record;
  }

  AUDIO.log = internalLog;

  /* ------------------------------------------------------------------------
     10. CAPABILITY DETECTION
     ------------------------------------------------------------------------ */

  function detectCapabilities() {
    const capabilities = {
      webAudio: false,
      audioContext: false,
      oscillator: false,
      analyser: false,
      speechSynthesis: false,
      speechRecognition: false,
      microphone: false,
      audioWorklet: false,
      mediaSession: false,
      localStorage: false,
      indexedDB: false,
      visibilityAPI: false,
      deviceMemory: null,
      hardwareConcurrency: null
    };

    capabilities.webAudio = !!(
      window.AudioContext ||
      window.webkitAudioContext
    );

    capabilities.audioContext = capabilities.webAudio;

    capabilities.oscillator = capabilities.webAudio;

    capabilities.analyser = capabilities.webAudio;

    capabilities.speechSynthesis =
      "speechSynthesis" in window &&
      typeof window.SpeechSynthesisUtterance === "function";

    capabilities.speechRecognition = !!(
      window.SpeechRecognition ||
      window.webkitSpeechRecognition
    );

    capabilities.microphone =
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function";

    capabilities.audioWorklet = !!(
      window.AudioWorkletNode
    );

    capabilities.mediaSession =
      "mediaSession" in navigator;

    try {
      const testKey = "__chirombe_audio_test__";
      localStorage.setItem(testKey, "1");
      localStorage.removeItem(testKey);
      capabilities.localStorage = true;
    } catch (_) {
      capabilities.localStorage = false;
    }

    capabilities.indexedDB =
      "indexedDB" in window;

    capabilities.visibilityAPI =
      typeof document.visibilityState !== "undefined";

    capabilities.deviceMemory =
      navigator.deviceMemory || null;

    capabilities.hardwareConcurrency =
      navigator.hardwareConcurrency || null;

    state.capabilities = capabilities;

    internalLog(
      "INFO",
      "CAPABILITIES_DETECTED",
      capabilities
    );

    return capabilities;
  }

  AUDIO.detectCapabilities = detectCapabilities;

  /* ------------------------------------------------------------------------
     11. AUDIO CONTEXT
     ------------------------------------------------------------------------ */

  let audioContext = null;

  let masterGain = null;
  let limiter = null;
  let analyser = null;

  const buses = {};

  function getAudioContextConstructor() {
    return (
      window.AudioContext ||
      window.webkitAudioContext ||
      null
    );
  }

  function createAudioContext() {
    if (audioContext) return audioContext;

    const Constructor = getAudioContextConstructor();

    if (!Constructor) {
      state.audioContextState = "UNAVAILABLE";

      internalLog(
        "WARN",
        "WEB_AUDIO_UNAVAILABLE"
      );

      return null;
    }

    try {
      audioContext = new Constructor();

      state.audioContextState =
        audioContext.state || "unknown";

      state.sampleRate =
        audioContext.sampleRate || null;

      state.nyquistHz =
        state.sampleRate
          ? state.sampleRate / 2
          : null;

      masterGain =
        audioContext.createGain();

      masterGain.gain.value =
        CONFIG.defaultMasterGain;

      limiter =
        audioContext.createDynamicsCompressor();

      limiter.threshold.value = -6;
      limiter.knee.value = 12;
      limiter.ratio.value = 12;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.15;

      analyser =
        audioContext.createAnalyser();

      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.82;

      masterGain
        .connect(limiter)
        .connect(analyser)
        .connect(audioContext.destination);

      createAudioBuses();

      state.audioContextState =
        audioContext.state;

      internalLog(
        "INFO",
        "AUDIO_CONTEXT_CREATED",
        {
          state: audioContext.state,
          sampleRate: audioContext.sampleRate,
          nyquistHz: state.nyquistHz
        }
      );

      emit("AUDIO_CONTEXT_READY", {
        sampleRate: state.sampleRate,
        nyquistHz: state.nyquistHz
      });

      return audioContext;

    } catch (error) {

      state.errors += 1;
      state.audioContextState = "ERROR";

      internalLog(
        "ERROR",
        "AUDIO_CONTEXT_CREATION_FAILED",
        {
          error: String(error)
        }
      );

      return null;
    }
  }

  AUDIO.createAudioContext = createAudioContext;
  AUDIO.getAudioContext = function () { return audioContext; };
  AUDIO.getAnalyser = function () { return analyser; };
  AUDIO.getBuses = function () { return buses; };

  /* ------------------------------------------------------------------------
     12. AUDIO BUS ARCHITECTURE
     ------------------------------------------------------------------------ */

  const BUS_NAMES = Object.freeze([
    "VOICE",
    "CHANT",
    "TONE",
    "DRONE",
    "AMBIENCE",
    "RHYTHM",
    "RESPONSE",
    "SPATIAL",
    "MONITOR",
    "MASTER"
  ]);

  function createAudioBuses() {
    if (!audioContext || !masterGain) return;

    for (const name of BUS_NAMES) {
      if (buses[name]) continue;

      const gain =
        audioContext.createGain();

      gain.gain.value =
        name === "MASTER"
          ? 1
          : 0.7;

      gain.connect(masterGain);

      buses[name] = {
        name,
        gain,
        createdAt: timestamp(),
        activeNodes: new Set()
      };
    }

    AUDIO.buses = buses;

    internalLog(
      "INFO",
      "AUDIO_BUSES_READY",
      {
        buses: BUS_NAMES
      }
    );

    emit("AUDIO_BUSES_READY", {
      buses: BUS_NAMES
    });
  }

  AUDIO.createAudioBuses = createAudioBuses;

  /* ------------------------------------------------------------------------
     13. MASTER SAFETY GOVERNOR
     ------------------------------------------------------------------------ */

  function clamp(value, minimum, maximum) {
    return Math.min(
      maximum,
      Math.max(minimum, Number(value) || 0)
    );
  }

  function setMasterGain(value) {
    const safeValue =
      clamp(
        value,
        0,
        CONFIG.maximumMasterGain
      );

    state.masterGain = safeValue;

    if (masterGain) {
      masterGain.gain.setTargetAtTime(
        safeValue,
        audioContext.currentTime,
        0.025
      );
    }

    emit("MASTER_GAIN_CHANGED", {
      requested: value,
      applied: safeValue
    });

    return safeValue;
  }

  AUDIO.setMasterGain = setMasterGain;

  function emergencyStop(reason = "USER_REQUEST") {

    state.lifecycle = STATES.SAFE_STOP;
    state.broadcastEnabled = false;
    state.livingWatch = false;
    state.masterGain = 0;

    if (audioContext) {
      try {
        for (const bus of Object.values(buses)) {
          if (bus.gain) {
            bus.gain.gain.cancelScheduledValues(
              audioContext.currentTime
            );

            bus.gain.gain.setTargetAtTime(
              0,
              audioContext.currentTime,
              CONFIG.emergencyStopReleaseMs / 1000
            );
          }
        }

        if (masterGain) {
          masterGain.gain.cancelScheduledValues(
            audioContext.currentTime
          );

          masterGain.gain.setTargetAtTime(
            0,
            audioContext.currentTime,
            CONFIG.emergencyStopReleaseMs / 1000
          );
        }

      } catch (_) {}
    }

    internalLog(
      "WARN",
      "AUDIO_EMERGENCY_STOP",
      {
        reason
      }
    );

    emit("AUDIO_SAFE_STOP", {
      reason
    });

    return true;
  }

  AUDIO.emergencyStop = emergencyStop;

  AUDIO.recoverFromSafeStop = function (reason) {
    if (state.lifecycle === STATES.SAFE_STOP) {
      state.lifecycle = STATES.READY;
    }
    state.masterGain = CONFIG.defaultMasterGain;
    if (audioContext && masterGain) {
      try {
        masterGain.gain.cancelScheduledValues(audioContext.currentTime);
        masterGain.gain.setTargetAtTime(
          CONFIG.defaultMasterGain,
          audioContext.currentTime,
          0.05
        );
        Object.values(buses).forEach(function (bus) {
          if (!bus.gain) return;
          bus.gain.gain.cancelScheduledValues(audioContext.currentTime);
          bus.gain.gain.setTargetAtTime(
            bus.name === "MASTER" ? 1 : 0.7,
            audioContext.currentTime,
            0.05
          );
        });
      } catch (_) {}
    }
    internalLog("INFO", "AUDIO_RECOVERED_FROM_SAFE_STOP", { reason: reason || "USER" });
    emit("AUDIO_RECOVERED", { reason: reason || "USER" });
    return true;
  };

  /* ------------------------------------------------------------------------
     14. FREQUENCY CAPABILITY GOVERNOR
     ------------------------------------------------------------------------ */

  function classifyFrequency(frequencyHz) {
    const f = Number(frequencyHz);

    if (!Number.isFinite(f) || f <= 0) {
      return {
        classification: "INVALID",
        supported: false,
        reason: "Frequency must be a positive finite number."
      };
    }

    if (f < 20) {
      return {
        classification: "INFRASONIC",
        supported: false,
        reason:
          "Below conventional human audible range."
      };
    }

    if (f <= CONFIG.maximumAudibleFrequencyHz) {
      const nyquistSupported =
        !state.nyquistHz ||
        f < state.nyquistHz;

      return {
        classification: "AUDIBLE",
        supported: nyquistSupported,
        nyquistSupported,
        reason: nyquistSupported
          ? "Within the configured audible/sample-rate range."
          : "Above current Nyquist limit."
      };
    }

    if (f < 1000000) {
      return {
        classification: "ULTRASONIC",
        supported: false,
        reason:
          "Ordinary phone/browser speaker output is not assumed capable of reproducing this frequency."
      };
    }

    return {
      classification: "RF_OR_MHZ",
      supported: false,
      reason:
        "Browser Web Audio output is not an RF/MHz transmitter."
    };
  }

  AUDIO.classifyFrequency = classifyFrequency;

  function validateFrequency(frequencyHz) {
    const result =
      classifyFrequency(frequencyHz);

    internalLog(
      result.supported ? "INFO" : "WARN",
      "FREQUENCY_VALIDATED",
      {
        requestedHz: frequencyHz,
        ...result
      }
    );

    return result;
  }

  AUDIO.validateFrequency = validateFrequency;

  /* ------------------------------------------------------------------------
     15. PERSISTENT STATE
     ------------------------------------------------------------------------ */

  function loadPersistentState() {

    if (!CONFIG.enablePersistence) {
      return null;
    }

    try {

      if (!window.localStorage) {
        return null;
      }

      const raw =
        localStorage.getItem(
          CONFIG.storageKey
        );

      if (!raw) {
        state.persistenceAvailable = true;

        return null;
      }

      const parsed =
        JSON.parse(raw);

      if (!parsed || typeof parsed !== "object") {
        return null;
      }

      if (parsed.version) {
        state.evolution =
          Object.assign(
            state.evolution,
            parsed.evolution || {}
          );

        state.currentMode =
          parsed.currentMode ||
          state.currentMode;
      }

      state.persistenceAvailable = true;

      internalLog(
        "INFO",
        "PERSISTENT_AUDIO_STATE_RESTORED",
        {
          version: parsed.version || null,
          savedAt: parsed.savedAt || null
        }
      );

      emit(
        "PERSISTENT_STATE_RESTORED",
        parsed
      );

      return parsed;

    } catch (error) {

      state.warnings += 1;

      internalLog(
        "WARN",
        "PERSISTENT_STATE_RESTORE_FAILED",
        {
          error: String(error)
        }
      );

      return null;
    }
  }

  function persistState() {

    if (!CONFIG.enablePersistence) {
      return false;
    }

    try {

      if (!window.localStorage) {
        return false;
      }

      const persistent = {
        version: VERSION,
        build: BUILD,
        savedAt: timestamp(),

        currentMode:
          state.currentMode,

        evolution:
          safeClone(state.evolution),

        capabilities:
          safeClone(state.capabilities),

        lastBroadcast:
          safeClone(state.lastBroadcast),

        statistics: {
          eventsObserved:
            state.eventsObserved,

          broadcastsIssued:
            state.broadcastsIssued,

          broadcastsSuppressed:
            state.broadcastsSuppressed,

          warnings:
            state.warnings,

          errors:
            state.errors
        }
      };

      localStorage.setItem(
        CONFIG.storageKey,
        JSON.stringify(persistent)
      );

      state.lastPersisted =
        persistent.savedAt;

      state.persistenceAvailable = true;

      emit(
        "AUDIO_STATE_PERSISTED",
        persistent
      );

      return true;

    } catch (error) {

      state.warnings += 1;

      internalLog(
        "WARN",
        "AUDIO_STATE_PERSIST_FAILED",
        {
          error: String(error)
        }
      );

      return false;
    }
  }

  AUDIO.loadPersistentState =
    loadPersistentState;

  AUDIO.persistState =
    persistState;

  /* ------------------------------------------------------------------------
     16. AUDIO MEMORY
     ------------------------------------------------------------------------ */

  const memory = [];

  function remember(type, data = {}, importance = 0.5) {

    const record = {
      id: makeId("MEM"),
      timestamp: timestamp(),
      type,
      importance:
        clamp(importance, 0, 1),
      sessionId: SESSION_ID,
      data: safeClone(data)
    };

    memory.push(record);

    while (
      memory.length >
      CONFIG.maxMemoryEntries
    ) {
      memory.shift();
    }

    state.memoryEntries =
      memory.length;

    emit(
      "AUDIO_MEMORY_RECORDED",
      record
    );

    return record;
  }

  AUDIO.remember = remember;

  AUDIO.getMemory = function(limit = 100) {
    return memory
      .slice(-Math.max(1, limit))
      .map(safeClone);
  };

  /* ------------------------------------------------------------------------
     17. BROADCAST QUEUE
     ------------------------------------------------------------------------ */

  const broadcastQueue = [];

  const recentBroadcasts = [];

  function contentFingerprint(text) {

    const normalised =
      String(text || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    let hash = 2166136261;

    for (let i = 0; i < normalised.length; i++) {
      hash ^= normalised.charCodeAt(i);
      hash +=
        (hash << 1) +
        (hash << 4) +
        (hash << 7) +
        (hash << 8) +
        (hash << 24);
    }

    return (
      hash >>> 0
    ).toString(16);
  }

  function hasRecentlyBroadcast(text) {

    const fingerprint =
      contentFingerprint(text);

    const now =
      Date.now();

    return recentBroadcasts.some(
      item =>
        item.fingerprint === fingerprint &&
        now - item.timestamp <
          CONFIG.repeatWindowMs
    );
  }

  function queueBroadcast(spec = {}) {

    const text =
      String(spec.text || "").trim();

    if (!text) return null;

    if (hasRecentlyBroadcast(text)) {

      state.broadcastsSuppressed += 1;

      internalLog(
        "INFO",
        "BROADCAST_SUPPRESSED_AS_REPETITION",
        {
          text
        }
      );

      return null;
    }

    const item = {
      id: makeId("BRD"),
      createdAt: timestamp(),

      priority:
        clamp(
          spec.priority ?? 0.5,
          0,
          1
        ),

      category:
        spec.category ||
        "SYSTEM_INFORMATION",

      text,

      language:
        spec.language ||
        state.currentLanguage,

      mode:
        spec.mode ||
        state.currentMode,

      source:
        spec.source ||
        BUILD,

      reason:
        spec.reason ||
        "UNSPECIFIED",

      interruptible:
        spec.interruptible !== false,

      spiritual:
        !!spec.spiritual,

      provenance:
        spec.provenance ||
        "ORIGINAL",

      status: "QUEUED"
    };

    broadcastQueue.push(item);

    while (
      broadcastQueue.length >
      CONFIG.maxBroadcastQueue
    ) {
      broadcastQueue.shift();
    }

    state.queueLength =
      broadcastQueue.length;

    emit(
      "BROADCAST_QUEUED",
      item
    );

    return item;
  }

  AUDIO.queueBroadcast =
    queueBroadcast;

  AUDIO.getBroadcastQueue =
    function() {
      return broadcastQueue.map(
        safeClone
      );
    };

  /* ------------------------------------------------------------------------
     18. BROADCAST DECISION MATRIX — FOUNDATION
     ------------------------------------------------------------------------ */

  const matrix = {
    weights: {
      severity: 0.25,
      novelty: 0.15,
      systemImportance: 0.20,
      userRelevance: 0.15,
      safetyImportance: 0.15,
      timeSensitivity: 0.10
    },

    thresholds: {
      silent: 0.20,
      queue: 0.40,
      speak: 0.62,
      interrupt: 0.85
    }
  };

  AUDIO.broadcastMatrix = matrix;

  function scoreEvent(event = {}) {

    const payload =
      event.payload || {};

    const score =
      (
        clamp(
          payload.severity ?? 0.5,
          0,
          1
        ) * matrix.weights.severity
      ) +
      (
        clamp(
          payload.novelty ?? 0.5,
          0,
          1
        ) * matrix.weights.novelty
      ) +
      (
        clamp(
          payload.systemImportance ?? 0.5,
          0,
          1
        ) * matrix.weights.systemImportance
      ) +
      (
        clamp(
          payload.userRelevance ?? 0.5,
          0,
          1
        ) * matrix.weights.userRelevance
      ) +
      (
        clamp(
          payload.safetyImportance ?? 0.5,
          0,
          1
        ) * matrix.weights.safetyImportance
      ) +
      (
        clamp(
          payload.timeSensitivity ?? 0.5,
          0,
          1
        ) * matrix.weights.timeSensitivity
      );

    return clamp(score, 0, 1);
  }

  AUDIO.scoreEvent =
    scoreEvent;

  function ingestIntoBroadcastMatrix(event) {

    if (!event) return null;

    const score =
      scoreEvent(event);

    let action =
      "SILENT";

    if (
      score >=
      matrix.thresholds.interrupt
    ) {
      action = "INTERRUPT";
    } else if (
      score >=
      matrix.thresholds.speak
    ) {
      action = "SPEAK";
    } else if (
      score >=
      matrix.thresholds.queue
    ) {
      action = "QUEUE";
    }

    const decision = {
      id: makeId("DEC"),
      timestamp: timestamp(),
      eventId: event.id,
      score,
      action,
      state:
        state.lifecycle,
      reason:
        `Broadcast matrix score ${score.toFixed(3)}`
    };

    emit(
      "BROADCAST_DECISION",
      decision
    );

    remember(
      "BROADCAST_DECISION",
      decision,
      score
    );

    return decision;
  }

  AUDIO.ingestIntoBroadcastMatrix =
    ingestIntoBroadcastMatrix;

  /* ------------------------------------------------------------------------
     19. SYSTEM INFORMATION BROADCAST HELPER
     ------------------------------------------------------------------------ */

  function announceSystemInformation(
    text,
    options = {}
  ) {

    return queueBroadcast({
      text,
      category:
        options.category ||
        "SYSTEM_INFORMATION",

      priority:
        options.priority ??
        0.55,

      source:
        options.source ||
        BUILD,

      reason:
        options.reason ||
        "SYSTEM_STATUS",

      language:
        options.language ||
        state.currentLanguage,

      provenance:
        "ORIGINAL"
    });
  }

  AUDIO.announceSystemInformation =
    announceSystemInformation;

  /* ------------------------------------------------------------------------
     20. SPIRITUAL DECLARATION CHANNEL
     ------------------------------------------------------------------------ */

  function createProtectiveDeclaration(
    text,
    options = {}
  ) {

    const declaration = {
      id: makeId("DECL"),
      timestamp: timestamp(),

      text: String(text || "").trim(),

      mode:
        options.mode ||
        "PROTECTION",

      language:
        options.language ||
        state.currentLanguage,

      provenance:
        options.provenance ||
        "ORIGINAL",

      spiritualStatus:
        "USER_DIRECTED_SPIRITUAL_PRACTICE",

      factualStatus:
        "DECLARATION_NOT_SENSOR_EVIDENCE"
    };

    remember(
      "PROTECTIVE_DECLARATION",
      declaration,
      0.7
    );

    emit(
      "PROTECTIVE_DECLARATION_CREATED",
      declaration
    );

    return declaration;
  }

  AUDIO.createProtectiveDeclaration =
    createProtectiveDeclaration;

  /* ------------------------------------------------------------------------
     21. HEARTBEAT
     ------------------------------------------------------------------------ */

  let heartbeatTimer = null;

  function heartbeat() {

    state.lastHeartbeat =
      timestamp();

    state.queueLength =
      broadcastQueue.length;

    state.activeNodes =
      Object.values(buses)
        .reduce(
          (total, bus) =>
            total +
            (bus.activeNodes
              ? bus.activeNodes.size
              : 0),
          0
        );

    emit(
      "AUDIO_HEARTBEAT",
      {
        lifecycle:
          state.lifecycle,

        livingWatch:
          state.livingWatch,

        broadcastEnabled:
          state.broadcastEnabled,

        queueLength:
          state.queueLength,

        activeNodes:
          state.activeNodes,

        systemHealth:
          state.systemHealth
      }
    );

    if (
      CONFIG.enablePersistence &&
      Date.now() -
        new Date(
          state.lastPersisted ||
          0
        ).getTime()
        >
        CONFIG.persistenceIntervalMs
    ) {
      persistState();
    }
  }

  function startHeartbeat() {

    if (heartbeatTimer) {
      clearInterval(
        heartbeatTimer
      );
    }

    heartbeatTimer =
      setInterval(
        heartbeat,
        CONFIG.heartbeatMs
      );
  }

  AUDIO.startHeartbeat =
    startHeartbeat;

  /* ------------------------------------------------------------------------
     22. INITIALISATION
     ------------------------------------------------------------------------ */

  function initialise() {

    state.lifecycle =
      STATES.INITIALISING;

    detectCapabilities();

    loadPersistentState();

    connectExternalBus();

    if (state.capabilities.webAudio) {
      /*
       * We intentionally create the AudioContext object here but do not
       * force playback. Modern browsers normally require a user gesture
       * before resuming audio.
       */
      createAudioContext();
    }

    state.lifecycle =
      STATES.READY;

    state.systemHealth =
      "INITIAL_AUDIO_KERNEL_READY";

    startHeartbeat();

    remember(
      "KERNEL_INITIALISED",
      {
        version: VERSION,
        sessionId: SESSION_ID,
        capabilities:
          state.capabilities
      },
      0.8
    );

    internalLog(
      "INFO",
      "CHIROMBE_AUDIO_KERNEL_READY",
      {
        version: VERSION,
        sessionId: SESSION_ID
      }
    );

    emit(
      "AUDIO_KERNEL_READY",
      {
        version: VERSION,
        sessionId: SESSION_ID,
        capabilities:
          state.capabilities
      }
    );

    AUDIO.STATUS = "READY";

    return AUDIO;
  }

  /* ------------------------------------------------------------------------
     23. USER-GESTURE AUDIO UNLOCK
     ------------------------------------------------------------------------ */

  async function unlockAudio() {

    const context =
      createAudioContext();

    if (!context) {
      return false;
    }

    try {

      if (
        context.state ===
        "suspended"
      ) {
        await context.resume();
      }

      state.audioContextState =
        context.state;

      emit(
        "AUDIO_UNLOCKED",
        {
          state:
            context.state
        }
      );

      internalLog(
        "INFO",
        "AUDIO_USER_GESTURE_UNLOCK",
        {
          state:
            context.state
        }
      );

      return (
        context.state ===
        "running"
      );

    } catch (error) {

      state.errors += 1;

      internalLog(
        "ERROR",
        "AUDIO_UNLOCK_FAILED",
        {
          error:
            String(error)
        }
      );

      return false;
    }
  }

  AUDIO.unlockAudio =
    unlockAudio;

  /* ------------------------------------------------------------------------
     24. LIVING WATCH
     ------------------------------------------------------------------------ */

  function startLivingWatch() {

    if (
      state.lifecycle ===
      STATES.SAFE_STOP
    ) {
      return false;
    }

    state.livingWatch = true;
    state.broadcastEnabled = true;
    state.lifecycle =
      STATES.MONITORING;

    announceSystemInformation(
      "CHIROMBE Living Watch is now active. The audio intelligence layer is monitoring connected system activity and will prioritise meaningful information for broadcast.",
      {
        priority: 0.75,
        reason:
          "LIVING_WATCH_ACTIVATED"
      }
    );

    remember(
      "LIVING_WATCH_STARTED",
      {
        mode:
          state.currentMode
      },
      0.9
    );

    emit(
      "LIVING_WATCH_STARTED",
      {
        mode:
          state.currentMode
      }
    );

    persistState();

    return true;
  }

  function stopLivingWatch(
    reason = "USER_REQUEST"
  ) {

    state.livingWatch = false;
    state.broadcastEnabled = false;

    if (
      state.lifecycle !==
      STATES.SAFE_STOP
    ) {
      state.lifecycle =
        STATES.READY;
    }

    remember(
      "LIVING_WATCH_STOPPED",
      {
        reason
      },
      0.6
    );

    emit(
      "LIVING_WATCH_STOPPED",
      {
        reason
      }
    );

    persistState();

    return true;
  }

  AUDIO.startLivingWatch =
    startLivingWatch;

  AUDIO.stopLivingWatch =
    stopLivingWatch;

  /* ------------------------------------------------------------------------
     25. PUBLIC STATUS REPORT
     ------------------------------------------------------------------------ */

  AUDIO.getStatus = function() {

    return {
      build: BUILD,
      version: VERSION,

      sessionId:
        state.sessionId,

      lifecycle:
        state.lifecycle,

      livingWatch:
        state.livingWatch,

      broadcastEnabled:
        state.broadcastEnabled,

      currentMode:
        state.currentMode,

      audioContext:
        state.audioContextState,

      sampleRate:
        state.sampleRate,

      nyquistHz:
        state.nyquistHz,

      masterGain:
        state.masterGain,

      activeNodes:
        state.activeNodes,

      queueLength:
        state.queueLength,

      memoryEntries:
        state.memoryEntries,

      eventsObserved:
        state.eventsObserved,

      broadcastsIssued:
        state.broadcastsIssued,

      broadcastsSuppressed:
        state.broadcastsSuppressed,

      warnings:
        state.warnings,

      errors:
        state.errors,

      capabilities:
        safeClone(
          state.capabilities
        ),

      evolution:
        safeClone(
          state.evolution
        )
    };
  };

  /* ------------------------------------------------------------------------
     26. PAGE VISIBILITY AWARENESS
     ------------------------------------------------------------------------ */

  if (
    typeof document.visibilityState !==
    "undefined"
  ) {

    document.addEventListener(
      "visibilitychange",
      () => {

        emit(
          "PAGE_VISIBILITY_CHANGED",
          {
            visibility:
              document.visibilityState
          }
        );

        /*
         * CHIROMBE does not automatically interpret a background page as
         * permission to bypass browser audio restrictions. The state is
         * observed and recorded only.
         */
      }
    );
  }

  /* ------------------------------------------------------------------------
     27. ERROR RECOVERY
     ------------------------------------------------------------------------ */

  window.addEventListener(
    "error",
    event => {

      state.errors += 1;

      internalLog(
        "ERROR",
        "PAGE_ERROR_OBSERVED",
        {
          message:
            event.message ||
            "Unknown page error",

          source:
            event.filename ||
            null,

          line:
            event.lineno ||
            null
        }
      );
    }
  );

  window.addEventListener(
    "unhandledrejection",
    event => {

      state.errors += 1;

      internalLog(
        "ERROR",
        "UNHANDLED_PROMISE_REJECTION",
        {
          reason:
            String(
              event.reason ||
              "Unknown rejection"
            )
        }
      );
    }
  );

  /* ------------------------------------------------------------------------
     28. BOOTSTRAP
     ------------------------------------------------------------------------ */

  try {

    initialise();

  } catch (error) {

    state.lifecycle =
      STATES.ERROR;

    state.errors += 1;

    internalLog(
      "ERROR",
      "AUDIO_KERNEL_BOOT_FAILURE",
      {
        error:
          String(error)
      }
    );
  }

  /* ------------------------------------------------------------------------
     29. GLOBAL CONTROL SURFACE
     ------------------------------------------------------------------------ */

  window.CHIROMBE_AUDIO_CONTROL = {

    status:
      () =>
        AUDIO.getStatus(),

    start:
      () =>
        AUDIO.startLivingWatch(),

    stop:
      () =>
        AUDIO.stopLivingWatch(),

    unlock:
      () =>
        AUDIO.unlockAudio(),

    emergencyStop:
      reason =>
        AUDIO.emergencyStop(
          reason
        ),

    setGain:
      value =>
        AUDIO.setMasterGain(
          value
        ),

    queue:
      specification =>
        AUDIO.queueBroadcast(
          specification
        ),

    announce:
      (text, options) =>
        AUDIO.announceSystemInformation(
          text,
          options
        ),

    declaration:
      (text, options) =>
        AUDIO.createProtectiveDeclaration(
          text,
          options
        ),

    frequency:
      hz =>
        AUDIO.validateFrequency(
          hz
        ),

    memory:
      limit =>
        AUDIO.getMemory(
          limit
        )
  };

  /* ------------------------------------------------------------------------
     30. PART 1 COMPLETION EVENT
     ------------------------------------------------------------------------ */

  emit(
    "AUDIO_PART_1_COMPLETE",
    {
      build: BUILD,
      version: VERSION,
      kernel: "READY",
      nextLayer:
        "INTELLIGENT_LITURGY_AND_CONTENT_ENGINE"
    }
  );

})();
/* ============================================================================
   CHIROMBE AUDIO LIVING LITURGY
   PART 2 — INTELLIGENT LITURGY / PRAYER / CONTENT COMPOSITION ENGINE
   ----------------------------------------------------------------------------
   Builds upon Part 1.

   Responsibilities:
     - Intelligent prayer composition
     - Dynamic liturgy construction
     - Bloodline-person prayer orchestration
     - Novelty and repetition control
     - Multi-language content architecture
     - Spiritual declaration generation
     - Ritual sequencing
     - Call-and-response preparation
     - Sacred-source provenance
     - Original-content generation
     - Session continuity
     - Content memory
     - Broadcast-ready composition

   Important distinction:
     This subsystem can create spiritual and devotional material, but it does
     not claim that software can scientifically detect, identify, communicate
     with, or repel supernatural entities. Spiritual declarations are treated
     as user-directed devotional practice.

   Copyright/source principle:
     CHIROMBE must not falsely attribute generated text to scripture, religion,
     prophet, author, or historical source. Every item receives provenance.
 ============================================================================ */

(() => {
  "use strict";

  const AUDIO =
    window.CHIROMBE_AUDIO ||
    (
      window.CHIROMBE &&
      window.CHIROMBE.AudioLivingLiturgy
    );

  if (!AUDIO) {
    console.error(
      "CHIROMBE AUDIO PART 2: Part 1 kernel not found."
    );
    return;
  }

  const root =
    window.CHIROMBE ||
    (window.CHIROMBE = {});

  const VERSION = "1.0.0-part2";

  /* ------------------------------------------------------------------------
     01. CONTENT ENGINE NAMESPACE
     ------------------------------------------------------------------------ */

  const LITURGY =
    AUDIO.Liturgy ||
    (AUDIO.Liturgy = {});

  LITURGY.VERSION = VERSION;
  LITURGY.STATUS = "INITIALISING";

  window.CHIROMBE_AUDIO_LITURGY_ENGINE =
    LITURGY;

  /* ------------------------------------------------------------------------
     02. CONTENT TAXONOMY
     ------------------------------------------------------------------------ */

  const CONTENT_TYPES = Object.freeze({

    PRAYER:
      "PRAYER",

    DECLARATION:
      "DECLARATION",

    GRATITUDE:
      "GRATITUDE",

    REFLECTION:
      "REFLECTION",

    PROTECTION_INTENTION:
      "PROTECTION_INTENTION",

    PERSON_BLESSING:
      "PERSON_BLESSING",

    FAMILY_UNITY:
      "FAMILY_UNITY",

    COURAGE:
      "COURAGE",

    WISDOM:
      "WISDOM",

    PEACE:
      "PEACE",

    HOPE:
      "HOPE",

    REMEMBRANCE:
      "REMEMBRANCE",

    TRUTH:
      "TRUTH",

    COMPASSION:
      "COMPASSION",

    STEWARDSHIP:
      "STEWARDSHIP",

    CLOSING:
      "CLOSING",

    CALL:
      "CALL",

    RESPONSE:
      "RESPONSE",

    SILENCE:
      "SILENCE",

    SYSTEM_INFORMATION:
      "SYSTEM_INFORMATION",

    ALERT:
      "ALERT",

    RECOVERY_REPORT:
      "RECOVERY_REPORT",

    EVOLUTION_REPORT:
      "EVOLUTION_REPORT"
  });

  LITURGY.CONTENT_TYPES =
    CONTENT_TYPES;

  /* ------------------------------------------------------------------------
     03. THEMATIC VOCABULARY
     ------------------------------------------------------------------------ */

  const THEMES = {

    PROTECTION: [
      "protection",
      "peace",
      "wisdom",
      "courage",
      "clarity",
      "resilience",
      "truth",
      "safety",
      "unity"
    ],

    FAMILY: [
      "family",
      "lineage",
      "unity",
      "love",
      "respect",
      "responsibility",
      "remembrance",
      "continuity",
      "legacy"
    ],

    COURAGE: [
      "courage",
      "strength",
      "steadfastness",
      "hope",
      "perseverance",
      "calm",
      "confidence"
    ],

    PEACE: [
      "peace",
      "stillness",
      "patience",
      "compassion",
      "rest",
      "clarity",
      "gentleness"
    ],

    WISDOM: [
      "wisdom",
      "discernment",
      "truth",
      "learning",
      "understanding",
      "humility",
      "responsibility"
    ],

    GRATITUDE: [
      "gratitude",
      "life",
      "family",
      "creation",
      "opportunity",
      "knowledge",
      "community",
      "hope"
    ],

    NIGHT: [
      "rest",
      "peace",
      "watchfulness",
      "reflection",
      "quiet",
      "safety",
      "renewal"
    ],

    MORNING: [
      "renewal",
      "purpose",
      "gratitude",
      "courage",
      "wisdom",
      "clarity",
      "hope"
    ],

    REMEMBRANCE: [
      "memory",
      "legacy",
      "gratitude",
      "honour",
      "continuity",
      "family",
      "wisdom"
    ]
  };

  LITURGY.THEMES = THEMES;

  /* ------------------------------------------------------------------------
     04. TRADITION MODES
     ------------------------------------------------------------------------ */

  const TRADITION_MODES = {

    ORIGINAL:
      "ORIGINAL",

    MASOWE_PERSONAL:
      "MASOWE_PERSONAL",

    CHRISTIAN_REFLECTION:
      "CHRISTIAN_REFLECTION",

    JEWISH_REFLECTION:
      "JEWISH_REFLECTION",

    ISLAMIC_REFLECTION:
      "ISLAMIC_REFLECTION",

    HINDU_REFLECTION:
      "HINDU_REFLECTION",

    BUDDHIST_REFLECTION:
      "BUDDHIST_REFLECTION",

    INTERFAITH_REFLECTION:
      "INTERFAITH_REFLECTION",

    USER_PROVIDED:
      "USER_PROVIDED"
  };

  LITURGY.TRADITION_MODES =
    TRADITION_MODES;

  /*
   * CHIROMBE does not automatically blend religions into one theology.
   * A selected tradition is treated as a distinct interpretive mode.
   */

  /* ------------------------------------------------------------------------
     05. LANGUAGE PACKS
     ------------------------------------------------------------------------ */

  const LANGUAGE_PACKS = {

    en: {
      name: "English",

      openings: [
        "May this moment begin in peace.",
        "Let truth guide this moment.",
        "Let wisdom govern our words and actions.",
        "May courage remain steady within this household.",
        "Let peace be established in this space."
      ],

      gratitude: [
        "We give thanks for life, family, learning and another opportunity to grow.",
        "We acknowledge the gift of another day and the responsibilities that come with it.",
        "We give thanks for those who have helped us and for the wisdom gained through experience."
      ],

      protection: [
        "May this household be guided by peace, wisdom, courage and truth.",
        "Let fear give way to clarity, and confusion give way to understanding.",
        "May every person here be strengthened to choose what protects life, dignity and peace.",
        "Let harmful intentions find no encouragement in our actions or words."
      ],

      courage: [
        "Give us courage to meet difficulty without surrendering wisdom.",
        "Strengthen the heart to remain calm when circumstances become difficult.",
        "Let courage be guided by compassion and responsibility."
      ],

      closing: [
        "Let peace remain with this household.",
        "May wisdom accompany every decision that follows.",
        "Let this time of reflection end with gratitude, courage and peace."
      ]
    },

    sh: {
      name: "Shona",

      openings: [
        "Mwari ndiMwari; ngatitangei nerugare.",
        "Ngirozi dzerunyararo nemweya werudo ngazvititungamirire.",
        "Ngatitangei nguva ino nechokwadi, rugare nouchenjeri.",
        "Ngative vakasimba mumwoyo asi vakapfava murudo."
      ],

      gratitude: [
        "Tinotenda noupenyu, mhuri, kudzidza uye mukana wokukura.",
        "Tinotenda Mwari nokuda kwezuva idzva nemikana mitsva.",
        "Tinorangarira avo vakatitangira uye tinochengeta huchenjeri hwavakatidzidzisa."
      ],

      protection: [
        "Mwari ndiMwari; ngapave norugare, chokwadi nouchenjeri mumhuri.",
        "Kutya ngakudzike, rugare noruzivo zvikwire.",
        "Ngatidzivirirei hupenyu, chiremerera uye kubatana kwemhuri.",
        "Mwoyo yedu ngaigariswe norudo, huchenjeri uye ushingi."
      ],

      courage: [
        "Mwari tipei ushingi hunotungamirirwa nouchenjeri.",
        "Ngative vakasimba pakatarisana nematambudziko.",
        "Uchenjeri ngarutitungamirire pakusarudza zvakanaka."
      ],

      closing: [
        "Rugare ngarugare mumhuri.",
        "Uchenjeri ngahufambe nesu muzvisarudzo zvedu.",
        "Ngatipedzei nguva ino nerutendo, rugare noushingi."
      ]
    }
  };

  LITURGY.LANGUAGE_PACKS =
    LANGUAGE_PACKS;

  /* ------------------------------------------------------------------------
     06. SACRED VOCABULARY
     ------------------------------------------------------------------------ */

  const SACRED_VOCABULARY = {

    "MWARI_NDI_MWARI": {
      text: "Mwari ndiMwari",
      language: "sh",
      provenance: "USER_PREFERRED_PHRASE",
      category: "FAITH_ANCHOR"
    },

    "MUDZIMU_UNOYERA": {
      text: "Mudzimu Unoyera",
      language: "sh",
      provenance: "USER_PREFERRED_PHRASE",
      category: "SPIRITUAL_VOCABULARY"
    },

    "TRUTH": {
      text: "Truth",
      language: "en",
      provenance: "ORIGINAL_CONCEPT",
      category: "ANCHOR"
    },

    "PEACE": {
      text: "Peace",
      language: "en",
      provenance: "ORIGINAL_CONCEPT",
      category: "ANCHOR"
    },

    "UNITY": {
      text: "Unity",
      language: "en",
      provenance: "ORIGINAL_CONCEPT",
      category: "ANCHOR"
    },

    "CONTINUITY": {
      text: "Continuity",
      language: "en",
      provenance: "ORIGINAL_CONCEPT",
      category: "ANCHOR"
    }
  };

  LITURGY.SACRED_VOCABULARY =
    SACRED_VOCABULARY;

  /* ------------------------------------------------------------------------
     07. CONTENT MEMORY
     ------------------------------------------------------------------------ */

  const contentMemory = [];

  function rememberContent(content) {

    const record = {
      id:
        content.id ||
        `CONTENT-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

      timestamp:
        new Date().toISOString(),

      fingerprint:
        fingerprint(
          content.text ||
          ""
        ),

      type:
        content.type ||
        CONTENT_TYPES.PRAYER,

      theme:
        content.theme ||
        null,

      language:
        content.language ||
        "en",

      personKey:
        content.personKey ||
        null,

      mode:
        content.mode ||
        TRADITION_MODES.ORIGINAL,

      provenance:
        content.provenance ||
        "ORIGINAL",

      text:
        content.text ||
        ""
    };

    contentMemory.push(record);

    const max =
      AUDIO.CONFIG &&
      AUDIO.CONFIG.maxMemoryEntries
        ? AUDIO.CONFIG.maxMemoryEntries
        : 2000;

    while (
      contentMemory.length >
      max
    ) {
      contentMemory.shift();
    }

    if (
      typeof AUDIO.remember ===
      "function"
    ) {
      AUDIO.remember(
        "LITURGY_CONTENT",
        record,
        0.65
      );
    }

    return record;
  }

  LITURGY.contentMemory =
    contentMemory;

  LITURGY.getContentMemory =
    function(limit = 100) {
      return contentMemory
        .slice(-Math.max(1, limit));
    };

  /* ------------------------------------------------------------------------
     08. FINGERPRINTING
     ------------------------------------------------------------------------ */

  function fingerprint(text) {

    const value =
      String(text || "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .replace(/\s+/g, " ")
        .trim();

    let hash =
      2166136261;

    for (
      let i = 0;
      i < value.length;
      i++
    ) {
      hash ^= value.charCodeAt(i);

      hash +=
        (hash << 1) +
        (hash << 4) +
        (hash << 7) +
        (hash << 8) +
        (hash << 24);
    }

    return (
      hash >>> 0
    ).toString(16);
  }

  LITURGY.fingerprint =
    fingerprint;

  /* ------------------------------------------------------------------------
     09. TOKEN / PHRASE NOVELTY ANALYSIS
     ------------------------------------------------------------------------ */

  function tokenise(text) {

    return String(text || "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter(Boolean);
  }

  function similarity(a, b) {

    const A =
      new Set(tokenise(a));

    const B =
      new Set(tokenise(b));

    if (!A.size || !B.size) {
      return 0;
    }

    let intersection = 0;

    for (const token of A) {
      if (B.has(token)) {
        intersection += 1;
      }
    }

    const union =
      new Set([
        ...A,
        ...B
      ]).size;

    return (
      intersection /
      Math.max(1, union)
    );
  }

  function noveltyScore(text) {

    if (!contentMemory.length) {
      return 1;
    }

    const recent =
      contentMemory.slice(-100);

    let maximumSimilarity = 0;

    for (const item of recent) {

      const score =
        similarity(
          text,
          item.text
        );

      if (
        score >
        maximumSimilarity
      ) {
        maximumSimilarity =
          score;
      }
    }

    return Math.max(
      0,
      1 -
      maximumSimilarity
    );
  }

  LITURGY.similarity =
    similarity;

  LITURGY.noveltyScore =
    noveltyScore;

  /* ------------------------------------------------------------------------
     10. TEMPLATE LIBRARY
     ------------------------------------------------------------------------ */

  const TEMPLATES = {

    OPENING: [
      "Let this moment begin with {theme}.",
      "We enter this moment with {theme}.",
      "Let our attention settle upon {theme}.",
      "May this time be guided by {theme}."
    ],

    GRATITUDE: [
      "We give thanks for {subject}.",
      "We acknowledge with gratitude {subject}.",
      "Let us remember with gratitude {subject}.",
      "We honour the opportunity to appreciate {subject}."
    ],

    PROTECTION: [
      "May {person} be surrounded by wisdom, peace and courage.",
      "May {person} walk with clarity and strength.",
      "Let {person} be guided toward choices that preserve dignity, safety and peace.",
      "May {person} find courage when circumstances become difficult."
    ],

    FAMILY: [
      "May this family remain united by truth, compassion and wisdom.",
      "Let understanding strengthen the bonds between generations.",
      "May the family remember its responsibilities to one another.",
      "Let every generation contribute to peace and continuity."
    ],

    COURAGE: [
      "When difficulty arrives, may courage remain stronger than fear.",
      "May wisdom accompany courage in every difficult decision.",
      "Let strength be expressed through patience, responsibility and compassion."
    ],

    PEACE: [
      "Let the mind become still enough to recognise what truly matters.",
      "May peace guide the atmosphere of this moment.",
      "Let unnecessary fear give way to calm attention."
    ],

    CLOSING: [
      "Let what is good in this reflection continue through the next actions.",
      "May wisdom remain present after this moment ends.",
      "Let peace accompany every person returning to the work of the day."
    ]
  };

  LITURGY.TEMPLATES =
    TEMPLATES;

  /* ------------------------------------------------------------------------
     11. RANDOMISATION WITHOUT CHAOS
     ------------------------------------------------------------------------ */

  function choose(list, excluded = []) {

    if (
      !Array.isArray(list) ||
      !list.length
    ) {
      return "";
    }

    const available =
      list.filter(
        item =>
          !excluded.includes(item)
      );

    const pool =
      available.length
        ? available
        : list;

    return pool[
      Math.floor(
        Math.random() *
        pool.length
      )
    ];
  }

  /* ------------------------------------------------------------------------
     12. THEME RESOLUTION
     ------------------------------------------------------------------------ */

  function resolveThemes(options = {}) {

    const requested =
      Array.isArray(options.themes)
        ? options.themes
        : [];

    const result =
      [...requested];

    const category =
      options.category ||
      "PROTECTION";

    const defaults =
      THEMES[category] ||
      THEMES.PROTECTION;

    while (
      result.length < 3
    ) {

      const candidate =
        choose(defaults, result);

      if (
        candidate &&
        !result.includes(candidate)
      ) {
        result.push(candidate);
      } else {
        break;
      }
    }

    return [
      ...new Set(result)
    ];
  }

  LITURGY.resolveThemes =
    resolveThemes;

  /* ------------------------------------------------------------------------
     13. LANGUAGE RESOLUTION
     ------------------------------------------------------------------------ */

  function resolveLanguage(
    options = {}
  ) {

    const requested =
      options.language;

    if (
      requested &&
      LANGUAGE_PACKS[requested]
    ) {
      return requested;
    }

    if (
      AUDIO.state &&
      AUDIO.state.currentLanguage &&
      LANGUAGE_PACKS[
        AUDIO.state.currentLanguage
      ]
    ) {
      return AUDIO.state.currentLanguage;
    }

    return "en";
  }

  LITURGY.resolveLanguage =
    resolveLanguage;

  /* ------------------------------------------------------------------------
     14. PERSON PROFILE NORMALISATION
     ------------------------------------------------------------------------ */

  function normalisePerson(
    person,
    index = 0
  ) {

    if (
      typeof person ===
      "string"
    ) {

      return {
        personKey:
          `PERSON_${index + 1}`,

        displayName:
          person,

        preferredLanguage:
          "en",

        approvedThemes:
          [],

        privacyMode:
          false
      };
    }

    if (
      !person ||
      typeof person !==
      "object"
    ) {

      return {
        personKey:
          `PERSON_${index + 1}`,

        displayName:
          `Family member ${index + 1}`,

        preferredLanguage:
          "en",

        approvedThemes:
          [],

        privacyMode:
          true
      };
    }

    return {

      personKey:
        person.personKey ||
        person.id ||
        `PERSON_${index + 1}`,

      displayName:
        person.displayName ||
        person.name ||
        `Family member ${index + 1}`,

      preferredLanguage:
        person.preferredLanguage ||
        "en",

      approvedThemes:
        Array.isArray(
          person.approvedThemes
        )
          ? person.approvedThemes
          : [],

      traditionMode:
        person.traditionMode ||
        TRADITION_MODES.ORIGINAL,

      privacyMode:
        !!person.privacyMode,

      sessionFrequency:
        person.sessionFrequency ||
        null,

      recentThemes:
        Array.isArray(
          person.recentThemes
        )
          ? person.recentThemes
          : []
    };
  }

  LITURGY.normalisePerson =
    normalisePerson;

  /* ------------------------------------------------------------------------
     15. PERSON-SPECIFIC SUBJECT
     ------------------------------------------------------------------------ */

  function personReference(person) {

    if (
      person.privacyMode
    ) {
      return "this family member";
    }

    return person.displayName;
  }

  /* ------------------------------------------------------------------------
     16. ORIGINAL PRAYER GENERATOR
     ------------------------------------------------------------------------ */

  function generatePrayer(
    options = {}
  ) {

    const language =
      resolveLanguage(options);

    const pack =
      LANGUAGE_PACKS[language] ||
      LANGUAGE_PACKS.en;

    const category =
      options.category ||
      "PROTECTION";

    const themes =
      resolveThemes({
        ...options,
        category
      });

    const person =
      options.person
        ? normalisePerson(
            options.person
          )
        : null;

    const personName =
      person
        ? personReference(person)
        : "every person represented in this prayer";

    const sections = [];

    /*
     * Opening
     */
    sections.push(
      choose(
        pack.openings
      )
    );

    /*
     * Theme statement
     */
    const theme =
      choose(themes);

    sections.push(
      TEMPLATES.OPENING
        ? fillTemplate(
            choose(
              TEMPLATES.OPENING
            ),
            {
              theme
            }
          )
        : ""
    );

    /*
     * Gratitude
     */
    sections.push(
      choose(
        pack.gratitude
      )
    );

    /*
     * Person-specific protection
     */
    if (person) {

      const template =
        choose(
          TEMPLATES.PROTECTION
        );

      sections.push(
        fillTemplate(
          template,
          {
            person:
              personName
          }
        )
      );
    } else {

      sections.push(
        choose(
          pack.protection
        )
      );
    }

    /*
     * Courage
     */
    sections.push(
      choose(
        pack.courage
      )
    );

    /*
     * Family unity
     */
    if (
      options.includeFamilyUnity !== false
    ) {

      sections.push(
        choose(
          TEMPLATES.FAMILY
        )
      );
    }

    /*
     * Peace
     */
    sections.push(
      choose(
        TEMPLATES.PEACE
      )
    );

    /*
     * Optional sacred anchor
     */
    if (
      options.includeSacredAnchor
    ) {

      const anchor =
        choose(
          Object.values(
            SACRED_VOCABULARY
          )
            .filter(
              item =>
                item.language ===
                language
            )
            .map(
              item =>
                item.text
            )
        );

      if (anchor) {
        sections.push(anchor);
      }
    }

    /*
     * Closing
     */
    sections.push(
      choose(
        pack.closing
      )
    );

    let text =
      sections
        .filter(Boolean)
        .join(" ");

    /*
     * Novelty repair.
     *
     * The system does not simply accept a generated sequence. It checks
     * similarity against recent content and makes a second construction
     * attempt when repetition becomes excessive.
     */

    let novelty =
      noveltyScore(text);

    let attempts = 0;

    while (
      novelty < 0.42 &&
      attempts < 6
    ) {

      attempts += 1;

      const alternativeSections =
        sections.map(
          section => {

            if (
              Math.random() >
              0.45
            ) {
              return section;
            }

            return choose(
              [
                ...pack.protection,
                ...pack.courage,
                ...pack.closing
              ]
            );
          }
        );

      text =
        alternativeSections
          .filter(Boolean)
          .join(" ");

      novelty =
        noveltyScore(text);
    }

    const content = {

      id:
        `PRAYER-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

      type:
        person
          ? CONTENT_TYPES.PERSON_BLESSING
          : CONTENT_TYPES.PRAYER,

      text,

      language,

      category,

      themes,

      personKey:
        person
          ? person.personKey
          : null,

      personName:
        person
          ? person.displayName
          : null,

      mode:
        options.traditionMode ||
        TRADITION_MODES.ORIGINAL,

      provenance:
        "ORIGINAL_GENERATED_BY_CHIROMBE",

      novelty,

      generationAttempts:
        attempts + 1,

      generatedAt:
        new Date().toISOString()
    };

    rememberContent(content);

    if (
      typeof AUDIO.emit ===
      "function"
    ) {

      AUDIO.emit(
        "LITURGY_PRAYER_GENERATED",
        content
      );
    }

    return content;
  }

  LITURGY.generatePrayer =
    generatePrayer;

  /* ------------------------------------------------------------------------
     17. TEMPLATE INTERPOLATION
     ------------------------------------------------------------------------ */

  function fillTemplate(
    template,
    values = {}
  ) {

    return String(template || "")
      .replace(
        /\{([^}]+)\}/g,
        (_, key) =>
          values[key] !== undefined
            ? String(values[key])
            : ""
      );
  }

  /* ------------------------------------------------------------------------
     18. PROTECTION DECLARATION GENERATOR
     ------------------------------------------------------------------------ */

  function generateDeclaration(
    options = {}
  ) {

    const language =
      resolveLanguage(options);

    const pack =
      LANGUAGE_PACKS[language] ||
      LANGUAGE_PACKS.en;

    const themes =
      resolveThemes({
        ...options,
        category:
          "PROTECTION"
      });

    const opening =
      choose(
        pack.protection
      );

    const emphasis =
      choose([
        "Let truth guide this household.",
        "Let peace remain stronger than fear.",
        "Let wisdom govern every response.",
        "Let courage serve life and dignity.",
        "Let unity overcome unnecessary division.",
        "Let compassion remain present even during difficulty."
      ]);

    const closing =
      choose(
        pack.closing
      );

    const text =
      [
        opening,
        emphasis,
        closing
      ].join(" ");

    const declaration = {

      id:
        `DECL-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

      type:
        CONTENT_TYPES.DECLARATION,

      text,

      language,

      themes,

      mode:
        options.traditionMode ||
        TRADITION_MODES.ORIGINAL,

      provenance:
        "ORIGINAL_GENERATED_BY_CHIROMBE",

      spiritualStatus:
        "DEVOTIONAL_DECLARATION",

      factualStatus:
        "NOT_SENSOR_EVIDENCE",

      generatedAt:
        new Date().toISOString()
    };

    rememberContent(
      declaration
    );

    return declaration;
  }

  LITURGY.generateDeclaration =
    generateDeclaration;

  /* ------------------------------------------------------------------------
     19. GRATITUDE GENERATOR
     ------------------------------------------------------------------------ */

  function generateGratitude(
    options = {}
  ) {

    const language =
      resolveLanguage(options);

    const pack =
      LANGUAGE_PACKS[language] ||
      LANGUAGE_PACKS.en;

    const subject =
      options.subject ||
      choose([
        "life",
        "family",
        "learning",
        "wisdom gained through experience",
        "the opportunity to begin again",
        "people who have offered kindness",
        "the responsibilities entrusted to us"
      ]);

    const text =
      fillTemplate(
        choose(
          TEMPLATES.GRATITUDE
        ),
        {
          subject
        }
      );

    const result = {

      id:
        `GRAT-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

      type:
        CONTENT_TYPES.GRATITUDE,

      text,

      language,

      subject,

      provenance:
        "ORIGINAL_GENERATED_BY_CHIROMBE",

      generatedAt:
        new Date().toISOString()
    };

    rememberContent(result);

    return result;
  }

  LITURGY.generateGratitude =
    generateGratitude;

  /* ------------------------------------------------------------------------
     20. PERSON-BY-PERSON PRAYER
     ------------------------------------------------------------------------ */

  function generatePersonPrayer(
    person,
    options = {}
  ) {

    const profile =
      normalisePerson(person);

    const language =
      profile.preferredLanguage &&
      LANGUAGE_PACKS[
        profile.preferredLanguage
      ]
        ? profile.preferredLanguage
        : resolveLanguage(options);

    const themes =
      profile.approvedThemes.length
        ? profile.approvedThemes
        : resolveThemes(options);

    const result =
      generatePrayer({
        ...options,

        language,

        themes,

        person: profile,

        category:
          options.category ||
          "PROTECTION",

        includeFamilyUnity:
          options.includeFamilyUnity !== false,

        includeSacredAnchor:
          options.includeSacredAnchor === true
      });

    result.personKey =
      profile.personKey;

    result.personName =
      profile.displayName;

    return result;
  }

  LITURGY.generatePersonPrayer =
    generatePersonPrayer;

  /* ------------------------------------------------------------------------
     21. BLOODLINE SOURCE RESOLUTION
     ------------------------------------------------------------------------ */

  function discoverBloodline() {

    const candidates = [

      window.CHIROMBE_BLOODLINE,

      root.BLOODLINE,

      window.ChirombeBloodline,

      window.CHIROMBE_FAMILY,

      window.CHIROMBE &&
      window.CHIROMBE.BLOODLINE
    ];

    for (
      const candidate of candidates
    ) {

      if (!candidate) {
        continue;
      }

      if (
        Array.isArray(candidate)
      ) {
        return candidate;
      }

      if (
        Array.isArray(
          candidate.members
        )
      ) {
        return candidate.members;
      }

      if (
        Array.isArray(
          candidate.people
        )
      ) {
        return candidate.people;
      }
    }

    return [];
  }

  LITURGY.discoverBloodline =
    discoverBloodline;

  /* ------------------------------------------------------------------------
     22. BLOODLINE PRAYER PLAN
     ------------------------------------------------------------------------ */

  function createBloodlinePlan(
    options = {}
  ) {

    const people =
      options.people ||
      discoverBloodline();

    const profiles =
      people.map(
        (person, index) =>
          normalisePerson(
            person,
            index
          )
      );

    const plan = {

      id:
        `PLAN-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

      createdAt:
        new Date().toISOString(),

      mode:
        options.mode ||
        "BLOODLINE_WATCH",

      language:
        options.language ||
        null,

      people:
        profiles.map(
          profile => ({
            personKey:
              profile.personKey,

            displayName:
              profile.displayName,

            preferredLanguage:
              profile.preferredLanguage,

            approvedThemes:
              profile.approvedThemes,

            privacyMode:
              profile.privacyMode,

            status:
              "PENDING"
          })
        ),

      total:
        profiles.length,

      completed:
        0
    };

    if (
      typeof AUDIO.remember ===
      "function"
    ) {

      AUDIO.remember(
        "BLOODLINE_LITURGY_PLAN",
        plan,
        0.85
      );
    }

    if (
      typeof AUDIO.emit ===
      "function"
    ) {

      AUDIO.emit(
        "BLOODLINE_LITURGY_PLAN_CREATED",
        plan
      );
    }

    return {
      plan,
      profiles
    };
  }

  LITURGY.createBloodlinePlan =
    createBloodlinePlan;

  /* ------------------------------------------------------------------------
     23. BLOODLINE SESSION GENERATOR
     ------------------------------------------------------------------------ */

  function generateBloodlineSession(
    options = {}
  ) {

    const {
      plan,
      profiles
    } =
      createBloodlinePlan(
        options
      );

    const content = [];

    /*
     * Opening
     */
    content.push(
      generatePrayer({
        ...options,

        category:
          "PROTECTION",

        includeFamilyUnity:
          true,

        includeSacredAnchor:
          options.includeSacredAnchor === true
      })
    );

    /*
     * Each approved/available person receives an individual composition.
     *
     * We do not infer curses, possession, spiritual status, guilt, or danger
     * from a person's identity. The content is protective/devotional only.
     */

    for (
      let i = 0;
      i < profiles.length;
      i++
    ) {

      const profile =
        profiles[i];

      const prayer =
        generatePersonPrayer(
          profile,
          {
            ...options,

            category:
              options.personCategory ||
              "PROTECTION",

            includeFamilyUnity:
              false
          }
        );

      prayer.sequence =
        i + 1;

      prayer.planId =
        plan.id;

      content.push(
        prayer
      );

      plan.people[i].status =
        "GENERATED";

      plan.completed += 1;
    }

    /*
     * Family-unity closing.
     */

    const familyClosing =
      generatePrayer({
        ...options,

        category:
          "FAMILY",

        themes: [
          "family",
          "unity",
          "continuity",
          "legacy"
        ],

        includeFamilyUnity:
          true
      });

    familyClosing.type =
      CONTENT_TYPES.FAMILY_UNITY;

    familyClosing.planId =
      plan.id;

    content.push(
      familyClosing
    );

    plan.status =
      "COMPLETE";

    plan.completed =
      profiles.length;

    const session = {

      id:
        `BLOODLINE-SESSION-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

      createdAt:
        new Date().toISOString(),

      planId:
        plan.id,

      mode:
        plan.mode,

      content,

      peopleCovered:
        profiles.length,

      status:
        "READY_FOR_PERFORMANCE",

      provenance:
        "CHIROMBE_AUDIO_LITURGY_ENGINE"
    };

    if (
      typeof AUDIO.remember ===
      "function"
    ) {

      AUDIO.remember(
        "BLOODLINE_LITURGY_SESSION",
        {
          id:
            session.id,

          planId:
            session.planId,

          peopleCovered:
            session.peopleCovered,

          status:
            session.status
        },
        0.95
      );
    }

    if (
      typeof AUDIO.emit ===
      "function"
    ) {

      AUDIO.emit(
        "BLOODLINE_LITURGY_READY",
        session
      );
    }

    return session;
  }

  LITURGY.generateBloodlineSession =
    generateBloodlineSession;

  /* ------------------------------------------------------------------------
     24. RITUAL STAGE MODEL
     ------------------------------------------------------------------------ */

  const RITUAL_STAGES = Object.freeze([

    {
      id: "ARRIVAL",
      type: CONTENT_TYPES.OPENING,
      purpose:
        "Transition attention into the session."
    },

    {
      id: "GROUNDING",
      type: CONTENT_TYPES.REFLECTION,
      purpose:
        "Establish calm and present awareness."
    },

    {
      id: "OPENING_DECLARATION",
      type: CONTENT_TYPES.DECLARATION,
      purpose:
        "Declare the intended values of the session."
    },

    {
      id: "GRATITUDE",
      type: CONTENT_TYPES.GRATITUDE,
      purpose:
        "Establish gratitude."
    },

    {
      id: "PROTECTION_INTENTION",
      type: CONTENT_TYPES.PROTECTION_INTENTION,
      purpose:
        "Express protective intentions centred on peace, truth, dignity and safety."
    },

    {
      id: "PERSON_PRAYER",
      type: CONTENT_TYPES.PERSON_BLESSING,
      purpose:
        "Offer individual family prayers."
    },

    {
      id: "INTERCESSION",
      type: CONTENT_TYPES.PRAYER,
      purpose:
        "Offer wider prayers for family and community."
    },

    {
      id: "SILENCE",
      type: CONTENT_TYPES.SILENCE,
      purpose:
        "Create deliberate silence."
    },

    {
      id: "CALL_RESPONSE",
      type: CONTENT_TYPES.CALL,
      purpose:
        "Invite optional spoken participation."
    },

    {
      id: "CLOSING",
      type: CONTENT_TYPES.CLOSING,
      purpose:
        "Conclude with peace, gratitude and continuity."
    }

  ]);

  LITURGY.RITUAL_STAGES =
    RITUAL_STAGES;

  /* ------------------------------------------------------------------------
     25. RITUAL SESSION BUILDER
     ------------------------------------------------------------------------ */

  function buildRitualSession(
    options = {}
  ) {

    const language =
      resolveLanguage(options);

    const stages = [];

    for (
      const stage of RITUAL_STAGES
    ) {

      let item = null;

      switch (stage.id) {

        case "ARRIVAL":
          item =
            generatePrayer({
              ...options,
              language,
              category:
                "PEACE"
            });
          break;

        case "GROUNDING":
          item = {
            type:
              CONTENT_TYPES.REFLECTION,

            text:
              language === "sh"
                ? "Ngatitangei nokunyarara, tichifema zvishoma uye tichitarisa nguva iripo."
                : "Let us become still, breathe naturally, and give our attention to the present moment.",

            language,

            provenance:
              "ORIGINAL_GENERATED_BY_CHIROMBE"
          };
          break;

        case "OPENING_DECLARATION":
          item =
            generateDeclaration({
              ...options,
              language
            });
          break;

        case "GRATITUDE":
          item =
            generateGratitude({
              ...options,
              language
            });
          break;

        case "PROTECTION_INTENTION":
          item =
            generateDeclaration({
              ...options,
              language,
              themes:
                resolveThemes({
                  ...options,
                  category:
                    "PROTECTION"
                })
            });

          item.type =
            CONTENT_TYPES.PROTECTION_INTENTION;
          break;

        case "PERSON_PRAYER":
          item = {
            type:
              CONTENT_TYPES.PERSON_BLESSING,

            text:
              "PERSON_BY_PERSON_STAGE",

            language,

            provenance:
              "RUNTIME_BLOODLINE_ORCHESTRATION"
          };
          break;

        case "INTERCESSION":
          item =
            generatePrayer({
              ...options,
              language,
              category:
                "FAMILY"
            });
          break;

        case "SILENCE":
          item = {
            type:
              CONTENT_TYPES.SILENCE,

            durationMs:
              options.silenceDurationMs ||
              30000,

            language,

            provenance:
              "RITUAL_STRUCTURE"
          };
          break;

        case "CALL_RESPONSE":

          item = {

            type:
              CONTENT_TYPES.CALL,

            call:
              language === "sh"
                ? "Rugare ngaruve nesu."
                : "May peace remain with us.",

            response:
              language === "sh"
                ? "Rugare, chokwadi nouchenjeri."
                : "Peace, truth and wisdom.",

            language,

            provenance:
              "ORIGINAL_GENERATED_BY_CHIROMBE"
          };

          break;

        case "CLOSING":

          item =
            generatePrayer({
              ...options,
              language,
              category:
                "PEACE"
            });

          item.type =
            CONTENT_TYPES.CLOSING;

          break;
      }

      if (item) {

        item.stage =
          stage.id;

        item.stagePurpose =
          stage.purpose;

        stages.push(item);
      }
    }

    const session = {

      id:
        `RITUAL-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

      createdAt:
        new Date().toISOString(),

      language,

      mode:
        options.mode ||
        "DAILY_PROTECTION",

      stages,

      status:
        "READY",

      provenance:
        "CHIROMBE_AUDIO_LITURGY_ENGINE"
    };

    if (
      typeof AUDIO.remember ===
      "function"
    ) {

      AUDIO.remember(
        "RITUAL_SESSION_CREATED",
        {
          id:
            session.id,

          stageCount:
            stages.length,

          language,

          mode:
            session.mode
        },
        0.8
      );
    }

    if (
      typeof AUDIO.emit ===
      "function"
    ) {

      AUDIO.emit(
        "RITUAL_SESSION_CREATED",
        session
      );
    }

    return session;
  }

  LITURGY.buildRitualSession =
    buildRitualSession;

  /* ------------------------------------------------------------------------
     26. DAILY ADAPTIVE LITURGY
     ------------------------------------------------------------------------ */

  function generateDailyLiturgy(
    options = {}
  ) {

    const hour =
      new Date().getHours();

    let category =
      "PROTECTION";

    let mode =
      "DAILY_PROTECTION";

    if (
      hour >= 5 &&
      hour < 11
    ) {

      category =
        "MORNING";

      mode =
        "DAWN";
    }

    if (
      hour >= 20 ||
      hour < 5
    ) {

      category =
        "NIGHT";

      mode =
        "NIGHT_WATCH";
    }

    const prayer =
      generatePrayer({
        ...options,
        category
      });

    const declaration =
      generateDeclaration({
        ...options
      });

    const gratitude =
      generateGratitude({
        ...options
      });

    const result = {

      id:
        `DAILY-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

      createdAt:
        new Date().toISOString(),

      mode,

      hour,

      content: [
        gratitude,
        declaration,
        prayer
      ],

      status:
        "READY"
    };

    if (
      typeof AUDIO.emit ===
      "function"
    ) {

      AUDIO.emit(
        "DAILY_LITURGY_GENERATED",
        result
      );
    }

    return result;
  }

  LITURGY.generateDailyLiturgy =
    generateDailyLiturgy;

  /* ------------------------------------------------------------------------
     27. SYSTEM STATUS NARRATION
     ------------------------------------------------------------------------ */

  function narrateSystemEvent(
    event,
    options = {}
  ) {

    if (!event) {
      return null;
    }

    const payload =
      event.payload ||
      {};

    const name =
      event.name ||
      "UNKNOWN_EVENT";

    let text =
      "";

    switch (name) {

      case "AUDIO_HEARTBEAT":

        text =
          "CHIROMBE audio monitoring remains active.";

        break;

      case "AUDIO_KERNEL_READY":

        text =
          "The CHIROMBE audio kernel is ready and connected to its available capabilities.";

        break;

      case "PERSISTENT_STATE_RESTORED":

        text =
          "Previous CHIROMBE audio state has been restored.";

        break;

      case "BROADCAST_QUEUED":

        text =
          "A new CHIROMBE broadcast has entered the communication queue.";

        break;

      case "AUDIO_SAFE_STOP":

        text =
          "CHIROMBE audio has entered safe-stop mode.";

        break;

      case "LIVING_WATCH_STARTED":

        text =
          "CHIROMBE Living Watch is active.";

        break;

      default:

        text =
          `CHIROMBE has observed the system event ${name.replace(
            /_/g,
            " "
          ).toLowerCase()}.`;

        if (
          payload.reason
        ) {
          text +=
            ` Reason: ${payload.reason}.`;
        }
    }

    return {

      id:
        `SYSVOICE-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

      type:
        CONTENT_TYPES.SYSTEM_INFORMATION,

      text,

      sourceEvent:
        name,

      language:
        options.language ||
        "en",

      provenance:
        "CHIROMBE_SYSTEM_STATE",

      generatedAt:
        new Date().toISOString()
    };
  }

  LITURGY.narrateSystemEvent =
    narrateSystemEvent;

  /* ------------------------------------------------------------------------
     28. USER QUESTION INTERPRETATION FOUNDATION
     ------------------------------------------------------------------------ */

  function interpretInquiry(
    question
  ) {

    const q =
      String(question || "")
        .trim()
        .toLowerCase();

    if (!q) {
      return {
        intent:
          "EMPTY"
      };
    }

    if (
      /what.*doing|what.*up to|activity|status/
        .test(q)
    ) {
      return {
        intent:
          "SYSTEM_STATUS"
      };
    }

    if (
      /anything.*concern|concern|danger|warning|problem|wrong/
        .test(q)
    ) {
      return {
        intent:
          "CONCERNS"
      };
    }

    if (
      /what.*change|changed|update|updated/
        .test(q)
    ) {
      return {
        intent:
          "RECENT_CHANGES"
      };
    }

    if (
      /what.*design|designed|algorithm|technique/
        .test(q)
    ) {
      return {
        intent:
          "ENGINE_DESIGN"
      };
    }

    if (
      /pray|prayer|liturgy/
        .test(q)
    ) {
      return {
        intent:
          "PRAYER"
      };
    }

    if (
      /frequency|tone|sound|audio/
        .test(q)
    ) {
      return {
        intent:
          "AUDIO_STATUS"
      };
    }

    return {
      intent:
        "GENERAL_INQUIRY"
    };
  }

  LITURGY.interpretInquiry =
    interpretInquiry;

  /* ------------------------------------------------------------------------
     29. INQUIRY RESPONSE
     ------------------------------------------------------------------------ */

  function answerInquiry(
    question
  ) {

    const interpretation =
      interpretInquiry(
        question
      );

    let text = "";

    switch (
      interpretation.intent
    ) {

      case "SYSTEM_STATUS": {

        const status =
          AUDIO.getStatus
            ? AUDIO.getStatus()
            : {};

        text =
          `CHIROMBE audio status: lifecycle ${
            status.lifecycle ||
            "unknown"
          }. Living Watch ${
            status.livingWatch
              ? "active"
              : "inactive"
          }. Broadcast queue contains ${
            status.queueLength ||
            0
          } items. The audio kernel has observed ${
            status.eventsObserved ||
            0
          } events.`;

        break;
      }

      case "CONCERNS": {

        const status =
          AUDIO.getStatus
            ? AUDIO.getStatus()
            : {};

        text =
          `CHIROMBE has recorded ${
            status.warnings ||
            0
          } warnings and ${
            status.errors ||
            0
          } errors in the current audio session. These are software observations and require context before being interpreted as significant.`;

        break;
      }

      case "RECENT_CHANGES": {

        const memory =
          contentMemory
            .slice(-5);

        text =
          memory.length
            ? `Recent audio intelligence contains ${memory.length} recorded content developments.`
            : "There are currently no recent audio content developments recorded.";
        break;
      }

      case "ENGINE_DESIGN":

        text =
          "The audio intelligence layer is designed to generate, compare, prioritise and remember content rather than repeatedly replaying a fixed sequence.";

        break;

      case "PRAYER":

        text =
          "CHIROMBE can construct an original prayer according to the selected language, themes, person profile and liturgical mode.";

        break;

      case "AUDIO_STATUS": {

        const status =
          AUDIO.getStatus
            ? AUDIO.getStatus()
            : {};

        text =
          `The current audio context is ${
            status.audioContext ||
            "unavailable"
          }, with a ${
            status.sampleRate ||
            "unknown"
          } Hz sample rate and approximately ${
            status.nyquistHz ||
            "unknown"
          } Hz Nyquist limit.`;

        break;
      }

      default:

        text =
          "CHIROMBE has received the inquiry, but this content engine does not yet have enough context to provide a specific answer.";
    }

    const response = {

      id:
        `ANSWER-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

      type:
        CONTENT_TYPES.SYSTEM_INFORMATION,

      question:
        String(question),

      intent:
        interpretation.intent,

      text,

      provenance:
        "CHIROMBE_AUDIO_INFORMATION_ENGINE",

      generatedAt:
        new Date().toISOString()
    };

    if (
      typeof AUDIO.remember ===
      "function"
    ) {

      AUDIO.remember(
        "USER_AUDIO_INQUIRY",
        {
          question:
            String(question),

          intent:
            interpretation.intent,

          response:
            text
        },
        0.7
      );
    }

    return response;
  }

  LITURGY.answerInquiry =
    answerInquiry;

  /* ------------------------------------------------------------------------
     30. BROADCAST PREPARATION
     ------------------------------------------------------------------------ */

  function prepareForBroadcast(
    content,
    options = {}
  ) {

    if (!content) {
      return null;
    }

    const text =
      typeof content ===
      "string"
        ? content
        : content.text;

    if (!text) {
      return null;
    }

    const novelty =
      noveltyScore(text);

    const prepared = {

      id:
        `PREP-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

      text,

      language:
        options.language ||
        content.language ||
        "en",

      type:
        options.type ||
        content.type ||
        CONTENT_TYPES.PRAYER,

      category:
        options.category ||
        content.category ||
        "GENERAL",

      priority:
        options.priority ??
        (
          content.type ===
          CONTENT_TYPES.ALERT
            ? 0.9
            : 0.65
        ),

      novelty,

      provenance:
        content.provenance ||
        "ORIGINAL",

      spiritual:
        [
          CONTENT_TYPES.PRAYER,
          CONTENT_TYPES.DECLARATION,
          CONTENT_TYPES.PROTECTION_INTENTION,
          CONTENT_TYPES.PERSON_BLESSING,
          CONTENT_TYPES.FAMILY_UNITY
        ].includes(
          content.type
        ),

      performance:
        {
          pace:
            options.pace ||
            "NORMAL",

          pauses:
            options.pauses !== false,

          emphasis:
            options.emphasis !== false,

          backgroundTone:
            options.backgroundTone !== false
        }
    };

    /*
     * Connect directly to Part 1's broadcast queue.
     */

    if (
      typeof AUDIO.queueBroadcast ===
      "function"
    ) {

      prepared.queueItem =
        AUDIO.queueBroadcast({
          text:
            prepared.text,

          language:
            prepared.language,

          category:
            prepared.category,

          priority:
            prepared.priority,

          spiritual:
            prepared.spiritual,

          provenance:
            prepared.provenance,

          reason:
            options.reason ||
            "LITURGY_CONTENT_READY"
        });
    }

    if (
      typeof AUDIO.emit ===
      "function"
    ) {

      AUDIO.emit(
        "LITURGY_CONTENT_PREPARED",
        prepared
      );
    }

    return prepared;
  }

  LITURGY.prepareForBroadcast =
    prepareForBroadcast;

  /* ------------------------------------------------------------------------
     31. LIVE WATCH CONTENT GENERATOR
     ------------------------------------------------------------------------ */

  function generateLivingWatchMessage(
    options = {}
  ) {

    const status =
      AUDIO.getStatus
        ? AUDIO.getStatus()
        : {};

    const messages = [];

    if (
      status.errors &&
      status.errors > 0
    ) {

      messages.push(
        `CHIROMBE has recorded ${status.errors} audio-system error${status.errors === 1 ? "" : "s"} in the current session.`
      );
    }

    if (
      status.warnings &&
      status.warnings > 0
    ) {

      messages.push(
        `CHIROMBE has recorded ${status.warnings} warning${status.warnings === 1 ? "" : "s"} requiring contextual review.`
      );
    }

    if (
      !messages.length
    ) {

      messages.push(
        "CHIROMBE Living Watch reports no current high-priority audio-system concerns."
      );
    }

    const result = {

      id:
        `WATCH-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

      type:
        CONTENT_TYPES.SYSTEM_INFORMATION,

      text:
        messages.join(" "),

      priority:
        messages.length === 1 &&
        messages[0].includes(
          "no current"
        )
          ? 0.35
          : 0.75,

      provenance:
        "CHIROMBE_LIVING_WATCH",

      generatedAt:
        new Date().toISOString()
    };

    return result;
  }

  LITURGY.generateLivingWatchMessage =
    generateLivingWatchMessage;

  /* ------------------------------------------------------------------------
     32. ADAPTIVE SESSION GENERATOR
     ------------------------------------------------------------------------ */

  function generateAdaptiveSession(
    options = {}
  ) {

    const mode =
      options.mode ||
      (
        AUDIO.state &&
        AUDIO.state.currentMode
      ) ||
      "DAILY_PROTECTION";

    switch (mode) {

      case "BLOODLINE_WATCH":

        return generateBloodlineSession(
          options
        );

      case "NIGHT_WATCH":

        return buildRitualSession({
          ...options,
          mode
        });

      case "FAMILY_UNITY":

        return buildRitualSession({
          ...options,
          mode,
          category:
            "FAMILY"
        });

      case "REMEMBRANCE":

        return buildRitualSession({
          ...options,
          mode,
          category:
            "REMEMBRANCE"
        });

      case "INTERFAITH_REFLECTION":

        return buildRitualSession({
          ...options,
          mode,
          traditionMode:
            TRADITION_MODES.INTERFAITH_REFLECTION
        });

      case "MASOWE_PERSONAL":

        return buildRitualSession({
          ...options,
          mode,
          language:
            options.language ||
            "sh",

          traditionMode:
            TRADITION_MODES.MASOWE_PERSONAL,

          includeSacredAnchor:
            true
        });

      default:

        return generateDailyLiturgy(
          options
        );
    }
  }

  LITURGY.generateAdaptiveSession =
    generateAdaptiveSession;

  /* ------------------------------------------------------------------------
     33. EVENT-DRIVEN CONTENT RESPONSE
     ------------------------------------------------------------------------ */

  function respondToSystemEvent(
    event
  ) {

    if (!event) {
      return null;
    }

    const name =
      event.name ||
      "";

    /*
     * Certain events receive immediate information content.
     * Others are remembered without interrupting the user.
     */

    const highPriorityEvents = [

      "AUDIO_SAFE_STOP",
      "AUDIO_CONTEXT_ERROR",
      "ENGINE_INTEGRITY_FAILURE",
      "SECURITY_ALERT",
      "WATCHDOG_ALERT",
      "RECOVERY_FAILURE",
      "CRITICAL_ANOMALY"
    ];

    const mediumPriorityEvents = [

      "AUDIO_KERNEL_READY",
      "PERSISTENT_STATE_RESTORED",
      "LIVING_WATCH_STARTED",
      "BLOODLINE_LITURGY_READY",
      "RITUAL_SESSION_CREATED",
      "EVOLUTION_PROPOSAL_CREATED",
      "EVOLUTION_COMMITTED"
    ];

    if (
      highPriorityEvents.includes(
        name
      )
    ) {

      const narration =
        narrateSystemEvent(
          event
        );

      return prepareForBroadcast(
        narration,
        {
          priority:
            0.9,

          category:
            CONTENT_TYPES.ALERT,

          reason:
            "HIGH_PRIORITY_SYSTEM_EVENT"
        }
      );
    }

    if (
      mediumPriorityEvents.includes(
        name
      )
    ) {

      const narration =
        narrateSystemEvent(
          event
        );

      return prepareForBroadcast(
        narration,
        {
          priority:
            0.65,

          category:
            CONTENT_TYPES.SYSTEM_INFORMATION,

          reason:
            "MEDIUM_PRIORITY_SYSTEM_EVENT"
        }
      );
    }

    /*
     * Low-priority events are retained for later summaries.
     */

    if (
      typeof AUDIO.remember ===
      "function"
    ) {

      AUDIO.remember(
        "LOW_PRIORITY_SYSTEM_EVENT",
        {
          eventName:
            name,

          event:
            event
        },
        0.25
      );
    }

    return null;
  }

  LITURGY.respondToSystemEvent =
    respondToSystemEvent;

  /* ------------------------------------------------------------------------
     34. SUBSCRIBE TO AUDIO KERNEL EVENTS
     ------------------------------------------------------------------------ */

  if (
    typeof AUDIO.on ===
    "function"
  ) {

    AUDIO.on(
      "SYSTEM_EVENT_OBSERVED",
      event => {

        try {

          respondToSystemEvent(
            event
          );

        } catch (error) {

          if (
            typeof AUDIO.log ===
            "function"
          ) {

            AUDIO.log(
              "ERROR",
              "LITURGY_EVENT_RESPONSE_FAILED",
              {
                error:
                  String(error)
              }
            );
          }
        }
      }
    );

    AUDIO.on(
      "BROADCAST_DECISION",
      event => {

        /*
         * Broadcast decisions become part of content memory.
         * This gives later evolution stages evidence about how often
         * information is being suppressed, queued, spoken or interrupted.
         */

        if (
          typeof AUDIO.remember ===
          "function"
        ) {

          AUDIO.remember(
            "BROADCAST_DECISION_HISTORY",
            event.payload,
            0.35
          );
        }
      }
    );
  }

  /* ------------------------------------------------------------------------
     35. CONTENT ENGINE STATUS
     ------------------------------------------------------------------------ */

  LITURGY.getStatus =
    function() {

      return {

        version:
          VERSION,

        status:
          LITURGY.STATUS,

        contentMemory:
          contentMemory.length,

        supportedLanguages:
          Object.keys(
            LANGUAGE_PACKS
          ),

        traditionModes:
          Object.keys(
            TRADITION_MODES
          ),

        contentTypes:
          Object.keys(
            CONTENT_TYPES
          ).length,

        ritualStages:
          RITUAL_STAGES.length,

        templates:
          Object.keys(
            TEMPLATES
          ).length,

        bloodlineAvailable:
          discoverBloodline()
            .length > 0
      };
    };

  /* ------------------------------------------------------------------------
     36. PUBLIC CONTENT COMMANDS
     ------------------------------------------------------------------------ */

  LITURGY.commands = {

    prayer:
      options =>
        generatePrayer(
          options
        ),

    declaration:
      options =>
        generateDeclaration(
          options
        ),

    gratitude:
      options =>
        generateGratitude(
          options
        ),

    personPrayer:
      (person, options) =>
        generatePersonPrayer(
          person,
          options
        ),

    bloodline:
      options =>
        generateBloodlineSession(
          options
        ),

    ritual:
      options =>
        buildRitualSession(
          options
        ),

    daily:
      options =>
        generateDailyLiturgy(
          options
        ),

    adaptive:
      options =>
        generateAdaptiveSession(
          options
        ),

    inquiry:
      question =>
        answerInquiry(
          question
        ),

    watch:
      options =>
        generateLivingWatchMessage(
          options
        ),

    prepare:
      (content, options) =>
        prepareForBroadcast(
          content,
          options
        )
  };

  /* ------------------------------------------------------------------------
     37. INITIALISATION
     ------------------------------------------------------------------------ */

  LITURGY.STATUS =
    "READY";

  if (
    typeof AUDIO.remember ===
    "function"
  ) {

    AUDIO.remember(
      "LITURGY_ENGINE_INITIALISED",
      {
        version:
          VERSION,

        languages:
          Object.keys(
            LANGUAGE_PACKS
          ),

        ritualStages:
          RITUAL_STAGES.length,

        contentTypes:
          Object.keys(
            CONTENT_TYPES
          ).length,

        engine:
          "INTELLIGENT_CONTENT_COMPOSITION"
      },
      0.85
    );
  }

  if (
    typeof AUDIO.emit ===
    "function"
  ) {

    AUDIO.emit(
      "LITURGY_ENGINE_READY",
      {
        version:
          VERSION,

        capabilities: [
          "DYNAMIC_PRAYER",
          "PERSON_SPECIFIC_PRAYER",
          "BLOODLINE_ORCHESTRATION",
          "RITUAL_COMPOSITION",
          "NOVELTY_CONTROL",
          "MULTI_LANGUAGE",
          "PROVENANCE",
          "SYSTEM_NARRATION",
          "INQUIRY_RESPONSE",
          "ADAPTIVE_SESSIONS"
        ]
      }
    );
  }

  /*
   * Make the engine discoverable by the rest of CHIROMBE.
   */

  root.CHIROMBE_AUDIO_LITURGY_ENGINE =
    LITURGY;

  AUDIO.LITURGY_ENGINE =
    LITURGY;

  console.info(
    "CHIROMBE AUDIO LIVING LITURGY — PART 2 READY",
    LITURGY.getStatus()
  );

})();
/* ================================================================
   CHIROMBE AUDIO LIVING LITURGY
   PART 3 — MULTI-TRADITION KNOWLEDGE & PROVENANCE LIBRARY
   ================================================================
   PURPOSE
   -------
   This module gives the Living Liturgy system a structured,
   auditable knowledge layer for spiritual, devotional, reflective,
   cultural and user-provided material.

   CORE PRINCIPLES
   ---------------
   1. Every source has provenance.
   2. Generated text is never silently presented as scripture.
   3. User-provided material remains distinguishable from generated
      material.
   4. Copyright/licensing metadata travels with every source.
   5. Long copyrighted texts are not reconstructed automatically.
   6. Retrieval is thematic and semantic-inspired, not claimed to
      possess supernatural knowledge.
   7. Tradition labels describe the requested mode; they do not
      certify theological authority.
   8. Audio narration can announce provenance when requested.
   9. Sources can be approved, suspended, archived or removed.
   10. All source decisions can be recorded into CHIROMBE memory.
   ================================================================ */

(() => {
  "use strict";

  const root = window;
  const CHIROMBE =
    root.CHIROMBE ||
    (root.CHIROMBE = {});

  const AUDIO =
    root.CHIROMBE_AUDIO ||
    (CHIROMBE.AudioLivingLiturgy =
      CHIROMBE.AudioLivingLiturgy || {});

  const LITURGY =
    root.CHIROMBE_AUDIO_LITURGY_ENGINE ||
    (root.CHIROMBE_AUDIO_LITURGY_ENGINE = {});

  /* ---------------------------------------------------------------
     1. GLOBAL LIBRARY IDENTITY
     --------------------------------------------------------------- */

  const VERSION = "3.0.0";
  const MODULE_ID =
    "CHIROMBE_AUDIO_TRADITION_LIBRARY";

  const STORAGE_KEY =
    "CHIROMBE_AUDIO_TRADITION_LIBRARY_V3";

  const MEMORY_NAMESPACE =
    "AUDIO_TRADITION_LIBRARY";

  const MAX_SOURCES = 5000;
  const MAX_CONTENT_LENGTH = 12000;
  const MAX_EXCERPT_LENGTH = 500;

  const SOURCE_STATUS = Object.freeze({
    ACTIVE: "ACTIVE",
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    SUSPENDED: "SUSPENDED",
    ARCHIVED: "ARCHIVED",
    USER_ONLY: "USER_ONLY"
  });

  const PROVENANCE = Object.freeze({
    ORIGINAL: "ORIGINAL",
    USER_PROVIDED: "USER_PROVIDED",
    PUBLIC_DOMAIN: "PUBLIC_DOMAIN",
    OPEN_LICENSE: "OPEN_LICENSE",
    LICENSED: "LICENSED",
    SHORT_PERMITTED_EXCERPT: "SHORT_PERMITTED_EXCERPT",
    PARAPHRASE: "PARAPHRASE",
    SUMMARY: "SUMMARY",
    METADATA_ONLY: "METADATA_ONLY",
    UNKNOWN: "UNKNOWN"
  });

  const CONTENT_CLASS = Object.freeze({
    PRAYER: "PRAYER",
    DECLARATION: "DECLARATION",
    HYMN: "HYMN",
    CHANT: "CHANT",
    SCRIPTURE_REFERENCE: "SCRIPTURE_REFERENCE",
    REFLECTION: "REFLECTION",
    TEACHING: "TEACHING",
    POETRY: "POETRY",
    WISDOM: "WISDOM",
    GRATITUDE: "GRATITUDE",
    REMEMBRANCE: "REMEMBRANCE",
    INVOCATION: "INVOCATION",
    BENEDICTION: "BENEDICTION",
    USER_TEXT: "USER_TEXT",
    GENERATED_TEXT: "GENERATED_TEXT",
    METADATA: "METADATA"
  });

  /* ---------------------------------------------------------------
     2. TRADITION REGISTRY
     --------------------------------------------------------------- */

  const TRADITIONS = Object.freeze({

    ORIGINAL: {
      id: "ORIGINAL",
      label: "CHIROMBE Original",
      description:
        "Original devotional and reflective material generated by the system.",
      attributionRequired: false,
      quotationAllowed: false
    },

    MASOWE_PERSONAL: {
      id: "MASOWE_PERSONAL",
      label: "Masowe Personal Reflection",
      description:
        "User-directed Masowe devotional mode using approved terminology and personal declarations.",
      attributionRequired: false,
      quotationAllowed: false
    },

    CHRISTIAN: {
      id: "CHRISTIAN",
      label: "Christian Reflection",
      description:
        "Christian devotional and reflective mode.",
      attributionRequired: true,
      quotationAllowed: true
    },

    JEWISH: {
      id: "JEWISH",
      label: "Jewish Reflection",
      description:
        "Jewish devotional and reflective mode.",
      attributionRequired: true,
      quotationAllowed: true
    },

    ISLAMIC: {
      id: "ISLAMIC",
      label: "Islamic Reflection",
      description:
        "Islamic devotional and reflective mode.",
      attributionRequired: true,
      quotationAllowed: true
    },

    HINDU: {
      id: "HINDU",
      label: "Hindu Reflection",
      description:
        "Hindu devotional and reflective mode.",
      attributionRequired: true,
      quotationAllowed: true
    },

    BUDDHIST: {
      id: "BUDDHIST",
      label: "Buddhist Reflection",
      description:
        "Buddhist contemplative and reflective mode.",
      attributionRequired: true,
      quotationAllowed: true
    },

    INTERFAITH: {
      id: "INTERFAITH",
      label: "Interfaith Reflection",
      description:
        "Respectful comparative or multi-tradition reflection.",
      attributionRequired: true,
      quotationAllowed: true
    },

    USER_DEFINED: {
      id: "USER_DEFINED",
      label: "User Defined Tradition",
      description:
        "Custom devotional material supplied and approved by the user.",
      attributionRequired: true,
      quotationAllowed: true
    }

  });

  /* ---------------------------------------------------------------
     3. THEME TAXONOMY
     --------------------------------------------------------------- */

  const THEMES = Object.freeze([
    "PROTECTION",
    "PEACE",
    "COURAGE",
    "WISDOM",
    "TRUTH",
    "UNITY",
    "FAMILY",
    "GRATITUDE",
    "MERCY",
    "COMPASSION",
    "HOPE",
    "HEALING",
    "REMEMBRANCE",
    "STEWARDSHIP",
    "JUSTICE",
    "HUMILITY",
    "FORGIVENESS",
    "FAITH",
    "LOVE",
    "COMMUNITY",
    "SERVICE",
    "DISCERNMENT",
    "RESILIENCE",
    "CONTINUITY",
    "LEGACY",
    "REFLECTION",
    "REST",
    "NIGHT",
    "MORNING",
    "BLESSING",
    "FAMILY_UNITY"
  ]);

  /* ---------------------------------------------------------------
     4. LANGUAGE REGISTRY
     --------------------------------------------------------------- */

  const LANGUAGES = Object.freeze({
    en: {
      id: "en",
      label: "English",
      aliases: ["english", "en-gb", "en-us"]
    },

    sn: {
      id: "sn",
      label: "Shona",
      aliases: ["shona", "chiShona"]
    },

    nd: {
      id: "nd",
      label: "isiNdebele",
      aliases: ["ndebele"]
    },

    fr: {
      id: "fr",
      label: "French",
      aliases: ["french"]
    },

    ar: {
      id: "ar",
      label: "Arabic",
      aliases: ["arabic"]
    },

    he: {
      id: "he",
      label: "Hebrew",
      aliases: ["hebrew"]
    },

    hi: {
      id: "hi",
      label: "Hindi",
      aliases: ["hindi"]
    },

    pi: {
      id: "pi",
      label: "Pali",
      aliases: ["pali"]
    },

    multi: {
      id: "multi",
      label: "Multilingual",
      aliases: []
    }
  });

  /* ---------------------------------------------------------------
     5. IN-MEMORY DATABASE
     --------------------------------------------------------------- */

  const state = {
    version: VERSION,

    initialized: false,

    sources: new Map(),

    indexes: {
      tradition: new Map(),
      language: new Map(),
      theme: new Map(),
      class: new Map(),
      provenance: new Map(),
      status: new Map()
    },

    queryHistory: [],

    statistics: {
      registrations: 0,
      retrievals: 0,
      approvals: 0,
      suspensions: 0,
      archived: 0,
      generatedSelections: 0,
      provenanceChecks: 0,
      rejectedItems: 0
    },

    settings: {
      maxSources: MAX_SOURCES,
      maxContentLength: MAX_CONTENT_LENGTH,
      maxExcerptLength: MAX_EXCERPT_LENGTH,
      requireProvenance: true,
      requireSourceForQuotation: true,
      citationAware: true,
      allowUnknownSources: false,
      userApprovalRequiredForCustomMaterial: true
    }
  };

  /* ---------------------------------------------------------------
     6. UTILITY FUNCTIONS
     --------------------------------------------------------------- */

  function now() {
    return new Date().toISOString();
  }

  function uid(prefix = "SRC") {
    return (
      prefix +
      "_" +
      Date.now().toString(36) +
      "_" +
      Math.random()
        .toString(36)
        .slice(2, 10)
        .toUpperCase()
    );
  }

  function safeString(value, fallback = "") {
    if (value === null || value === undefined) {
      return fallback;
    }

    return String(value).trim();
  }

  function array(value) {
    if (Array.isArray(value)) {
      return value.slice();
    }

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return [];
    }

    return [value];
  }

  function unique(values) {
    return [...new Set(
      values
        .map(v => safeString(v))
        .filter(Boolean)
    )];
  }

  function clamp(value, min, max) {
    const n = Number(value);

    if (!Number.isFinite(n)) {
      return min;
    }

    return Math.min(max, Math.max(min, n));
  }

  function normaliseLanguage(language) {
    const raw = safeString(language).toLowerCase();

    for (const key of Object.keys(LANGUAGES)) {
      const pack = LANGUAGES[key];

      if (
        raw === key ||
        raw === pack.label.toLowerCase() ||
        pack.aliases.includes(raw)
      ) {
        return key;
      }
    }

    return "en";
  }

  function normaliseTradition(tradition) {
    const raw = safeString(tradition)
      .toUpperCase()
      .replace(/\s+/g, "_");

    if (TRADITIONS[raw]) {
      return raw;
    }

    const aliases = {
      MASOWE: "MASOWE_PERSONAL",
      CHRISTIAN_REFLECTION: "CHRISTIAN",
      JEWISH_REFLECTION: "JEWISH",
      ISLAMIC_REFLECTION: "ISLAMIC",
      HINDU_REFLECTION: "HINDU",
      BUDDHIST_REFLECTION: "BUDDHIST",
      INTERFAITH_REFLECTION: "INTERFAITH"
    };

    return aliases[raw] || "ORIGINAL";
  }

  function normaliseThemes(themes) {
    return unique(array(themes)
      .map(v =>
        safeString(v)
          .toUpperCase()
          .replace(/\s+/g, "_")
      ))
      .filter(v => THEMES.includes(v));
  }

  function hashText(text) {
    const input = safeString(text);

    let hash = 2166136261;

    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash +=
        (hash << 1) +
        (hash << 4) +
        (hash << 7) +
        (hash << 8) +
        (hash << 24);

      hash >>>= 0;
    }

    return hash.toString(16).padStart(8, "0");
  }

  /* ---------------------------------------------------------------
     7. PROVENANCE VALIDATION
     --------------------------------------------------------------- */

  function validateProvenance(input) {
    state.statistics.provenanceChecks++;

    const provenance =
      safeString(input.provenance)
        .toUpperCase();

    const valid =
      Object.values(PROVENANCE)
        .includes(provenance);

    if (!valid) {
      return {
        valid: false,
        reason:
          "Source provenance is missing or unrecognised."
      };
    }

    if (
      provenance === PROVENANCE.UNKNOWN &&
      !state.settings.allowUnknownSources
    ) {
      return {
        valid: false,
        reason:
          "Unknown provenance is disabled."
      };
    }

    if (
      provenance === PROVENANCE.LICENSED ||
      provenance === PROVENANCE.OPEN_LICENSE
    ) {
      if (!safeString(input.license)) {
        return {
          valid: false,
          reason:
            "Licensed/open-license material requires license metadata."
        };
      }
    }

    if (
      provenance === PROVENANCE.SHORT_PERMITTED_EXCERPT
    ) {
      const content =
        safeString(input.content);

      if (
        content.length >
        state.settings.maxExcerptLength
      ) {
        return {
          valid: false,
          reason:
            "Permitted excerpt exceeds configured excerpt limit."
        };
      }
    }

    return {
      valid: true,
      provenance
    };
  }

  /* ---------------------------------------------------------------
     8. SOURCE NORMALISATION
     --------------------------------------------------------------- */

  function normaliseSource(input = {}) {

    const provenance =
      safeString(input.provenance)
        .toUpperCase() ||
      PROVENANCE.UNKNOWN;

    const tradition =
      normaliseTradition(
        input.tradition ||
        input.traditionMode
      );

    const language =
      normaliseLanguage(
        input.language
      );

    const content =
      safeString(input.content);

    const source = {

      id:
        safeString(input.id) ||
        uid("SOURCE"),

      title:
        safeString(input.title) ||
        "Untitled Source",

      author:
        safeString(input.author) ||
        "Unknown",

      tradition,

      traditionLabel:
        TRADITIONS[tradition]?.label ||
        tradition,

      language,

      languageLabel:
        LANGUAGES[language]?.label ||
        language,

      contentClass:
        safeString(input.contentClass)
          .toUpperCase() ||
        CONTENT_CLASS.METADATA,

      provenance,

      sourceName:
        safeString(input.sourceName) ||
        "",

      publication:
        safeString(input.publication) ||
        "",

      date:
        safeString(input.date) ||
        "",

      url:
        safeString(input.url) ||
        "",

      license:
        safeString(input.license) ||
        "",

      themes:
        normaliseThemes(input.themes),

      keywords:
        unique(array(input.keywords)),

      excerpt:
        safeString(input.excerpt)
          .slice(0, MAX_EXCERPT_LENGTH),

      content:
        content.slice(0, MAX_CONTENT_LENGTH),

      description:
        safeString(input.description),

      translation:
        safeString(input.translation),

      translationSource:
        safeString(input.translationSource),

      attribution:
        safeString(input.attribution),

      permissions:
        safeString(input.permissions),

      approved:
        Boolean(input.approved),

      status:
        safeString(input.status)
          .toUpperCase() ||
        SOURCE_STATUS.PENDING,

      userProvided:
        Boolean(input.userProvided),

      userApproved:
        Boolean(input.userApproved),

      generated:
        Boolean(input.generated),

      searchable:
        input.searchable !== false,

      createdAt:
        safeString(input.createdAt) ||
        now(),

      updatedAt:
        now(),

      contentHash:
        hashText(content),

      metadataHash:
        hashText(
          JSON.stringify({
            title: input.title,
            author: input.author,
            tradition,
            language,
            provenance,
            themes: normaliseThemes(input.themes)
          })
        )
    };

    if (
      source.provenance ===
      PROVENANCE.ORIGINAL
    ) {
      source.generated =
        source.generated !== false;
    }

    if (
      source.provenance ===
      PROVENANCE.USER_PROVIDED
    ) {
      source.userProvided = true;
    }

    if (
      source.provenance ===
      PROVENANCE.PARAPHRASE ||
      source.provenance ===
      PROVENANCE.SUMMARY
    ) {
      source.contentClass =
        source.contentClass ||
        CONTENT_CLASS.REFLECTION;
    }

    return source;
  }

  /* ---------------------------------------------------------------
     9. INDEX MANAGEMENT
     --------------------------------------------------------------- */

  function indexAdd(index, key, id) {

    if (!key) {
      return;
    }

    if (!index.has(key)) {
      index.set(key, new Set());
    }

    index.get(key).add(id);
  }

  function indexRemove(index, key, id) {

    if (!index.has(key)) {
      return;
    }

    const bucket =
      index.get(key);

    bucket.delete(id);

    if (!bucket.size) {
      index.delete(key);
    }
  }

  function addIndexes(source) {

    indexAdd(
      state.indexes.tradition,
      source.tradition,
      source.id
    );

    indexAdd(
      state.indexes.language,
      source.language,
      source.id
    );

    indexAdd(
      state.indexes.contentClass,
      source.contentClass,
      source.id
    );

    indexAdd(
      state.indexes.provenance,
      source.provenance,
      source.id
    );

    indexAdd(
      state.indexes.status,
      source.status,
      source.id
    );

    source.themes.forEach(theme =>
      indexAdd(
        state.indexes.theme,
        theme,
        source.id
      )
    );
  }

  function removeIndexes(source) {

    indexRemove(
      state.indexes.tradition,
      source.tradition,
      source.id
    );

    indexRemove(
      state.indexes.language,
      source.language,
      source.id
    );

    indexRemove(
      state.indexes.contentClass,
      source.contentClass,
      source.id
    );

    indexRemove(
      state.indexes.provenance,
      source.provenance,
      source.id
    );

    indexRemove(
      state.indexes.status,
      source.status,
      source.id
    );

    source.themes.forEach(theme =>
      indexRemove(
        state.indexes.theme,
        theme,
        source.id
      )
    );
  }

  /* ---------------------------------------------------------------
     10. PERSISTENCE
     --------------------------------------------------------------- */

  function serialiseState() {

    return {
      version: VERSION,

      sources:
        [...state.sources.values()],

      statistics:
        state.statistics,

      settings:
        state.settings,

      savedAt:
        now()
    };
  }

  function save() {

    try {

      const payload =
        JSON.stringify(
          serialiseState()
        );

      localStorage.setItem(
        STORAGE_KEY,
        payload
      );

      if (
        AUDIO &&
        typeof AUDIO.remember === "function"
      ) {
        AUDIO.remember(
          MEMORY_NAMESPACE,
          {
            type: "LIBRARY_SNAPSHOT",
            version: VERSION,
            count: state.sources.size,
            timestamp: now()
          }
        );
      }

      return true;

    } catch (error) {

      console.warn(
        "[CHIROMBE AUDIO LIBRARY] Save failed",
        error
      );

      return false;
    }
  }

  function load() {

    try {

      const raw =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!raw) {
        return false;
      }

      const parsed =
        JSON.parse(raw);

      if (
        !parsed ||
        !Array.isArray(parsed.sources)
      ) {
        return false;
      }

      state.sources.clear();

      Object.keys(state.indexes)
        .forEach(key =>
          state.indexes[key].clear()
        );

      parsed.sources
        .slice(0, MAX_SOURCES)
        .forEach(rawSource => {

          const source =
            normaliseSource(rawSource);

          state.sources.set(
            source.id,
            source
          );

          addIndexes(source);
        });

      if (parsed.statistics) {
        Object.assign(
          state.statistics,
          parsed.statistics
        );
      }

      return true;

    } catch (error) {

      console.warn(
        "[CHIROMBE AUDIO LIBRARY] Load failed",
        error
      );

      return false;
    }
  }

  /* ---------------------------------------------------------------
     11. SOURCE REGISTRATION
     --------------------------------------------------------------- */

  function registerSource(input = {}) {

    if (
      state.sources.size >=
      state.settings.maxSources
    ) {
      state.statistics.rejectedItems++;

      throw new Error(
        "CHIROMBE source capacity reached."
      );
    }

    const source =
      normaliseSource(input);

    const provenanceCheck =
      validateProvenance(source);

    if (!provenanceCheck.valid) {

      state.statistics.rejectedItems++;

      return {
        ok: false,
        error: provenanceCheck.reason
      };
    }

    if (
      source.content.length >
      state.settings.maxContentLength
    ) {
      state.statistics.rejectedItems++;

      return {
        ok: false,
        error:
          "Source content exceeds configured maximum."
      };
    }

    if (
      source.provenance ===
      PROVENANCE.USER_PROVIDED &&
      state.settings.userApprovalRequiredForCustomMaterial
    ) {
      source.status =
        source.userApproved
          ? SOURCE_STATUS.APPROVED
          : SOURCE_STATUS.USER_ONLY;
    }

    if (
      source.provenance ===
      PROVENANCE.ORIGINAL
    ) {
      source.status =
        SOURCE_STATUS.ACTIVE;
    }

    if (
      source.approved
    ) {
      source.status =
        SOURCE_STATUS.APPROVED;
    }

    const previous =
      state.sources.get(source.id);

    if (previous) {
      removeIndexes(previous);
    }

    state.sources.set(
      source.id,
      source
    );

    addIndexes(source);

    state.statistics.registrations++;

    save();

    emit(
      "SOURCE_REGISTERED",
      {
        sourceId: source.id,
        title: source.title,
        tradition: source.tradition,
        provenance: source.provenance
      }
    );

    return {
      ok: true,
      source: clone(source)
    };
  }

  /* ---------------------------------------------------------------
     12. SOURCE APPROVAL / STATUS
     --------------------------------------------------------------- */

  function setStatus(id, status) {

    const source =
      state.sources.get(id);

    if (!source) {
      return {
        ok: false,
        error: "Source not found."
      };
    }

    const next =
      safeString(status)
        .toUpperCase();

    if (
      !Object.values(SOURCE_STATUS)
        .includes(next)
    ) {
      return {
        ok: false,
        error: "Invalid source status."
      };
    }

    removeIndexes(source);

    source.status = next;
    source.updatedAt = now();

    if (
      next === SOURCE_STATUS.APPROVED
    ) {
      source.approved = true;
      state.statistics.approvals++;
    }

    if (
      next === SOURCE_STATUS.SUSPENDED
    ) {
      state.statistics.suspensions++;
    }

    if (
      next === SOURCE_STATUS.ARCHIVED
    ) {
      state.statistics.archived++;
    }

    addIndexes(source);

    save();

    emit(
      "SOURCE_STATUS_CHANGED",
      {
        sourceId: id,
        status: next
      }
    );

    return {
      ok: true,
      source: clone(source)
    };
  }

  /* ---------------------------------------------------------------
     13. SAFE CLONING
     --------------------------------------------------------------- */

  function clone(value) {

    try {
      return JSON.parse(
        JSON.stringify(value)
      );
    } catch (_) {
      return value;
    }
  }

  /* ---------------------------------------------------------------
     14. EVENT BRIDGE
     --------------------------------------------------------------- */

  function emit(type, detail = {}) {

    const payload = {
      type,
      timestamp: now(),
      module: MODULE_ID,
      version: VERSION,
      detail
    };

    try {

      if (
        AUDIO &&
        typeof AUDIO.emit === "function"
      ) {
        AUDIO.emit(
          "TRADITION_LIBRARY_EVENT",
          payload
        );
      }

    } catch (_) {}

    try {

      root.dispatchEvent(
        new CustomEvent(
          "CHIROMBE_AUDIO_TRADITION_EVENT",
          {
            detail: payload
          }
        )
      );

    } catch (_) {}

    return payload;
  }

  /* ---------------------------------------------------------------
     15. SEARCH TOKENISATION
     --------------------------------------------------------------- */

  function tokens(text) {

    return unique(
      safeString(text)
        .toLowerCase()
        .replace(/[^\p{L}\p{N}_]+/gu, " ")
        .split(/\s+/)
        .filter(word => word.length > 2)
    );
  }

  function overlap(a, b) {

    const A = new Set(tokens(a));
    const B = new Set(tokens(b));

    if (!A.size || !B.size) {
      return 0;
    }

    let hits = 0;

    A.forEach(item => {
      if (B.has(item)) {
        hits++;
      }
    });

    return hits /
      Math.max(
        1,
        Math.min(A.size, B.size)
      );
  }

  /* ---------------------------------------------------------------
     16. SEARCH / RETRIEVAL ENGINE
     --------------------------------------------------------------- */

  function search(query = {}) {

    state.statistics.retrievals++;

    const q =
      safeString(query.text ||
                  query.query);

    const tradition =
      query.tradition
        ? normaliseTradition(
            query.tradition
          )
        : null;

    const language =
      query.language
        ? normaliseLanguage(
            query.language
          )
        : null;

    const themes =
      normaliseThemes(
        query.themes
      );

    const contentClass =
      safeString(
        query.contentClass
      ).toUpperCase();

    const provenance =
      safeString(
        query.provenance
      ).toUpperCase();

    const approvedOnly =
      query.approvedOnly !== false;

    const limit =
      clamp(
        query.limit || 20,
        1,
        100
      );

    const candidates = [];

    state.sources.forEach(source => {

      if (
        source.status ===
        SOURCE_STATUS.ARCHIVED
      ) {
        return;
      }

      if (
        approvedOnly &&
        ![
          SOURCE_STATUS.ACTIVE,
          SOURCE_STATUS.APPROVED
        ].includes(source.status)
      ) {
        return;
      }

      if (
        tradition &&
        source.tradition !== tradition
      ) {
        return;
      }

      if (
        language &&
        source.language !== language &&
        source.language !== "multi"
      ) {
        return;
      }

      if (
        contentClass &&
        source.contentClass !== contentClass
      ) {
        return;
      }

      if (
        provenance &&
        source.provenance !== provenance
      ) {
        return;
      }

      const themeHits =
        themes.filter(
          theme =>
            source.themes.includes(theme)
        ).length;

      const themeScore =
        themes.length
          ? themeHits / themes.length
          : 0;

      const searchableText = [
        source.title,
        source.author,
        source.description,
        source.content,
        source.excerpt,
        source.keywords.join(" "),
        source.themes.join(" ")
      ].join(" ");

      const textScore =
        q
          ? overlap(
              q,
              searchableText
            )
          : 0;

      const exactTitle =
        q &&
        source.title
          .toLowerCase()
          .includes(
            q.toLowerCase()
          )
          ? 0.25
          : 0;

      const provenanceScore =
        source.provenance ===
        PROVENANCE.ORIGINAL
          ? 0.10
          : 0.05;

      const score =
        (
          textScore * 0.55 +
          themeScore * 0.30 +
          provenanceScore +
          exactTitle
        );

      candidates.push({
        source,
        score
      });
    });

    candidates.sort(
      (a, b) =>
        b.score - a.score
    );

    const result =
      candidates
        .slice(0, limit)
        .map(item => ({
          score:
            Number(
              item.score.toFixed(4)
            ),
          source:
            clone(item.source)
        }));

    state.queryHistory.unshift({
      timestamp: now(),
      query: q,
      tradition,
      language,
      themes,
      resultCount: result.length
    });

    state.queryHistory =
      state.queryHistory.slice(0, 100);

    return result;
  }

  /* ---------------------------------------------------------------
     17. THEME-BASED RETRIEVAL
     --------------------------------------------------------------- */

  function retrieveByTheme(
    theme,
    options = {}
  ) {

    return search({
      themes: [theme],
      tradition:
        options.tradition,
      language:
        options.language,
      approvedOnly:
        options.approvedOnly !== false,
      limit:
        options.limit || 20
    });
  }

  /* ---------------------------------------------------------------
     18. TRADITION-BASED RETRIEVAL
     --------------------------------------------------------------- */

  function retrieveByTradition(
    tradition,
    options = {}
  ) {

    return search({
      tradition,
      language:
        options.language,
      themes:
        options.themes,
      approvedOnly:
        options.approvedOnly !== false,
      limit:
        options.limit || 20
    });
  }

  /* ---------------------------------------------------------------
     19. SOURCE SAFETY / ATTRIBUTION
     --------------------------------------------------------------- */

  function attribution(source) {

    if (!source) {
      return {
        valid: false,
        text:
          "No source supplied."
      };
    }

    const provenance =
      source.provenance;

    if (
      provenance ===
      PROVENANCE.ORIGINAL
    ) {
      return {
        valid: true,
        text:
          "Original CHIROMBE-generated devotional material."
      };
    }

    if (
      provenance ===
      PROVENANCE.PARAPHRASE
    ) {
      return {
        valid: true,
        text:
          "Paraphrase generated for reflective use; not a verbatim quotation."
      };
    }

    if (
      provenance ===
      PROVENANCE.SUMMARY
    ) {
      return {
        valid: true,
        text:
          "Summary of the registered source; not a verbatim quotation."
      };
    }

    if (
      provenance ===
      PROVENANCE.USER_PROVIDED
    ) {
      return {
        valid: true,
        text:
          source.author &&
          source.author !== "Unknown"
            ? `User-provided material attributed to ${source.author}.`
            : "User-provided material."
      };
    }

    if (
      source.author !== "Unknown" &&
      source.title !== "Untitled Source"
    ) {
      return {
        valid: true,
        text:
          `${source.title} — ${source.author}.`
      };
    }

    return {
      valid: false,
      text:
        "Source attribution is incomplete."
    };
  }

  function citationLine(source) {

    const info =
      attribution(source);

    if (!info.valid) {
      return (
        "Source attribution unavailable; " +
        "this material should not be presented as a verified quotation."
      );
    }

    return info.text;
  }

  /* ---------------------------------------------------------------
     20. CITATION-AWARE AUDIO PACKET
     --------------------------------------------------------------- */

  function createAudioSourcePacket(
    source,
    options = {}
  ) {

    if (!source) {
      return {
        ok: false,
        error: "No source supplied."
      };
    }

    const attributionData =
      attribution(source);

    const packet = {

      sourceId:
        source.id,

      title:
        source.title,

      author:
        source.author,

      tradition:
        source.tradition,

      traditionLabel:
        source.traditionLabel,

      language:
        source.language,

      provenance:
        source.provenance,

      contentClass:
        source.contentClass,

      themes:
        source.themes,

      text:
        source.content ||
        source.excerpt ||
        source.description,

      attribution:
        attributionData.text,

      announceProvenance:
        options.announceProvenance !== false,

      quotationMode:
        source.provenance ===
        PROVENANCE.SHORT_PERMITTED_EXCERPT,

      generated:
        source.generated,

      userProvided:
        source.userProvided,

      contentHash:
        source.contentHash,

      createdAt:
        now()
    };

    return {
      ok: true,
      packet
    };
  }

  /* ---------------------------------------------------------------
     21. SAFE SOURCE SELECTION FOR LITURGY
     --------------------------------------------------------------- */

  function selectForLiturgy(
    context = {}
  ) {

    const results =
      search({
        text:
          context.query ||
          context.topic ||
          "",

        tradition:
          context.tradition,

        language:
          context.language,

        themes:
          context.themes,

        contentClass:
          context.contentClass,

        approvedOnly:
          true,

        limit:
          context.limit || 10
      });

    if (!results.length) {

      return {
        ok: false,
        reason:
          "No approved source matched the requested context.",
        results: []
      };
    }

    const chosen =
      results[0];

    state.statistics.generatedSelections++;

    emit(
      "SOURCE_SELECTED_FOR_LITURGY",
      {
        sourceId:
          chosen.source.id,

        score:
          chosen.score,

        tradition:
          chosen.source.tradition,

        themes:
          chosen.source.themes
      }
    );

    return {
      ok: true,
      selected:
        chosen.source,
      alternatives:
        results.slice(1)
          .map(item => item.source)
    };
  }

  /* ---------------------------------------------------------------
     22. ORIGINAL CHIROMBE SOURCE FACTORY
     --------------------------------------------------------------- */

  function createOriginal(
    input = {}
  ) {

    const source =
      normaliseSource({
        ...input,

        provenance:
          PROVENANCE.ORIGINAL,

        generated:
          true,

        status:
          SOURCE_STATUS.ACTIVE
      });

    return registerSource(
      source
    );
  }

  /* ---------------------------------------------------------------
     23. USER-PROVIDED SOURCE FACTORY
     --------------------------------------------------------------- */

  function createUserSource(
    input = {}
  ) {

    const source =
      normaliseSource({
        ...input,

        provenance:
          PROVENANCE.USER_PROVIDED,

        userProvided:
          true,

        userApproved:
          Boolean(
            input.userApproved
          )
      });

    return registerSource(
      source
    );
  }

  /* ---------------------------------------------------------------
     24. PARAPHRASE FACTORY
     --------------------------------------------------------------- */

  function createParaphrase(
    input = {}
  ) {

    const source =
      normaliseSource({
        ...input,

        provenance:
          PROVENANCE.PARAPHRASE,

        generated:
          true,

        contentClass:
          input.contentClass ||
          CONTENT_CLASS.REFLECTION,

        status:
          SOURCE_STATUS.ACTIVE
      });

    if (
      input.sourceId
    ) {
      source.translationSource =
        input.sourceId;
    }

    return registerSource(
      source
    );
  }

  /* ---------------------------------------------------------------
     25. SOURCE REMOVAL
     --------------------------------------------------------------- */

  function removeSource(id) {

    const source =
      state.sources.get(id);

    if (!source) {
      return {
        ok: false,
        error: "Source not found."
      };
    }

    removeIndexes(source);

    state.sources.delete(id);

    save();

    emit(
      "SOURCE_REMOVED",
      {
        sourceId: id,
        title: source.title
      }
    );

    return {
      ok: true,
      removed: id
    };
  }

  /* ---------------------------------------------------------------
     26. EXPORT / IMPORT
     --------------------------------------------------------------- */

  function exportLibrary() {

    return clone(
      serialiseState()
    );
  }

  function importLibrary(
    payload,
    options = {}
  ) {

    if (
      !payload ||
      !Array.isArray(
        payload.sources
      )
    ) {
      return {
        ok: false,
        error:
          "Invalid library payload."
      };
    }

    let imported = 0;
    let rejected = 0;

    payload.sources.forEach(raw => {

      const result =
        registerSource(raw);

      if (result.ok) {
        imported++;
      } else {
        rejected++;
      }
    });

    return {
      ok: true,
      imported,
      rejected,
      merge:
        options.merge !== false
    };
  }

  /* ---------------------------------------------------------------
     27. SEARCHABLE KNOWLEDGE SNAPSHOT
     --------------------------------------------------------------- */

  function knowledgeSnapshot() {

    const traditions = {};

    Object.keys(
      TRADITIONS
    ).forEach(key => {

      traditions[key] =
        state.indexes.tradition
          .get(key)?.size || 0;
    });

    const themes = {};

    THEMES.forEach(theme => {

      themes[theme] =
        state.indexes.theme
          .get(theme)?.size || 0;
    });

    return {
      module: MODULE_ID,
      version: VERSION,
      sourceCount:
        state.sources.size,
      traditions,
      themes,
      statistics:
        clone(state.statistics),
      settings:
        clone(state.settings),
      timestamp:
        now()
    };
  }

  /* ---------------------------------------------------------------
     28. SYSTEM NARRATION
     --------------------------------------------------------------- */

  function narrateSource(source) {

    if (!source) {
      return "";
    }

    const lines = [];

    lines.push(
      `Knowledge source: ${source.title}.`
    );

    if (
      source.author &&
      source.author !== "Unknown"
    ) {
      lines.push(
        `Attribution: ${source.author}.`
      );
    }

    lines.push(
      `Tradition mode: ${source.traditionLabel}.`
    );

    lines.push(
      `Language: ${source.languageLabel}.`
    );

    lines.push(
      `Provenance: ${source.provenance}.`
    );

    if (
      source.themes.length
    ) {
      lines.push(
        `Themes: ${source.themes.join(", ")}.`
      );
    }

    if (
      state.settings.citationAware
    ) {
      lines.push(
        citationLine(source)
      );
    }

    return lines.join(" ");
  }

  /* ---------------------------------------------------------------
     29. INTEGRATION WITH LITURGY ENGINE
     --------------------------------------------------------------- */

  if (
    LITURGY &&
    typeof LITURGY === "object"
  ) {

    LITURGY.Sources =
      LITURGY.Sources || {};

    Object.assign(
      LITURGY.Sources,
      {
        register: registerSource,
        original: createOriginal,
        userProvided: createUserSource,
        paraphrase: createParaphrase,
        search,
        byTheme: retrieveByTheme,
        byTradition: retrieveByTradition,
        select: selectForLiturgy,
        packet: createAudioSourcePacket,
        narrate: narrateSource,
        approve: id =>
          setStatus(
            id,
            SOURCE_STATUS.APPROVED
          ),
        suspend: id =>
          setStatus(
            id,
            SOURCE_STATUS.SUSPENDED
          ),
        archive: id =>
          setStatus(
            id,
            SOURCE_STATUS.ARCHIVED
          ),
        remove: removeSource,
        export: exportLibrary,
        import: importLibrary,
        snapshot: knowledgeSnapshot,
        provenance: PROVENANCE,
        traditions: TRADITIONS,
        languages: LANGUAGES,
        themes: THEMES
      }
    );

  }

  /* ---------------------------------------------------------------
     30. PUBLIC GLOBAL INTERFACE
     --------------------------------------------------------------- */

  const LIBRARY = {

    MODULE_ID,
    VERSION,

    SOURCE_STATUS,
    PROVENANCE,
    CONTENT_CLASS,
    TRADITIONS,
    LANGUAGES,
    THEMES,

    register:
      registerSource,

    createOriginal,

    createUserSource,

    createParaphrase,

    approve:
      id =>
        setStatus(
          id,
          SOURCE_STATUS.APPROVED
        ),

    suspend:
      id =>
        setStatus(
          id,
          SOURCE_STATUS.SUSPENDED
        ),

    archive:
      id =>
        setStatus(
          id,
          SOURCE_STATUS.ARCHIVED
        ),

    remove:
      removeSource,

    search,

    retrieveByTheme,

    retrieveByTradition,

    selectForLiturgy,

    createAudioSourcePacket,

    attribution,

    citationLine,

    narrateSource,

    export:
      exportLibrary,

    import:
      importLibrary,

    save,

    load,

    snapshot:
      knowledgeSnapshot,

    getSource:
      id =>
        clone(
          state.sources.get(id) ||
          null
        ),

    list:
      options => {

        const limit =
          clamp(
            options?.limit || 100,
            1,
            500
          );

        return [
          ...state.sources.values()
        ]
          .filter(source => {

            if (
              options?.status &&
              source.status !==
              options.status
            ) {
              return false;
            }

            if (
              options?.tradition &&
              source.tradition !==
              normaliseTradition(
                options.tradition
              )
            ) {
              return false;
            }

            return true;
          })
          .slice(0, limit)
          .map(clone);
      },

    getStatus() {

      return {
        module:
          MODULE_ID,

        version:
          VERSION,

        initialized:
          state.initialized,

        sourceCount:
          state.sources.size,

        statistics:
          clone(
            state.statistics
          ),

        settings:
          clone(
            state.settings
          ),

        timestamp:
          now()
      };
    }

  };

  /* ---------------------------------------------------------------
     31. COMMAND INTERFACE
     --------------------------------------------------------------- */

  if (
    LITURGY &&
    typeof LITURGY === "object"
  ) {

    LITURGY.commands =
      LITURGY.commands || {};

    LITURGY.commands[
      "audio.sources.register"
    ] = registerSource;

    LITURGY.commands[
      "audio.sources.search"
    ] = search;

    LITURGY.commands[
      "audio.sources.select"
    ] = selectForLiturgy;

    LITURGY.commands[
      "audio.sources.approve"
    ] =
      args =>
        setStatus(
          args?.id,
          SOURCE_STATUS.APPROVED
        );

    LITURGY.commands[
      "audio.sources.suspend"
    ] =
      args =>
        setStatus(
          args?.id,
          SOURCE_STATUS.SUSPENDED
        );

    LITURGY.commands[
      "audio.sources.snapshot"
    ] =
      knowledgeSnapshot;

  }

  /* ---------------------------------------------------------------
     32. EVENT-DRIVEN SOURCE SELECTION
     --------------------------------------------------------------- */

  function observeLiturgyRequest(event) {

    const detail =
      event?.detail ||
      event ||
      {};

    if (
      !detail
    ) {
      return;
    }

    const themes =
      detail.themes ||
      detail.theme ||
      [];

    const tradition =
      detail.tradition ||
      detail.traditionMode;

    const language =
      detail.language;

    if (
      !themes &&
      !tradition &&
      !detail.query
    ) {
      return;
    }

    try {

      const selection =
        selectForLiturgy({
          query:
            detail.query ||
            detail.topic ||
            "",

          themes,

          tradition,

          language,

          contentClass:
            detail.contentClass,

          limit: 5
        });

      emit(
        "LITURGY_SOURCE_OPTIONS_READY",
        {
          requestId:
            detail.requestId ||
            null,

          selection
        }
      );

    } catch (error) {

      emit(
        "LITURGY_SOURCE_SELECTION_ERROR",
        {
          error:
            error?.message ||
            String(error)
        }
      );
    }
  }

  try {

    root.addEventListener(
      "CHIROMBE_LITURGY_REQUEST",
      observeLiturgyRequest
    );

  } catch (_) {}

  /* ---------------------------------------------------------------
     33. OPTIONAL AUDIO EVENT INTEGRATION
     --------------------------------------------------------------- */

  if (
    AUDIO &&
    typeof AUDIO.on === "function"
  ) {

    try {

      AUDIO.on(
        "LITURGY_CONTEXT_REQUESTED",
        detail =>
          observeLiturgyRequest({
            detail
          })
      );

    } catch (_) {}

  }

  /* ---------------------------------------------------------------
     34. DEFAULT ORIGINAL CHIROMBE MATERIAL
     ---------------------------------------------------------------
     These are deliberately original declarations rather than
     quotations from scripture or any external religious authority.
     --------------------------------------------------------------- */

  const DEFAULT_ORIGINALS = [

    {
      id:
        "CHIROMBE_ORIGINAL_PROTECTION_001",

      title:
        "Declaration of Truth and Protection",

      author:
        "CHIROMBE Original",

      tradition:
        "ORIGINAL",

      language:
        "en",

      contentClass:
        CONTENT_CLASS.DECLARATION,

      provenance:
        PROVENANCE.ORIGINAL,

      themes: [
        "PROTECTION",
        "TRUTH",
        "UNITY",
        "RESILIENCE",
        "CONTINUITY"
      ],

      content:
        "Mwari ndiMwari. Let truth guide this household, let wisdom govern every action, let peace strengthen every relationship, and let every rightful protection be maintained with courage, discernment and love.",

      description:
        "Original CHIROMBE devotional declaration."
    },

    {
      id:
        "CHIROMBE_ORIGINAL_SHONA_001",

      title:
        "Munamato weKubatana",

      author:
        "CHIROMBE Original",

      tradition:
        "MASOWE_PERSONAL",

      language:
        "sn",

      contentClass:
        CONTENT_CLASS.PRAYER,

      provenance:
        PROVENANCE.ORIGINAL,

      themes: [
        "FAMILY",
        "UNITY",
        "PEACE",
        "PROTECTION",
        "CONTINUITY"
      ],

      content:
        "Mwari ndiMwari. Tinokumbira rugare, kubatana, njere nesimba remwoyo mumhuri yedu. Chokwadi ngachitungamire mashoko edu, rudo ngarusimbise hukama hwedu, uye tinamate kuti mhuri yedu ifambe munzira yerunyararo nekuchenjera.",

      description:
        "Original Shona devotional prayer created for CHIROMBE personal liturgy."
    },

    {
      id:
        "CHIROMBE_ORIGINAL_NIGHT_001",

      title:
        "Night Watch Reflection",

      author:
        "CHIROMBE Original",

      tradition:
        "ORIGINAL",

      language:
        "en",

      contentClass:
        CONTENT_CLASS.REFLECTION,

      provenance:
        PROVENANCE.ORIGINAL,

      themes: [
        "NIGHT",
        "PEACE",
        "REST",
        "PROTECTION",
        "REFLECTION"
      ],

      content:
        "As night settles, let the household become quiet. Let fear give way to calm, confusion to clarity, and exhaustion to rest. May every person be remembered with dignity, every decision be guided by wisdom, and every new morning meet a family prepared to walk in truth and peace.",

      description:
        "Original night-watch reflection."
    }

  ];

  DEFAULT_ORIGINALS.forEach(item => {

    if (
      !state.sources.has(item.id)
    ) {
      try {
        registerSource(item);
      } catch (_) {}
    }

  });

  /* ---------------------------------------------------------------
     35. INITIALISATION
     --------------------------------------------------------------- */

  function initialise() {

    if (
      state.initialized
    ) {
      return;
    }

    load();

    state.initialized = true;

    emit(
      "TRADITION_LIBRARY_READY",
      knowledgeSnapshot()
    );

    console.info(
      "[CHIROMBE AUDIO] Multi-Tradition Knowledge & Provenance Library ready.",
      knowledgeSnapshot()
    );
  }

  /* ---------------------------------------------------------------
     36. GLOBAL REGISTRATION
     --------------------------------------------------------------- */

  window.CHIROMBE_AUDIO_TRADITION_LIBRARY =
    LIBRARY;

  CHIROMBE.AudioTraditionLibrary =
    LIBRARY;

  root.CHIROMBE_AUDIO_TRADITION_LIBRARY =
    LIBRARY;

  if (
    !CHIROMBE.AudioLivingLiturgy
  ) {
    CHIROMBE.AudioLivingLiturgy = {};
  }

  CHIROMBE.AudioLivingLiturgy.Sources =
    LIBRARY;

  /* ---------------------------------------------------------------
     37. START
     --------------------------------------------------------------- */

  initialise();

})();
(() => {
  "use strict";

  /* ================================================================
     CHIROMBE AUDIO LIVING LITURGY
     PART 4 — BLOODLINE PRAYER ORCHESTRATOR
     ================================================================
     
     PURPOSE
     -------
     Transform approved CHIROMBE family/bloodline records into
     structured, person-aware devotional sessions.

     DESIGN
     ------
     BLOODLINE DATA
          ↓
     VALIDATION
          ↓
     PERSON PROFILE
          ↓
     LANGUAGE / PRIVACY / THEME RESOLUTION
          ↓
     NOVELTY ENGINE
          ↓
     PERSON PRAYER
          ↓
     COVERAGE TRACKING
          ↓
     FAMILY SESSION
          ↓
     LIVING WATCH / AUDIO BROADCAST

     IMPORTANT
     ---------
     This module does not diagnose, label or infer that any person is
     cursed, possessed, spiritually attacked, dangerous or doomed.

     It treats "protection" as a devotional intention and the
     computational protection layer as system integrity, privacy,
     resilience, continuity, monitoring and recovery.

     The family dataset is READ-ONLY from this module.
     ================================================================ */

  const root = window;

  const CHIROMBE =
    root.CHIROMBE ||
    (root.CHIROMBE = {});

  const AUDIO =
    root.CHIROMBE_AUDIO ||
    (CHIROMBE.AudioLivingLiturgy =
      CHIROMBE.AudioLivingLiturgy || {});

  const LITURGY =
    root.CHIROMBE_AUDIO_LITURGY_ENGINE ||
    {};

  const LIBRARY =
    root.CHIROMBE_AUDIO_TRADITION_LIBRARY ||
    CHIROMBE.AudioTraditionLibrary ||
    LITURGY.Sources ||
    {};

  const MODULE_ID =
    "CHIROMBE_AUDIO_BLOODLINE_ORCHESTRATOR";

  const VERSION =
    "4.0.0";

  const STORAGE_KEY =
    "CHIROMBE_AUDIO_BLOODLINE_ORCHESTRATOR_V4";

  const MEMORY_NAMESPACE =
    "AUDIO_BLOODLINE_ORCHESTRATOR";

  /* ================================================================
     1. STATES
     ================================================================ */

  const STATES = Object.freeze({
    DORMANT: "DORMANT",
    READY: "READY",
    VALIDATING: "VALIDATING",
    PLANNING: "PLANNING",
    PRAYING: "PRAYING",
    PAUSED: "PAUSED",
    COMPLETED: "COMPLETED",
    RECOVERING: "RECOVERING",
    SAFE_STOP: "SAFE_STOP"
  });

  const SESSION_MODES = Object.freeze({
    PERSON: "PERSON",
    FAMILY: "FAMILY",
    BLOODLINE: "BLOODLINE",
    DAILY: "DAILY",
    NIGHT_WATCH: "NIGHT_WATCH",
    REMEMBRANCE: "REMEMBRANCE",
    FAMILY_UNITY: "FAMILY_UNITY",
    CUSTOM: "CUSTOM"
  });

  const PRIVACY_MODES = Object.freeze({
    FULL_NAME: "FULL_NAME",
    FIRST_NAME: "FIRST_NAME",
    INITIALS: "INITIALS",
    PRIVATE_REFERENCE: "PRIVATE_REFERENCE",
    NO_NAME: "NO_NAME"
  });

  const THEMES = [
    "PROTECTION",
    "PEACE",
    "COURAGE",
    "WISDOM",
    "TRUTH",
    "UNITY",
    "FAMILY",
    "GRATITUDE",
    "HOPE",
    "HEALING",
    "REMEMBRANCE",
    "STEWARDSHIP",
    "JUSTICE",
    "HUMILITY",
    "FORGIVENESS",
    "FAITH",
    "LOVE",
    "COMMUNITY",
    "SERVICE",
    "DISCERNMENT",
    "RESILIENCE",
    "CONTINUITY",
    "LEGACY",
    "REFLECTION",
    "REST",
    "BLESSING",
    "FAMILY_UNITY",
    "NIGHT",
    "MORNING"
  ];

  /* ================================================================
     2. INTERNAL STATE
     ================================================================ */

  const state = {

    state:
      STATES.DORMANT,

    initialized:
      false,

    sourceRevision:
      0,

    people:
      new Map(),

    approvedPeople:
      new Set(),

    sessions:
      new Map(),

    coverage:
      new Map(),

    recentPrayerHashes:
      [],

    recentThemes:
      [],

    recentPersons:
      [],

    statistics: {

      peopleDiscovered:
        0,

      peopleApproved:
        0,

      sessionsCreated:
        0,

      sessionsCompleted:
        0,

      personPrayers:
        0,

      familySessions:
        0,

      skippedPeople:
        0,

      privacyFiltered:
        0,

      noveltyRegenerations:
        0,

      errors:
        0
    },

    settings: {

      maxRecentHashes:
        500,

      maxRecentThemes:
        100,

      maxRecentPersons:
        100,

      defaultPrivacy:
        PRIVACY_MODES.FIRST_NAME,

      defaultLanguage:
        "en",

      defaultDuration:
        20,

      minimumNovelty:
        0.42,

      requireApprovedPerson:
        false,

      readOnlyFamilySource:
        true,

      preserveSacredAnchors:
        true,

      rotateThemes:
        true,

      rotateOpenings:
        true,

      rotateClosings:
        true
    },

    activeSession:
      null
  };

  /* ================================================================
     3. UTILITIES
     ================================================================ */

  function now() {
    return new Date().toISOString();
  }

  function uid(prefix = "BL") {

    return (
      prefix +
      "_" +
      Date.now().toString(36) +
      "_" +
      Math.random()
        .toString(36)
        .slice(2, 9)
        .toUpperCase()
    );
  }

  function safe(value, fallback = "") {

    if (
      value === null ||
      value === undefined
    ) {
      return fallback;
    }

    return String(value).trim();
  }

  function arr(value) {

    if (Array.isArray(value)) {
      return value.slice();
    }

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return [];
    }

    return [value];
  }

  function unique(values) {

    return [
      ...new Set(
        values
          .map(v => safe(v))
          .filter(Boolean)
      )
    ];
  }

  function clamp(value, min, max) {

    const number =
      Number(value);

    if (
      !Number.isFinite(number)
    ) {
      return min;
    }

    return Math.min(
      max,
      Math.max(
        min,
        number
      )
    );
  }

  function hash(text) {

    const value =
      safe(text);

    let h =
      2166136261;

    for (
      let i = 0;
      i < value.length;
      i++
    ) {

      h ^=
        value.charCodeAt(i);

      h +=
        (h << 1) +
        (h << 4) +
        (h << 7) +
        (h << 8) +
        (h << 24);

      h >>>=
        0;
    }

    return h
      .toString(16)
      .padStart(8, "0");
  }

  function choose(list, seed = 0) {

    if (
      !Array.isArray(list) ||
      !list.length
    ) {
      return "";
    }

    const index =
      Math.abs(
        Number(seed) || 0
      ) % list.length;

    return list[index];
  }

  function clone(value) {

    try {

      return JSON.parse(
        JSON.stringify(value)
      );

    } catch (_) {

      return value;
    }
  }

  /* ================================================================
     4. FAMILY SOURCE DISCOVERY
     ================================================================ */

  function discoverSource() {

    const candidates = [

      root.CHIROMBE_BLOODLINE,

      root.BLOODLINE,

      root.ChirombeBloodline,

      root.CHIROMBE_FAMILY,

      CHIROMBE.BLOODLINE,

      CHIROMBE.FAMILY,

      root.CHIROMBE_STATE?.bloodline,

      root.CHIROMBE_STATE?.family,

      root.ChirombeState?.bloodline,

      root.ChirombeState?.family

    ];

    for (
      const candidate of candidates
    ) {

      if (
        Array.isArray(candidate) &&
        candidate.length
      ) {
        return {
          source:
            candidate,
          sourceType:
            "ARRAY"
        };
      }

      if (
        candidate &&
        Array.isArray(
          candidate.people
        )
      ) {
        return {
          source:
            candidate.people,
          sourceType:
            "PEOPLE"
        };
      }

      if (
        candidate &&
        Array.isArray(
          candidate.members
        )
      ) {
        return {
          source:
            candidate.members,
          sourceType:
            "MEMBERS"
        };
      }

      if (
        candidate &&
        Array.isArray(
          candidate.family
        )
      ) {
        return {
          source:
            candidate.family,
          sourceType:
            "FAMILY"
        };
      }
    }

    return {
      source: [],
      sourceType:
        "NONE"
    };
  }

  /* ================================================================
     5. PERSON NORMALISATION
     ================================================================ */

  function normalisePerson(
    raw,
    index = 0
  ) {

    if (
      !raw ||
      typeof raw !== "object"
    ) {
      return null;
    }

    const displayName =
      safe(
        raw.displayName ||
        raw.name ||
        raw.fullName ||
        raw.personName ||
        raw.label
      );

    if (!displayName) {
      return null;
    }

    const personKey =
      safe(
        raw.personKey ||
        raw.id ||
        raw.key ||
        raw.uid
      ) ||
      hash(
        displayName +
        ":" +
        index
      );

    const approved =
      raw.approved !== false &&
      raw.enabled !== false &&
      raw.audioApproved !== false;

    const preferredLanguage =
      safe(
        raw.preferredLanguage ||
        raw.language
      ) ||
      state.settings.defaultLanguage;

    const privacy =
      safe(
        raw.privacyMode ||
        raw.audioPrivacy
      ).toUpperCase() ||
      state.settings.defaultPrivacy;

    const themes =
      unique(
        arr(
          raw.approvedThemes ||
          raw.themes ||
          raw.prayerThemes
        )
      )
      .map(theme =>
        theme
          .toUpperCase()
          .replace(/\s+/g, "_")
      )
      .filter(
        theme =>
          THEMES.includes(theme)
      );

    return {

      personKey,

      displayName,

      firstName:
        safe(
          raw.firstName ||
          displayName.split(/\s+/)[0]
        ),

      preferredLanguage,

      traditionMode:
        safe(
          raw.traditionMode ||
          raw.tradition ||
          "ORIGINAL"
        ),

      privacyMode:
        Object.values(
          PRIVACY_MODES
        ).includes(privacy)
          ? privacy
          : state.settings.defaultPrivacy,

      approved,

      approvedThemes:
        themes,

      preferredDuration:
        clamp(
          raw.preferredDuration ||
          state.settings.defaultDuration,
          1,
          180
        ),

      sessionFrequency:
        safe(
          raw.sessionFrequency
        ) ||
        "ADAPTIVE",

      pronunciation:
        safe(
          raw.pronunciation
        ),

      pronunciationGuide:
        safe(
          raw.pronunciationGuide
        ),

      preferredVoice:
        safe(
          raw.preferredVoice
        ),

      notes:
        safe(
          raw.audioNotes
        ),

      consent:
        raw.audioConsent !== false,

      remembrance:
        Boolean(
          raw.remembrance ||
          raw.isAncestor ||
          raw.historical
        ),

      generation:
        safe(
          raw.generation
        ),

      relationship:
        safe(
          raw.relationship ||
          raw.relation
        ),

      metadata:
        {
          sourceIndex:
            index,

          sourceRevision:
            state.sourceRevision
        }
    };
  }

  /* ================================================================
     6. READ-ONLY BLOODLINE REFRESH
     ================================================================ */

  function refreshBloodline() {

    state.state =
      STATES.VALIDATING;

    const discovered =
      discoverSource();

    const incoming =
      discovered.source;

    const next =
      new Map();

    incoming.forEach(
      (raw, index) => {

        const person =
          normalisePerson(
            raw,
            index
          );

        if (!person) {
          return;
        }

        next.set(
          person.personKey,
          person
        );
      }
    );

    state.people =
      next;

    state.approvedPeople =
      new Set(
        [...next.values()]
          .filter(
            person =>
              person.approved &&
              person.consent
          )
          .map(
            person =>
              person.personKey
          )
      );

    state.statistics.peopleDiscovered =
      next.size;

    state.statistics.peopleApproved =
      state.approvedPeople.size;

    state.sourceRevision++;

    state.state =
      STATES.READY;

    emit(
      "BLOODLINE_REFRESHED",
      {
        sourceType:
          discovered.sourceType,

        discovered:
          next.size,

        approved:
          state.approvedPeople.size,

        revision:
          state.sourceRevision
      }
    );

    persist();

    return {
      ok: true,

      sourceType:
        discovered.sourceType,

      people:
        next.size,

      approved:
        state.approvedPeople.size,

      revision:
        state.sourceRevision
    };
  }

  /* ================================================================
     7. PRIVACY REFERENCE
     ================================================================ */

  function referenceFor(
    person,
    override
  ) {

    const mode =
      override ||
      person.privacyMode ||
      state.settings.defaultPrivacy;

    switch (mode) {

      case PRIVACY_MODES.FULL_NAME:
        return person.displayName;

      case PRIVACY_MODES.FIRST_NAME:
        return person.firstName;

      case PRIVACY_MODES.INITIALS:

        return person.displayName
          .split(/\s+/)
          .filter(Boolean)
          .map(
            word =>
              word.charAt(0)
                .toUpperCase()
          )
          .join(".") + ".";

      case PRIVACY_MODES.PRIVATE_REFERENCE:
        return "this family member";

      case PRIVACY_MODES.NO_NAME:
        return "this beloved person";

      default:
        return person.firstName;
    }
  }

  /* ================================================================
     8. THEME ROTATION
     ================================================================ */

  const THEME_GROUPS = {

    protection: [
      "PROTECTION",
      "TRUTH",
      "RESILIENCE",
      "DISCERNMENT"
    ],

    family: [
      "FAMILY",
      "UNITY",
      "FAMILY_UNITY",
      "LOVE"
    ],

    peace: [
      "PEACE",
      "REST",
      "HOPE",
      "REFLECTION"
    ],

    growth: [
      "WISDOM",
      "COURAGE",
      "SERVICE",
      "STEWARDSHIP"
    ],

    remembrance: [
      "REMEMBRANCE",
      "LEGACY",
      "CONTINUITY",
      "GRATITUDE"
    ]

  };

  function resolveThemes(
    person,
    options = {}
  ) {

    let themes =
      unique(
        arr(
          options.themes ||
          person.approvedThemes
        )
      )
      .map(
        theme =>
          theme
            .toUpperCase()
            .replace(/\s+/g, "_")
      )
      .filter(
        theme =>
          THEMES.includes(theme)
      );

    if (
      !themes.length
    ) {

      const groups =
        Object.keys(
          THEME_GROUPS
        );

      const group =
        choose(
          groups,
          state.recentThemes.length
        );

      themes =
        THEME_GROUPS[group]
          .slice();
    }

    if (
      state.settings.rotateThemes &&
      state.recentThemes.length
    ) {

      const previous =
        new Set(
          state.recentThemes
        );

      const alternatives =
        themes.filter(
          theme =>
            !previous.has(theme)
        );

      if (
        alternatives.length
      ) {
        themes =
          alternatives;
      }
    }

    return themes.slice(0, 5);
  }

  /* ================================================================
     9. LANGUAGE RESOLUTION
     ================================================================ */

  function resolveLanguage(
    person,
    options = {}
  ) {

    return safe(
      options.language ||
      person.preferredLanguage ||
      state.settings.defaultLanguage
    );
  }

  /* ================================================================
     10. PERSON PRAYER COMPONENTS
     ================================================================ */

  const OPENINGS = {

    en: [
      "Let us enter this moment with gratitude, truth and peace.",
      "May this moment be set apart for reflection, wisdom and love.",
      "We begin in stillness, remembering the dignity of every life.",
      "Let this prayer become a quiet expression of care and hope.",
      "We gather our thoughts with gratitude and peaceful intention."
    ],

    sn: [
      "Ngatipinde panguva ino nekutenda, chokwadi nerugare.",
      "Ngaiyi ive nguva yekufungisisa, njere nerudo.",
      "Tinotanga takanyarara, tichiyeuka kukosha kwehupenyu hwese.",
      "Munamato uyu ngauve kuratidza rudo netariro.",
      "Tinounganidza pfungwa dzedu nekutenda nerunyararo."
    ]

  };

  const PERSON_LINES = {

    en: [
      "May {person} be surrounded by wisdom, peace and courage.",
      "May {person} walk with clarity, dignity and strength.",
      "May {person} find wise people, truthful words and peaceful paths.",
      "May {person} have courage for difficult moments and gratitude for good ones.",
      "May {person} be guided toward choices that preserve dignity, safety and love.",
      "May {person} be strengthened by family unity and truthful understanding.",
      "May {person} have space to rest, reflect and begin again.",
      "May {person} carry hope into every place they enter."
    ],

    sn: [
      "{person} ngaawane nenjere, rugare uye ushingi.",
      "{person} ngaafambe nechokwadi, rukudzo nesimba.",
      "{person} ngaawane vanhu vakachenjera, mashoko echokwadi nenzira dzerugare.",
      "{person} ngaave nesimba panguva dzakaoma uye nekutenda panguva dzakanaka.",
      "{person} ngaatungamirirwe pasarudzo dzinochengetedza rukudzo, kuchengeteka nerudo.",
      "{person} ngaasimbiswe nekubatana kwemhuri uye nekunzwisisa kwechokwadi.",
      "{person} ngaawane nguva yekuzorora, kufungisisa uye kutanga patsva.",
      "{person} ngaatakure tariro munzvimbo dzose dzaanofamba."
    ]

  };

  const THEME_LINES = {

    en: {

      PROTECTION:
        "May protection be understood through wise action, secure boundaries, careful decisions and peaceful strength.",

      PEACE:
        "May peace settle the heart and make room for clear thought.",

      COURAGE:
        "May courage arise without hatred, and strength without cruelty.",

      WISDOM:
        "May wisdom guide every decision and every relationship.",

      TRUTH:
        "May truth remain stronger than confusion and honesty guide every conversation.",

      UNITY:
        "May the family remain connected through respect, patience and love.",

      FAMILY:
        "May family bonds be strengthened by compassion and mutual care.",

      GRATITUDE:
        "May gratitude keep good memories alive and deepen appreciation for life.",

      HOPE:
        "May hope remain present even when circumstances are difficult.",

      HEALING:
        "May there be space for restoration, rest, compassion and renewed strength.",

      REMEMBRANCE:
        "May those remembered be honoured with dignity and their positive legacy carried forward.",

      CONTINUITY:
        "May what is good be preserved and wisely passed to future generations.",

      LEGACY:
        "May every worthy lesson become part of a constructive legacy.",

      REFLECTION:
        "May reflection reveal what deserves attention and what can be released peacefully.",

      REST:
        "May the body, mind and household find peaceful rest.",

      BLESSING:
        "May this moment be filled with gratitude, peace and a sincere intention for good.",

      FAMILY_UNITY:
        "May family unity be strengthened through truth, patience, forgiveness and love.",

      RESILIENCE:
        "May resilience grow through wisdom, preparation, community and hope.",

      DISCERNMENT:
        "May discernment distinguish evidence from uncertainty and wisdom from fear."

    },

    sn: {

      PROTECTION:
        "Kuchengetedzwa ngakunzwisiswe kuburikidza nenjere, miganhu yakachengeteka, sarudzo dzakangwara nesimba rerugare.",

      PEACE:
        "Rugare ngaruzadze mwoyo uye rwugadzirire nzvimbo yekufunga zvakajeka.",

      COURAGE:
        "Ushingi ngauuye pasina ruvengo, uye simba risina hutsinye.",

      WISDOM:
        "Njere ngadzitungamirire sarudzo dzese nehukama hwese.",

      TRUTH:
        "Chokwadi ngachikunde kuvhiringidzika uye kutendeseka kutungamirire hurukuro dzedu.",

      UNITY:
        "Mhuri ngaigare yakabatana neruremekedzo, moyo murefu nerudo.",

      FAMILY:
        "Ukama hwemhuri ngahusimbiswe netsitsi nekubatsirana.",

      GRATITUDE:
        "Kutenda ngakuchengetedze ndangariro dzakanaka uye kuwedzere kukoshesa hupenyu.",

      HOPE:
        "Tariro ngaigare iripo kunyange nguva dzakaoma.",

      HEALING:
        "Ngakuve nenzvimbo yekuzorora, kuvandudzwa, tsitsi nesimba idzva.",

      REMEMBRANCE:
        "Vatinorangarira ngavaremekedzwe uye nhaka yavo yakanaka ienderere mberi.",

      CONTINUITY:
        "Zvakanaka ngazvichengetedzwe uye zvipfuudzwe nekuchenjera kune vanotevera.",

      LEGACY:
        "Chidzidzo chose chakanaka ngachive chikamu chenhaka inovaka.",

      REFLECTION:
        "Kufungisisa ngakuratidze zvinoda kutariswa nezvinogona kusiiwa murugare.",

      REST:
        "Muviri, mwoyo nemhuri ngazviwane kuzorora murugare.",

      BLESSING:
        "Nguva ino ngaizadzwe nekutenda, rugare uye chinangwa chakanaka.",

      FAMILY_UNITY:
        "Kubatana kwemhuri ngakusimbiswe nechokwadi, moyo murefu, kuregererana nerudo.",

      RESILIENCE:
        "Kusimba ngakukure kuburikidza nenjere, kugadzirira, kubatsirana netariro.",

      DISCERNMENT:
        "Kunzwisisa kwakadzama ngakusiyanise humbowo nekusaziva uye njere nekutya."

    }

  };

  const CLOSINGS = {

    en: [
      "May peace remain with this family as the moment closes.",
      "Let gratitude remain, let wisdom continue, and let peace guide the next step.",
      "We close with truth, unity, courage and hope.",
      "May the good intention of this moment continue through wise action.",
      "The prayer closes, but care, remembrance and peaceful action continue."
    ],

    sn: [
      "Rugare ngarurambe ruri nemhuri iyi sezvo nguva ino ichivharwa.",
      "Kutenda ngakurambe kuripo, njere ngadzienderere mberi, uye rugare rutungamirire danho rinotevera.",
      "Tinopedzisa nechokwadi, kubatana, ushingi netariro.",
      "Chinangwa chakanaka chenguva ino ngachienderere mberi kuburikidza nezviito zvine njere.",
      "Munamato wapera, asi rudo, kurangarira nezviito zverugare zvinoenderera mberi."
    ]

  };

  /* ================================================================
     11. SACRED ANCHORS
     ================================================================ */

  function sacredAnchor(
    language
  ) {

    if (
      !state.settings.preserveSacredAnchors
    ) {
      return "";
    }

    if (
      language === "sn"
    ) {

      return (
        "Mwari ndiMwari. " +
        "Mudzimu Unoyera. "
      );
    }

    return (
      "Mwari ndiMwari. " +
      "Mudzimu Unoyera. "
    );
  }

  /* ================================================================
     12. TEMPLATE FILLING
     ================================================================ */

  function fill(
    template,
    person
  ) {

    return template
      .replace(
        /\{person\}/g,
        referenceFor(person)
      );
  }

  /* ================================================================
     13. NOVELTY ENGINE
     ================================================================ */

  function noveltyScore(
    text
  ) {

    const current =
      new Set(
        safe(text)
          .toLowerCase()
          .split(/\W+/)
          .filter(
            word =>
              word.length > 2
          )
      );

    if (
      !current.size
    ) {
      return 1;
    }

    let highest =
      0;

    state.recentPrayerHashes
      .forEach(record => {

        if (
          !record.text
        ) {
          return;
        }

        const previous =
          new Set(
            record.text
              .toLowerCase()
              .split(/\W+/)
              .filter(
                word =>
                  word.length > 2
              )
          );

        if (
          !previous.size
        ) {
          return;
        }

        let hits = 0;

        current.forEach(word => {

          if (
            previous.has(word)
          ) {
            hits++;
          }

        });

        const similarity =
          hits /
          Math.max(
            1,
            Math.min(
              current.size,
              previous.size
            )
          );

        highest =
          Math.max(
            highest,
            similarity
          );
      });

    return (
      1 - highest
    );
  }

  function rememberPrayer(
    person,
    text,
    themes
  ) {

    state.recentPrayerHashes
      .unshift({
        hash:
          hash(text),

        text,

        personKey:
          person.personKey,

        timestamp:
          now(),

        themes:
          themes.slice()
      });

    state.recentPrayerHashes =
      state.recentPrayerHashes
        .slice(
          0,
          state.settings.maxRecentHashes
        );

    themes.forEach(
      theme =>
        state.recentThemes.unshift(theme)
    );

    state.recentThemes =
      state.recentThemes
        .slice(
          0,
          state.settings.maxRecentThemes
        );

    state.recentPersons.unshift(
      person.personKey
    );

    state.recentPersons =
      state.recentPersons
        .slice(
          0,
          state.settings.maxRecentPersons
        );
  }

  /* ================================================================
     14. PERSON PRAYER GENERATOR
     ================================================================ */

  function generatePersonPrayer(
    person,
    options = {}
  ) {

    if (
      !person
    ) {
      return {
        ok: false,
        error:
          "No person supplied."
      };
    }

    if (
      state.settings.requireApprovedPerson &&
      !state.approvedPeople.has(
        person.personKey
      )
    ) {

      state.statistics.skippedPeople++;

      return {
        ok: false,
        skipped: true,
        reason:
          "Person is not approved for audio."
      };
    }

    const language =
      resolveLanguage(
        person,
        options
      );

    const themes =
      resolveThemes(
        person,
        options
      );

    const openingPack =
      OPENINGS[language] ||
      OPENINGS.en;

    const personPack =
      PERSON_LINES[language] ||
      PERSON_LINES.en;

    const themePack =
      THEME_LINES[language] ||
      THEME_LINES.en;

    const closingPack =
      CLOSINGS[language] ||
      CLOSINGS.en;

    const personRef =
      referenceFor(
        person,
        options.privacyMode
      );

    let opening =
      choose(
        openingPack,
        Date.now() +
        person.personKey.length
      );

    let personLine =
      choose(
        personPack,
        Date.now() +
        person.displayName.length
      );

    personLine =
      fill(
        personLine,
        person
      );

    const themeLines =
      themes
        .map(
          theme =>
            themePack[theme]
        )
        .filter(Boolean);

    const selectedThemeLines =
      themeLines.slice(
        0,
        Math.min(
          4,
          themeLines.length
        )
      );

    let closing =
      choose(
        closingPack,
        Date.now() +
        themes.length
      );

    const anchor =
      sacredAnchor(
        language
      );

    let body = [

      anchor,

      opening,

      `We hold ${personRef} in a sincere intention of peace, wisdom, dignity and protection.`,

      personLine,

      ...selectedThemeLines,

      closing

    ]
      .filter(Boolean)
      .join(" ");

    let novelty =
      noveltyScore(body);

    let attempts = 0;

    while (
      novelty <
        state.settings.minimumNovelty &&
      attempts < 8
    ) {

      attempts++;

      state.statistics
        .noveltyRegenerations++;

      opening =
        choose(
          openingPack,
          Date.now() +
          attempts * 17
        );

      personLine =
        choose(
          personPack,
          Date.now() +
          attempts * 31
        );

      personLine =
        fill(
          personLine,
          person
        );

      closing =
        choose(
          closingPack,
          Date.now() +
          attempts * 43
        );

      const rotatedThemes =
        resolveThemes(
          person,
          {
            ...options,
            themes:
              themes
                .slice()
                .reverse()
          }
        );

      const rotatedLines =
        rotatedThemes
          .map(
            theme =>
              themePack[theme]
          )
          .filter(Boolean)
          .slice(0, 4);

      body = [

        anchor,

        opening,

        `We hold ${personRef} in a sincere intention of peace, wisdom, dignity and protection.`,

        personLine,

        ...rotatedLines,

        closing

      ]
        .filter(Boolean)
        .join(" ");

      novelty =
        noveltyScore(
          body
        );
    }

    const record = {

      prayerId:
        uid("PRAYER"),

      personKey:
        person.personKey,

      personReference:
        personRef,

      language,

      traditionMode:
        person.traditionMode,

      themes,

      text:
        body,

      novelty:
        Number(
          novelty.toFixed(4)
        ),

      generationAttempts:
        attempts,

      generatedAt:
        now(),

      contentHash:
        hash(body),

      privacyMode:
        person.privacyMode,

      provenance:
        "ORIGINAL_CHIROMBE_DEVOTIONAL",

      disclaimer:
        "Devotional material generated for user-directed spiritual practice; not presented as a verified quotation."
    };

    rememberPrayer(
      person,
      body,
      themes
    );

    state.statistics.personPrayers++;

    emit(
      "PERSON_PRAYER_GENERATED",
      {
        prayerId:
          record.prayerId,

        personKey:
          person.personKey,

        themes,

        novelty:
          record.novelty
      }
    );

    return {
      ok: true,
      prayer:
        record
    };
  }

  /* ================================================================
     15. PERSON LOOKUP
     ================================================================ */

  function getPerson(
    personKey
  ) {

    return clone(
      state.people.get(
        personKey
      ) || null
    );
  }

  /* ================================================================
     16. NEXT PERSON SELECTION
     ================================================================ */

  function chooseNextPerson(
    options = {}
  ) {

    const people =
      [...state.people.values()]
        .filter(
          person =>
            person.consent &&
            (
              !state.settings
                .requireApprovedPerson ||
              person.approved
            )
        );

    if (
      !people.length
    ) {
      return null;
    }

    const excluded =
      new Set(
        arr(
          options.exclude
        )
      );

    const candidates =
      people.filter(
        person =>
          !excluded.has(
            person.personKey
          )
      );

    const pool =
      candidates.length
        ? candidates
        : people;

    /*
     * Prefer people who have not recently received a prayer.
     */
    const sorted =
      pool.slice().sort(
        (a, b) => {

          const ai =
            state.recentPersons
              .indexOf(
                a.personKey
              );

          const bi =
            state.recentPersons
              .indexOf(
                b.personKey
              );

          const av =
            ai === -1
              ? -1
              : ai;

          const bv =
            bi === -1
              ? -1
              : bi;

          return bv - av;
        }
      );

    return sorted[0] ||
      pool[0];
  }

  /* ================================================================
     17. COVERAGE TRACKING
     ================================================================ */

  function updateCoverage(
    person,
    prayer
  ) {

    if (
      !person ||
      !prayer
    ) {
      return;
    }

    const previous =
      state.coverage.get(
        person.personKey
      ) ||
      {
        personKey:
          person.personKey,

        prayerCount:
          0,

        lastPrayer:
          null,

        totalDuration:
          0,

        themes:
          [],

        languages:
          [],

        hashes:
          []
      };

    previous.prayerCount++;

    previous.lastPrayer =
      prayer.generatedAt;

    previous.themes =
      unique([
        ...previous.themes,
        ...prayer.themes
      ]).slice(-50);

    previous.languages =
      unique([
        ...previous.languages,
        prayer.language
      ]);

    previous.hashes.unshift(
      prayer.contentHash
    );

    previous.hashes =
      previous.hashes.slice(
        0,
        50
      );

    state.coverage.set(
      person.personKey,
      previous
    );
  }

  function getCoverage(
    personKey
  ) {

    if (
      personKey
    ) {

      return clone(
        state.coverage.get(
          personKey
        ) || null
      );
    }

    return clone(
      Object.fromEntries(
        state.coverage.entries()
      )
    );
  }

  /* ================================================================
     18. PERSON SESSION
     ================================================================ */

  function createPersonSession(
    personKey,
    options = {}
  ) {

    let person =
      state.people.get(
        personKey
      );

    if (
      !person
    ) {

      refreshBloodline();

      person =
        state.people.get(
          personKey
        );
    }

    if (
      !person
    ) {
      return {
        ok: false,
        error:
          "Person not found in approved/available bloodline data."
      };
    }

    state.state =
      STATES.PLANNING;

    const generated =
      generatePersonPrayer(
        person,
        options
      );

    if (
      !generated.ok
    ) {
      return generated;
    }

    const prayer =
      generated.prayer;

    const session = {

      sessionId:
        uid("SESSION"),

      mode:
        SESSION_MODES.PERSON,

      personKeys:
        [person.personKey],

      currentPersonIndex:
        0,

      language:
        prayer.language,

      durationMinutes:
        clamp(
          options.duration ||
          person.preferredDuration,
          1,
          180
        ),

      sections: [

        {
          type:
            "PERSON_PRAYER",

          personKey:
            person.personKey,

          prayerId:
            prayer.prayerId,

          text:
            prayer.text,

          themes:
            prayer.themes
        }

      ],

      createdAt:
        now(),

      sourceRevision:
        state.sourceRevision,

      status:
        "READY"
    };

    updateCoverage(
      person,
      prayer
    );

    state.sessions.set(
      session.sessionId,
      session
    );

    state.statistics.sessionsCreated++;

    state.activeSession =
      session.sessionId;

    persist();

    emit(
      "PERSON_SESSION_CREATED",
      {
        sessionId:
          session.sessionId,

        personKey:
          person.personKey,

        prayerId:
          prayer.prayerId
      }
    );

    return {
      ok: true,
      session:
        clone(session)
    };
  }

  /* ================================================================
     19. FAMILY ORDERING
     ================================================================ */

  function orderFamily(
    people,
    options = {}
  ) {

    let ordered =
      people.slice();

    const mode =
      options.order ||
      "BALANCED";

    if (
      mode === "SOURCE"
    ) {
      return ordered;
    }

    if (
      mode === "NAME"
    ) {

      return ordered.sort(
        (a, b) =>
          a.displayName.localeCompare(
            b.displayName
          )
      );
    }

    if (
      mode === "GENERATION"
    ) {

      return ordered.sort(
        (a, b) =>
          safe(a.generation)
            .localeCompare(
              safe(b.generation)
            )
      );
    }

    /*
     * BALANCED:
     * recently prayed people move toward the end.
     */

    return ordered.sort(
      (a, b) => {

        const ai =
          state.recentPersons
            .indexOf(
              a.personKey
            );

        const bi =
          state.recentPersons
            .indexOf(
              b.personKey
            );

        const av =
          ai === -1
            ? 9999
            : ai;

        const bv =
          bi === -1
            ? 9999
            : bi;

        return bv - av;
      }
    );
  }

  /* ================================================================
     20. WHOLE BLOODLINE SESSION
     ================================================================ */

  function createBloodlineSession(
    options = {}
  ) {

    refreshBloodline();

    let people =
      [...state.people.values()]
        .filter(
          person =>
            person.consent &&
            (
              !state.settings
                .requireApprovedPerson ||
              person.approved
            )
        );

    if (
      options.personKeys &&
      Array.isArray(
        options.personKeys
      )
    ) {

      const requested =
        new Set(
          options.personKeys
        );

      people =
        people.filter(
          person =>
            requested.has(
              person.personKey
            )
        );
    }

    if (
      options.excludePersonKeys
    ) {

      const excluded =
        new Set(
          options.excludePersonKeys
        );

      people =
        people.filter(
          person =>
            !excluded.has(
              person.personKey
            )
        );
    }

    people =
      orderFamily(
        people,
        options
      );

    if (
      !people.length
    ) {

      return {
        ok: false,
        error:
          "No eligible family members were available."
      };
    }

    state.state =
      STATES.PLANNING;

    const sections = [];

    const openingLanguage =
      options.language ||
      state.settings.defaultLanguage;

    sections.push({

      type:
        "ARRIVAL",

      text:
        (
          openingLanguage === "sn"
            ? "Ngatipinde pamwe chete murugare, kutenda nekubatana."
            : "Let us enter this family moment together in peace, gratitude and unity."
        ),

      themes: [
        "FAMILY",
        "UNITY",
        "PEACE"
      ]
    });

    sections.push({

      type:
        "SACRED_ANCHOR",

      text:
        sacredAnchor(
          openingLanguage
        ),

      themes: [
        "FAITH",
        "TRUTH"
      ]
    });

    const generatedPeople =
      [];

    people.forEach(
      person => {

        const generated =
          generatePersonPrayer(
            person,
            {
              ...options,
              language:
                options.language ||
                person.preferredLanguage
            }
          );

        if (
          !generated.ok
        ) {

          state.statistics
            .skippedPeople++;

          return;
        }

        generatedPeople.push(
          generated.prayer
        );

        sections.push({

          type:
            "PERSON_PRAYER",

          personKey:
            person.personKey,

          displayReference:
            referenceFor(
              person,
              options.privacyMode
            ),

          prayerId:
            generated.prayer.prayerId,

          text:
            generated.prayer.text,

          themes:
            generated.prayer.themes
        });

        updateCoverage(
          person,
          generated.prayer
        );
      }
    );

    sections.push({

      type:
        "FAMILY_UNITY",

      text:
        openingLanguage === "sn"
          ? "Mhuri ngaibatane muchokwadi, murugare, nemoyo murefu. Zvakanaka ngazvichengetedzwe uye zvipfuudzwe nekuchenjera."
          : "May this family remain connected through truth, peace and patience. May what is good be preserved and carried forward with wisdom.",

      themes: [
        "FAMILY_UNITY",
        "TRUTH",
        "CONTINUITY"
      ]
    });

    sections.push({

      type:
        "INTERCESSION",

      text:
        openingLanguage === "sn"
          ? "Tinonamatira mhuri yose kuti iwane njere, ushingi, rugare, rudo uye nzira dzakanaka dzekufamba nadzo."
          : "We hold the whole family in an intention for wisdom, courage, peace, love and constructive paths forward.",

      themes: [
        "WISDOM",
        "COURAGE",
        "PEACE",
        "LOVE"
      ]
    });

    sections.push({

      type:
        "CLOSING",

      text:
        choose(
          CLOSINGS[
            openingLanguage
          ] ||
          CLOSINGS.en,
          Date.now()
        ),

      themes: [
        "GRATITUDE",
        "PEACE",
        "HOPE"
      ]
    });

    const session = {

      sessionId:
        uid("BLOODLINE"),

      mode:
        SESSION_MODES.BLOODLINE,

      personKeys:
        people.map(
          person =>
            person.personKey
        ),

      coveredPersonKeys:
        generatedPeople.map(
          prayer =>
            prayer.personKey
        ),

      sections,

      durationMinutes:
        clamp(
          options.duration ||
          (
            5 +
            people.length * 2
          ),
          1,
          240
        ),

      language:
        openingLanguage,

      createdAt:
        now(),

      sourceRevision:
        state.sourceRevision,

      status:
        "READY",

      coverage:

        people.length
          ? generatedPeople.length /
            people.length
          : 0,

      privacyMode:
        options.privacyMode ||
        state.settings.defaultPrivacy,

      provenance:
        "ORIGINAL_CHIROMBE_DEVOTIONAL_ORCHESTRATION"
    };

    state.sessions.set(
      session.sessionId,
      session
    );

    state.statistics.sessionsCreated++;
    state.statistics.familySessions++;

    state.activeSession =
      session.sessionId;

    state.state =
      STATES.READY;

    persist();

    emit(
      "BLOODLINE_SESSION_CREATED",
      {
        sessionId:
          session.sessionId,

        people:
          people.length,

        covered:
          generatedPeople.length,

        coverage:
          session.coverage
      }
    );

    return {
      ok: true,
      session:
        clone(session)
    };
  }

  /* ================================================================
     21. FAMILY COVERAGE REPORT
     ================================================================ */

  function coverageReport() {

    const people =
      [...state.people.values()];

    const rows =
      people.map(
        person => {

          const coverage =
            state.coverage.get(
              person.personKey
            );

          return {

            personKey:
              person.personKey,

            reference:
              referenceFor(
                person
              ),

            prayerCount:
              coverage?.prayerCount ||
              0,

            lastPrayer:
              coverage?.lastPrayer ||
              null,

            themes:
              coverage?.themes ||
              [],

            languages:
              coverage?.languages ||
              [],

            consent:
              person.consent,

            approved:
              person.approved
          };
        }
      );

    const covered =
      rows.filter(
        row =>
          row.prayerCount > 0
      ).length;

    const eligible =
      rows.filter(
        row =>
          row.consent
      ).length;

    return {

      totalPeople:
        rows.length,

      eligiblePeople:
        eligible,

      coveredPeople:
        covered,

      coverageRatio:
        eligible
          ? Number(
              (
                covered /
                eligible
              ).toFixed(4)
            )
          : 0,

      people:
        rows
    };
  }

  /* ================================================================
     22. ADAPTIVE NEXT PRAYER
     ================================================================ */

  function generateAdaptivePersonPrayer(
    options = {}
  ) {

    const person =
      options.personKey
        ? state.people.get(
            options.personKey
          )
        : chooseNextPerson(
            options
          );

    if (
      !person
    ) {

      return {
        ok: false,
        error:
          "No eligible person is available."
      };
    }

    const themes =
      resolveThemes(
        person,
        options
      );

    const result =
      generatePersonPrayer(
        person,
        {
          ...options,
          themes
        }
      );

    if (
      result.ok
    ) {

      updateCoverage(
        person,
        result.prayer
      );

      persist();
    }

    return result;
  }

  /* ================================================================
     23. AUDIO BROADCAST INTEGRATION
     ================================================================ */

  function broadcastPrayer(
    prayer,
    options = {}
  ) {

    if (
      !prayer
    ) {
      return {
        ok: false,
        error:
          "No prayer supplied."
      };
    }

    const payload = {

      type:
        "PERSON_BLESSING",

      priority:
        options.priority ||
        "NORMAL",

      personKey:
        prayer.personKey,

      prayerId:
        prayer.prayerId,

      language:
        prayer.language,

      text:
        prayer.text,

      themes:
        prayer.themes,

      duration:
        options.duration ||
        0,

      provenance:
        prayer.provenance,

      contentHash:
        prayer.contentHash
    };

    try {

      if (
        typeof AUDIO.queueBroadcast ===
        "function"
      ) {

        AUDIO.queueBroadcast(
          payload
        );

      } else if (
        typeof AUDIO.emit ===
        "function"
      ) {

        AUDIO.emit(
          "BLOODLINE_PRAYER_READY",
          payload
        );
      }

    } catch (error) {

      state.statistics.errors++;

      emit(
        "BLOODLINE_BROADCAST_ERROR",
        {
          error:
            error?.message ||
            String(error)
        }
      );

      return {
        ok: false,
        error:
          error?.message ||
          String(error)
      };
    }

    emit(
      "BLOODLINE_PRAYER_BROADCAST",
      payload
    );

    return {
      ok: true,
      payload
    };
  }

  /* ================================================================
     24. GENERATE + BROADCAST
     ================================================================ */

  function generateAndBroadcast(
    options = {}
  ) {

    const result =
      generateAdaptivePersonPrayer(
        options
      );

    if (
      !result.ok
    ) {
      return result;
    }

    const broadcast =
      broadcastPrayer(
        result.prayer,
        options
      );

    return {
      ok:
        broadcast.ok,

      prayer:
        result.prayer,

      broadcast
    };
  }

  /* ================================================================
     25. SESSION PROGRESSION
     ================================================================ */

  function getSession(
    sessionId
  ) {

    return clone(
      state.sessions.get(
        sessionId
      ) || null
    );
  }

  function completeSession(
    sessionId
  ) {

    const session =
      state.sessions.get(
        sessionId
      );

    if (
      !session
    ) {
      return {
        ok: false,
        error:
          "Session not found."
      };
    }

    session.status =
      "COMPLETED";

    session.completedAt =
      now();

    state.statistics
      .sessionsCompleted++;

    if (
      state.activeSession ===
      sessionId
    ) {
      state.activeSession =
        null;
    }

    state.state =
      STATES.COMPLETED;

    persist();

    emit(
      "BLOODLINE_SESSION_COMPLETED",
      {
        sessionId
      }
    );

    return {
      ok: true,
      session:
        clone(session)
    };
  }

  function pauseSession(
    sessionId
  ) {

    const session =
      state.sessions.get(
        sessionId
      );

    if (
      !session
    ) {
      return {
        ok: false,
        error:
          "Session not found."
      };
    }

    session.status =
      "PAUSED";

    session.pausedAt =
      now();

    state.state =
      STATES.PAUSED;

    persist();

    emit(
      "BLOODLINE_SESSION_PAUSED",
      {
        sessionId
      }
    );

    return {
      ok: true,
      session:
        clone(session)
    };
  }

  /* ================================================================
     26. PERSISTENCE
     ================================================================ */

  function serialise() {

    return {

      version:
        VERSION,

      state:
        state.state,

      sourceRevision:
        state.sourceRevision,

      coverage:
        [...state.coverage.values()],

      recentPrayerHashes:
        state.recentPrayerHashes
          .slice(
            0,
            state.settings.maxRecentHashes
          ),

      recentThemes:
        state.recentThemes
          .slice(
            0,
            state.settings.maxRecentThemes
          ),

      recentPersons:
        state.recentPersons
          .slice(
            0,
            state.settings.maxRecentPersons
          ),

      statistics:
        state.statistics,

      settings:
        state.settings,

      savedAt:
        now()
    };
  }

  function persist() {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          serialise()
        )
      );

      if (
        typeof AUDIO.remember ===
        "function"
      ) {

        AUDIO.remember(
          MEMORY_NAMESPACE,
          {
            type:
              "BLOODLINE_ORCHESTRATOR_STATE",

            sourceRevision:
              state.sourceRevision,

            coverageCount:
              state.coverage.size,

            timestamp:
              now()
          }
        );
      }

      return true;

    } catch (error) {

      console.warn(
        "[CHIROMBE BLOODLINE AUDIO] Persistence failed",
        error
      );

      return false;
    }
  }

  function restore() {

    try {

      const raw =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (
        !raw
      ) {
        return false;
      }

      const data =
        JSON.parse(raw);

      if (
        !data
      ) {
        return false;
      }

      if (
        Array.isArray(
          data.coverage
        )
      ) {

        state.coverage =
          new Map(
            data.coverage.map(
              item =>
                [
                  item.personKey,
                  item
                ]
            )
          );
      }

      if (
        Array.isArray(
          data.recentPrayerHashes
        )
      ) {

        state.recentPrayerHashes =
          data.recentPrayerHashes
            .slice(
              0,
              state.settings.maxRecentHashes
            );
      }

      if (
        Array.isArray(
          data.recentThemes
        )
      ) {

        state.recentThemes =
          data.recentThemes
            .slice(
              0,
              state.settings.maxRecentThemes
            );
      }

      if (
        Array.isArray(
          data.recentPersons
        )
      ) {

        state.recentPersons =
          data.recentPersons
            .slice(
              0,
              state.settings.maxRecentPersons
            );
      }

      if (
        data.statistics
      ) {

        Object.assign(
          state.statistics,
          data.statistics
        );
      }

      if (
        Number.isFinite(
          data.sourceRevision
        )
      ) {

        state.sourceRevision =
          data.sourceRevision;
      }

      emit(
        "BLOODLINE_AUDIO_MEMORY_RESTORED",
        {
          coverage:
            state.coverage.size
        }
      );

      return true;

    } catch (error) {

      console.warn(
        "[CHIROMBE BLOODLINE AUDIO] Restore failed",
        error
      );

      return false;
    }
  }

  /* ================================================================
     27. EVENT SYSTEM
     ================================================================ */

  function emit(
    type,
    detail = {}
  ) {

    const payload = {

      type,

      timestamp:
        now(),

      module:
        MODULE_ID,

      version:
        VERSION,

      detail
    };

    try {

      if (
        AUDIO &&
        typeof AUDIO.emit ===
        "function"
      ) {

        AUDIO.emit(
          "BLOODLINE_ORCHESTRATOR_EVENT",
          payload
        );
      }

    } catch (_) {}

    try {

      root.dispatchEvent(
        new CustomEvent(
          "CHIROMBE_AUDIO_BLOODLINE_EVENT",
          {
            detail:
              payload
          }
        )
      );

    } catch (_) {}

    return payload;
  }

  /* ================================================================
     28. SYSTEM EVENT RESPONSE
     ================================================================ */

  function observeSystemEvent(
    event
  ) {

    const detail =
      event?.detail ||
      event ||
      {};

    const type =
      safe(
        detail.type ||
        detail.event ||
        detail.name
      ).toUpperCase();

    if (
      !type
    ) {
      return;
    }

    const relevant = [

      "LIVING_WATCH_STARTED",

      "FAMILY_UNITY",

      "BLOODLINE_LITURGY_READY",

      "RECOVERY_COMPLETED",

      "SYSTEM_HEALTH_RESTORED",

      "DAILY_LITURGY_REQUESTED"

    ];

    if (
      !relevant.includes(type)
    ) {
      return;
    }

    try {

      const result =
        generateAdaptivePersonPrayer({
          themes:
            detail.themes ||
            [],
          language:
            detail.language
        });

      if (
        result.ok
      ) {

        emit(
          "SYSTEM_EVENT_BLOODLINE_PRAYER_READY",
          {
            event:
              type,

            prayerId:
              result.prayer.prayerId,

            personKey:
              result.prayer.personKey
          }
        );
      }

    } catch (error) {

      state.statistics.errors++;

      emit(
        "BLOODLINE_EVENT_HANDLER_ERROR",
        {
          event:
            type,

          error:
            error?.message ||
            String(error)
        }
      );
    }
  }

  try {

    root.addEventListener(
      "CHIROMBE_AUDIO_EVENT",
      observeSystemEvent
    );

    root.addEventListener(
      "CHIROMBE_LIVING_WATCH_EVENT",
      observeSystemEvent
    );

  } catch (_) {}

  if (
    AUDIO &&
    typeof AUDIO.on ===
    "function"
  ) {

    try {

      AUDIO.on(
        "SYSTEM_EVENT_OBSERVED",
        observeSystemEvent
      );

    } catch (_) {}
  }

  /* ================================================================
     29. LIVING WATCH ROTATION
     ================================================================ */

  function livingWatchStep(
    options = {}
  ) {

    if (
      state.state ===
      STATES.SAFE_STOP
    ) {
      return {
        ok: false,
        stopped: true,
        reason:
          "Bloodline orchestrator is in SAFE_STOP."
      };
    }

    if (
      !state.people.size
    ) {
      refreshBloodline();
    }

    const result =
      generateAndBroadcast({
        ...options,

        exclude:
          options.exclude ||
          []
      });

    if (
      result.ok
    ) {

      emit(
        "LIVING_WATCH_BLOODLINE_STEP",
        {
          prayerId:
            result.prayer.prayerId,

          personKey:
            result.prayer.personKey,

          themes:
            result.prayer.themes
        }
      );
    }

    return result;
  }

  /* ================================================================
     30. SAFE STOP
     ================================================================ */

  function safeStop(
    reason = "Manual stop"
  ) {

    state.state =
      STATES.SAFE_STOP;

    state.activeSession =
      null;

    emit(
      "BLOODLINE_AUDIO_SAFE_STOP",
      {
        reason
      }
    );

    persist();

    return {
      ok: true,
      state:
        state.state,
      reason
    };
  }

  function resume() {

    if (
      state.state ===
      STATES.SAFE_STOP
    ) {

      state.state =
        STATES.READY;

      emit(
        "BLOODLINE_AUDIO_RESUMED",
        {}
      );

      return {
        ok: true
      };
    }

    return {
      ok: true,
      state:
        state.state
    };
  }

  /* ================================================================
     31. FULL STATUS
     ================================================================ */

  function getStatus() {

    return {

      module:
        MODULE_ID,

      version:
        VERSION,

      state:
        state.state,

      initialized:
        state.initialized,

      sourceRevision:
        state.sourceRevision,

      people:
        state.people.size,

      approvedPeople:
        state.approvedPeople.size,

      activeSession:
        state.activeSession,

      sessions:
        state.sessions.size,

      coverage:
        coverageReport(),

      statistics:
        clone(
          state.statistics
        ),

      settings:
        clone(
          state.settings
        ),

      timestamp:
        now()
    };
  }

  /* ================================================================
     32. PUBLIC API
     ================================================================ */

  const BLOODLINE = {

    MODULE_ID,

    VERSION,

    STATES,

    SESSION_MODES,

    PRIVACY_MODES,

    refresh:
      refreshBloodline,

    getPerson,

    listPeople:
      () =>
        [...state.people.values()]
          .map(clone),

    chooseNext:
      chooseNextPerson,

    generatePerson:
      generatePersonPrayer,

    generateAdaptive:
      generateAdaptivePersonPrayer,

    createPersonSession,

    createBloodlineSession,

    broadcast:
      broadcastPrayer,

    generateAndBroadcast,

    livingWatchStep,

    getSession,

    completeSession,

    pauseSession,

    safeStop,

    resume,

    getCoverage,

    coverageReport,

    persist,

    restore,

    getStatus
  };

  /* ================================================================
     33. CONNECT TO CHIROMBE NAMESPACE
     ================================================================ */

  window.CHIROMBE_AUDIO_BLOODLINE_ORCHESTRATOR =
    BLOODLINE;

  CHIROMBE.AudioBloodlineOrchestrator =
    BLOODLINE;

  root.CHIROMBE_AUDIO_BLOODLINE_ORCHESTRATOR =
    BLOODLINE;

  if (
    !CHIROMBE.AudioLivingLiturgy
  ) {
    CHIROMBE.AudioLivingLiturgy =
      {};
  }

  CHIROMBE.AudioLivingLiturgy.Bloodline =
    BLOODLINE;

  /* ================================================================
     34. LITURGY COMMANDS
     ================================================================ */

  if (
    LITURGY &&
    typeof LITURGY === "object"
  ) {

    LITURGY.commands =
      LITURGY.commands || {};

    LITURGY.commands[
      "audio.bloodline.refresh"
    ] =
      refreshBloodline;

    LITURGY.commands[
      "audio.bloodline.person"
    ] =
      args =>
        createPersonSession(
          args?.personKey,
          args
        );

    LITURGY.commands[
      "audio.bloodline.generate"
    ] =
      args =>
        generateAdaptivePersonPrayer(
          args || {}
        );

    LITURGY.commands[
      "audio.bloodline.broadcast"
    ] =
      args =>
        generateAndBroadcast(
          args || {}
        );

    LITURGY.commands[
      "audio.bloodline.session"
    ] =
      args =>
        createBloodlineSession(
          args || {}
        );

    LITURGY.commands[
      "audio.bloodline.coverage"
    ] =
      coverageReport;

    LITURGY.commands[
      "audio.bloodline.watch"
    ] =
      args =>
        livingWatchStep(
          args || {}
        );

    LITURGY.commands[
      "audio.bloodline.stop"
    ] =
      args =>
        safeStop(
          args?.reason ||
          "Commanded safe stop"
        );

    LITURGY.commands[
      "audio.bloodline.resume"
    ] =
      resume;

  }

  /* ================================================================
     35. AUDIO QUEUE INTEGRATION
     ================================================================ */

  function queueSession(
    sessionId,
    options = {}
  ) {

    const session =
      state.sessions.get(
        sessionId
      );

    if (
      !session
    ) {

      return {
        ok: false,
        error:
          "Session not found."
      };
    }

    let queued =
      0;

    session.sections
      .forEach(
        section => {

          if (
            !section.text
          ) {
            return;
          }

          const payload = {

            type:
              section.type,

            sessionId,

            personKey:
              section.personKey ||
              null,

            text:
              section.text,

            language:
              session.language,

            themes:
              section.themes ||
              [],

            provenance:
              "CHIROMBE_ORCHESTRATED",

            priority:
              options.priority ||
              "NORMAL"
          };

          try {

            if (
              typeof AUDIO.queueBroadcast ===
              "function"
            ) {

              AUDIO.queueBroadcast(
                payload
              );

              queued++;

            } else if (
              typeof AUDIO.emit ===
              "function"
            ) {

              AUDIO.emit(
                "BLOODLINE_SECTION_READY",
                payload
              );

              queued++;
            }

          } catch (error) {

            state.statistics.errors++;

            emit(
              "BLOODLINE_SECTION_QUEUE_ERROR",
              {
                sessionId,
                error:
                  error?.message ||
                  String(error)
              }
            );
          }
        }
      );

    emit(
      "BLOODLINE_SESSION_QUEUED",
      {
        sessionId,
        queued
      }
    );

    return {
      ok: true,
      queued
    };
  }

  BLOODLINE.queueSession =
    queueSession;

  if (
    LITURGY &&
    LITURGY.commands
  ) {

    LITURGY.commands[
      "audio.bloodline.queue"
    ] =
      args =>
        queueSession(
          args?.sessionId,
          args || {}
        );
  }

  /* ================================================================
     36. INITIALISATION
     ================================================================ */

  function initialise() {

    if (
      state.initialized
    ) {
      return;
    }

    restore();

    refreshBloodline();

    state.initialized =
      true;

    state.state =
      STATES.READY;

    emit(
      "BLOODLINE_AUDIO_ORCHESTRATOR_READY",
      getStatus()
    );

    console.info(
      "[CHIROMBE AUDIO] Bloodline Prayer Orchestrator ready.",
      getStatus()
    );
  }

  /* ================================================================
     37. START
     ================================================================ */

  initialise();

})();
/* ================================================================
   CHIROMBE AUDIO LIVING LITURGY
   PART 5 — TONAL / FREQUENCY / DRONE / HARMONIC ENGINE
   ================================================================

   PURPOSE
   -------
   Creates the actual computational sound layer beneath the
   CHIROMBE Living Liturgy system.

   CAPABILITIES
   ------------
   • Oscillator synthesis
   • Harmonic stacks
   • Drone generation
   • Frequency scenes
   • Slow frequency sweeps
   • Amplitude modulation
   • Rhythmic pulses
   • Audible frequency validation
   • Nyquist protection
   • Master gain control
   • Envelope control
   • Voice ducking
   • Spectral analysis
   • Tone fingerprints
   • Scene transitions
   • Tone scheduling
   • Audio-resource cleanup
   • Safe stop
   • Hardware capability reporting
   • Frequency research metadata

   IMPORTANT
   ---------
   "Frequency" here means an audio signal unless explicitly marked
   otherwise.

   A normal phone speaker/headphone system cannot output arbitrary
   MHz/RF signals. Frequencies beyond the supported audio range are
   therefore represented as research/target metadata rather than
   falsely claimed to be physically emitted.

   This engine does not claim that a particular frequency scientifically
   repels supernatural entities or guarantees spiritual protection.

   It provides a controllable sound environment for devotional,
   reflective, symbolic and technical purposes.

   ================================================================ */

(() => {
  "use strict";

  const root = window;

  const CHIROMBE =
    root.CHIROMBE ||
    (root.CHIROMBE = {});

  const AUDIO =
    root.CHIROMBE_AUDIO ||
    (CHIROMBE.AudioLivingLiturgy =
      CHIROMBE.AudioLivingLiturgy || {});

  const BLOODLINE =
    root.CHIROMBE_AUDIO_BLOODLINE_ORCHESTRATOR ||
    CHIROMBE.AudioBloodlineOrchestrator ||
    {};

  const MODULE_ID =
    "CHIROMBE_AUDIO_TONAL_ENGINE";

  const VERSION =
    "5.0.0";

  /* ================================================================
     1. STATES
     ================================================================ */

  const STATES = Object.freeze({

    DORMANT:
      "DORMANT",

    READY:
      "READY",

    INITIALISING:
      "INITIALISING",

    PLAYING:
      "PLAYING",

    TRANSITIONING:
      "TRANSITIONING",

    ANALYSING:
      "ANALYSING",

    PAUSED:
      "PAUSED",

    SAFE_STOP:
      "SAFE_STOP",

    UNSUPPORTED:
      "UNSUPPORTED",

    ERROR:
      "ERROR"

  });

  const FREQUENCY_CLASSES =
    Object.freeze({

      SUB_AUDIO:
        "SUB_AUDIO",

      AUDIBLE:
        "AUDIBLE",

      ULTRASONIC:
        "ULTRASONIC",

      RF_METADATA:
        "RF_METADATA",

      INVALID:
        "INVALID"

    });

  const WAVEFORMS =
    Object.freeze({

      SINE:
        "sine",

      TRIANGLE:
        "triangle",

      SQUARE:
        "square",

      SAWTOOTH:
        "sawtooth",

      CUSTOM:
        "custom"

    });

  const SCENES =
    Object.freeze({

      GROUNDING:
        "GROUNDING",

      REFLECTION:
        "REFLECTION",

      PROTECTION:
        "PROTECTION",

      GRATITUDE:
        "GRATITUDE",

      REMEMBRANCE:
        "REMEMBRANCE",

      UNITY:
        "UNITY",

      COURAGE:
        "COURAGE",

      PEACE:
        "PEACE",

      NIGHT_WATCH:
        "NIGHT_WATCH",

      DAWN:
        "DAWN",

      EVENING:
        "EVENING",

      SILENT_WATCH:
        "SILENT_WATCH",

      RECOVERY:
        "RECOVERY",

      ALERT:
        "ALERT",

      CLOSING:
        "CLOSING"

    });

  /* ================================================================
     2. DEFAULT CONFIGURATION
     ================================================================ */

  const CONFIG = {

    masterGain:
      0.22,

    maximumMasterGain:
      0.50,

    oscillatorGain:
      0.075,

    maximumOscillatorGain:
      0.16,

    defaultAttackMs:
      900,

    defaultReleaseMs:
      1400,

    maximumOscillators:
      16,

    maximumHarmonics:
      8,

    maximumDurationMs:
      60 * 60 * 1000,

    maximumSweepRate:
      20,

    defaultWaveform:
      WAVEFORMS.SINE,

    analysisFftSize:
      2048,

    smoothing:
      0.82,

    duckGain:
      0.20,

    safetyHeadroom:
      0.80,

    allowUltrasonicGeneration:
      false,

    allowExperimentalModulation:
      true,

    enableAnalysis:
      true,

    autoCleanup:
      true

  };

  /* ================================================================
     3. INTERNAL STATE
     ================================================================ */

  const state = {

    state:
      STATES.DORMANT,

    context:
      null,

    master:
      null,

    analyser:
      null,

    compressor:
      null,

    voiceDuck:
      null,

    activeNodes:
      new Map(),

    activeScenes:
      new Map(),

    scheduled:
      new Map(),

    toneHistory:
      [],

    sceneHistory:
      [],

    frequencyHistory:
      [],

    analysis:
      {

        rms:
          0,

        peak:
          0,

        spectralCentroid:
          0,

        dominantFrequency:
          0,

        timestamp:
          null

      },

    capabilities:
      {

        webAudio:
          false,

        oscillator:
          false,

        analyser:
          false,

        speechSynthesis:
          "speechSynthesis" in root,

        audioWorklet:
          false,

        sampleRate:
          null,

        channelCount:
          null,

        maxAudibleFrequency:
          null

      },

    currentScene:
      null,

    currentFundamental:
      null,

    safeStopped:
      false,

    initialised:
      false

  };

  /* ================================================================
     4. UTILITIES
     ================================================================ */

  function now() {
    return new Date().toISOString();
  }

  function uid(prefix = "TON") {

    return (
      prefix +
      "_" +
      Date.now().toString(36) +
      "_" +
      Math.random()
        .toString(36)
        .slice(2, 9)
    );
  }

  function number(
    value,
    fallback = 0
  ) {

    const n =
      Number(value);

    return Number.isFinite(n)
      ? n
      : fallback;
  }

  function clamp(
    value,
    min,
    max
  ) {

    return Math.min(
      max,
      Math.max(
        min,
        number(value, min)
      )
    );
  }

  function safe(value) {

    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return String(value).trim();
  }

  function hash(text) {

    const input =
      safe(text);

    let h =
      2166136261;

    for (
      let i = 0;
      i < input.length;
      i++
    ) {

      h ^=
        input.charCodeAt(i);

      h +=
        (h << 1) +
        (h << 4) +
        (h << 7) +
        (h << 8) +
        (h << 24);

      h >>>=
        0;
    }

    return h
      .toString(16)
      .padStart(8, "0");
  }

  function emit(
    type,
    detail = {}
  ) {

    const payload = {

      type,

      timestamp:
        now(),

      module:
        MODULE_ID,

      version:
        VERSION,

      detail

    };

    try {

      if (
        AUDIO &&
        typeof AUDIO.emit ===
        "function"
      ) {

        AUDIO.emit(
          "TONAL_ENGINE_EVENT",
          payload
        );
      }

    } catch (_) {}

    try {

      root.dispatchEvent(
        new CustomEvent(
          "CHIROMBE_AUDIO_TONAL_EVENT",
          {
            detail:
              payload
          }
        )
      );

    } catch (_) {}

    return payload;
  }

  /* ================================================================
     5. FREQUENCY CLASSIFICATION
     ================================================================ */

  function classifyFrequency(
    frequency,
    context = state.context
  ) {

    const hz =
      number(
        frequency,
        NaN
      );

    if (
      !Number.isFinite(hz) ||
      hz <= 0
    ) {

      return {
        class:
          FREQUENCY_CLASSES.INVALID,

        supported:
          false,

        frequencyHz:
          hz,

        reason:
          "Frequency must be greater than zero."
      };
    }

    const sampleRate =
      number(
        context?.sampleRate,
        44100
      );

    const nyquist =
      sampleRate / 2;

    if (
      hz < 20
    ) {

      return {

        class:
          FREQUENCY_CLASSES.SUB_AUDIO,

        supported:
          false,

        frequencyHz:
          hz,

        nyquist,

        reason:
          "Below conventional human-audible range."
      };
    }

    if (
      hz <=
      Math.min(
        20000,
        nyquist * 0.95
      )
    ) {

      return {

        class:
          FREQUENCY_CLASSES.AUDIBLE,

        supported:
          true,

        frequencyHz:
          hz,

        nyquist,

        reason:
          "Within normal audio generation range."
      };
    }

    if (
      hz <=
      nyquist
    ) {

      return {

        class:
          FREQUENCY_CLASSES.ULTRASONIC,

        supported:
          CONFIG.allowUltrasonicGeneration,

        frequencyHz:
          hz,

        nyquist,

        reason:
          "Above conventional audible range."
      };
    }

    /*
     * Frequencies beyond Nyquist cannot be represented directly by
     * the current digital audio context.
     */

    if (
      hz >=
      20000
    ) {

      return {

        class:
          FREQUENCY_CLASSES.RF_METADATA,

        supported:
          false,

        frequencyHz:
          hz,

        nyquist,

        reason:
          "Not directly representable as ordinary digital audio."
      };
    }

    return {

      class:
        FREQUENCY_CLASSES.INVALID,

      supported:
        false,

      frequencyHz:
        hz,

      nyquist
    };
  }

  /* ================================================================
     6. FREQUENCY SPECIFICATION
     ================================================================ */

  function createToneSpec(
    options = {}
  ) {

    const frequencyHz =
      number(
        options.frequencyHz ||
        options.frequency ||
        432
      );

    const classification =
      classifyFrequency(
        frequencyHz
      );

    const spec = {

      toneId:
        uid("TONE"),

      frequencyHz,

      classification:
        classification.class,

      supported:
        classification.supported,

      waveform:
        options.waveform ||
        CONFIG.defaultWaveform,

      amplitude:
        clamp(
          options.amplitude ??
          CONFIG.oscillatorGain,
          0,
          CONFIG.maximumOscillatorGain
        ),

      phase:
        number(
          options.phase,
          0
        ),

      attackMs:
        clamp(
          options.attackMs ??
          CONFIG.defaultAttackMs,
          1,
          30000
        ),

      releaseMs:
        clamp(
          options.releaseMs ??
          CONFIG.defaultReleaseMs,
          1,
          30000
        ),

      durationMs:
        clamp(
          options.durationMs ??
          10000,
          10,
          CONFIG.maximumDurationMs
        ),

      pan:
        clamp(
          options.pan ??
          0,
          -1,
          1
        ),

      modulationDepth:
        clamp(
          options.modulationDepth ??
          0,
          0,
          1
        ),

      modulationRateHz:
        clamp(
          options.modulationRateHz ??
          0,
          0,
          CONFIG.maximumSweepRate
        ),

      detuneCents:
        clamp(
          options.detuneCents ??
          0,
          -1200,
          1200
        ),

      purpose:
        safe(
          options.purpose
        ) ||
        "REFLECTION",

      provenance:
        safe(
          options.provenance
        ) ||
        "CHIROMBE_GENERATED",

      safetyLimit:
        clamp(
          options.safetyLimit ??
          CONFIG.maximumOscillatorGain,
          0,
          CONFIG.maximumOscillatorGain
        ),

      metadata:
        options.metadata || {}

    };

    spec.fingerprint =
      hash(
        JSON.stringify({
          frequencyHz:
            spec.frequencyHz,

          waveform:
            spec.waveform,

          amplitude:
            spec.amplitude,

          detuneCents:
            spec.detuneCents,

          modulationDepth:
            spec.modulationDepth,

          modulationRateHz:
            spec.modulationRateHz
        })
      );

    return spec;
  }

  /* ================================================================
     7. AUDIO CONTEXT INITIALISATION
     ================================================================ */

  async function initialiseAudio() {

    if (
      state.initialised &&
      state.context
    ) {

      return {
        ok: true,
        context:
          state.context
      };
    }

    state.state =
      STATES.INITIALISING;

    const AudioContextClass =
      root.AudioContext ||
      root.webkitAudioContext;

    const kernelAudio = root.CHIROMBE_AUDIO;
    let sharedContext = null;
    if (kernelAudio && typeof kernelAudio.createAudioContext === "function") {
      try { sharedContext = kernelAudio.createAudioContext(); } catch (error) { sharedContext = null; }
    }

    if (
      !sharedContext &&
      !AudioContextClass
    ) {

      state.state =
        STATES.UNSUPPORTED;

      state.capabilities.webAudio =
        false;

      emit(
        "TONAL_ENGINE_UNSUPPORTED",
        {
          reason:
            "Web Audio API unavailable."
        }
      );

      return {
        ok: false,
        error:
          "Web Audio API is unavailable."
      };
    }

    try {

      state.context =
        sharedContext ||
        new AudioContextClass();

      state.usesKernelContext =
        Boolean(sharedContext);

      const context =
        state.context;

      state.capabilities.webAudio =
        true;

      state.capabilities.oscillator =
        typeof context
          .createOscillator ===
        "function";

      state.capabilities.analyser =
        typeof context
          .createAnalyser ===
        "function";

      state.capabilities.audioWorklet =
        Boolean(
          context.audioWorklet
        );

      state.capabilities.sampleRate =
        context.sampleRate;

      state.capabilities.maxAudibleFrequency =
        Math.min(
          20000,
          context.sampleRate / 2
        );

      /*
       * Master routing:
       *
       * oscillator/source
       *       ↓
       * voice duck / gain
       *       ↓
       * master
       *       ↓
       * compressor
       *       ↓
       * analyser
       *       ↓
       * destination
       */

      state.master =
        context.createGain();

      state.master.gain.value =
        clamp(
          CONFIG.masterGain,
          0,
          CONFIG.maximumMasterGain
        );

      state.compressor =
        context.createDynamicsCompressor();

      state.compressor.threshold.value =
        -18;

      state.compressor.knee.value =
        20;

      state.compressor.ratio.value =
        4;

      state.compressor.attack.value =
        0.01;

      state.compressor.release.value =
        0.25;

      state.voiceDuck =
        context.createGain();

      state.voiceDuck.gain.value =
        1;

      if (
        state.capabilities.analyser
      ) {

        state.analyser =
          context.createAnalyser();

        state.analyser.fftSize =
          CONFIG.analysisFftSize;

        state.analyser.smoothingTimeConstant =
          CONFIG.smoothing;
      }

      state.voiceDuck.connect(
        state.master
      );

      state.master.connect(
        state.compressor
      );

      const toneBus =
        kernelAudio &&
        kernelAudio.buses &&
        kernelAudio.buses.TONE &&
        kernelAudio.buses.TONE.gain;

      const sink =
        toneBus ||
        context.destination;

      if (
        state.analyser
      ) {

        state.compressor.connect(
          state.analyser
        );

        state.analyser.connect(
          sink
        );

      } else {

        state.compressor.connect(
          sink
        );
      }

      state.state =
        STATES.READY;

      state.initialised =
        true;

      emit(
        "TONAL_ENGINE_READY",
        {
          sampleRate:
            context.sampleRate,

          maxAudibleFrequency:
            state.capabilities
              .maxAudibleFrequency
        }
      );

      return {
        ok: true,
        context
      };

    } catch (error) {

      state.state =
        STATES.ERROR;

      emit(
        "TONAL_ENGINE_INIT_ERROR",
        {
          error:
            error?.message ||
            String(error)
        }
      );

      return {
        ok: false,
        error:
          error?.message ||
          String(error)
      };
    }
  }

  /* ================================================================
     8. AUDIO CONTEXT UNLOCK
     ================================================================ */

  async function unlock() {

    const result =
      await initialiseAudio();

    if (
      !result.ok
    ) {
      return result;
    }

    try {

      if (
        state.context.state ===
        "suspended"
      ) {

        await state.context.resume();
      }

      emit(
        "TONAL_AUDIO_UNLOCKED",
        {
          contextState:
            state.context.state
        }
      );

      return {
        ok: true,

        state:
          state.context.state
      };

    } catch (error) {

      return {
        ok: false,
        error:
          error?.message ||
          String(error)
      };
    }
  }

  /* ================================================================
     9. SAFE AMPLITUDE
     ================================================================ */

  function safeAmplitude(
    amplitude
  ) {

    return clamp(
      amplitude,
      0,
      CONFIG.maximumOscillatorGain
    );
  }

  /* ================================================================
     10. CREATE OSCILLATOR
     ================================================================ */

  async function createOscillator(
    input = {}
  ) {

    const unlocked =
      await unlock();

    if (
      !unlocked.ok
    ) {
      return unlocked;
    }

    if (
      state.safeStopped
    ) {

      return {
        ok: false,
        error:
          "Tonal engine is in SAFE_STOP."
      };
    }

    const spec =
      createToneSpec(
        input
      );

    const classification =
      classifyFrequency(
        spec.frequencyHz
      );

    if (
      !classification.supported
    ) {

      emit(
        "TONAL_FREQUENCY_REJECTED",
        {
          frequencyHz:
            spec.frequencyHz,

          classification
        }
      );

      return {
        ok: false,

        error:
          classification.reason,

        classification,

        spec
      };
    }

    if (
      state.activeNodes.size >=
      CONFIG.maximumOscillators
    ) {

      return {
        ok: false,

        error:
          "Maximum simultaneous oscillators reached."
      };
    }

    const context =
      state.context;

    const oscillator =
      context.createOscillator();

    const gain =
      context.createGain();

    oscillator.type =
      spec.waveform;

    oscillator.frequency.setValueAtTime(
      spec.frequencyHz,
      context.currentTime
    );

    oscillator.detune.setValueAtTime(
      spec.detuneCents,
      context.currentTime
    );

    /*
     * Optional stereo panning.
     */

    let output =
      gain;

    let panner =
      null;

    if (
      typeof context.createStereoPanner ===
      "function"
    ) {

      panner =
        context.createStereoPanner();

      panner.pan.value =
        spec.pan;

      gain.connect(
        panner
      );

      output =
        panner;
    }

    output.connect(
      state.voiceDuck
    );

    /*
     * Start safely at zero gain and ramp up.
     */

    const startTime =
      context.currentTime;

    const attackSeconds =
      spec.attackMs / 1000;

    const releaseSeconds =
      spec.releaseMs / 1000;

    const amplitude =
      safeAmplitude(
        spec.amplitude
      );

    gain.gain.cancelScheduledValues(
      startTime
    );

    gain.gain.setValueAtTime(
      0,
      startTime
    );

    gain.gain.linearRampToValueAtTime(
      amplitude,
      startTime +
      attackSeconds
    );

    /*
     * Optional amplitude modulation.
     */

    let modulation =
      null;

    if (
      CONFIG.allowExperimentalModulation &&
      spec.modulationDepth > 0 &&
      spec.modulationRateHz > 0
    ) {

      modulation =
        context.createOscillator();

      const modulationGain =
        context.createGain();

      modulation.type =
        "sine";

      modulation.frequency.value =
        spec.modulationRateHz;

      modulationGain.gain.value =
        amplitude *
        spec.modulationDepth;

      modulation.connect(
        modulationGain
      );

      modulationGain.connect(
        gain.gain
      );

      modulation.start(
        startTime
      );
    }

    oscillator.start(
      startTime
    );

    const durationSeconds =
      spec.durationMs / 1000;

    const stopTime =
      startTime +
      durationSeconds;

    const record = {

      id:
        spec.toneId,

      spec,

      oscillator,

      gain,

      panner,

      modulation,

      startedAt:
        now(),

      startTime,

      stopTime,

      status:
        "PLAYING"

    };

    state.activeNodes.set(
      spec.toneId,
      record
    );

    state.toneHistory.unshift({

      toneId:
        spec.toneId,

      frequencyHz:
        spec.frequencyHz,

      waveform:
        spec.waveform,

      amplitude:
        spec.amplitude,

      purpose:
        spec.purpose,

      timestamp:
        now(),

      fingerprint:
        spec.fingerprint

    });

    state.toneHistory =
      state.toneHistory.slice(
        0,
        500
      );

    if (
      CONFIG.autoCleanup
    ) {

      window.setTimeout(
        () => {

          releaseOscillator(
            spec.toneId
          );

        },
        spec.durationMs
      );
    }

    emit(
      "TONAL_OSCILLATOR_STARTED",
      {
        toneId:
          spec.toneId,

        frequencyHz:
          spec.frequencyHz,

        purpose:
          spec.purpose
      }
    );

    return {

      ok: true,

      toneId:
        spec.toneId,

      spec,

      classification

    };
  }

  /* ================================================================
     11. RELEASE OSCILLATOR
     ================================================================ */

  function releaseOscillator(
    toneId
  ) {

    const record =
      state.activeNodes.get(
        toneId
      );

    if (
      !record
    ) {
      return false;
    }

    try {

      const context =
        state.context;

      const current =
        context.currentTime;

      const releaseSeconds =
        record.spec.releaseMs /
        1000;

      record.gain.gain.cancelScheduledValues(
        current
      );

      record.gain.gain.setValueAtTime(
        record.gain.gain.value,
        current
      );

      record.gain.gain.linearRampToValueAtTime(
        0,
        current +
        releaseSeconds
      );

      record.oscillator.stop(
        current +
        releaseSeconds +
        0.05
      );

      if (
        record.modulation
      ) {

        try {

          record.modulation.stop(
            current +
            releaseSeconds +
            0.05
          );

        } catch (_) {}
      }

      record.status =
        "RELEASING";

      window.setTimeout(
        () => {

          try {

            record.oscillator.disconnect();

          } catch (_) {}

          try {

            record.gain.disconnect();

          } catch (_) {}

          try {

            record.panner?.disconnect();

          } catch (_) {}

          try {

            record.modulation?.disconnect();

          } catch (_) {}

          state.activeNodes.delete(
            toneId
          );

          emit(
            "TONAL_OSCILLATOR_RELEASED",
            {
              toneId
            }
          );

        },
        record.spec.releaseMs + 100
      );

      return true;

    } catch (error) {

      state.activeNodes.delete(
        toneId
      );

      emit(
        "TONAL_RELEASE_ERROR",
        {
          toneId,

          error:
            error?.message ||
            String(error)
        }
      );

      return false;
    }
  }

  /* ================================================================
     12. STOP ALL OSCILLATORS
     ================================================================ */

  function stopAll(
    reason =
      "Manual tonal stop"
  ) {

    [
      ...state.activeNodes.keys()
    ].forEach(
      toneId =>
        releaseOscillator(
          toneId
        )
    );

    emit(
      "TONAL_ALL_STOPPED",
      {
        reason
      }
    );

    return {
      ok: true
    };
  }

  /* ================================================================
     13. HARMONIC GENERATOR
     ================================================================ */

  function harmonicFrequencies(
    fundamental,
    options = {}
  ) {

    const base =
      number(
        fundamental,
        432
      );

    const ratios =
      Array.isArray(
        options.ratios
      )
        ? options.ratios
        : [
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8
          ];

    return ratios
      .slice(
        0,
        CONFIG.maximumHarmonics
      )
      .map(
        ratio =>
          ({
            ratio:
              number(ratio, 1),

            frequencyHz:
              base *
              number(
                ratio,
                1
              )
          })
      )
      .filter(
        item =>
          item.frequencyHz > 0
      );
  }

  /* ================================================================
     14. HARMONIC STACK
     ================================================================ */

  async function playHarmonicStack(
    options = {}
  ) {

    const fundamental =
      number(
        options.frequencyHz ||
        options.fundamental ||
        432
      );

    const harmonics =
      harmonicFrequencies(
        fundamental,
        options
      );

    const results =
      [];

    for (
      let i = 0;
      i < harmonics.length;
      i++
    ) {

      const harmonic =
        harmonics[i];

      const amplitude =
        safeAmplitude(
          (
            number(
              options.amplitude,
              CONFIG.oscillatorGain
            ) /
            Math.sqrt(
              i + 1
            )
          )
        );

      const result =
        await createOscillator({

          frequencyHz:
            harmonic.frequencyHz,

          amplitude,

          waveform:
            options.waveform ||
            WAVEFORMS.SINE,

          durationMs:
            options.durationMs ||
            12000,

          attackMs:
            options.attackMs ||
            1000,

          releaseMs:
            options.releaseMs ||
            1600,

          pan:
            options.pan ||
            0,

          purpose:
            options.purpose ||
            "HARMONIC_REFLECTION",

          provenance:
            "CHIROMBE_HARMONIC_ENGINE",

          metadata: {

            fundamental,

            ratio:
              harmonic.ratio,

            harmonicIndex:
              i

          }

        });

      results.push(
        result
      );
    }

    emit(
      "TONAL_HARMONIC_STACK_STARTED",
      {
        fundamental,

        harmonics:
          harmonics.length
      }
    );

    return {
      ok:
        results.some(
          result =>
            result.ok
        ),

      fundamental,

      results
    };
  }

  /* ================================================================
     15. DRONE
     ================================================================ */

  async function playDrone(
    options = {}
  ) {

    const fundamental =
      number(
        options.frequencyHz ||
        options.fundamental ||
        128
      );

    const ratios =
      options.ratios ||
      [
        1,
        1.5,
        2
      ];

    const amplitudes =
      options.amplitudes ||
      [
        0.07,
        0.045,
        0.025
      ];

    const results =
      [];

    for (
      let i = 0;
      i < ratios.length;
      i++
    ) {

      results.push(
        await createOscillator({

          frequencyHz:
            fundamental *
            number(
              ratios[i],
              1
            ),

          amplitude:
            amplitudes[i] ||
            0.03,

          waveform:
            options.waveform ||
            WAVEFORMS.SINE,

          durationMs:
            options.durationMs ||
            30000,

          attackMs:
            options.attackMs ||
            2500,

          releaseMs:
            options.releaseMs ||
            3000,

          detuneCents:
            i === 0
              ? 0
              : (
                  i % 2 === 0
                    ? 3
                    : -3
                ),

          purpose:
            options.purpose ||
            "GROUNDING_DRONE",

          provenance:
            "CHIROMBE_DRONE_ENGINE"

        })
      );
    }

    state.currentFundamental =
      fundamental;

    emit(
      "TONAL_DRONE_STARTED",
      {
        fundamental,

        components:
          ratios.length
      }
    );

    return {
      ok:
        results.some(
          result =>
            result.ok
        ),

      fundamental,

      results
    };
  }

  /* ================================================================
     16. FREQUENCY SWEEP
     ================================================================ */

  async function playSweep(
    options = {}
  ) {

    const unlocked =
      await unlock();

    if (
      !unlocked.ok
    ) {
      return unlocked;
    }

    const startFrequency =
      number(
        options.startFrequency ||
        options.from ||
        220
      );

    const endFrequency =
      number(
        options.endFrequency ||
        options.to ||
        440
      );

    const durationMs =
      clamp(
        options.durationMs ||
        10000,
        100,
        CONFIG.maximumDurationMs
      );

    const startClass =
      classifyFrequency(
        startFrequency
      );

    const endClass =
      classifyFrequency(
        endFrequency
      );

    if (
      !startClass.supported ||
      !endClass.supported
    ) {

      return {

        ok: false,

        error:
          "Sweep endpoints are outside the supported audio range.",

        startClass,

        endClass

      };
    }

    const context =
      state.context;

    const oscillator =
      context.createOscillator();

    const gain =
      context.createGain();

    oscillator.type =
      options.waveform ||
      WAVEFORMS.SINE;

    const startTime =
      context.currentTime;

    const endTime =
      startTime +
      durationMs / 1000;

    oscillator.frequency.setValueAtTime(
      startFrequency,
      startTime
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(
        20,
        endFrequency
      ),
      endTime
    );

    gain.gain.setValueAtTime(
      0,
      startTime
    );

    gain.gain.linearRampToValueAtTime(
      safeAmplitude(
        options.amplitude ??
        CONFIG.oscillatorGain
      ),
      startTime +
      0.8
    );

    gain.gain.linearRampToValueAtTime(
      0,
      endTime
    );

    oscillator.connect(
      gain
    );

    gain.connect(
      state.voiceDuck
    );

    oscillator.start(
      startTime
    );

    oscillator.stop(
      endTime +
      0.05
    );

    const sweepId =
      uid("SWEEP");

    state.activeNodes.set(
      sweepId,
      {
        id:
          sweepId,

        oscillator,

        gain,

        startedAt:
          now(),

        status:
          "PLAYING",

        spec: {

          startFrequency,

          endFrequency,

          durationMs

        }

      }
    );

    window.setTimeout(
      () => {

        try {

          oscillator.disconnect();

        } catch (_) {}

        try {

          gain.disconnect();

        } catch (_) {}

        state.activeNodes.delete(
          sweepId
        );

      },
      durationMs + 200
    );

    emit(
      "TONAL_SWEEP_STARTED",
      {
        sweepId,

        startFrequency,

        endFrequency,

        durationMs
      }
    );

    return {

      ok: true,

      sweepId,

      startFrequency,

      endFrequency,

      durationMs

    };
  }

  /* ================================================================
     17. RHYTHMIC PULSE
     ================================================================ */

  async function playPulse(
    options = {}
  ) {

    const frequency =
      number(
        options.frequencyHz ||
        options.frequency ||
        220
      );

    const pulseRate =
      clamp(
        options.pulseRateHz ||
        options.rate ||
        2,
        0.1,
        20
      );

    const durationMs =
      clamp(
        options.durationMs ||
        10000,
        100,
        CONFIG.maximumDurationMs
      );

    const pulseDuration =
      1 /
      pulseRate;

    const pulseCount =
      Math.ceil(
        durationMs /
        1000 *
        pulseRate
      );

    const results =
      [];

    for (
      let i = 0;
      i < pulseCount;
      i++
    ) {

      const delay =
        i *
        pulseDuration *
        1000;

      const id =
        window.setTimeout(
          () => {

            createOscillator({

              frequencyHz:
                frequency,

              amplitude:
                options.amplitude ||
                0.05,

              attackMs:
                Math.min(
                  80,
                  pulseDuration *
                  250
                ),

              releaseMs:
                Math.min(
                  150,
                  pulseDuration *
                  350
                ),

              durationMs:
                Math.max(
                  80,
                  pulseDuration *
                  700
                ),

              purpose:
                options.purpose ||
                "RHYTHMIC_PULSE",

              provenance:
                "CHIROMBE_RHYTHM_ENGINE"

            });

          },
          delay
        );

      state.scheduled.set(
        String(id),
        {
          timeout:
            id,

          createdAt:
            now()
        }
      );
    }

    emit(
      "TONAL_PULSE_PATTERN_STARTED",
      {
        frequency,

        pulseRate,

        durationMs,

        pulseCount
      }
    );

    return {

      ok: true,

      frequency,

      pulseRate,

      durationMs,

      pulseCount

    };
  }

  /* ================================================================
     18. SCENE DEFINITIONS
     ================================================================ */

  const SCENE_DEFINITIONS = {

    [SCENES.GROUNDING]: {

      fundamental:
        128,

      harmonics:
        [1, 1.5, 2],

      durationMs:
        30000,

      purpose:
        "GROUNDING",

      amplitude:
        0.055

    },

    [SCENES.REFLECTION]: {

      fundamental:
        220,

      harmonics:
        [1, 1.5, 2],

      durationMs:
        30000,

      purpose:
        "REFLECTION",

      amplitude:
        0.045

    },

    [SCENES.PROTECTION]: {

      fundamental:
        256,

      harmonics:
        [1, 2, 3, 4],

      durationMs:
        25000,

      purpose:
        "PROTECTION",

      amplitude:
        0.045

    },

    [SCENES.GRATITUDE]: {

      fundamental:
        261.63,

      harmonics:
        [1, 1.25, 1.5, 2],

      durationMs:
        25000,

      purpose:
        "GRATITUDE",

      amplitude:
        0.04

    },

    [SCENES.REMEMBRANCE]: {

      fundamental:
        196,

      harmonics:
        [1, 1.5, 2],

      durationMs:
        35000,

      purpose:
        "REMEMBRANCE",

      amplitude:
        0.04

    },

    [SCENES.UNITY]: {

      fundamental:
        192,

      harmonics:
        [1, 1.25, 1.5, 2],

      durationMs:
        30000,

      purpose:
        "UNITY",

      amplitude:
        0.04

    },

    [SCENES.COURAGE]: {

      fundamental:
        220,

      harmonics:
        [1, 1.5, 2, 3],

      durationMs:
        22000,

      purpose:
        "COURAGE",

      amplitude:
        0.045

    },

    [SCENES.PEACE]: {

      fundamental:
        174,

      harmonics:
        [1, 1.5, 2],

      durationMs:
        35000,

      purpose:
        "PEACE",

      amplitude:
        0.035

    },

    [SCENES.NIGHT_WATCH]: {

      fundamental:
        110,

      harmonics:
        [1, 1.5, 2],

      durationMs:
        45000,

      purpose:
        "NIGHT_WATCH",

      amplitude:
        0.028

    },

    [SCENES.DAWN]: {

      fundamental:
        196,

      harmonics:
        [1, 1.25, 1.5, 2],

      durationMs:
        30000,

      purpose:
        "DAWN",

      amplitude:
        0.04

    },

    [SCENES.EVENING]: {

      fundamental:
        164.81,

      harmonics:
        [1, 1.5, 2],

      durationMs:
        35000,

      purpose:
        "EVENING",

      amplitude:
        0.032

    },

    [SCENES.SILENT_WATCH]: {

      fundamental:
        64,

      harmonics:
        [1],

      durationMs:
        45000,

      purpose:
        "SILENT_WATCH",

      amplitude:
        0.018

    },

    [SCENES.RECOVERY]: {

      fundamental:
        196,

      harmonics:
        [1, 1.5, 2],

      durationMs:
        20000,

      purpose:
        "RECOVERY",

      amplitude:
        0.035

    },

    [SCENES.ALERT]: {

      fundamental:
        440,

      harmonics:
        [1, 2],

      durationMs:
        4000,

      purpose:
        "ALERT",

      amplitude:
        0.035

    },

    [SCENES.CLOSING]: {

      fundamental:
        261.63,

      harmonics:
        [1, 1.5, 2],

      durationMs:
        22000,

      purpose:
        "CLOSING",

      amplitude:
        0.03

    }

  };

  /* ================================================================
     19. PLAY SCENE
     ================================================================ */

  async function playScene(
    sceneName,
    options = {}
  ) {

    const scene =
      SCENE_DEFINITIONS[
        sceneName
      ];

    if (
      !scene
    ) {

      return {
        ok: false,

        error:
          "Unknown tonal scene.",

        available:
          Object.keys(
            SCENE_DEFINITIONS
          )
      };
    }

    await stopScene(
      state.currentScene
    );

    state.state =
      STATES.TRANSITIONING;

    const durationMs =
      clamp(
        options.durationMs ||
        scene.durationMs,
        100,
        CONFIG.maximumDurationMs
      );

    const fundamental =
      number(
        options.frequencyHz ||
        scene.fundamental
      );

    const ratios =
      options.harmonics ||
      scene.harmonics;

    const result =
      await playHarmonicStack({

        frequencyHz:
          fundamental,

        ratios,

        durationMs,

        amplitude:
          options.amplitude ||
          scene.amplitude,

        purpose:
          options.purpose ||
          scene.purpose,

        waveform:
          options.waveform ||
          WAVEFORMS.SINE

      });

    state.currentScene =
      sceneName;

    state.currentFundamental =
      fundamental;

    state.sceneHistory.unshift({

      scene:
        sceneName,

      fundamental,

      durationMs,

      timestamp:
        now(),

      result:
        result.ok

    });

    state.sceneHistory =
      state.sceneHistory.slice(
        0,
        250
      );

    state.state =
      STATES.PLAYING;

    emit(
      "TONAL_SCENE_STARTED",
      {
        scene:
          sceneName,

        fundamental,

        durationMs,

        purpose:
          scene.purpose
      }
    );

    return {

      ok:
        result.ok,

      scene:
        sceneName,

      fundamental,

      durationMs,

      result

    };
  }

  /* ================================================================
     20. STOP SCENE
     ================================================================ */

  async function stopScene(
    sceneName
  ) {

    if (
      !sceneName
    ) {
      return {
        ok: true
      };
    }

    stopAll(
      "Scene transition"
    );

    state.activeScenes.delete(
      sceneName
    );

    emit(
      "TONAL_SCENE_STOPPED",
      {
        scene:
          sceneName
      }
    );

    return {
      ok: true
    };
  }

  /* ================================================================
     21. VOICE DUCKING
     ================================================================ */

  function setVoiceDuck(
    speaking
  ) {

    if (
      !state.voiceDuck ||
      !state.context
    ) {

      return {
        ok: false,
        error:
          "Tonal engine not initialised."
      };
    }

    const target =
      speaking
        ? CONFIG.duckGain
        : 1;

    const current =
      state.context.currentTime;

    state.voiceDuck.gain.cancelScheduledValues(
      current
    );

    state.voiceDuck.gain.setValueAtTime(
      state.voiceDuck.gain.value,
      current
    );

    state.voiceDuck.gain.linearRampToValueAtTime(
      target,
      current +
      0.25
    );

    emit(
      "TONAL_VOICE_DUCK_CHANGED",
      {
        speaking,
        target
      }
    );

    return {
      ok: true,
      speaking,
      target
    };
  }

  /* ================================================================
     22. MASTER GAIN
     ================================================================ */

  function setMasterGain(
    value
  ) {

    if (
      !state.master
    ) {

      return {
        ok: false,
        error:
          "Tonal engine not initialised."
      };
    }

    const gain =
      clamp(
        value,
        0,
        CONFIG.maximumMasterGain
      );

    state.master.gain.value =
      gain;

    emit(
      "TONAL_MASTER_GAIN_CHANGED",
      {
        gain
      }
    );

    return {
      ok: true,
      gain
    };
  }

  /* ================================================================
     23. SPECTRAL ANALYSIS
     ================================================================ */

  function analyse() {

    if (
      !state.analyser
    ) {

      return {
        ok: false,
        error:
          "Analyser unavailable."
      };
    }

    const analyser =
      state.analyser;

    const size =
      analyser.fftSize;

    const timeData =
      new Float32Array(
        size
      );

    const frequencyData =
      new Uint8Array(
        analyser.frequencyBinCount
      );

    analyser.getFloatTimeDomainData(
      timeData
    );

    analyser.getByteFrequencyData(
      frequencyData
    );

    let sumSquares =
      0;

    let peak =
      0;

    for (
      let i = 0;
      i < timeData.length;
      i++
    ) {

      const sample =
        timeData[i];

      sumSquares +=
        sample *
        sample;

      peak =
        Math.max(
          peak,
          Math.abs(sample)
        );
    }

    const rms =
      Math.sqrt(
        sumSquares /
        timeData.length
      );

    const sampleRate =
      state.context.sampleRate;

    let weighted =
      0;

    let magnitude =
      0;

    let dominantIndex =
      0;

    let dominantValue =
      -1;

    for (
      let i = 0;
      i < frequencyData.length;
      i++
    ) {

      const value =
        frequencyData[i];

      weighted +=
        i *
        value;

      magnitude +=
        value;

      if (
        value >
        dominantValue
      ) {

        dominantValue =
          value;

        dominantIndex =
          i;
      }
    }

    const binWidth =
      sampleRate /
      size;

    const spectralCentroid =
      magnitude
        ? (
            weighted /
            magnitude
          ) *
          binWidth
        : 0;

    const dominantFrequency =
      dominantIndex *
      binWidth;

    state.analysis = {

      rms,

      peak,

      spectralCentroid,

      dominantFrequency,

      timestamp:
        now()

    };

    state.state =
      STATES.ANALYSING;

    emit(
      "TONAL_ANALYSIS_UPDATED",
      state.analysis
    );

    return {
      ok: true,
      ...state.analysis
    };
  }

  /* ================================================================
     24. FREQUENCY METADATA
     ================================================================ */

  function registerResearchFrequency(
    frequency,
    metadata = {}
  ) {

    const hz =
      number(
        frequency,
        NaN
      );

    const classification =
      classifyFrequency(
        hz
      );

    const record = {

      frequencyHz:
        hz,

      classification:
        classification.class,

      physicallyGeneratedByThisEngine:
        classification.supported,

      purpose:
        safe(
          metadata.purpose
        ) ||
        "RESEARCH_METADATA",

      source:
        safe(
          metadata.source
        ) ||
        "USER_DEFINED",

      note:
        safe(
          metadata.note
        ) ||
        classification.reason,

      registeredAt:
        now()

    };

    state.frequencyHistory.unshift(
      record
    );

    state.frequencyHistory =
      state.frequencyHistory.slice(
        0,
        1000
      );

    emit(
      "TONAL_FREQUENCY_REGISTERED",
      record
    );

    return record;
  }

  /* ================================================================
     25. COMMON FREQUENCY SETS
     ================================================================ */

  const FREQUENCY_PRESETS = {

    AUDIBLE_LOW:
      64,

    GROUNDING:
      128,

    REFLECTION:
      174,

    PEACE:
      192,

    COURAGE:
      220,

    UNITY:
      256,

    GRATITUDE:
      261.63,

    CLOSING:
      392,

    REFERENCE_A:
      440,

    RESEARCH_432:
      432,

    RESEARCH_528:
      528,

    RESEARCH_639:
      639,

    RESEARCH_741:
      741,

    RESEARCH_852:
      852,

    RESEARCH_963:
      963

  };

  /*
   * The preset names above are descriptors only. They do not imply
   * scientifically established supernatural or healing properties.
   */

  function getPreset(
    name
  ) {

    const key =
      safe(
        name
      ).toUpperCase();

    const frequency =
      FREQUENCY_PRESETS[
        key
      ];

    if (
      frequency ===
      undefined
    ) {

      return null;
    }

    return {

      name:
        key,

      frequencyHz:
        frequency,

      classification:
        classifyFrequency(
          frequency
        ),

      note:
        key.startsWith(
          "RESEARCH_"
        )
          ? "Research/reference frequency; no guaranteed physiological or spiritual effect is implied."
          : "CHIROMBE audio-scene reference."

    };
  }

  /* ================================================================
     26. ADAPTIVE SCENE SELECTION
     ================================================================ */

  function selectScene(
    context = {}
  ) {

    const mode =
      safe(
        context.mode
      ).toUpperCase();

    const time =
      safe(
        context.timeOfDay
      ).toLowerCase();

    if (
      mode ===
      "NIGHT_WATCH"
    ) {

      return SCENES.NIGHT_WATCH;
    }

    if (
      mode ===
      "RECOVERY"
    ) {

      return SCENES.RECOVERY;
    }

    if (
      mode ===
      "ALERT"
    ) {

      return SCENES.ALERT;
    }

    if (
      mode ===
      "PROTECTION"
    ) {

      return SCENES.PROTECTION;
    }

    if (
      mode ===
      "FAMILY"
    ) {

      return SCENES.UNITY;
    }

    if (
      time ===
      "morning" ||
      time ===
      "dawn"
    ) {

      return SCENES.DAWN;
    }

    if (
      time ===
      "evening"
    ) {

      return SCENES.EVENING;
    }

    return SCENES.REFLECTION;
  }

  /* ================================================================
     27. ADAPTIVE SOUND RESPONSE
     ================================================================ */

  async function adaptiveResponse(
    context = {}
  ) {

    const scene =
      context.scene ||
      selectScene(
        context
      );

    const result =
      await playScene(
        scene,
        context
      );

    emit(
      "TONAL_ADAPTIVE_RESPONSE",
      {
        scene,

        reason:
          context.reason ||
          "Adaptive selection",

        result:
          result.ok
      }
    );

    return result;
  }

  /* ================================================================
     28. SYSTEM EVENT INTEGRATION
     ================================================================ */

  function systemEvent(
    event
  ) {

    const detail =
      event?.detail ||
      event ||
      {};

    const type =
      safe(
        detail.type ||
        detail.event ||
        detail.name
      ).toUpperCase();

    if (
      !type
    ) {
      return;
    }

    const mappings = {

      "SECURITY_ALERT":
        SCENES.ALERT,

      "WATCHDOG_ALERT":
        SCENES.ALERT,

      "RECOVERY_STARTED":
        SCENES.RECOVERY,

      "RECOVERY_COMPLETED":
        SCENES.RECOVERY,

      "LIVING_WATCH_STARTED":
        SCENES.NIGHT_WATCH,

      "FAMILY_UNITY":
        SCENES.UNITY,

      "BLOODLINE_LITURGY_READY":
        SCENES.PROTECTION,

      "RITUAL_SESSION_CREATED":
        SCENES.REFLECTION,

      "EVOLUTION_PROPOSAL_CREATED":
        SCENES.REFLECTION,

      "AUDIO_SAFE_STOP":
        null,

      "ENGINE_INTEGRITY_FAILURE":
        SCENES.ALERT

    };

    if (
      !(type in mappings)
    ) {
      return;
    }

    const scene =
      mappings[type];

    if (
      !scene
    ) {
      return;
    }

    adaptiveResponse({

      scene,

      reason:
        type,

      mode:
        type

    }).catch(
      error =>
        emit(
          "TONAL_SYSTEM_EVENT_ERROR",
          {
            event:
              type,

            error:
              error?.message ||
              String(error)
          }
        )
    );
  }

  try {

    root.addEventListener(
      "CHIROMBE_AUDIO_EVENT",
      systemEvent
    );

    root.addEventListener(
      "CHIROMBE_LIVING_WATCH_EVENT",
      systemEvent
    );

    root.addEventListener(
      "CHIROMBE_ENGINE_EVENT",
      systemEvent
    );

  } catch (_) {}

  if (
    AUDIO &&
    typeof AUDIO.on ===
    "function"
  ) {

    try {

      AUDIO.on(
        "SYSTEM_EVENT_OBSERVED",
        systemEvent
      );

    } catch (_) {}
  }

  /* ================================================================
     29. SCHEDULED TONE MANAGEMENT
     ================================================================ */

  function cancelScheduled() {

    state.scheduled.forEach(
      record => {

        try {

          clearTimeout(
            record.timeout
          );

        } catch (_) {}

      }
    );

    state.scheduled.clear();

    emit(
      "TONAL_SCHEDULE_CLEARED",
      {}
    );

    return {
      ok: true
    };
  }

  /* ================================================================
     30. SAFE STOP
     ================================================================ */

  function safeStop(
    reason =
      "Manual safe stop"
  ) {

    state.safeStopped =
      true;

    state.state =
      STATES.SAFE_STOP;

    cancelScheduled();

    stopAll(
      reason
    );

    if (
      state.master &&
      state.context
    ) {

      try {

        state.master.gain.setValueAtTime(
          0,
          state.context.currentTime
        );

      } catch (_) {}
    }

    emit(
      "TONAL_ENGINE_SAFE_STOP",
      {
        reason
      }
    );

    return {
      ok: true,
      state:
        state.state
    };
  }

  /* ================================================================
     31. RESUME
     ================================================================ */

  async function resume() {

    state.safeStopped =
      false;

    const result =
      await unlock();

    if (
      result.ok
    ) {

      if (
        state.master
      ) {

        state.master.gain.value =
          CONFIG.masterGain;
      }

      state.state =
        STATES.READY;

      emit(
        "TONAL_ENGINE_RESUMED",
        {}
      );
    }

    return result;
  }

  /* ================================================================
     32. HARDWARE CAPABILITY REPORT
     ================================================================ */

  function getCapabilities() {

    return {

      ...state.capabilities,

      contextState:
        state.context?.state ||
        "NOT_INITIALISED",

      activeOscillators:
        state.activeNodes.size,

      maximumOscillators:
        CONFIG.maximumOscillators,

      configuredMasterGain:
        state.master?.gain?.value ??
        CONFIG.masterGain,

      frequencyPolicy: {

        audible:
          "GENERATE_WHEN_SUPPORTED",

        ultrasonic:
          CONFIG.allowUltrasonicGeneration
            ? "EXPERIMENTAL"
            : "METADATA_ONLY",

        rfMHz:
          "METADATA_ONLY_UNLESS_EXTERNAL_HARDWARE_EXISTS"

      }

    };
  }

  /* ================================================================
     33. STATUS
     ================================================================ */

  function getStatus() {

    return {

      module:
        MODULE_ID,

      version:
        VERSION,

      state:
        state.state,

      initialised:
        state.initialised,

      safeStopped:
        state.safeStopped,

      usesKernelContext:
        state.usesKernelContext === true,

      currentScene:
        state.currentScene,

      currentFundamental:
        state.currentFundamental,

      activeOscillators:
        state.activeNodes.size,

      scheduledEvents:
        state.scheduled.size,

      capabilities:
        getCapabilities(),

      analysis:
        {
          ...state.analysis
        },

      history: {

        tones:
          state.toneHistory.length,

        scenes:
          state.sceneHistory.length,

        frequencies:
          state.frequencyHistory.length

      },

      timestamp:
        now()

    };
  }

  /* ================================================================
     34. PUBLIC API
     ================================================================ */

  const TONAL = {

    MODULE_ID,

    VERSION,

    STATES,

    FREQUENCY_CLASSES,

    WAVEFORMS,

    SCENES,

    FREQUENCY_PRESETS,

    initialise:
      initialiseAudio,

    unlock,

    classifyFrequency,

    createToneSpec,

    createOscillator,

    releaseOscillator,

    stopAll,

    playHarmonicStack,

    harmonicFrequencies,

    playDrone,

    playSweep,

    playPulse,

    playScene,

    stopScene,

    adaptiveResponse,

    selectScene,

    analyse,

    setVoiceDuck,

    setMasterGain,

    registerResearchFrequency,

    getPreset,

    getCapabilities,

    safeStop,

    resume,

    cancelScheduled,

    getStatus

  };

  /* ================================================================
     35. NAMESPACE REGISTRATION
     ================================================================ */

  root.CHIROMBE_AUDIO_TONAL_ENGINE =
    TONAL;

  CHIROMBE.AudioTonalEngine =
    TONAL;

  if (
    !CHIROMBE.AudioLivingLiturgy
  ) {

    CHIROMBE.AudioLivingLiturgy =
      {};
  }

  CHIROMBE.AudioLivingLiturgy.Tonal =
    TONAL;

  /* ================================================================
     36. LITURGY COMMAND BUS INTEGRATION
     ================================================================ */

  const LITURGY =
    root.CHIROMBE_AUDIO_LITURGY_ENGINE ||
    {};

  if (
    LITURGY &&
    typeof LITURGY === "object"
  ) {

    LITURGY.commands =
      LITURGY.commands || {};

    LITURGY.commands[
      "audio.tonal.initialise"
    ] =
      initialiseAudio;

    LITURGY.commands[
      "audio.tonal.unlock"
    ] =
      unlock;

    LITURGY.commands[
      "audio.tonal.tone"
    ] =
      args =>
        createOscillator(
          args || {}
        );

    LITURGY.commands[
      "audio.tonal.harmonics"
    ] =
      args =>
        playHarmonicStack(
          args || {}
        );

    LITURGY.commands[
      "audio.tonal.drone"
    ] =
      args =>
        playDrone(
          args || {}
        );

    LITURGY.commands[
      "audio.tonal.sweep"
    ] =
      args =>
        playSweep(
          args || {}
        );

    LITURGY.commands[
      "audio.tonal.pulse"
    ] =
      args =>
        playPulse(
          args || {}
        );

    LITURGY.commands[
      "audio.tonal.scene"
    ] =
      args =>
        playScene(
          args?.scene ||
          SCENES.REFLECTION,
          args || {}
        );

    LITURGY.commands[
      "audio.tonal.stop"
    ] =
      args =>
        stopAll(
          args?.reason ||
          "Commanded tonal stop"
        );

    LITURGY.commands[
      "audio.tonal.safeStop"
    ] =
      args =>
        safeStop(
          args?.reason ||
          "Commanded tonal safe stop"
        );

    LITURGY.commands[
      "audio.tonal.resume"
    ] =
      resume;

    LITURGY.commands[
      "audio.tonal.analyse"
    ] =
      analyse;

    LITURGY.commands[
      "audio.tonal.status"
    ] =
      getStatus;

  }

  /* ================================================================
     37. AUTOMATIC INITIALISATION
     ================================================================ */

  /*
   * Do NOT automatically start sound on page load.
   *
   * Browsers normally require a user gesture before audio can begin.
   * The engine therefore prepares itself but waits for explicit
   * activation/unlock.
   */

  emit(
    "TONAL_ENGINE_REGISTERED",
    {
      version:
        VERSION,

      policy:
        "USER_GESTURE_AUDIO_ACTIVATION",

      capability:
        getCapabilities()
    }
  );

  console.info(
    "[CHIROMBE AUDIO] Part 5 — Tonal/Frequency Engine registered.",
    getStatus()
  );

})();
/* ============================================================
   CHIROMBE AUDIO LIVING LITURGY
   PART 6 — ENVIRONMENT / ACOUSTIC / MOTION / ADAPTIVE ENGINE
   Version: 6.0.0
   ------------------------------------------------------------
   Purpose:
   • Observe measurable environmental conditions locally
   • Analyse microphone acoustics
   • Analyse motion/orientation when permitted
   • Optionally analyse ambient light when supported
   • Maintain environmental history
   • Adapt CHIROMBE audio scenes
   • Feed observations into Living Watch / Liturgy / Tonal systems
   • Keep sensor observations separate from spiritual interpretation
   • Never upload microphone data by default
   • Never treat sensor anomalies as proof of supernatural activity
   ============================================================ */

(() => {
  "use strict";

  const ROOT =
    window.CHIROMBE_AUDIO_ENVIRONMENT_ENGINE ||
    {};

  const AUDIO =
    window.CHIROMBE_AUDIO ||
    {};

  const TONAL =
    window.CHIROMBE_AUDIO_TONAL_ENGINE ||
    window.CHIROMBE_AUDIO?.Tonal ||
    null;

  const LITURGY =
    window.CHIROMBE_AUDIO_LITURGY_ENGINE ||
    window.CHIROMBE_AUDIO?.Liturgy ||
    null;

  const VERSION = "6.0.0";

  /* ------------------------------------------------------------
     CONSTANTS
     ------------------------------------------------------------ */

  const STATES = Object.freeze({
    DORMANT: "DORMANT",
    READY: "READY",
    REQUESTING_PERMISSION: "REQUESTING_PERMISSION",
    LISTENING: "LISTENING",
    ANALYSING: "ANALYSING",
    ADAPTING: "ADAPTING",
    PAUSED: "PAUSED",
    SAFE_STOP: "SAFE_STOP",
    UNSUPPORTED: "UNSUPPORTED",
    ERROR: "ERROR"
  });

  const ENVIRONMENTS = Object.freeze({
    SILENT: "SILENT",
    QUIET: "QUIET",
    NORMAL: "NORMAL",
    BUSY: "BUSY",
    LOUD: "LOUD",
    UNKNOWN: "UNKNOWN"
  });

  const MOTION = Object.freeze({
    STILL: "STILL",
    GENTLE: "GENTLE",
    MOVING: "MOVING",
    ACTIVE: "ACTIVE",
    UNKNOWN: "UNKNOWN"
  });

  const LIGHT = Object.freeze({
    DARK: "DARK",
    DIM: "DIM",
    NORMAL: "NORMAL",
    BRIGHT: "BRIGHT",
    UNKNOWN: "UNKNOWN"
  });

  const MODES = Object.freeze({
    OBSERVE: "OBSERVE",
    SANCTUARY: "SANCTUARY",
    NIGHT_WATCH: "NIGHT_WATCH",
    FAMILY_CIRCLE: "FAMILY_CIRCLE",
    REFLECTION: "REFLECTION",
    PROTECTION: "PROTECTION",
    GRATITUDE: "GRATITUDE",
    REMEMBRANCE: "REMEMBRANCE",
    UNITY: "UNITY",
    RECOVERY: "RECOVERY",
    SILENT_WATCH: "SILENT_WATCH"
  });

  const CONFIG = {
    version: VERSION,

    localOnly: true,

    microphone: {
      enabled: false,
      fftSize: 2048,
      smoothing: 0.82,
      intervalMs: 500,
      maxSessionMs: 24 * 60 * 60 * 1000
    },

    motion: {
      enabled: false,
      intervalMs: 500
    },

    light: {
      enabled: false,
      intervalMs: 1000
    },

    network: {
      enabled: false,
      timeoutMs: 3000
    },

    history: {
      maxSnapshots: 600,
      maxEvents: 1000
    },

    adaptation: {
      enabled: true,
      minimumChangeMs: 15000,
      quietThreshold: 0.018,
      normalThreshold: 0.055,
      busyThreshold: 0.11,
      loudThreshold: 0.20,
      stillThreshold: 0.035,
      movingThreshold: 0.18,
      activeThreshold: 0.50
    },

    privacy: {
      uploadEnabled: false,
      retainRawAudio: false,
      retainAudioBuffers: false,
      externalAIEnabled: false
    },

    safety: {
      maxCpuLoopMs: 100,
      maxSnapshotsPerMinute: 120,
      automaticAdaptation: true
    }
  };

  /* ------------------------------------------------------------
     STATE
     ------------------------------------------------------------ */

  const STATE = {
    state: STATES.DORMANT,

    mode: MODES.OBSERVE,

    startedAt: null,
    lastAnalysisAt: null,
    lastAdaptationAt: 0,

    sampleCount: 0,

    microphone: {
      supported: false,
      permission: "unknown",
      active: false,
      stream: null,
      source: null,
      analyser: null,
      dataTime: null,
      dataFreq: null,
      context: null
    },

    motion: {
      supported: false,
      permission: "unknown",
      active: false,
      acceleration: {
        x: 0,
        y: 0,
        z: 0
      },
      rotation: {
        alpha: 0,
        beta: 0,
        gamma: 0
      },
      magnitude: 0,
      lastEventAt: null
    },

    light: {
      supported: false,
      permission: "unknown",
      active: false,
      lux: null,
      sensor: null
    },

    network: {
      enabled: false,
      lastRTT: null,
      lastCheckedAt: null
    },

    acoustic: {
      rms: 0,
      peak: 0,
      decibels: -Infinity,
      noiseFloor: 0,
      dynamicRange: 0,

      spectralCentroid: 0,
      spectralRolloff: 0,
      zeroCrossingRate: 0,

      dominantFrequency: 0,

      bands: {
        sub: 0,
        low: 0,
        lowMid: 0,
        mid: 0,
        highMid: 0,
        high: 0
      },

      environment: ENVIRONMENTS.UNKNOWN
    },

    environment: {
      motion: MOTION.UNKNOWN,
      light: LIGHT.UNKNOWN,
      acoustic: ENVIRONMENTS.UNKNOWN,

      confidence: 0,

      classification: "UNKNOWN",

      interpretationBoundary:
        "MEASUREMENT_ONLY"
    },

    adaptation: {
      enabled: true,
      currentScene: null,
      reason: null,
      lastDecision: null
    },

    history: [],
    events: [],

    errors: []
  };

  /* ------------------------------------------------------------
     UTILITIES
     ------------------------------------------------------------ */

  function now() {
    return Date.now();
  }

  function uid(prefix = "env") {
    return (
      prefix +
      "_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 10)
    );
  }

  function num(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function average(values) {
    if (!values.length) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  function rms(values) {
    if (!values.length) return 0;

    let total = 0;

    for (let i = 0; i < values.length; i++) {
      total += values[i] * values[i];
    }

    return Math.sqrt(total / values.length);
  }

  function emit(type, detail = {}) {
    const event = {
      id: uid("env-event"),
      type,
      timestamp: now(),
      version: VERSION,
      detail
    };

    STATE.events.push(event);

    if (
      STATE.events.length >
      CONFIG.history.maxEvents
    ) {
      STATE.events.splice(
        0,
        STATE.events.length -
          CONFIG.history.maxEvents
      );
    }

    try {
      window.dispatchEvent(
        new CustomEvent(
          "CHIROMBE_AUDIO_ENVIRONMENT_EVENT",
          {
            detail: event
          }
        )
      );
    } catch (_) {}

    try {
      if (
        window.ChirombeBus &&
        typeof window.ChirombeBus.emit ===
          "function"
      ) {
        window.ChirombeBus.emit(
          type,
          detail
        );
      }
    } catch (_) {}

    return event;
  }

  function recordError(error, context) {
    const entry = {
      id: uid("env-error"),
      timestamp: now(),
      context,
      message:
        error?.message ||
        String(error)
    };

    STATE.errors.push(entry);

    if (STATE.errors.length > 100) {
      STATE.errors.shift();
    }

    emit("ENVIRONMENT_ENGINE_ERROR", entry);
  }

  /* ------------------------------------------------------------
     CAPABILITY DETECTION
     ------------------------------------------------------------ */

  function detectCapabilities() {
    const nav = navigator || {};

    STATE.microphone.supported =
      !!(
        nav.mediaDevices &&
        typeof nav.mediaDevices.getUserMedia ===
          "function"
      );

    STATE.motion.supported =
      "DeviceMotionEvent" in window;

    STATE.light.supported =
      "AmbientLightSensor" in window;

    STATE.network.enabled =
      typeof performance !== "undefined" &&
      typeof performance.now === "function";

    if (
      !STATE.microphone.supported &&
      !STATE.motion.supported &&
      !STATE.light.supported
    ) {
      STATE.state = STATES.UNSUPPORTED;
    } else {
      STATE.state = STATES.READY;
    }

    return getCapabilities();
  }

  /* ------------------------------------------------------------
     AUDIO CONTEXT DISCOVERY
     ------------------------------------------------------------ */

  function findAudioContext() {
    try {
      if (
        TONAL &&
        TONAL.context
      ) {
        return TONAL.context;
      }
    } catch (_) {}

    try {
      if (
        AUDIO &&
        AUDIO.context
      ) {
        return AUDIO.context;
      }
    } catch (_) {}

    try {
      if (
        AUDIO &&
        typeof AUDIO.getAudioContext ===
          "function"
      ) {
        const shared =
          AUDIO.getAudioContext();
        if (shared) return shared;
      }
    } catch (_) {}

    return (
      window.audioContext ||
      window.AudioContextInstance ||
      null
    );
  }

  /* ------------------------------------------------------------
     MICROPHONE PERMISSION
     ------------------------------------------------------------ */

  async function requestMicrophone() {
    if (
      !STATE.microphone.supported
    ) {
      STATE.microphone.permission =
        "unsupported";

      emit(
        "ENVIRONMENT_MIC_UNSUPPORTED"
      );

      return false;
    }

    STATE.state =
      STATES.REQUESTING_PERMISSION;

    emit(
      "ENVIRONMENT_MIC_PERMISSION_REQUESTED"
    );

    try {
      const stream =
        await navigator.mediaDevices
          .getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: false,
              autoGainControl: false,
              channelCount: 1
            },
            video: false
          });

      STATE.microphone.stream =
        stream;

      STATE.microphone.permission =
        "granted";

      STATE.microphone.active =
        true;

      initialiseMicrophoneGraph();

      emit(
        "ENVIRONMENT_MIC_GRANTED"
      );

      return true;
    } catch (error) {
      STATE.microphone.permission =
        "denied_or_unavailable";

      STATE.microphone.active =
        false;

      recordError(
        error,
        "requestMicrophone"
      );

      emit(
        "ENVIRONMENT_MIC_DENIED",
        {
          message:
            error?.message ||
            String(error)
        }
      );

      STATE.state =
        STATES.READY;

      return false;
    }
  }

  /* ------------------------------------------------------------
     MICROPHONE GRAPH
     ------------------------------------------------------------ */

  function initialiseMicrophoneGraph() {
    try {
      const context =
        findAudioContext();

      if (!context) {
        throw new Error(
          "No compatible AudioContext available."
        );
      }

      STATE.microphone.context =
        context;

      const stream =
        STATE.microphone.stream;

      if (!stream) {
        throw new Error(
          "Microphone stream missing."
        );
      }

      STATE.microphone.source =
        context.createMediaStreamSource(
          stream
        );

      STATE.microphone.analyser =
        context.createAnalyser();

      STATE.microphone.analyser.fftSize =
        CONFIG.microphone.fftSize;

      STATE.microphone.analyser.smoothingTimeConstant =
        CONFIG.microphone.smoothing;

      STATE.microphone.dataTime =
        new Float32Array(
          STATE.microphone.analyser.fftSize
        );

      STATE.microphone.dataFreq =
        new Float32Array(
          STATE.microphone.analyser.frequencyBinCount
        );

      /*
       * IMPORTANT:
       * The microphone graph terminates at the analyser.
       *
       * We intentionally do NOT connect the microphone
       * analyser back to the audible output.
       *
       * This prevents microphone feedback loops.
       */

      STATE.microphone.source.connect(
        STATE.microphone.analyser
      );

      if (
        context.state === "suspended"
      ) {
        context.resume().catch(
          () => {}
        );
      }

      emit(
        "ENVIRONMENT_MIC_GRAPH_READY"
      );

      return true;
    } catch (error) {
      recordError(
        error,
        "initialiseMicrophoneGraph"
      );

      return false;
    }
  }

  /* ------------------------------------------------------------
     ACOUSTIC ANALYSIS
     ------------------------------------------------------------ */

  function analyseMicrophone() {
    const analyser =
      STATE.microphone.analyser;

    if (!analyser) {
      return null;
    }

    const time =
      STATE.microphone.dataTime;

    const freq =
      STATE.microphone.dataFreq;

    analyser.getFloatTimeDomainData(
      time
    );

    analyser.getFloatFrequencyData(
      freq
    );

    /* RMS / PEAK */

    let peak = 0;

    for (
      let i = 0;
      i < time.length;
      i++
    ) {
      const absolute =
        Math.abs(time[i]);

      if (absolute > peak) {
        peak = absolute;
      }
    }

    const rmsValue =
      rms(time);

    /* dBFS */

    const db =
      rmsValue > 0
        ? 20 *
          Math.log10(rmsValue)
        : -Infinity;

    /* ZERO CROSSING RATE */

    let crossings = 0;

    for (
      let i = 1;
      i < time.length;
      i++
    ) {
      if (
        (time[i - 1] < 0 &&
          time[i] >= 0) ||
        (time[i - 1] >= 0 &&
          time[i] < 0)
      ) {
        crossings++;
      }
    }

    const zcr =
      crossings /
      Math.max(1, time.length - 1);

    /* SPECTRAL ANALYSIS */

    const context =
      STATE.microphone.context;

    const sampleRate =
      context?.sampleRate ||
      44100;

    const binWidth =
      sampleRate /
      analyser.fftSize;

    let totalMagnitude = 0;
    let weightedFrequency = 0;

    let maxMagnitude = -Infinity;
    let dominantBin = 0;

    const magnitudes = [];

    for (
      let i = 0;
      i < freq.length;
      i++
    ) {
      const dbValue =
        freq[i];

      const magnitude =
        Number.isFinite(dbValue)
          ? Math.pow(
              10,
              dbValue / 20
            )
          : 0;

      magnitudes.push(
        magnitude
      );

      totalMagnitude +=
        magnitude;

      weightedFrequency +=
        magnitude *
        (i * binWidth);

      if (
        dbValue >
        maxMagnitude
      ) {
        maxMagnitude =
          dbValue;

        dominantBin =
          i;
      }
    }

    const centroid =
      totalMagnitude > 0
        ? weightedFrequency /
          totalMagnitude
        : 0;

    /* SPECTRAL ROLLOFF */

    const targetEnergy =
      totalMagnitude * 0.85;

    let accumulated = 0;
    let rolloffBin = 0;

    for (
      let i = 0;
      i < magnitudes.length;
      i++
    ) {
      accumulated +=
        magnitudes[i];

      if (
        accumulated >=
        targetEnergy
      ) {
        rolloffBin = i;
        break;
      }
    }

    const rolloff =
      rolloffBin *
      binWidth;

    /* FREQUENCY BANDS */

    function bandEnergy(
      minHz,
      maxHz
    ) {
      let total = 0;
      let count = 0;

      for (
        let i = 0;
        i < freq.length;
        i++
      ) {
        const hz =
          i * binWidth;

        if (
          hz >= minHz &&
          hz < maxHz
        ) {
          total +=
            magnitudes[i];
          count++;
        }
      }

      return count
        ? total / count
        : 0;
    }

    const bands = {
      sub: bandEnergy(20, 60),
      low: bandEnergy(60, 250),
      lowMid: bandEnergy(250, 500),
      mid: bandEnergy(500, 2000),
      highMid: bandEnergy(2000, 6000),
      high: bandEnergy(6000, 12000)
    };

    const previousFloor =
      STATE.acoustic.noiseFloor;

    const newFloor =
      previousFloor === 0
        ? rmsValue
        : previousFloor * 0.95 +
          rmsValue * 0.05;

    const dynamicRange =
      Math.max(
        0,
        peak -
          newFloor
      );

    STATE.acoustic.rms =
      rmsValue;

    STATE.acoustic.peak =
      peak;

    STATE.acoustic.decibels =
      db;

    STATE.acoustic.noiseFloor =
      newFloor;

    STATE.acoustic.dynamicRange =
      dynamicRange;

    STATE.acoustic.spectralCentroid =
      centroid;

    STATE.acoustic.spectralRolloff =
      rolloff;

    STATE.acoustic.zeroCrossingRate =
      zcr;

    STATE.acoustic.dominantFrequency =
      dominantBin *
      binWidth;

    STATE.acoustic.bands =
      bands;

    STATE.acoustic.environment =
      classifyAcousticEnvironment(
        rmsValue,
        peak
      );

    return {
      rms: rmsValue,
      peak,
      decibels: db,
      noiseFloor: newFloor,
      dynamicRange,
      spectralCentroid: centroid,
      spectralRolloff: rolloff,
      zeroCrossingRate: zcr,
      dominantFrequency:
        dominantBin *
        binWidth,
      bands,
      environment:
        STATE.acoustic.environment,
      sampleRate,
      fftSize:
        analyser.fftSize,
      timestamp: now()
    };
  }

  /* ------------------------------------------------------------
     ACOUSTIC CLASSIFICATION
     ------------------------------------------------------------ */

  function classifyAcousticEnvironment(
    rmsValue,
    peak
  ) {
    const value =
      Math.max(
        rmsValue,
        peak * 0.35
      );

    if (
      value <
      CONFIG.adaptation.quietThreshold
    ) {
      return ENVIRONMENTS.SILENT;
    }

    if (
      value <
      CONFIG.adaptation.normalThreshold
    ) {
      return ENVIRONMENTS.QUIET;
    }

    if (
      value <
      CONFIG.adaptation.busyThreshold
    ) {
      return ENVIRONMENTS.NORMAL;
    }

    if (
      value <
      CONFIG.adaptation.loudThreshold
    ) {
      return ENVIRONMENTS.BUSY;
    }

    return ENVIRONMENTS.LOUD;
  }

  /* ------------------------------------------------------------
     MOTION / ORIENTATION
     ------------------------------------------------------------ */

  function requestMotionPermission() {
    return new Promise(
      resolve => {
        try {
          if (
            typeof DeviceMotionEvent ===
              "undefined"
          ) {
            STATE.motion.permission =
              "unsupported";

            resolve(false);
            return;
          }

          if (
            typeof DeviceMotionEvent
              .requestPermission ===
              "function"
          ) {
            DeviceMotionEvent
              .requestPermission()
              .then(result => {
                STATE.motion.permission =
                  result;

                if (
                  result === "granted"
                ) {
                  attachMotion();
                  resolve(true);
                } else {
                  resolve(false);
                }
              })
              .catch(error => {
                recordError(
                  error,
                  "motionPermission"
                );

                resolve(false);
              });
          } else {
            STATE.motion.permission =
              "granted";

            attachMotion();

            resolve(true);
          }
        } catch (error) {
          recordError(
            error,
            "requestMotionPermission"
          );

          resolve(false);
        }
      }
    );
  }

  function attachMotion() {
    if (
      STATE.motion.active
    ) {
      return true;
    }

    try {
      window.addEventListener(
        "devicemotion",
        handleMotion,
        {
          passive: true
        }
      );

      window.addEventListener(
        "deviceorientation",
        handleOrientation,
        {
          passive: true
        }
      );

      STATE.motion.active =
        true;

      emit(
        "ENVIRONMENT_MOTION_ACTIVE"
      );

      return true;
    } catch (error) {
      recordError(
        error,
        "attachMotion"
      );

      return false;
    }
  }

  function handleMotion(event) {
    const acc =
      event.accelerationIncludingGravity ||
      event.acceleration ||
      {};

    const x =
      num(acc.x);

    const y =
      num(acc.y);

    const z =
      num(acc.z);

    const magnitude =
      Math.sqrt(
        x * x +
        y * y +
        z * z
      );

    STATE.motion.acceleration = {
      x,
      y,
      z
    };

    STATE.motion.magnitude =
      magnitude;

    STATE.motion.lastEventAt =
      now();

    STATE.environment.motion =
      classifyMotion(
        magnitude
      );
  }

  function handleOrientation(
    event
  ) {
    STATE.motion.rotation = {
      alpha: num(event.alpha),
      beta: num(event.beta),
      gamma: num(event.gamma)
    };
  }

  function classifyMotion(
    magnitude
  ) {
    /*
     * Gravity is approximately 9.81 m/s².
     * We use change from gravity rather than
     * claiming that raw acceleration proves
     * anything beyond physical movement.
     */

    const delta =
      Math.abs(
        magnitude - 9.81
      );

    if (
      delta <
      CONFIG.adaptation.stillThreshold
    ) {
      return MOTION.STILL;
    }

    if (
      delta <
      CONFIG.adaptation.movingThreshold
    ) {
      return MOTION.GENTLE;
    }

    if (
      delta <
      CONFIG.adaptation.activeThreshold
    ) {
      return MOTION.MOVING;
    }

    return MOTION.ACTIVE;
  }

  /* ------------------------------------------------------------
     AMBIENT LIGHT
     ------------------------------------------------------------ */

  async function startAmbientLight() {
    if (
      !STATE.light.supported
    ) {
      STATE.light.permission =
        "unsupported";

      return false;
    }

    try {
      const sensor =
        new AmbientLightSensor();

      STATE.light.sensor =
        sensor;

      sensor.addEventListener(
        "reading",
        () => {
          STATE.light.lux =
            num(sensor.illuminance, null);

          STATE.environment.light =
            classifyLight(
              STATE.light.lux
            );
        }
      );

      sensor.addEventListener(
        "error",
        event => {
          recordError(
            event.error ||
              new Error(
                "Ambient light sensor error."
              ),
            "ambientLight"
          );
        }
      );

      sensor.start();

      STATE.light.active =
        true;

      STATE.light.permission =
        "granted";

      emit(
        "ENVIRONMENT_LIGHT_ACTIVE"
      );

      return true;
    } catch (error) {
      STATE.light.permission =
        "unavailable";

      recordError(
        error,
        "startAmbientLight"
      );

      return false;
    }
  }

  function classifyLight(
    lux
  ) {
    if (!Number.isFinite(lux)) {
      return LIGHT.UNKNOWN;
    }

    if (lux < 1) {
      return LIGHT.DARK;
    }

    if (lux < 30) {
      return LIGHT.DIM;
    }

    if (lux < 1000) {
      return LIGHT.NORMAL;
    }

    return LIGHT.BRIGHT;
  }

  /* ------------------------------------------------------------
     ENVIRONMENTAL CLASSIFICATION
     ------------------------------------------------------------ */

  function classifyEnvironment() {
    const acoustic =
      STATE.acoustic.environment;

    const motion =
      STATE.environment.motion;

    let classification =
      "STABLE";

    if (
      acoustic ===
        ENVIRONMENTS.LOUD ||
      motion === MOTION.ACTIVE
    ) {
      classification =
        "ACTIVE_ENVIRONMENT";
    } else if (
      acoustic ===
        ENVIRONMENTS.BUSY ||
      motion === MOTION.MOVING
    ) {
      classification =
        "MOBILE_ENVIRONMENT";
    } else if (
      acoustic ===
        ENVIRONMENTS.SILENT &&
      motion === MOTION.STILL
    ) {
      classification =
        "STILL_ENVIRONMENT";
    } else if (
      acoustic ===
        ENVIRONMENTS.QUIET
    ) {
      classification =
        "QUIET_ENVIRONMENT";
    }

    STATE.environment.classification =
      classification;

    STATE.environment.confidence =
      calculateConfidence();

    return classification;
  }

  function calculateConfidence() {
    let score = 0;
    let count = 0;

    if (
      STATE.microphone.active
    ) {
      score += 0.45;
      count++;
    }

    if (
      STATE.motion.active
    ) {
      score += 0.35;
      count++;
    }

    if (
      STATE.light.active
    ) {
      score += 0.20;
      count++;
    }

    return count
      ? clamp(score, 0, 1)
      : 0;
  }

  /* ------------------------------------------------------------
     SNAPSHOT
     ------------------------------------------------------------ */

  function snapshot() {
    const snap = {
      id: uid("environment"),
      timestamp: now(),

      acoustic: {
        ...STATE.acoustic,
        bands: {
          ...STATE.acoustic.bands
        }
      },

      motion: {
        ...STATE.motion.acceleration,
        magnitude:
          STATE.motion.magnitude,
        rotation: {
          ...STATE.motion.rotation
        }
      },

      light: {
        lux:
          STATE.light.lux,
        classification:
          STATE.environment.light
      },

      classification:
        STATE.environment.classification,

      confidence:
        STATE.environment.confidence,

      mode:
        STATE.mode,

      interpretationBoundary:
        "MEASURED_ENVIRONMENT_ONLY"
    };

    STATE.history.push(snap);

    if (
      STATE.history.length >
      CONFIG.history.maxSnapshots
    ) {
      STATE.history.splice(
        0,
        STATE.history.length -
          CONFIG.history.maxSnapshots
      );
    }

    STATE.sampleCount++;

    return snap;
  }

  /* ------------------------------------------------------------
     ADAPTIVE AUDIO DECISION ENGINE
     ------------------------------------------------------------ */

  function chooseAdaptiveScene() {
    if (
      !CONFIG.adaptation.enabled ||
      !STATE.adaptation.enabled
    ) {
      return null;
    }

    const mode =
      STATE.mode;

    const acoustic =
      STATE.acoustic.environment;

    const motion =
      STATE.environment.motion;

    /*
     * The environment determines an audio strategy,
     * not a supernatural interpretation.
     */

    if (
      mode === MODES.NIGHT_WATCH
    ) {
      if (
        acoustic ===
          ENVIRONMENTS.SILENT &&
        motion === MOTION.STILL
      ) {
        return {
          scene: "SILENT_WATCH",
          reason:
            "Measured quiet and still environment."
        };
      }

      return {
        scene: "NIGHT_WATCH",
        reason:
          "Night-watch mode selected."
      };
    }

    if (
      mode === MODES.RECOVERY
    ) {
      return {
        scene: "RECOVERY",
        reason:
          "Recovery mode selected."
      };
    }

    if (
      acoustic ===
        ENVIRONMENTS.LOUD
    ) {
      return {
        scene: "GROUNDING",
        reason:
          "Environment measured as loud; selecting a restrained grounding scene."
      };
    }

    if (
      acoustic ===
        ENVIRONMENTS.BUSY ||
      motion === MOTION.ACTIVE
    ) {
      return {
        scene: "GROUNDING",
        reason:
          "Active environment detected; selecting a stable grounding scene."
      };
    }

    if (
      acoustic ===
        ENVIRONMENTS.SILENT &&
      motion === MOTION.STILL
    ) {
      if (
        mode === MODES.PROTECTION
      ) {
        return {
          scene: "PROTECTION",
          reason:
            "Quiet/still environment with protection mode active."
        };
      }

      return {
        scene: "REFLECTION",
        reason:
          "Quiet/still environment detected."
      };
    }

    if (
      mode === MODES.FAMILY_CIRCLE
    ) {
      return {
        scene: "UNITY",
        reason:
          "Family-circle mode active."
      };
    }

    if (
      mode === MODES.GRATITUDE
    ) {
      return {
        scene: "GRATITUDE",
        reason:
          "Gratitude mode active."
      };
    }

    if (
      mode === MODES.REMEMBRANCE
    ) {
      return {
        scene: "REMEMBRANCE",
        reason:
          "Remembrance mode active."
      };
    }

    if (
      mode === MODES.UNITY
    ) {
      return {
        scene: "UNITY",
        reason:
          "Unity mode active."
      };
    }

    return {
      scene: "REFLECTION",
      reason:
        "Default adaptive reflection scene."
    };
  }

  async function adaptAudio() {
    if (
      !STATE.adaptation.enabled ||
      !CONFIG.safety.automaticAdaptation
    ) {
      return null;
    }

    const current =
      now();

    if (
      current -
        STATE.adaptation.lastDecision <
      CONFIG.adaptation.minimumChangeMs
    ) {
      return null;
    }

    const decision =
      chooseAdaptiveScene();

    if (!decision) {
      return null;
    }

    STATE.adaptation.lastDecision =
      current;

    if (
      STATE.adaptation.currentScene ===
      decision.scene
    ) {
      return decision;
    }

    STATE.state =
      STATES.ADAPTING;

    const previous =
      STATE.adaptation.currentScene;

    STATE.adaptation.currentScene =
      decision.scene;

    STATE.adaptation.reason =
      decision.reason;

    STATE.adaptation.lastAdaptationAt =
      current;

    emit(
      "ENVIRONMENT_AUDIO_ADAPTATION",
      {
        previous,
        current:
          decision.scene,
        reason:
          decision.reason,
        classification:
          STATE.environment.classification,
        acoustic:
          STATE.acoustic.environment,
        motion:
          STATE.environment.motion
      }
    );

    /*
     * Only use the existing tonal engine.
     * Never construct uncontrolled oscillators here.
     */

    try {
      if (
        TONAL &&
        typeof TONAL.playScene ===
          "function"
      ) {
        await TONAL.playScene(
          decision.scene
        );
      }
    } catch (error) {
      recordError(
        error,
        "adaptiveAudio.playScene"
      );
    }

    STATE.state =
      STATES.LISTENING;

    return decision;
  }

  /* ------------------------------------------------------------
     OPERATING MODE
     ------------------------------------------------------------ */

  function setMode(mode) {
    const values =
      Object.values(MODES);

    if (
      !values.includes(mode)
    ) {
      throw new Error(
        "Unknown CHIROMBE environment mode: " +
          mode
      );
    }

    STATE.mode = mode;

    emit(
      "ENVIRONMENT_MODE_CHANGED",
      {
        mode
      }
    );

    return mode;
  }

  /* ------------------------------------------------------------
     ANALYSIS LOOP
     ------------------------------------------------------------ */

  let analysisTimer =
    null;

  function analysisCycle() {
    if (
      STATE.state ===
        STATES.SAFE_STOP ||
      STATE.state ===
        STATES.PAUSED
    ) {
      return;
    }

    const started =
      performance.now();

    try {
      STATE.state =
        STATES.ANALYSING;

      if (
        STATE.microphone.active
      ) {
        analyseMicrophone();
      }

      classifyEnvironment();

      snapshot();

      STATE.lastAnalysisAt =
        now();

      if (
        STATE.adaptation.enabled
      ) {
        adaptAudio().catch(
          error =>
            recordError(
              error,
              "analysisCycle.adaptAudio"
            )
        );
      }

      if (
        performance.now() -
          started >
        CONFIG.safety.maxCpuLoopMs
      ) {
        emit(
          "ENVIRONMENT_CPU_GUARD",
          {
            durationMs:
              performance.now() -
              started
          }
        );
      }

      if (
        STATE.state ===
        STATES.ANALYSING
      ) {
        STATE.state =
          STATES.LISTENING;
      }
    } catch (error) {
      recordError(
        error,
        "analysisCycle"
      );

      STATE.state =
        STATES.ERROR;
    }
  }

  function startAnalysisLoop() {
    stopAnalysisLoop();

    analysisTimer =
      window.setInterval(
        analysisCycle,
        CONFIG.microphone.intervalMs
      );

    emit(
      "ENVIRONMENT_ANALYSIS_STARTED"
    );
  }

  function stopAnalysisLoop() {
    if (
      analysisTimer !== null
    ) {
      clearInterval(
        analysisTimer
      );

      analysisTimer =
        null;
    }
  }

  /* ------------------------------------------------------------
     NETWORK TIMING — OPTIONAL / LOCAL CONTROL
     ------------------------------------------------------------ */

  async function measureNetworkTiming(
    url = location.href
  ) {
    if (
      !CONFIG.network.enabled
    ) {
      return null;
    }

    const started =
      performance.now();

    try {
      /*
       * Same-origin only by default.
       * This prevents the environmental engine
       * from becoming an arbitrary network scanner.
       */

      const target =
        new URL(
          url,
          location.href
        );

      if (
        target.origin !==
        location.origin
      ) {
        throw new Error(
          "Cross-origin network timing blocked."
        );
      }

      const controller =
        new AbortController();

      const timeout =
        setTimeout(
          () =>
            controller.abort(),
          CONFIG.network.timeoutMs
        );

      await fetch(
        target.href,
        {
          method: "HEAD",
          cache: "no-store",
          credentials: "same-origin",
          signal:
            controller.signal
        }
      );

      clearTimeout(timeout);

      const rtt =
        performance.now() -
        started;

      STATE.network.lastRTT =
        rtt;

      STATE.network.lastCheckedAt =
        now();

      emit(
        "ENVIRONMENT_NETWORK_TIMING",
        {
          rtt
        }
      );

      return rtt;
    } catch (error) {
      recordError(
        error,
        "measureNetworkTiming"
      );

      return null;
    }
  }

  /* ------------------------------------------------------------
     START
     ------------------------------------------------------------ */

  async function start(options = {}) {
    if (
      STATE.state ===
        STATES.LISTENING ||
      STATE.state ===
        STATES.ANALYSING
    ) {
      return getStatus();
    }

    if (
      options.mode
    ) {
      setMode(
        options.mode
      );
    }

    STATE.state =
      STATES.REQUESTING_PERMISSION;

    STATE.startedAt =
      now();

    detectCapabilities();

    let microphoneStarted =
      false;

    if (
      options.microphone === true
    ) {
      microphoneStarted =
        await requestMicrophone();
    }

    if (
      options.motion !== false &&
      STATE.motion.supported
    ) {
      await requestMotionPermission();
    }

    if (
      options.light !== false &&
      STATE.light.supported
    ) {
      await startAmbientLight();
    }

    startAnalysisLoop();

    STATE.state =
      STATES.LISTENING;

    emit(
      "ENVIRONMENT_ENGINE_STARTED",
      {
        microphone:
          microphoneStarted,
        motion:
          STATE.motion.active,
        light:
          STATE.light.active,
        localOnly:
          CONFIG.localOnly,
        mode:
          STATE.mode
      }
    );

    return getStatus();
  }

  /* ------------------------------------------------------------
     PAUSE / RESUME
     ------------------------------------------------------------ */

  function pause() {
    STATE.state =
      STATES.PAUSED;

    emit(
      "ENVIRONMENT_ENGINE_PAUSED"
    );

    return true;
  }

  function resume() {
    if (
      STATE.state !==
      STATES.PAUSED
    ) {
      return false;
    }

    STATE.state =
      STATES.LISTENING;

    emit(
      "ENVIRONMENT_ENGINE_RESUMED"
    );

    return true;
  }

  /* ------------------------------------------------------------
     MICROPHONE STOP
     ------------------------------------------------------------ */

  function stopMicrophone() {
    try {
      if (
        STATE.microphone.source
      ) {
        try {
          STATE.microphone.source.disconnect();
        } catch (_) {}
      }

      if (
        STATE.microphone.analyser
      ) {
        try {
          STATE.microphone.analyser.disconnect();
        } catch (_) {}
      }

      if (
        STATE.microphone.stream
      ) {
        STATE.microphone.stream
          .getTracks()
          .forEach(track => {
            try {
              track.stop();
            } catch (_) {}
          });
      }
    } catch (error) {
      recordError(
        error,
        "stopMicrophone"
      );
    }

    STATE.microphone.source =
      null;

    STATE.microphone.analyser =
      null;

    STATE.microphone.stream =
      null;

    STATE.microphone.active =
      false;

    emit(
      "ENVIRONMENT_MIC_STOPPED"
    );
  }

  /* ------------------------------------------------------------
     MOTION STOP
     ------------------------------------------------------------ */

  function stopMotion() {
    try {
      window.removeEventListener(
        "devicemotion",
        handleMotion
      );

      window.removeEventListener(
        "deviceorientation",
        handleOrientation
      );
    } catch (_) {}

    STATE.motion.active =
      false;

    emit(
      "ENVIRONMENT_MOTION_STOPPED"
    );
  }

  /* ------------------------------------------------------------
     LIGHT STOP
     ------------------------------------------------------------ */

  function stopLight() {
    try {
      if (
        STATE.light.sensor &&
        typeof STATE.light.sensor.stop ===
          "function"
      ) {
        STATE.light.sensor.stop();
      }
    } catch (_) {}

    STATE.light.sensor =
      null;

    STATE.light.active =
      false;

    emit(
      "ENVIRONMENT_LIGHT_STOPPED"
    );
  }

  /* ------------------------------------------------------------
     SAFE STOP
     ------------------------------------------------------------ */

  function safeStop(
    reason =
      "User requested safe stop."
  ) {
    stopAnalysisLoop();
    stopMicrophone();
    stopMotion();
    stopLight();

    STATE.state =
      STATES.SAFE_STOP;

    STATE.adaptation.enabled =
      false;

    emit(
      "ENVIRONMENT_SAFE_STOP",
      {
        reason
      }
    );

    return true;
  }

  /* ------------------------------------------------------------
     PRIVACY
     ------------------------------------------------------------ */

  function getPrivacyStatus() {
    return {
      localOnly:
        CONFIG.localOnly,

      uploadEnabled:
        CONFIG.privacy.uploadEnabled,

      rawAudioRetained:
        CONFIG.privacy.retainRawAudio,

      audioBuffersRetained:
        CONFIG.privacy.retainAudioBuffers,

      externalAIEnabled:
        CONFIG.privacy.externalAIEnabled,

      microphoneActive:
        STATE.microphone.active,

      microphonePermission:
        STATE.microphone.permission
    };
  }

  function setPrivacy(options = {}) {
    /*
     * This engine defaults to local-only operation.
     * Remote transmission cannot be enabled merely by
     * an environmental observation.
     */

    if (
      options.uploadEnabled === true
    ) {
      throw new Error(
        "Remote environmental upload is disabled by default. Implement an explicit, separately audited consent/backend layer before enabling it."
      );
    }

    if (
      options.externalAIEnabled === true
    ) {
      throw new Error(
        "External AI environmental transmission is disabled in Part 6. Use a separate consented backend integration."
      );
    }

    return getPrivacyStatus();
  }

  /* ------------------------------------------------------------
     HISTORY
     ------------------------------------------------------------ */

  function getHistory(limit = 50) {
    const n =
      clamp(
        Math.floor(num(limit, 50)),
        1,
        CONFIG.history.maxSnapshots
      );

    return STATE.history
      .slice(-n)
      .map(item => ({
        ...item,
        acoustic: {
          ...item.acoustic,
          bands: {
            ...item.acoustic.bands
          }
        }
      }));
  }

  function clearHistory() {
    STATE.history.length = 0;

    emit(
      "ENVIRONMENT_HISTORY_CLEARED"
    );

    return true;
  }

  /* ------------------------------------------------------------
     STATUS
     ------------------------------------------------------------ */

  function getCapabilities() {
    return {
      version: VERSION,

      microphone:
        STATE.microphone.supported,

      motion:
        STATE.motion.supported,

      ambientLight:
        STATE.light.supported,

      networkTiming:
        STATE.network.enabled,

      localOnly:
        CONFIG.localOnly,

      rawAudioRetention:
        CONFIG.privacy.retainRawAudio,

      externalAI:
        CONFIG.privacy.externalAIEnabled
    };
  }

  function getStatus() {
    return {
      version: VERSION,

      state:
        STATE.state,

      mode:
        STATE.mode,

      startedAt:
        STATE.startedAt,

      lastAnalysisAt:
        STATE.lastAnalysisAt,

      sampleCount:
        STATE.sampleCount,

      capabilities:
        getCapabilities(),

      microphone: {
        supported:
          STATE.microphone.supported,
        permission:
          STATE.microphone.permission,
        active:
          STATE.microphone.active,
        sampleRate:
          STATE.microphone.context?.sampleRate ||
          null
      },

      motion: {
        supported:
          STATE.motion.supported,
        permission:
          STATE.motion.permission,
        active:
          STATE.motion.active,
        magnitude:
          STATE.motion.magnitude,
        classification:
          STATE.environment.motion
      },

      light: {
        supported:
          STATE.light.supported,
        permission:
          STATE.light.permission,
        active:
          STATE.light.active,
        lux:
          STATE.light.lux,
        classification:
          STATE.environment.light
      },

      acoustic:
        JSON.parse(
          JSON.stringify(
            STATE.acoustic
          )
        ),

      environment:
        JSON.parse(
          JSON.stringify(
            STATE.environment
          )
        ),

      adaptation:
        JSON.parse(
          JSON.stringify(
            STATE.adaptation
          )
        ),

      privacy:
        getPrivacyStatus(),

      errors:
        STATE.errors.slice(-10)
    };
  }

  /* ------------------------------------------------------------
     PUBLIC OBSERVATION API
     ------------------------------------------------------------ */

  function observe() {
    classifyEnvironment();

    const result =
      snapshot();

    emit(
      "ENVIRONMENT_OBSERVATION",
      result
    );

    return result;
  }

  /* ------------------------------------------------------------
     COMMAND BUS / LITURGY INTEGRATION
     ------------------------------------------------------------ */

  function registerCommands() {
    const commands = {
      "audio.environment.capabilities":
        async () =>
          getCapabilities(),

      "audio.environment.start":
        async args =>
          start(args || {}),

      "audio.environment.stop":
        async args =>
          safeStop(
            args?.reason ||
              "Commanded stop."
          ),

      "audio.environment.pause":
        async () =>
          pause(),

      "audio.environment.resume":
        async () =>
          resume(),

      "audio.environment.observe":
        async () =>
          observe(),

      "audio.environment.status":
        async () =>
          getStatus(),

      "audio.environment.mode":
        async args =>
          setMode(
            args?.mode
          ),

      "audio.environment.network":
        async args =>
          measureNetworkTiming(
            args?.url ||
              location.href
          ),

      "audio.environment.history":
        async args =>
          getHistory(
            args?.limit || 50
          ),

      "audio.environment.clearHistory":
        async () =>
          clearHistory(),

      "audio.environment.safeStop":
        async args =>
          safeStop(
            args?.reason ||
              "Safe stop command."
          )
    };

    /*
     * Liturgy command registry
     */

    try {
      if (
        LITURGY &&
        typeof LITURGY.registerCommand ===
          "function"
      ) {
        Object.entries(
          commands
        ).forEach(
          ([name, handler]) => {
            try {
              LITURGY.registerCommand(
                name,
                handler
              );
            } catch (_) {}
          }
        );
      }
    } catch (error) {
      recordError(
        error,
        "registerCommands.liturgy"
      );
    }

    /*
     * Existing command bus
     */

    try {
      if (
        window.ChirombeBus &&
        typeof window.ChirombeBus.registerCommand ===
          "function"
      ) {
        Object.entries(
          commands
        ).forEach(
          ([name, handler]) => {
            try {
              window.ChirombeBus.registerCommand(
                name,
                handler
              );
            } catch (_) {}
          }
        );
      }
    } catch (error) {
      recordError(
        error,
        "registerCommands.bus"
      );
    }

    return Object.keys(
      commands
    );
  }

  /* ------------------------------------------------------------
     SYSTEM EVENT BRIDGE
     ------------------------------------------------------------ */

  function registerSystemEvents() {
    const events = [
      "LIVING_WATCH_STARTED",
      "RITUAL_SESSION_CREATED",
      "BLOODLINE_LITURGY_READY",
      "FAMILY_UNITY",
      "SECURITY_ALERT",
      "WATCHDOG_ALERT",
      "RECOVERY",
      "AUDIO_SAFE_STOP",
      "ENGINE_INTEGRITY_FAILURE"
    ];

    events.forEach(
      eventName => {
        try {
          window.addEventListener(
            eventName,
            event => {
              emit(
                "ENVIRONMENT_SYSTEM_EVENT",
                {
                  source:
                    eventName,
                  detail:
                    event?.detail ||
                    null
                }
              );

              /*
               * A security/integrity event may influence
               * the computational audio response, but it
               * is NOT interpreted as evidence of a
               * supernatural event.
               */

              if (
                eventName ===
                  "SECURITY_ALERT" ||
                eventName ===
                  "WATCHDOG_ALERT"
              ) {
                setMode(
                  MODES.PROTECTION
                );

                if (
                  STATE.adaptation.enabled
                ) {
                  adaptAudio().catch(
                    () => {}
                  );
                }
              }

              if (
                eventName ===
                "RECOVERY"
              ) {
                setMode(
                  MODES.RECOVERY
                );
              }
            }
          );
        } catch (_) {}
      }
    );
  }

  /* ------------------------------------------------------------
     INITIALISE
     ------------------------------------------------------------ */

  function initialise() {
    detectCapabilities();

    registerCommands();
    registerSystemEvents();

    emit(
      "ENVIRONMENT_ENGINE_READY",
      {
        version: VERSION,
        capabilities:
          getCapabilities()
      }
    );

    return getStatus();
  }

  /* ------------------------------------------------------------
     EXPORT
     ------------------------------------------------------------ */

  const API = {
    VERSION,

    STATES,
    ENVIRONMENTS,
    MOTION,
    LIGHT,
    MODES,

    CONFIG,

    initialise,

    start,
    pause,
    resume,
    safeStop,

    requestMicrophone,
    stopMicrophone,

    requestMotionPermission,
    stopMotion,

    startAmbientLight,
    stopLight,

    analyseMicrophone,
    classifyAcousticEnvironment,
    classifyMotion,
    classifyLight,
    classifyEnvironment,

    observe,
    snapshot,

    setMode,

    chooseAdaptiveScene,
    adaptAudio,

    measureNetworkTiming,

    getHistory,
    clearHistory,

    getCapabilities,
    getPrivacyStatus,
    setPrivacy,
    getStatus
  };

  window.CHIROMBE_AUDIO_ENVIRONMENT_ENGINE =
    API;

  /*
   * Unified namespace.
   */

  window.CHIROMBE_AUDIO =
    window.CHIROMBE_AUDIO ||
    {};

  window.CHIROMBE_AUDIO.Environment =
    API;

  window.CHIROMBE_AUDIO_ENVIRONMENT =
    API;

  /*
   * Initial boot.
   *
   * IMPORTANT:
   * We initialise capability detection only.
   * We do NOT request microphone permission automatically.
   * The user must explicitly activate environmental listening.
   */

  initialise();

  console.log(
    "[CHIROMBE AUDIO] Part 6 Environment Engine " +
      VERSION +
      " ready."
  );

})();
/* ============================================================
   CHIROMBE AUDIO LIVING LITURGY
   PART 7 — VOICE / CHANT / PERFORMANCE ENGINE
   Version: 7.0.0
   ------------------------------------------------------------
   PURPOSE
   • Speech synthesis orchestration
   • Prayer / declaration performance
   • Call-and-response
   • Chant sequencing
   • Multilingual delivery
   • Dynamic pauses and pacing
   • Person-specific devotional sessions
   • Environmental adaptation
   • Question / response interface
   • Voice ducking for tonal engine
   • Performance memory
   • Anti-repetition / novelty control
   • Full integration with Parts 1–6
   • No claim that generated audio proves supernatural events
   ============================================================ */

(() => {
  "use strict";

  /* Later Part 7 in this file is the performance engine that stays installed.
     This earlier copy is kept in the source and does not register a second engine. */
  return;

  const VERSION = "7.0.0";

  /* ------------------------------------------------------------
     DISCOVER EXISTING CHIROMBE AUDIO LAYERS
     ------------------------------------------------------------ */

  const AUDIO =
    window.CHIROMBE_AUDIO ||
    {};

  const ENV =
    window.CHIROMBE_AUDIO_ENVIRONMENT_ENGINE ||
    AUDIO.Environment ||
    null;

  const TONAL =
    window.CHIROMBE_AUDIO_TONAL_ENGINE ||
    AUDIO.Tonal ||
    null;

  const LITURGY =
    window.CHIROMBE_AUDIO_LITURGY_ENGINE ||
    AUDIO.Liturgy ||
    null;

  /* ------------------------------------------------------------
     STATES
     ------------------------------------------------------------ */

  const STATES = Object.freeze({
    DORMANT: "DORMANT",
    READY: "READY",
    PREPARING: "PREPARING",
    SPEAKING: "SPEAKING",
    CHANTING: "CHANTING",
    CALL_RESPONSE: "CALL_RESPONSE",
    READING: "READING",
    MEDITATION: "MEDITATION",
    PAUSED: "PAUSED",
    WAITING_RESPONSE: "WAITING_RESPONSE",
    SAFE_STOP: "SAFE_STOP",
    ERROR: "ERROR"
  });

  const MODES = Object.freeze({
    DECLARATION: "DECLARATION",
    SUPPLICATION: "SUPPLICATION",
    CHANT: "CHANT",
    CALL_RESPONSE: "CALL_RESPONSE",
    READING: "READING",
    MEDITATION: "MEDITATION",
    FAMILY_BLESSING: "FAMILY_BLESSING",
    PROTECTION: "PROTECTION",
    GRATITUDE: "GRATITUDE",
    REMEMBRANCE: "REMEMBRANCE",
    UNITY: "UNITY",
    NIGHT_WATCH: "NIGHT_WATCH",
    CLOSING: "CLOSING"
  });

  const LANGUAGES = Object.freeze({
    ENGLISH: "en-GB",
    SHONA: "sn-ZW",
    ZULU: "zu-ZA",
    XHOSA: "xh-ZA",
    FRENCH: "fr-FR",
    PORTUGUESE: "pt-PT",
    SPANISH: "es-ES"
  });

  const CONFIG = {

    version: VERSION,

    defaultLanguage:
      LANGUAGES.ENGLISH,

    defaultRate: 0.88,

    minRate: 0.55,

    maxRate: 1.25,

    defaultPitch: 0,

    minPitch: -2,

    maxPitch: 2,

    defaultVolume: 0.86,

    maxVolume: 0.92,

    pauseBetweenSentencesMs: 700,

    pauseBetweenSectionsMs: 1600,

    responseTimeoutMs: 15000,

    maximumTextLength: 12000,

    maximumSessionItems: 200,

    noveltyWindow: 100,

    maxHistory: 500,

    privacy: {
      retainTranscript: true,
      retainSpeechAudio: false,
      uploadTranscript: false,
      externalAI: false
    },

    safety: {
      maximumContinuousSpeechMs:
        15 * 60 * 1000,

      maximumSessionMs:
        60 * 60 * 1000,

      maximumQueue:
        200
    }
  };

  /* ------------------------------------------------------------
     STATE
     ------------------------------------------------------------ */

  const STATE = {

    state:
      STATES.DORMANT,

    mode:
      MODES.DECLARATION,

    language:
      CONFIG.defaultLanguage,

    voice:
      null,

    voices:
      [],

    speaking:
      false,

    paused:
      false,

    startedAt:
      null,

    speechStartedAt:
      null,

    currentItem:
      null,

    queue:
      [],

    session:
      null,

    history:
      [],

    spokenHashes:
      [],

    response:
      null,

    metrics: {

      sessions:
        0,

      utterances:
        0,

      words:
        0,

      characters:
        0,

      calls:
        0,

      responses:
        0,

      interruptions:
        0,

      completed:
        0,

      errors:
        0
    },

    settings: {

      rate:
        CONFIG.defaultRate,

      pitch:
        CONFIG.defaultPitch,

      volume:
        CONFIG.defaultVolume,

      autoPunctuation:
        true,

      automaticAdaptation:
        true,

      privacyMode:
        false
    },

    errors: []
  };

  /* ------------------------------------------------------------
     UTILITY FUNCTIONS
     ------------------------------------------------------------ */

  function now() {
    return Date.now();
  }

  function uid(
    prefix = "voice"
  ) {
    return (
      prefix +
      "_" +
      Date.now().toString(36) +
      "_" +
      Math.random()
        .toString(36)
        .slice(2, 9)
    );
  }

  function clamp(
    value,
    min,
    max
  ) {
    return Math.min(
      max,
      Math.max(
        min,
        Number(value)
      )
    );
  }

  function cleanText(
    text
  ) {
    return String(
      text ?? ""
    )
      .replace(
        /<script[\s\S]*?<\/script>/gi,
        ""
      )
      .replace(
        /<[^>]+>/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim()
      .slice(
        0,
        CONFIG.maximumTextLength
      );
  }

  function hashText(
    text
  ) {
    let hash =
      2166136261;

    const value =
      String(text);

    for (
      let i = 0;
      i < value.length;
      i++
    ) {
      hash ^=
        value.charCodeAt(i);

      hash +=
        (hash << 1) +
        (hash << 4) +
        (hash << 7) +
        (hash << 8) +
        (hash << 24);
    }

    return (
      hash >>> 0
    ).toString(16);
  }

  function emit(
    type,
    detail = {}
  ) {

    const event = {
      id:
        uid("performance-event"),

      type,

      timestamp:
        now(),

      version:
        VERSION,

      detail
    };

    try {
      window.dispatchEvent(
        new CustomEvent(
          "CHIROMBE_AUDIO_PERFORMANCE_EVENT",
          {
            detail: event
          }
        )
      );
    } catch (_) {}

    try {

      if (
        window.ChirombeBus &&
        typeof
          window.ChirombeBus.emit ===
          "function"
      ) {
        window.ChirombeBus.emit(
          type,
          detail
        );
      }

    } catch (_) {}

    return event;
  }

  function error(
    err,
    context
  ) {

    const item = {

      id:
        uid("voice-error"),

      timestamp:
        now(),

      context,

      message:
        err?.message ||
        String(err)
    };

    STATE.errors.push(
      item
    );

    STATE.metrics.errors++;

    if (
      STATE.errors.length >
      100
    ) {
      STATE.errors.shift();
    }

    emit(
      "AUDIO_PERFORMANCE_ERROR",
      item
    );

    return item;
  }

  /* ------------------------------------------------------------
     SPEECH SYNTHESIS CAPABILITY
     ------------------------------------------------------------ */

  function supported() {

    return (
      typeof window !==
        "undefined" &&
      "speechSynthesis" in
        window &&
      typeof SpeechSynthesisUtterance !==
        "undefined"
    );
  }

  function refreshVoices() {

    if (
      !supported()
    ) {
      STATE.voices = [];
      return [];
    }

    try {

      STATE.voices =
        window
          .speechSynthesis
          .getVoices()
          .slice();

      return STATE.voices;

    } catch (err) {

      error(
        err,
        "refreshVoices"
      );

      return [];
    }
  }

  function findVoice(
    language =
      STATE.language
  ) {

    const voices =
      refreshVoices();

    if (
      !voices.length
    ) {
      return null;
    }

    const requested =
      String(
        language ||
          STATE.language
      ).toLowerCase();

    const exact =
      voices.find(
        voice =>
          String(
            voice.lang
          ).toLowerCase() ===
          requested
      );

    if (
      exact
    ) {
      return exact;
    }

    const base =
      requested
        .split("-")[0];

    const compatible =
      voices.find(
        voice =>
          String(
            voice.lang
          )
            .toLowerCase()
            .startsWith(
              base
            )
      );

    if (
      compatible
    ) {
      return compatible;
    }

    return (
      voices.find(
        voice =>
          /english/i.test(
            voice.lang
          )
      ) ||
      voices[0]
    );
  }

  /* ------------------------------------------------------------
     LANGUAGE / VOICE CONTROL
     ------------------------------------------------------------ */

  function setLanguage(
    language
  ) {

    const supportedLanguages =
      Object.values(
        LANGUAGES
      );

    if (
      !supportedLanguages.includes(
        language
      )
    ) {

      /*
       * Permit browser language tags
       * while retaining a known safe default.
       */

      if (
        !/^[a-z]{2,3}(-[A-Z]{2})?$/i.test(
          String(language)
        )
      ) {
        throw new Error(
          "Unsupported language identifier."
        );
      }
    }

    STATE.language =
      language;

    STATE.voice =
      findVoice(
        language
      );

    emit(
      "AUDIO_LANGUAGE_CHANGED",
      {
        language,
        voice:
          STATE.voice?.name ||
          null
      }
    );

    return {
      language,
      voice:
        STATE.voice?.name ||
        null
    };
  }

  function setVoice(
    voiceName
  ) {

    refreshVoices();

    const voice =
      STATE.voices.find(
        item =>
          item.name ===
          voiceName
      );

    if (
      !voice
    ) {
      throw new Error(
        "Requested speech voice was not found."
      );
    }

    STATE.voice =
      voice;

    STATE.language =
      voice.lang;

    emit(
      "AUDIO_VOICE_CHANGED",
      {
        voice:
          voice.name,
        language:
          voice.lang
      }
    );

    return voice;
  }

  /* ------------------------------------------------------------
     SPEECH SETTINGS
     ------------------------------------------------------------ */

  function setSpeechSettings(
    settings = {}
  ) {

    if (
      settings.rate !==
      undefined
    ) {
      STATE.settings.rate =
        clamp(
          settings.rate,
          CONFIG.minRate,
          CONFIG.maxRate
        );
    }

    if (
      settings.pitch !==
      undefined
    ) {
      STATE.settings.pitch =
        clamp(
          settings.pitch,
          CONFIG.minPitch,
          CONFIG.maxPitch
        );
    }

    if (
      settings.volume !==
      undefined
    ) {
      STATE.settings.volume =
        clamp(
          settings.volume,
          0,
          CONFIG.maxVolume
        );
    }

    if (
      settings.automaticAdaptation !==
      undefined
    ) {
      STATE.settings.automaticAdaptation =
        !!settings.automaticAdaptation;
    }

    return {
      ...STATE.settings
    };
  }

  /* ------------------------------------------------------------
     VOICE DUCKING
     ------------------------------------------------------------ */

  function voiceDuck(
    enabled
  ) {

    try {

      if (
        TONAL &&
        typeof
          TONAL.setVoiceDuck ===
          "function"
      ) {

        TONAL.setVoiceDuck(
          enabled
            ? 0.20
            : 1
        );

        return true;
      }

    } catch (err) {

      error(
        err,
        "voiceDuck"
      );
    }

    return false;
  }

  /* ------------------------------------------------------------
     SPEECH PROMISE
     ------------------------------------------------------------ */

  function speakText(
    text,
    options = {}
  ) {

    return new Promise(
      resolve => {

        if (
          !supported()
        ) {

          error(
            new Error(
              "Speech synthesis is not available."
            ),
            "speakText"
          );

          resolve({
            ok: false,
            reason:
              "unsupported"
          });

          return;
        }

        const clean =
          cleanText(
            text
          );

        if (
          !clean
        ) {

          resolve({
            ok: false,
            reason:
              "empty_text"
          });

          return;
        }

        if (
          window.speechSynthesis.speaking
        ) {

          /*
           * The performance engine owns speech.
           * Stop previous utterance before a new
           * controlled utterance.
           */

          window.speechSynthesis.cancel();
        }

        const utterance =
          new SpeechSynthesisUtterance(
            clean
          );

        const language =
          options.language ||
          STATE.language;

        const voice =
          options.voice ||
          findVoice(
            language
          );

        utterance.lang =
          language;

        if (
          voice
        ) {
          utterance.voice =
            voice;
        }

        utterance.rate =
          clamp(
            options.rate ??
              STATE.settings.rate,
            CONFIG.minRate,
            CONFIG.maxRate
          );

        utterance.pitch =
          clamp(
            options.pitch ??
              STATE.settings.pitch,
            CONFIG.minPitch,
            CONFIG.maxPitch
          );

        utterance.volume =
          clamp(
            options.volume ??
              STATE.settings.volume,
            0,
            CONFIG.maxVolume
          );

        const started =
          now();

        STATE.state =
          STATES.SPEAKING;

        STATE.speaking =
          true;

        STATE.speechStartedAt =
          started;

        voiceDuck(
          true
        );

        emit(
          "AUDIO_SPEECH_STARTED",
          {
            text:
              STATE.settings.privacyMode
                ? "[PRIVATE]"
                : clean,

            language,

            voice:
              voice?.name ||
              null,

            mode:
              STATE.mode
          }
        );

        utterance.onend =
          () => {

            STATE.speaking =
              false;

            STATE.metrics.utterances++;

            STATE.metrics.words +=
              clean.split(/\s+/).length;

            STATE.metrics.characters +=
              clean.length;

            voiceDuck(
              false
            );

            emit(
              "AUDIO_SPEECH_COMPLETED",
              {
                durationMs:
                  now() -
                  started,

                characters:
                  clean.length
              }
            );

            resolve({
              ok: true,
              text:
                clean,
              durationMs:
                now() -
                started
            });
          };

        utterance.onerror =
          event => {

            STATE.speaking =
              false;

            voiceDuck(
              false
            );

            error(
              new Error(
                event?.error ||
                "Speech synthesis error."
              ),
              "speech.onerror"
            );

            resolve({
              ok: false,
              reason:
                event?.error ||
                "speech_error"
            });
          };

        try {

          window
            .speechSynthesis
            .speak(
              utterance
            );

        } catch (err) {

          STATE.speaking =
            false;

          voiceDuck(
            false
          );

          error(
            err,
            "speechSynthesis.speak"
          );

          resolve({
            ok: false,
            reason:
              "speak_exception"
          });
        }
      }
    );
  }

  /* ------------------------------------------------------------
     STOP / PAUSE / RESUME
     ------------------------------------------------------------ */

  function stop() {

    try {

      if (
        supported()
      ) {
        window
          .speechSynthesis
          .cancel();
      }

    } catch (_) {}

    STATE.queue =
      [];

    STATE.speaking =
      false;

    STATE.paused =
      false;

    voiceDuck(
      false
    );

    STATE.state =
      STATES.READY;

    STATE.metrics.interruptions++;

    emit(
      "AUDIO_PERFORMANCE_STOPPED"
    );

    return true;
  }

  function pause() {

    try {

      if (
        supported() &&
        window
          .speechSynthesis
          .speaking
      ) {

        window
          .speechSynthesis
          .pause();

        STATE.paused =
          true;

        STATE.state =
          STATES.PAUSED;

        emit(
          "AUDIO_PERFORMANCE_PAUSED"
        );

        return true;
      }

    } catch (err) {

      error(
        err,
        "pause"
      );
    }

    return false;
  }

  function resume() {

    try {

      if (
        supported() &&
        window
          .speechSynthesis
          .paused
      ) {

        window
          .speechSynthesis
          .resume();

        STATE.paused =
          false;

        STATE.state =
          STATES.SPEAKING;

        emit(
          "AUDIO_PERFORMANCE_RESUMED"
        );

        return true;
      }

    } catch (err) {

      error(
        err,
        "resume"
      );
    }

    return false;
  }

  /* ------------------------------------------------------------
     NOVELTY ENGINE
     ------------------------------------------------------------ */

  function isNovel(
    text
  ) {

    const hash =
      hashText(
        cleanText(text)
      );

    return !STATE.spokenHashes.includes(
      hash
    );
  }

  function rememberSpeech(
    text
  ) {

    const hash =
      hashText(
        cleanText(text)
      );

    STATE.spokenHashes.push(
      hash
    );

    if (
      STATE.spokenHashes.length >
      CONFIG.noveltyWindow
    ) {
      STATE.spokenHashes.shift();
    }

    return hash;
  }

  /* ------------------------------------------------------------
     DEVOTIONAL CONTENT LIBRARY
     ------------------------------------------------------------ */

  const LITURGY_LIBRARY = {

    openings: [

      "Mwari Ndi Mwari. Let truth, peace and wisdom guide this moment.",

      "Mudzimu Unoyera, let this house and this family be held in peace, courage and unity.",

      "We enter this moment with gratitude, humility, courage and a clear intention for peace.",

      "Let this moment become a place of stillness, reflection, protection and wise action."
    ],

    protection: [

      "May this family walk in peace, truth, wisdom and courage.",

      "May every member of this family be strengthened to choose what is good, truthful and life-giving.",

      "May fear give way to courage, confusion give way to wisdom, and division give way to unity.",

      "May this household be surrounded by peace, disciplined thought, compassion and resilience.",

      "May every person connected to this family find strength, safety, wisdom and a clear path forward."
    ],

    gratitude: [

      "We give thanks for life, for family, for memory, for learning and for another opportunity to do what is right.",

      "We remember the good that has carried this family through difficult seasons.",

      "We give thanks for those who taught us, those who protected us, and those who continue the work of love and truth."
    ],

    courage: [

      "Let courage rise where fear has been present.",

      "Let wisdom govern every decision.",

      "Let truth remain stronger than confusion.",

      "Let patience become strength.",

      "Let compassion remain present even in difficult circumstances."
    ],

    unity: [

      "May this family remain united without erasing the dignity of any individual.",

      "May differences be met with patience, truth and understanding.",

      "May every generation contribute something valuable to the generations that follow.",

      "May remembrance become wisdom and wisdom become constructive action."
    ],

    closing: [

      "We close this moment with gratitude, peace, wisdom and courage.",

      "May the peace of this moment continue into the next hour, the next decision and the next day.",

      "Mwari Ndi Mwari. We proceed with truth, courage, humility and peace.",

      "The session is complete. The intention remains: truth, protection, unity, resilience and peace."
    ],

    reflection: [

      "Be still for a moment and notice the breath.",

      "Notice the environment without judging it.",

      "Notice sound as sound, movement as movement, and thought as thought.",

      "Allow the mind to settle before choosing the next action.",

      "Return attention gently to peace and clarity."
    ]
  };

  /* ------------------------------------------------------------
     SHONA DEVOTIONAL LIBRARY
     ------------------------------------------------------------ */

  const SHONA_LIBRARY = {

    opening: [

      "Mwari Ndi Mwari. Ngatipindei munguva ino nerunyararo, chokwadi, njere uye ushingi.",

      "Mudzimu Unoyera, tungamirirai mhuri iyi murunyararo, rudo, chokwadi uye kubatana.",

      "Ngatimirirei murunyararo, tichitenda upenyu, mhuri uye mukana wekuita zvakanaka."
    ],

    protection: [

      "Dai mhuri iyi ifambe murunyararo, muchokwadi, munjere uye muushingi.",

      "Dai kutya kutsiviwa neushingi, kuvhiringidzika kutsiviwa nenjere, uye kupatsanuka kutsiviwa nekubatana.",

      "Dai vanhu vemhuri iyi vawana simba, runyararo, njere uye nzira yakajeka yekuenderera mberi."
    ],

    gratitude: [

      "Tinotenda Mwari neupenyu, mhuri, vadzidzisi, ndangariro uye mikana mitsva.",

      "Tinorangarira zvakanaka zvakapfuura uye zvatakadzidza kubva mazviri."
    ],

    unity: [

      "Dai mhuri iyi irambe yakabatana ichichengeta chiremerera chemunhu wese.",

      "Dai kusiyana kwedu kusanganiswe nemoyo murefu, chokwadi uye kunzwisisana."
    ],

    closing: [

      "Tinopedzisa nguva iyi nekutenda, rugare, njere uye ushingi.",

      "Mwari Ndi Mwari. Ngatiendererei muchokwadi, murugare uye nemoyo wakasimba."
    ]
  };

  /* ------------------------------------------------------------
     CONTENT SELECTION
     ------------------------------------------------------------ */

  function randomItem(
    list
  ) {

    if (
      !Array.isArray(list) ||
      !list.length
    ) {
      return "";
    }

    const candidates =
      list.filter(
        item =>
          isNovel(item)
      );

    const source =
      candidates.length
        ? candidates
        : list;

    return source[
      Math.floor(
        Math.random() *
          source.length
      )
    ];
  }

  function languageLibrary(
    language
  ) {

    if (
      String(language)
        .toLowerCase()
        .startsWith("sn")
    ) {
      return SHONA_LIBRARY;
    }

    return LITURGY_LIBRARY;
  }

  /* ------------------------------------------------------------
     PERSON-SPECIFIC DEVOTIONAL GENERATION
     ------------------------------------------------------------ */

  function personPrayer(
    person = {},
    options = {}
  ) {

    const name =
      cleanText(
        person.displayName ||
        person.name ||
        "this person"
      );

    const language =
      options.language ||
      STATE.language;

    const library =
      languageLibrary(
        language
      );

    const useShona =
      String(language)
        .toLowerCase()
        .startsWith("sn");

    let lines = [];

    if (
      useShona
    ) {

      lines.push(
        "Tinonyengeterera " +
          name +
          " nhasi."
      );

      lines.push(
        randomItem(
          library.protection
        )
      );

      lines.push(
        "Dai awana rugare, njere, ushingi uye hutungamiri hwakanaka."
      );

      lines.push(
        "Dai nzira yake izadzwa nechokwadi, rudo uye kuchenjera."
      );

    } else {

      lines.push(
        "We hold " +
          name +
          " in this moment of prayer."
      );

      lines.push(
        randomItem(
          library.protection
        )
      );

      lines.push(
        "May " +
          name +
          " have peace, wisdom, courage and good guidance."
      );

      lines.push(
        "May every decision ahead be approached with clarity, patience and truth."
      );
    }

    return lines
      .filter(Boolean)
      .join(" ");
  }

  /* ------------------------------------------------------------
     SESSION GENERATOR
     ------------------------------------------------------------ */

  function createSession(
    options = {}
  ) {

    const mode =
      options.mode ||
      STATE.mode;

    const language =
      options.language ||
      STATE.language;

    const duration =
      clamp(
        Number(
          options.durationMinutes ??
            10
        ),
        1,
        60
      );

    const people =
      Array.isArray(
        options.people
      )
        ? options.people
        : [];

    const library =
      languageLibrary(
        language
      );

    const items = [];

    function add(
      type,
      text,
      metadata = {}
    ) {

      const clean =
        cleanText(text);

      if (
        !clean
      ) {
        return;
      }

      items.push({

        id:
          uid("lit-item"),

        type,

        text:
          clean,

        language,

        mode,

        metadata
      });
    }

    /* OPENING */

    add(
      "OPENING",
      randomItem(
        library.opening ||
          library.openings ||
          LITURGY_LIBRARY.openings
      )
    );

    /* MODE SECTION */

    if (
      mode ===
      MODES.PROTECTION
    ) {

      add(
        "PROTECTION",
        randomItem(
          library.protection
        )
      );

      add(
        "COURAGE",
        randomItem(
          LITURGY_LIBRARY.courage
        )
      );
    }

    if (
      mode ===
      MODES.GRATITUDE
    ) {

      add(
        "GRATITUDE",
        randomItem(
          library.gratitude
        )
      );
    }

    if (
      mode ===
      MODES.UNITY ||
      mode ===
      MODES.FAMILY_BLESSING
    ) {

      add(
        "UNITY",
        randomItem(
          library.unity
        )
      );
    }

    if (
      mode ===
      MODES.REMEMBRANCE
    ) {

      add(
        "REMEMBRANCE",
        "We remember those whose lives, teachings and examples contributed to the family story. May remembrance become wisdom, gratitude and constructive action."
      );
    }

    /* PEOPLE */

    people.forEach(
      person => {

        if (
          items.length >=
          CONFIG.maximumSessionItems
        ) {
          return;
        }

        add(
          "PERSON_PRAYER",
          personPrayer(
            person,
            {
              language
            }
          ),
          {
            personKey:
              person.personKey ||
              person.id ||
              null,

            displayName:
              person.displayName ||
              person.name ||
              null
          }
        );
      }
    );

    /* REFLECTION */

    add(
      "REFLECTION",
      randomItem(
        library.reflection ||
          LITURGY_LIBRARY.reflection
      )
    );

    /* CLOSING */

    add(
      "CLOSING",
      randomItem(
        library.closing ||
          LITURGY_LIBRARY.closing
      )
    );

    const session = {

      id:
        uid("liturgy-session"),

      createdAt:
        now(),

      mode,

      language,

      durationMinutes:
        duration,

      peopleCount:
        people.length,

      items,

      status:
        "CREATED",

      provenance:
        "CHIROMBE_ORIGINAL_GENERATIVE_LITURGY",

      interpretationBoundary:
        "DEVOTIONAL_CONTENT_NOT_SUPERNATURAL_EVIDENCE"
    };

    STATE.session =
      session;

    STATE.metrics.sessions++;

    emit(
      "AUDIO_LITURGY_SESSION_CREATED",
      {
        sessionId:
          session.id,

        mode,

        language,

        itemCount:
          items.length,

        peopleCount:
          people.length
      }
    );

    return session;
  }

  /* ------------------------------------------------------------
     QUEUE
     ------------------------------------------------------------ */

  function queueSession(
    session
  ) {

    if (
      !session ||
      !Array.isArray(
        session.items
      )
    ) {
      throw new Error(
        "Invalid liturgy session."
      );
    }

    STATE.queue =
      session.items.slice(
        0,
        CONFIG.safety.maximumQueue
      );

    return STATE.queue.length;
  }

  /* ------------------------------------------------------------
     PERFORMANCE ITEM
     ------------------------------------------------------------ */

  async function performItem(
    item
  ) {

    if (
      !item
    ) {
      return false;
    }

    STATE.currentItem =
      item;

    if (
      item.type ===
      "SILENCE"
    ) {

      await delay(
        item.durationMs ||
          CONFIG.pauseBetweenSectionsMs
      );

      return true;
    }

    const hash =
      rememberSpeech(
        item.text
      );

    emit(
      "AUDIO_LITURGY_ITEM_STARTED",
      {
        itemId:
          item.id,

        type:
          item.type,

        hash,

        metadata:
          item.metadata ||
          {}
      }
    );

    const result =
      await speakText(
        item.text,
        {
          language:
            item.language ||
            STATE.language,

          rate:
            item.rate ||
            STATE.settings.rate,

          pitch:
            item.pitch ||
            STATE.settings.pitch,

          volume:
            item.volume ||
            STATE.settings.volume
        }
      );

    emit(
      "AUDIO_LITURGY_ITEM_COMPLETED",
      {
        itemId:
          item.id,

        ok:
          !!result.ok,

        type:
          item.type
      }
    );

    await delay(
      item.type ===
        "CLOSING"
        ? CONFIG.pauseBetweenSectionsMs
        : CONFIG.pauseBetweenSentencesMs
    );

    return !!result.ok;
  }

  function delay(
    ms
  ) {

    return new Promise(
      resolve =>
        setTimeout(
          resolve,
          Math.max(
            0,
            Number(ms) || 0
          )
        )
    );
  }

  /* ------------------------------------------------------------
     SESSION PERFORMANCE
     ------------------------------------------------------------ */

  async function performSession(
    session =
      STATE.session
  ) {

    if (
      !session
    ) {
      throw new Error(
        "No liturgy session available."
      );
    }

    STATE.startedAt =
      now();

    STATE.state =
      STATES.PREPARING;

    session.status =
      "PERFORMING";

    queueSession(
      session
    );

    emit(
      "AUDIO_LITURGY_PERFORMANCE_STARTED",
      {
        sessionId:
          session.id
      }
    );

    let completed =
      0;

    try {

      while (
        STATE.queue.length
      ) {

        if (
          STATE.state ===
            STATES.SAFE_STOP ||
          STATE.state ===
            STATES.PAUSED
        ) {
          break;
        }

        if (
          now() -
            STATE.startedAt >
          CONFIG.safety.maximumSessionMs
        ) {
          stop();

          session.status =
            "TIME_LIMIT";

          break;
        }

        const item =
          STATE.queue.shift();

        const ok =
          await performItem(
            item
          );

        if (
          ok
        ) {
          completed++;
        }

        if (
          now() -
            STATE.speechStartedAt >
          CONFIG.safety.maximumContinuousSpeechMs
        ) {
          await delay(
            1500
          );
        }
      }

      if (
        completed ===
        session.items.length
      ) {

        session.status =
          "COMPLETED";

        STATE.metrics.completed++;

      } else if (
        STATE.state ===
        STATES.PAUSED
      ) {

        session.status =
          "PAUSED";

      } else {

        session.status =
          "STOPPED";
      }

      STATE.history.push({
        sessionId:
          session.id,

        timestamp:
          now(),

        mode:
          session.mode,

        language:
          session.language,

        completed,

        total:
          session.items.length,

        status:
          session.status
      });

      if (
        STATE.history.length >
        CONFIG.maxHistory
      ) {
        STATE.history.shift();
      }

      emit(
        "AUDIO_LITURGY_PERFORMANCE_COMPLETED",
        {
          sessionId:
            session.id,

          completed,

          total:
            session.items.length,

          status:
            session.status
        }
      );

      STATE.state =
        STATES.READY;

      return session;

    } catch (err) {

      error(
        err,
        "performSession"
      );

      session.status =
        "ERROR";

      STATE.state =
        STATES.ERROR;

      return session;
    }
  }

  /* ------------------------------------------------------------
     CALL AND RESPONSE
     ------------------------------------------------------------ */

  async function callResponse(
    call,
    response,
    options = {}
  ) {

    STATE.state =
      STATES.CALL_RESPONSE;

    STATE.metrics.calls++;

    emit(
      "AUDIO_CALL_STARTED",
      {
        call:
          STATE.settings.privacyMode
            ? "[PRIVATE]"
            : call
      }
    );

    await speakText(
      call,
      options
    );

    STATE.state =
      STATES.WAITING_RESPONSE;

    STATE.response =
      {
        expected:
          response,

        startedAt:
          now(),

        received:
          null
      };

    emit(
      "AUDIO_WAITING_FOR_RESPONSE",
      {
        timeoutMs:
          CONFIG.responseTimeoutMs
      }
    );

    /*
     * Part 7 does not automatically claim that
     * an external sound, voice or event is a
     * spiritual communication.
     *
     * A future speech-recognition adapter can
     * explicitly submit a user response.
     */

    await delay(
      options.timeoutMs ||
        CONFIG.responseTimeoutMs
    );

    if (
      STATE.response &&
      !STATE.response.received
    ) {

      emit(
        "AUDIO_RESPONSE_TIMEOUT"
      );
    }

    return STATE.response;
  }

  function submitResponse(
    response
  ) {

    if (
      !STATE.response
    ) {
      return false;
    }

    STATE.response.received =
      cleanText(
        response
      );

    STATE.metrics.responses++;

    emit(
      "AUDIO_RESPONSE_RECEIVED",
      {
        response:
          STATE.settings.privacyMode
            ? "[PRIVATE]"
            : STATE.response.received
      }
    );

    return true;
  }

  /* ------------------------------------------------------------
     CHANT ENGINE
     ------------------------------------------------------------ */

  async function chant(
    lines = [],
    options = {}
  ) {

    if (
      !Array.isArray(lines) ||
      !lines.length
    ) {
      return false;
    }

    STATE.state =
      STATES.CHANTING;

    const repetitions =
      clamp(
        options.repetitions ??
          1,
        1,
        12
      );

    for (
      let cycle = 0;
      cycle < repetitions;
      cycle++
    ) {

      for (
        let i = 0;
        i < lines.length;
        i++
      ) {

        if (
          STATE.state ===
          STATES.SAFE_STOP
        ) {
          return false;
        }

        const line =
          cleanText(
            lines[i]
          );

        if (
          !line
        ) {
          continue;
        }

        await speakText(
          line,
          {
            language:
              options.language ||
              STATE.language,

            rate:
              options.rate ||
              0.72,

            pitch:
              options.pitch ??
              STATE.settings.pitch,

            volume:
              options.volume ??
              STATE.settings.volume
          }
        );

        await delay(
          options.pauseMs ??
            900
        );
      }
    }

    STATE.state =
      STATES.READY;

    emit(
      "AUDIO_CHANT_COMPLETED",
      {
        cycles:
          repetitions,

        lines:
          lines.length
      }
    );

    return true;
  }

  /* ------------------------------------------------------------
     DECLARATION ENGINE
     ------------------------------------------------------------ */

  async function declaration(
    text,
    options = {}
  ) {

    STATE.mode =
      MODES.DECLARATION;

    const prepared =
      cleanText(
        text
      );

    if (
      !prepared
    ) {
      return false;
    }

    return speakText(
      prepared,
      {
        language:
          options.language ||
          STATE.language,

        rate:
          options.rate ||
          0.82,

        pitch:
          options.pitch ??
          STATE.settings.pitch,

        volume:
          options.volume ??
          STATE.settings.volume
      }
    );
  }

  /* ------------------------------------------------------------
     MEDITATION / SILENCE
     ------------------------------------------------------------ */

  async function meditation(
    durationMs = 60000
  ) {

    STATE.state =
      STATES.MEDITATION;

    emit(
      "AUDIO_MEDITATION_STARTED",
      {
        durationMs
      }
    );

    await delay(
      clamp(
        durationMs,
        1000,
        15 * 60 * 1000
      )
    );

    STATE.state =
      STATES.READY;

    emit(
      "AUDIO_MEDITATION_COMPLETED"
    );

    return true;
  }

  /* ------------------------------------------------------------
     ENVIRONMENT-AWARE PERFORMANCE
     ------------------------------------------------------------ */

  function getEnvironmentContext() {

    try {

      if (
        ENV &&
        typeof ENV.getStatus ===
          "function"
      ) {

        const status =
          ENV.getStatus();

        return {

          classification:
            status.environment
              ?.classification ||
            "UNKNOWN",

          acoustic:
            status.acoustic
              ?.environment ||
            "UNKNOWN",

          motion:
            status.motion
              ?.classification ||
            "UNKNOWN",

          light:
            status.light
              ?.classification ||
            "UNKNOWN",

          confidence:
            status.environment
              ?.confidence ||
            0
        };
      }

    } catch (err) {

      error(
        err,
        "getEnvironmentContext"
      );
    }

    return {
      classification:
        "UNKNOWN",

      acoustic:
        "UNKNOWN",

      motion:
        "UNKNOWN",

      light:
        "UNKNOWN",

      confidence:
        0
    };
  }

  async function adaptPerformance() {

    if (
      !STATE.settings
        .automaticAdaptation
    ) {
      return null;
    }

    const environment =
      getEnvironmentContext();

    let rate =
      STATE.settings.rate;

    let pause =
      CONFIG.pauseBetweenSentencesMs;

    /*
     * Quiet + still:
     * slower, more reflective delivery.
     */

    if (
      environment.acoustic ===
        "SILENT" &&
      environment.motion ===
        "STILL"
    ) {

      rate =
        clamp(
          rate - 0.08,
          CONFIG.minRate,
          CONFIG.maxRate
        );

      pause +=
        500;
    }

    /*
     * Busy / moving:
     * slightly clearer and more concise.
     */

    if (
      environment.acoustic ===
        "LOUD" ||
      environment.motion ===
        "ACTIVE"
    ) {

      rate =
        clamp(
          rate + 0.05,
          CONFIG.minRate,
          CONFIG.maxRate
        );

      pause =
        Math.max(
          500,
          pause - 250
        );
    }

    return {
      rate,
      pause,
      environment
    };
  }

  /* ------------------------------------------------------------
     QUESTION / INQUIRY RESPONSE
     ------------------------------------------------------------ */

  async function answerQuestion(
    question,
    options = {}
  ) {

    const q =
      cleanText(
        question
      );

    if (
      !q
    ) {
      return false;
    }

    /*
     * Part 7 deliberately gives a bounded
     * response rather than pretending to know
     * facts that are not available to it.
     */

    const environment =
      getEnvironmentContext();

    let response =
      "I can help you reflect on that. " +
      "I will separate what CHIROMBE has actually measured " +
      "from spiritual or devotional interpretation.";

    if (
      /environment|sound|noise|microphone/i.test(
        q
      )
    ) {

      response =
        "The current measurable environment is " +
        environment.classification +
        ". The acoustic state is " +
        environment.acoustic +
        ", and the motion state is " +
        environment.motion +
        ". These are sensor observations, not proof of a supernatural cause.";
    }

    if (
      /status|system|chirombe/i.test(
        q
      )
    ) {

      response =
        "CHIROMBE audio performance is currently in " +
        STATE.state +
        " mode, using " +
        STATE.language +
        ".";
    }

    await speakText(
      response,
      {
        language:
          options.language ||
          STATE.language,

        rate:
          0.86
      }
    );

    return response;
  }

  /* ------------------------------------------------------------
     BLOODLINE SESSION
     ------------------------------------------------------------ */

  async function bloodlineSession(
    people = [],
    options = {}
  ) {

    const safePeople =
      Array.isArray(
        people
      )
        ? people
        : [];

    const session =
      createSession({
        mode:
          options.mode ||
          MODES.FAMILY_BLESSING,

        language:
          options.language ||
          STATE.language,

        durationMinutes:
          options.durationMinutes ||
          15,

        people:
          safePeople
      });

    return performSession(
      session
    );
  }

  /* ------------------------------------------------------------
     PRIVACY
     ------------------------------------------------------------ */

  function getPrivacyStatus() {

    return {

      transcriptRetained:
        CONFIG.privacy
          .retainTranscript,

      speechAudioRetained:
        CONFIG.privacy
          .retainSpeechAudio,

      uploadTranscript:
        CONFIG.privacy
          .uploadTranscript,

      externalAI:
        CONFIG.privacy
          .externalAI,

      privacyMode:
        STATE.settings
          .privacyMode
    };
  }

  function setPrivacyMode(
    enabled
  ) {

    STATE.settings.privacyMode =
      !!enabled;

    emit(
      "AUDIO_PRIVACY_MODE_CHANGED",
      {
        enabled:
          STATE.settings
            .privacyMode
      }
    );

    return getPrivacyStatus();
  }

  /* ------------------------------------------------------------
     STATUS
     ------------------------------------------------------------ */

  function getStatus() {

    return {

      version:
        VERSION,

      state:
        STATE.state,

      mode:
        STATE.mode,

      language:
        STATE.language,

      voice:
        STATE.voice?.name ||
        null,

      speaking:
        STATE.speaking,

      paused:
        STATE.paused,

      queueLength:
        STATE.queue.length,

      session:
        STATE.session
          ? {
              id:
                STATE.session.id,

              status:
                STATE.session.status,

              mode:
                STATE.session.mode,

              language:
                STATE.session.language,

              itemCount:
                STATE.session.items.length
            }
          : null,

      settings:
        {
          ...STATE.settings
        },

      metrics:
        {
          ...STATE.metrics
        },

      privacy:
        getPrivacyStatus(),

      environment:
        getEnvironmentContext(),

      capabilities:
        {
          speechSynthesis:
            supported(),

          voices:
            STATE.voices.length,

          tonalEngine:
            !!TONAL,

          environmentEngine:
            !!ENV,

          liturgyEngine:
            !!LITURGY
        },

      errors:
        STATE.errors.slice(-10)
    };
  }

  /* ------------------------------------------------------------
     COMMAND REGISTRATION
     ------------------------------------------------------------ */

  function registerCommands() {

    const commands = {

      "audio.performance.status":
        async () =>
          getStatus(),

      "audio.performance.voices":
        async () =>
          refreshVoices(),

      "audio.performance.language":
        async args =>
          setLanguage(
            args?.language
          ),

      "audio.performance.voice":
        async args =>
          setVoice(
            args?.name
          ),

      "audio.performance.settings":
        async args =>
          setSpeechSettings(
            args || {}
          ),

      "audio.performance.speak":
        async args =>
          speakText(
            args?.text ||
              "",
            args || {}
          ),

      "audio.performance.declaration":
        async args =>
          declaration(
            args?.text ||
              "",
            args || {}
          ),

      "audio.performance.chant":
        async args =>
          chant(
            args?.lines ||
              [],
            args || {}
          ),

      "audio.performance.callResponse":
        async args =>
          callResponse(
            args?.call ||
              "",
            args?.response ||
              "",
            args || {}
          ),

      "audio.performance.response":
        async args =>
          submitResponse(
            args?.response ||
              ""
          ),

      "audio.performance.meditation":
        async args =>
          meditation(
            args?.durationMs ||
              60000
          ),

      "audio.performance.createSession":
        async args =>
          createSession(
            args || {}
          ),

      "audio.performance.performSession":
        async args =>
          performSession(
            args?.session ||
              STATE.session
          ),

      "audio.performance.bloodline":
        async args =>
          bloodlineSession(
            args?.people ||
              [],
            args || {}
          ),

      "audio.performance.question":
        async args =>
          answerQuestion(
            args?.question ||
              "",
            args || {}
          ),

      "audio.performance.adapt":
        async () =>
          adaptPerformance(),

      "audio.performance.pause":
        async () =>
          pause(),

      "audio.performance.resume":
        async () =>
          resume(),

      "audio.performance.stop":
        async () =>
          stop(),

      "audio.performance.privacy":
        async args =>
          setPrivacyMode(
            args?.enabled
          )
    };

    try {

      if (
        LITURGY &&
        typeof
          LITURGY.registerCommand ===
          "function"
      ) {

        Object.entries(
          commands
        ).forEach(
          ([name, handler]) => {

            try {

              LITURGY.registerCommand(
                name,
                handler
              );

            } catch (_) {}
          }
        );
      }

    } catch (err) {

      error(
        err,
        "registerCommands.liturgy"
      );
    }

    try {

      if (
        window.ChirombeBus &&
        typeof
          window.ChirombeBus
            .registerCommand ===
          "function"
      ) {

        Object.entries(
          commands
        ).forEach(
          ([name, handler]) => {

            try {

              window.ChirombeBus
                .registerCommand(
                  name,
                  handler
                );

            } catch (_) {}
          }
        );
      }

    } catch (err) {

      error(
        err,
        "registerCommands.bus"
      );
    }

    return Object.keys(
      commands
    );
  }

  /* ------------------------------------------------------------
     SYSTEM EVENT INTEGRATION
     ------------------------------------------------------------ */

  function registerSystemEvents() {

    const events = [

      "LIVING_WATCH_STARTED",

      "BLOODLINE_LITURGY_READY",

      "RITUAL_SESSION_CREATED",

      "FAMILY_UNITY",

      "SECURITY_ALERT",

      "WATCHDOG_ALERT",

      "RECOVERY",

      "AUDIO_SAFE_STOP",

      "ENGINE_INTEGRITY_FAILURE"
    ];

    events.forEach(
      eventName => {

        try {

          window.addEventListener(
            eventName,
            event => {

              const detail =
                event?.detail ||
                {};

              emit(
                "AUDIO_PERFORMANCE_SYSTEM_EVENT",
                {
                  source:
                    eventName,

                  detail
                }
              );

              /*
               * Security events alter the
               * computational performance mode.
               *
               * They do not establish a
               * supernatural interpretation.
               */

              if (
                eventName ===
                  "SECURITY_ALERT" ||
                eventName ===
                  "WATCHDOG_ALERT"
              ) {

                STATE.mode =
                  MODES.PROTECTION;

                emit(
                  "AUDIO_PERFORMANCE_PROTECTION_MODE",
                  {
                    reason:
                      eventName
                  }
                );
              }

              if (
                eventName ===
                "RECOVERY"
              ) {

                STATE.mode =
                  MODES.NIGHT_WATCH;
              }

              if (
                eventName ===
                "AUDIO_SAFE_STOP"
              ) {

                stop();
              }
            }
          );

        } catch (_) {}
      }
    );
  }

  /* ------------------------------------------------------------
     INITIALISE
     ------------------------------------------------------------ */

  function initialise() {

    refreshVoices();

    if (
      supported()
    ) {

      try {

        window
          .speechSynthesis
          .addEventListener(
            "voiceschanged",
            refreshVoices
          );

      } catch (_) {}
    }

    registerCommands();

    registerSystemEvents();

    STATE.state =
      STATES.READY;

    emit(
      "AUDIO_PERFORMANCE_ENGINE_READY",
      {
        version:
          VERSION,

        speechSynthesis:
          supported(),

        voiceCount:
          STATE.voices.length
      }
    );

    return getStatus();
  }

  /* ------------------------------------------------------------
     PUBLIC API
     ------------------------------------------------------------ */

  const API = {

    VERSION,

    STATES,

    MODES,

    LANGUAGES,

    CONFIG,

    initialise,

    supported,

    refreshVoices,

    findVoice,

    setLanguage,

    setVoice,

    setSpeechSettings,

    speakText,

    declaration,

    chant,

    callResponse,

    submitResponse,

    meditation,

    createSession,

    queueSession,

    performItem,

    performSession,

    bloodlineSession,

    answerQuestion,

    adaptPerformance,

    getEnvironmentContext,

    pause,

    resume,

    stop,

    isNovel,

    rememberSpeech,

    setPrivacyMode,

    getPrivacyStatus,

    getStatus
  };

  /* ------------------------------------------------------------
     EXPORTS
     ------------------------------------------------------------ */

  window.CHIROMBE_AUDIO_PERFORMANCE_ENGINE =
    API;

  window.CHIROMBE_AUDIO_PERFORMANCE =
    API;

  window.CHIROMBE_AUDIO =
    window.CHIROMBE_AUDIO ||
    {};

  window.CHIROMBE_AUDIO.Performance =
    API;

  /*
   * Do not automatically speak on page load.
   *
   * Browser speech engines are user-facing output
   * and should begin from an explicit CHIROMBE
   * activation command.
   */

  initialise();

  console.log(
    "[CHIROMBE AUDIO] Part 7 Voice / Chant / Performance Engine " +
      VERSION +
      " ready."
  );

})();
/* ============================================================
   CHIROMBE AUDIO LIVING LITURGY
   PART 7 — VOICE / CHANT / PERFORMANCE ENGINE
   VERSION 7.0.0
   ============================================================ */

(() => {
  "use strict";

  const VERSION = "7.0.0";

  const AUDIO =
    window.CHIROMBE_AUDIO || {};

  const ENV =
    window.CHIROMBE_AUDIO_ENVIRONMENT_ENGINE ||
    AUDIO.Environment ||
    null;

  const TONAL =
    window.CHIROMBE_AUDIO_TONAL_ENGINE ||
    AUDIO.Tonal ||
    null;

  const LITURGY =
    window.CHIROMBE_AUDIO_LITURGY_ENGINE ||
    AUDIO.Liturgy ||
    null;

  const STATES = Object.freeze({
    DORMANT: "DORMANT",
    READY: "READY",
    PREPARING: "PREPARING",
    SPEAKING: "SPEAKING",
    CHANTING: "CHANTING",
    CALL_RESPONSE: "CALL_RESPONSE",
    READING: "READING",
    MEDITATION: "MEDITATION",
    PAUSED: "PAUSED",
    WAITING_RESPONSE: "WAITING_RESPONSE",
    SAFE_STOP: "SAFE_STOP",
    ERROR: "ERROR"
  });

  const MODES = Object.freeze({
    DECLARATION: "DECLARATION",
    SUPPLICATION: "SUPPLICATION",
    CHANT: "CHANT",
    CALL_RESPONSE: "CALL_RESPONSE",
    READING: "READING",
    MEDITATION: "MEDITATION",
    FAMILY_BLESSING: "FAMILY_BLESSING",
    PROTECTION: "PROTECTION",
    GRATITUDE: "GRATITUDE",
    REMEMBRANCE: "REMEMBRANCE",
    UNITY: "UNITY",
    NIGHT_WATCH: "NIGHT_WATCH",
    CLOSING: "CLOSING"
  });

  const LANGUAGES = Object.freeze({
    ENGLISH: "en-GB",
    SHONA: "sn-ZW",
    ZULU: "zu-ZA",
    XHOSA: "xh-ZA",
    FRENCH: "fr-FR",
    PORTUGUESE: "pt-PT",
    SPANISH: "es-ES"
  });

  const CONFIG = {
    defaultLanguage: LANGUAGES.ENGLISH,

    defaultRate: 0.88,
    minRate: 0.55,
    maxRate: 1.25,

    defaultPitch: 0,
    minPitch: -2,
    maxPitch: 2,

    defaultVolume: 0.86,
    maxVolume: 0.92,

    pauseBetweenSentencesMs: 700,
    pauseBetweenSectionsMs: 1600,

    responseTimeoutMs: 15000,

    maximumTextLength: 12000,
    maximumSessionItems: 200,

    noveltyWindow: 100,
    maxHistory: 500,

    privacy: {
      retainTranscript: true,
      retainSpeechAudio: false,
      uploadTranscript: false,
      externalAI: false
    },

    safety: {
      maximumContinuousSpeechMs:
        15 * 60 * 1000,

      maximumSessionMs:
        60 * 60 * 1000,

      maximumQueue: 200
    }
  };

  const STATE = {
    state: STATES.DORMANT,
    mode: MODES.DECLARATION,

    language:
      CONFIG.defaultLanguage,

    voice: null,
    voices: [],

    speaking: false,
    paused: false,

    startedAt: null,
    speechStartedAt: null,

    currentItem: null,
    queue: [],

    session: null,

    history: [],
    spokenHashes: [],

    response: null,

    metrics: {
      sessions: 0,
      utterances: 0,
      words: 0,
      characters: 0,
      calls: 0,
      responses: 0,
      interruptions: 0,
      completed: 0,
      errors: 0
    },

    settings: {
      rate: CONFIG.defaultRate,
      pitch: CONFIG.defaultPitch,
      volume: CONFIG.defaultVolume,
      autoPunctuation: true,
      automaticAdaptation: true,
      privacyMode: false
    },

    errors: []
  };

  function now() {
    return Date.now();
  }

  function uid(prefix = "voice") {
    return (
      prefix +
      "_" +
      Date.now().toString(36) +
      "_" +
      Math.random()
        .toString(36)
        .slice(2, 9)
    );
  }

  function clamp(value, min, max) {
    return Math.min(
      max,
      Math.max(
        min,
        Number(value)
      )
    );
  }

  function cleanText(text) {
    return String(text ?? "")
      .replace(
        /<script[\s\S]*?<\/script>/gi,
        ""
      )
      .replace(
        /<[^>]+>/g,
        " "
      )
      .replace(/\s+/g, " ")
      .trim()
      .slice(
        0,
        CONFIG.maximumTextLength
      );
  }

  function hashText(text) {
    let hash = 2166136261;
    const value = String(text);

    for (
      let i = 0;
      i < value.length;
      i++
    ) {
      hash ^= value.charCodeAt(i);

      hash +=
        (hash << 1) +
        (hash << 4) +
        (hash << 7) +
        (hash << 8) +
        (hash << 24);
    }

    return (
      hash >>> 0
    ).toString(16);
  }

  function emit(type, detail = {}) {
    const event = {
      id: uid("performance-event"),
      type,
      timestamp: now(),
      version: VERSION,
      detail
    };

    try {
      window.dispatchEvent(
        new CustomEvent(
          "CHIROMBE_AUDIO_PERFORMANCE_EVENT",
          {
            detail: event
          }
        )
      );
    } catch (_) {}

    try {
      if (
        window.ChirombeBus &&
        typeof window.ChirombeBus.emit ===
          "function"
      ) {
        window.ChirombeBus.emit(
          type,
          detail
        );
      }
    } catch (_) {}

    return event;
  }

  function recordError(err, context) {
    const item = {
      id: uid("voice-error"),
      timestamp: now(),
      context,
      message:
        err?.message ||
        String(err)
    };

    STATE.errors.push(item);

    STATE.metrics.errors++;

    if (
      STATE.errors.length > 100
    ) {
      STATE.errors.shift();
    }

    emit(
      "AUDIO_PERFORMANCE_ERROR",
      item
    );

    return item;
  }

  /* ==========================================================
     SPEECH SYNTHESIS
     ========================================================== */

  function supported() {
    return (
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      typeof SpeechSynthesisUtterance !==
        "undefined"
    );
  }

  function refreshVoices() {
    if (!supported()) {
      STATE.voices = [];
      return [];
    }

    try {
      STATE.voices =
        window.speechSynthesis
          .getVoices()
          .slice();

      return STATE.voices;
    } catch (err) {
      recordError(
        err,
        "refreshVoices"
      );

      return [];
    }
  }

  function findVoice(
    language = STATE.language
  ) {
    const voices =
      refreshVoices();

    if (!voices.length) {
      return null;
    }

    const requested =
      String(language)
        .toLowerCase();

    const exact =
      voices.find(
        voice =>
          String(
            voice.lang
          ).toLowerCase() ===
          requested
      );

    if (exact) {
      return exact;
    }

    const base =
      requested.split("-")[0];

    return (
      voices.find(
        voice =>
          String(
            voice.lang
          )
            .toLowerCase()
            .startsWith(base)
      ) ||
      voices.find(
        voice =>
          /english/i.test(
            voice.lang
          )
      ) ||
      voices[0]
    );
  }

  function setLanguage(
    language
  ) {
    const valid =
      Object.values(
        LANGUAGES
      );

    if (
      !valid.includes(language) &&
      !/^[a-z]{2,3}(-[A-Z]{2})?$/i.test(
        String(language)
      )
    ) {
      throw new Error(
        "Unsupported language."
      );
    }

    STATE.language =
      language;

    STATE.voice =
      findVoice(language);

    emit(
      "AUDIO_LANGUAGE_CHANGED",
      {
        language,
        voice:
          STATE.voice?.name ||
          null
      }
    );

    return {
      language,
      voice:
        STATE.voice?.name ||
        null
    };
  }

  function setVoice(
    voiceName
  ) {
    refreshVoices();

    const voice =
      STATE.voices.find(
        item =>
          item.name === voiceName
      );

    if (!voice) {
      throw new Error(
        "Speech voice not found."
      );
    }

    STATE.voice = voice;
    STATE.language = voice.lang;

    emit(
      "AUDIO_VOICE_CHANGED",
      {
        voice: voice.name,
        language: voice.lang
      }
    );

    return voice;
  }

  function setSpeechSettings(
    settings = {}
  ) {
    if (
      settings.rate !== undefined
    ) {
      STATE.settings.rate =
        clamp(
          settings.rate,
          CONFIG.minRate,
          CONFIG.maxRate
        );
    }

    if (
      settings.pitch !== undefined
    ) {
      STATE.settings.pitch =
        clamp(
          settings.pitch,
          CONFIG.minPitch,
          CONFIG.maxPitch
        );
    }

    if (
      settings.volume !== undefined
    ) {
      STATE.settings.volume =
        clamp(
          settings.volume,
          0,
          CONFIG.maxVolume
        );
    }

    if (
      settings.automaticAdaptation !==
      undefined
    ) {
      STATE.settings
        .automaticAdaptation =
        !!settings
          .automaticAdaptation;
    }

    return {
      ...STATE.settings
    };
  }

  /* ==========================================================
     TONAL ENGINE DUCKING
     ========================================================== */

  function voiceDuck(
    enabled
  ) {
    try {
      if (
        TONAL &&
        typeof TONAL.setVoiceDuck ===
          "function"
      ) {
        TONAL.setVoiceDuck(
          enabled ? 0.20 : 1
        );

        return true;
      }
    } catch (err) {
      recordError(
        err,
        "voiceDuck"
      );
    }

    return false;
  }

  /* ==========================================================
     SPEAK
     ========================================================== */

  function speakText(
    text,
    options = {}
  ) {
    return new Promise(
      resolve => {

        if (!supported()) {
          recordError(
            new Error(
              "Speech synthesis unavailable."
            ),
            "speakText"
          );

          resolve({
            ok: false,
            reason: "unsupported"
          });

          return;
        }

        const clean =
          cleanText(text);

        if (!clean) {
          resolve({
            ok: false,
            reason: "empty_text"
          });

          return;
        }

        try {
          window.speechSynthesis.cancel();
        } catch (_) {}

        const utterance =
          new SpeechSynthesisUtterance(
            clean
          );

        const language =
          options.language ||
          STATE.language;

        const voice =
          options.voice ||
          findVoice(language);

        utterance.lang =
          language;

        if (voice) {
          utterance.voice =
            voice;
        }

        utterance.rate =
          clamp(
            options.rate ??
              STATE.settings.rate,
            CONFIG.minRate,
            CONFIG.maxRate
          );

        utterance.pitch =
          clamp(
            options.pitch ??
              STATE.settings.pitch,
            CONFIG.minPitch,
            CONFIG.maxPitch
          );

        utterance.volume =
          clamp(
            options.volume ??
              STATE.settings.volume,
            0,
            CONFIG.maxVolume
          );

        const started =
          now();

        STATE.state =
          STATES.SPEAKING;

        STATE.speaking = true;
        STATE.speechStartedAt =
          started;

        voiceDuck(true);

        emit(
          "AUDIO_SPEECH_STARTED",
          {
            text:
              STATE.settings
                .privacyMode
                ? "[PRIVATE]"
                : clean,

            language,

            voice:
              voice?.name ||
              null,

            mode:
              STATE.mode
          }
        );

        utterance.onend =
          () => {

            STATE.speaking =
              false;

            STATE.metrics
              .utterances++;

            STATE.metrics.words +=
              clean.split(
                /\s+/
              ).length;

            STATE.metrics
              .characters +=
              clean.length;

            voiceDuck(false);

            emit(
              "AUDIO_SPEECH_COMPLETED",
              {
                durationMs:
                  now() -
                  started
              }
            );

            resolve({
              ok: true,
              text: clean,
              durationMs:
                now() -
                started
            });
          };

        utterance.onerror =
          event => {

            STATE.speaking =
              false;

            voiceDuck(false);

            recordError(
              new Error(
                event?.error ||
                "Speech synthesis error."
              ),
              "speech.onerror"
            );

            resolve({
              ok: false,
              reason:
                event?.error ||
                "speech_error"
            });
          };

        try {
          window.speechSynthesis
            .speak(
              utterance
            );
        } catch (err) {

          STATE.speaking =
            false;

          voiceDuck(false);

          recordError(
            err,
            "speechSynthesis.speak"
          );

          resolve({
            ok: false,
            reason:
              "speak_exception"
          });
        }
      }
    );
  }

  /* ==========================================================
     CONTROL
     ========================================================== */

  function stop() {
    try {
      if (supported()) {
        window.speechSynthesis.cancel();
      }
    } catch (_) {}

    STATE.queue = [];
    STATE.speaking = false;
    STATE.paused = false;

    voiceDuck(false);

    STATE.state =
      STATES.READY;

    STATE.metrics
      .interruptions++;

    emit(
      "AUDIO_PERFORMANCE_STOPPED"
    );

    return true;
  }

  function pause() {
    try {
      if (
        supported() &&
        window.speechSynthesis
          .speaking
      ) {
        window.speechSynthesis.pause();

        STATE.paused = true;
        STATE.state =
          STATES.PAUSED;

        emit(
          "AUDIO_PERFORMANCE_PAUSED"
        );

        return true;
      }
    } catch (err) {
      recordError(
        err,
        "pause"
      );
    }

    return false;
  }

  function resume() {
    try {
      if (
        supported() &&
        window.speechSynthesis
          .paused
      ) {
        window.speechSynthesis.resume();

        STATE.paused = false;
        STATE.state =
          STATES.SPEAKING;

        emit(
          "AUDIO_PERFORMANCE_RESUMED"
        );

        return true;
      }
    } catch (err) {
      recordError(
        err,
        "resume"
      );
    }

    return false;
  }

  /* ==========================================================
     NOVELTY
     ========================================================== */

  function isNovel(text) {
    return !STATE.spokenHashes.includes(
      hashText(
        cleanText(text)
      )
    );
  }

  function rememberSpeech(text) {
    const hash =
      hashText(
        cleanText(text)
      );

    STATE.spokenHashes.push(hash);

    if (
      STATE.spokenHashes.length >
      CONFIG.noveltyWindow
    ) {
      STATE.spokenHashes.shift();
    }

    return hash;
  }

  /* ==========================================================
     ORIGINAL DEVOTIONAL LIBRARY
     ========================================================== */

  const LIBRARY = {

    openings: [
      "Mwari Ndi Mwari. Let truth, peace and wisdom guide this moment.",

      "Mudzimu Unoyera, let this family be guided in peace, courage and unity.",

      "We enter this moment with gratitude, humility, courage and a clear intention for peace.",

      "Let this moment become a place of stillness, reflection, protection and wise action."
    ],

    protection: [
      "May this family walk in peace, truth, wisdom and courage.",

      "May every member of this family be strengthened to choose what is good, truthful and life-giving.",

      "May fear give way to courage, confusion give way to wisdom, and division give way to unity.",

      "May this household be strengthened by peace, disciplined thought, compassion and resilience.",

      "May every person connected to this family find strength, safety, wisdom and a clear path forward."
    ],

    gratitude: [
      "We give thanks for life, family, memory, learning and every opportunity to do what is right.",

      "We give thanks for those who taught us, those who protected us and those who continue the work of love and truth."
    ],

    courage: [
      "Let courage rise where fear has been present.",

      "Let wisdom govern every decision.",

      "Let truth remain stronger than confusion.",

      "Let patience become strength.",

      "Let compassion remain present even in difficult circumstances."
    ],

    unity: [
      "May this family remain united without removing the dignity of any individual.",

      "May differences be met with patience, truth and understanding.",

      "May every generation contribute something valuable to those who follow."
    ],

    reflection: [
      "Be still for a moment and notice the breath.",

      "Notice the environment without judging it.",

      "Notice sound as sound, movement as movement and thought as thought.",

      "Allow the mind to settle before choosing the next action."
    ],

    closing: [
      "We close this moment with gratitude, peace, wisdom and courage.",

      "May the peace of this moment continue into the next hour, the next decision and the next day.",

      "Mwari Ndi Mwari. We proceed with truth, courage, humility and peace."
    ]
  };

  const SHONA_LIBRARY = {

    opening: [
      "Mwari Ndi Mwari. Ngatipindei munguva ino nerunyararo, chokwadi, njere uye ushingi.",

      "Mudzimu Unoyera, tungamirirai mhuri iyi murunyararo, rudo, chokwadi uye kubatana."
    ],

    protection: [
      "Dai mhuri iyi ifambe murunyararo, muchokwadi, munjere uye muushingi.",

      "Dai kutya kutsiviwa neushingi, kuvhiringidzika kutsiviwa nenjere, uye kupatsanuka kutsiviwa nekubatana.",

      "Dai vanhu vemhuri iyi vawana simba, runyararo, njere uye nzira yakajeka yekuenderera mberi."
    ],

    gratitude: [
      "Tinotenda Mwari neupenyu, mhuri, vadzidzisi, ndangariro uye mikana mitsva.",

      "Tinorangarira zvakanaka zvakapfuura uye zvatakadzidza kubva mazviri."
    ],

    unity: [
      "Dai mhuri iyi irambe yakabatana ichichengeta chiremerera chemunhu wese.",

      "Dai kusiyana kwedu kusanganiswe nemoyo murefu, chokwadi uye kunzwisisana."
    ],

    closing: [
      "Tinopedzisa nguva iyi nekutenda, rugare, njere uye ushingi.",

      "Mwari Ndi Mwari. Ngatiendererei muchokwadi, murugare uye nemoyo wakasimba."
    ]
  };

  function randomItem(list) {
    if (
      !Array.isArray(list) ||
      !list.length
    ) {
      return "";
    }

    const novel =
      list.filter(
        item =>
          isNovel(item)
      );

    const source =
      novel.length
        ? novel
        : list;

    return source[
      Math.floor(
        Math.random() *
          source.length
      )
    ];
  }

  function getLibrary(
    language
  ) {
    return String(language)
      .toLowerCase()
      .startsWith("sn")
      ? SHONA_LIBRARY
      : LIBRARY;
  }

  /* ==========================================================
     PERSON PRAYER
     ========================================================== */

  function personPrayer(
    person = {},
    options = {}
  ) {

    const name =
      cleanText(
        person.displayName ||
        person.name ||
        "this person"
      );

    const language =
      options.language ||
      STATE.language;

    const shona =
      String(language)
        .toLowerCase()
        .startsWith("sn");

    const library =
      getLibrary(language);

    if (shona) {

      return [
        "Tinonyengeterera " +
          name +
          " nhasi.",

        randomItem(
          library.protection
        ),

        "Dai awana rugare, njere, ushingi uye hutungamiri hwakanaka.",

        "Dai nzira yake izadzwa nechokwadi, rudo uye kuchenjera."
      ].join(" ");

    }

    return [
      "We hold " +
        name +
        " in this moment of prayer.",

      randomItem(
        library.protection
      ),

      "May " +
        name +
        " have peace, wisdom, courage and good guidance.",

      "May every decision ahead be approached with clarity, patience and truth."
    ].join(" ");
  }

  /* ==========================================================
     SESSION CREATION
     ========================================================== */

  function createSession(
    options = {}
  ) {

    const mode =
      options.mode ||
      STATE.mode;

    const language =
      options.language ||
      STATE.language;

    const duration =
      clamp(
        Number(
          options.durationMinutes ||
          10
        ),
        1,
        60
      );

    const people =
      Array.isArray(
        options.people
      )
        ? options.people
        : [];

    const library =
      getLibrary(language);

    const items = [];

    function add(
      type,
      text,
      metadata = {}
    ) {

      const clean =
        cleanText(text);

      if (!clean) {
        return;
      }

      items.push({
        id: uid("lit-item"),
        type,
        text: clean,
        language,
        mode,
        metadata
      });
    }

    add(
      "OPENING",
      randomItem(
        library.opening ||
        library.openings ||
        LIBRARY.openings
      )
    );

    if (
      mode === MODES.PROTECTION
    ) {

      add(
        "PROTECTION",
        randomItem(
          library.protection
        )
      );

      add(
        "COURAGE",
        randomItem(
          LIBRARY.courage
        )
      );
    }

    if (
      mode === MODES.GRATITUDE
    ) {
      add(
        "GRATITUDE",
        randomItem(
          library.gratitude
        )
      );
    }

    if (
      mode === MODES.UNITY ||
      mode ===
        MODES.FAMILY_BLESSING
    ) {

      add(
        "UNITY",
        randomItem(
          library.unity
        )
      );
    }

    if (
      mode === MODES.REMEMBRANCE
    ) {

      add(
        "REMEMBRANCE",
        "We remember those whose lives, teachings and examples contributed to the family story. May remembrance become wisdom, gratitude and constructive action."
      );
    }

    people.forEach(
      person => {

        if (
          items.length >=
          CONFIG.maximumSessionItems
        ) {
          return;
        }

        add(
          "PERSON_PRAYER",
          personPrayer(
            person,
            {
              language
            }
          ),
          {
            personKey:
              person.personKey ||
              person.id ||
              null,

            displayName:
              person.displayName ||
              person.name ||
              null
          }
        );
      }
    );

    add(
      "REFLECTION",
      randomItem(
        library.reflection ||
        LIBRARY.reflection
      )
    );

    add(
      "CLOSING",
      randomItem(
        library.closing ||
        LIBRARY.closing
      )
    );

    const session = {
      id:
        uid("liturgy-session"),

      createdAt:
        now(),

      mode,
      language,

      durationMinutes:
        duration,

      peopleCount:
        people.length,

      items,

      status:
        "CREATED",

      provenance:
        "CHIROMBE_ORIGINAL_GENERATIVE_LITURGY",

      interpretationBoundary:
        "DEVOTIONAL_CONTENT_NOT_SUPERNATURAL_EVIDENCE"
    };

    STATE.session =
      session;

    STATE.metrics.sessions++;

    emit(
      "AUDIO_LITURGY_SESSION_CREATED",
      {
        sessionId:
          session.id,

        mode,
        language,

        itemCount:
          items.length,

        peopleCount:
          people.length
      }
    );

    return session;
  }

  /* ==========================================================
     QUEUE / PERFORMANCE
     ========================================================== */

  function queueSession(
    session
  ) {

    if (
      !session ||
      !Array.isArray(
        session.items
      )
    ) {
      throw new Error(
        "Invalid liturgy session."
      );
    }

    STATE.queue =
      session.items.slice(
        0,
        CONFIG.safety.maximumQueue
      );

    return STATE.queue.length;
  }

  function delay(ms) {
    return new Promise(
      resolve =>
        setTimeout(
          resolve,
          Math.max(
            0,
            Number(ms) || 0
          )
        )
    );
  }

  async function performItem(
    item
  ) {

    if (!item) {
      return false;
    }

    STATE.currentItem =
      item;

    if (
      item.type === "SILENCE"
    ) {

      await delay(
        item.durationMs ||
        CONFIG.pauseBetweenSectionsMs
      );

      return true;
    }

    const hash =
      rememberSpeech(
        item.text
      );

    emit(
      "AUDIO_LITURGY_ITEM_STARTED",
      {
        itemId:
          item.id,

        type:
          item.type,

        hash,

        metadata:
          item.metadata || {}
      }
    );

    const result =
      await speakText(
        item.text,
        {
          language:
            item.language ||
            STATE.language,

          rate:
            item.rate ||
            STATE.settings.rate,

          pitch:
            item.pitch ||
            STATE.settings.pitch,

          volume:
            item.volume ||
            STATE.settings.volume
        }
      );

    await delay(
      item.type === "CLOSING"
        ? CONFIG.pauseBetweenSectionsMs
        : CONFIG.pauseBetweenSentencesMs
    );

    emit(
      "AUDIO_LITURGY_ITEM_COMPLETED",
      {
        itemId:
          item.id,

        ok:
          !!result.ok,

        type:
          item.type
      }
    );

    return !!result.ok;
  }

  async function performSession(
    session =
      STATE.session
  ) {

    if (!session) {
      throw new Error(
        "No liturgy session."
      );
    }

    STATE.startedAt =
      now();

    STATE.state =
      STATES.PREPARING;

    session.status =
      "PERFORMING";

    queueSession(
      session
    );

    emit(
      "AUDIO_LITURGY_PERFORMANCE_STARTED",
      {
        sessionId:
          session.id
      }
    );

    let completed = 0;

    try {

      while (
        STATE.queue.length
      ) {

        if (
          STATE.state ===
            STATES.SAFE_STOP ||
          STATE.state ===
            STATES.PAUSED
        ) {
          break;
        }

        if (
          now() -
            STATE.startedAt >
          CONFIG.safety.maximumSessionMs
        ) {

          stop();

          session.status =
            "TIME_LIMIT";

          break;
        }

        const item =
          STATE.queue.shift();

        if (
          await performItem(item)
        ) {
          completed++;
        }
      }

      if (
        completed ===
        session.items.length
      ) {

        session.status =
          "COMPLETED";

        STATE.metrics.completed++;

      } else if (
        STATE.state ===
        STATES.PAUSED
      ) {

        session.status =
          "PAUSED";

      } else {

        session.status =
          "STOPPED";
      }

      STATE.history.push({
        sessionId:
          session.id,

        timestamp:
          now(),

        mode:
          session.mode,

        language:
          session.language,

        completed,

        total:
          session.items.length,

        status:
          session.status
      });

      if (
        STATE.history.length >
        CONFIG.maxHistory
      ) {
        STATE.history.shift();
      }

      emit(
        "AUDIO_LITURGY_PERFORMANCE_COMPLETED",
        {
          sessionId:
            session.id,

          completed,

          total:
            session.items.length,

          status:
            session.status
        }
      );

      STATE.state =
        STATES.READY;

      return session;

    } catch (err) {

      recordError(
        err,
        "performSession"
      );

      session.status =
        "ERROR";

      STATE.state =
        STATES.ERROR;

      return session;
    }
  }

  /* ==========================================================
     CHANT
     ========================================================== */

  async function chant(
    lines = [],
    options = {}
  ) {

    if (
      !Array.isArray(lines) ||
      !lines.length
    ) {
      return false;
    }

    STATE.state =
      STATES.CHANTING;

    const repetitions =
      clamp(
        options.repetitions ??
          1,
        1,
        12
      );

    for (
      let cycle = 0;
      cycle < repetitions;
      cycle++
    ) {

      for (
        let i = 0;
        i < lines.length;
        i++
      ) {

        if (
          STATE.state ===
          STATES.SAFE_STOP
        ) {
          return false;
        }

        const line =
          cleanText(
            lines[i]
          );

        if (!line) {
          continue;
        }

        await speakText(
          line,
          {
            language:
              options.language ||
              STATE.language,

            rate:
              options.rate ||
              0.72,

            pitch:
              options.pitch ??
              STATE.settings.pitch,

            volume:
              options.volume ??
              STATE.settings.volume
          }
        );

        await delay(
          options.pauseMs ??
          900
        );
      }
    }

    STATE.state =
      STATES.READY;

    emit(
      "AUDIO_CHANT_COMPLETED",
      {
        cycles:
          repetitions,

        lines:
          lines.length
      }
    );

    return true;
  }

  /* ==========================================================
     DECLARATION
     ========================================================== */

  async function declaration(
    text,
    options = {}
  ) {

    STATE.mode =
      MODES.DECLARATION;

    return speakText(
      cleanText(text),
      {
        language:
          options.language ||
          STATE.language,

        rate:
          options.rate ||
          0.82,

        pitch:
          options.pitch ??
          STATE.settings.pitch,

        volume:
          options.volume ??
          STATE.settings.volume
      }
    );
  }

  /* ==========================================================
     CALL / RESPONSE
     ========================================================== */

  async function callResponse(
    call,
    response,
    options = {}
  ) {

    STATE.state =
      STATES.CALL_RESPONSE;

    STATE.metrics.calls++;

    await speakText(
      call,
      options
    );

    STATE.state =
      STATES.WAITING_RESPONSE;

    STATE.response = {
      expected:
        response,

      startedAt:
        now(),

      received:
        null
    };

    emit(
      "AUDIO_WAITING_FOR_RESPONSE",
      {
        timeoutMs:
          CONFIG.responseTimeoutMs
      }
    );

    await delay(
      options.timeoutMs ||
      CONFIG.responseTimeoutMs
    );

    return STATE.response;
  }

  function submitResponse(
    response
  ) {

    if (!STATE.response) {
      return false;
    }

    STATE.response.received =
      cleanText(response);

    STATE.metrics.responses++;

    emit(
      "AUDIO_RESPONSE_RECEIVED",
      {
        response:
          STATE.settings.privacyMode
            ? "[PRIVATE]"
            : STATE.response.received
      }
    );

    return true;
  }

  /* ==========================================================
     MEDITATION
     ========================================================== */

  async function meditation(
    durationMs = 60000
  ) {

    STATE.state =
      STATES.MEDITATION;

    emit(
      "AUDIO_MEDITATION_STARTED",
      {
        durationMs
      }
    );

    await delay(
      clamp(
        durationMs,
        1000,
        15 * 60 * 1000
      )
    );

    STATE.state =
      STATES.READY;

    emit(
      "AUDIO_MEDITATION_COMPLETED"
    );

    return true;
  }

  /* ==========================================================
     ENVIRONMENT ADAPTATION
     ========================================================== */

  function getEnvironmentContext() {

    try {

      if (
        ENV &&
        typeof ENV.getStatus ===
          "function"
      ) {

        const status =
          ENV.getStatus();

        return {
          classification:
            status.environment
              ?.classification ||
            "UNKNOWN",

          acoustic:
            status.acoustic
              ?.environment ||
            "UNKNOWN",

          motion:
            status.motion
              ?.classification ||
            "UNKNOWN",

          light:
            status.light
              ?.classification ||
            "UNKNOWN",

          confidence:
            status.environment
              ?.confidence ||
            0
        };
      }

    } catch (err) {

      recordError(
        err,
        "environmentContext"
      );
    }

    return {
      classification:
        "UNKNOWN",

      acoustic:
        "UNKNOWN",

      motion:
        "UNKNOWN",

      light:
        "UNKNOWN",

      confidence:
        0
    };
  }

  async function adaptPerformance() {

    if (
      !STATE.settings
        .automaticAdaptation
    ) {
      return null;
    }

    const environment =
      getEnvironmentContext();

    let rate =
      STATE.settings.rate;

    let pause =
      CONFIG.pauseBetweenSentencesMs;

    if (
      environment.acoustic ===
        "SILENT" &&
      environment.motion ===
        "STILL"
    ) {

      rate =
        clamp(
          rate - 0.08,
          CONFIG.minRate,
          CONFIG.maxRate
        );

      pause += 500;
    }

    if (
      environment.acoustic ===
        "LOUD" ||
      environment.motion ===
        "ACTIVE"
    ) {

      rate =
        clamp(
          rate + 0.05,
          CONFIG.minRate,
          CONFIG.maxRate
        );

      pause =
        Math.max(
          500,
          pause - 250
        );
    }

    return {
      rate,
      pause,
      environment
    };
  }

  /* ==========================================================
     QUESTION / INQUIRY
     ========================================================== */

  async function answerQuestion(
    question,
    options = {}
  ) {

    const q =
      cleanText(question);

    if (!q) {
      return false;
    }

    const environment =
      getEnvironmentContext();

    let response =
      "I can help you reflect on that. CHIROMBE will separate what has actually been measured from spiritual or devotional interpretation.";

    if (
      /environment|sound|noise|microphone/i.test(
        q
      )
    ) {

      response =
        "The current measurable environment is " +
        environment.classification +
        ". The acoustic state is " +
        environment.acoustic +
        ", and the motion state is " +
        environment.motion +
        ". These are sensor observations and do not by themselves establish a supernatural cause.";
    }

    if (
      /status|system|chirombe/i.test(
        q
      )
    ) {

      response =
        "CHIROMBE audio performance is currently in " +
        STATE.state +
        " mode, using " +
        STATE.language +
        ".";
    }

    await speakText(
      response,
      {
        language:
          options.language ||
          STATE.language,

        rate: 0.86
      }
    );

    return response;
  }

  /* ==========================================================
     BLOODLINE SESSION
     ========================================================== */

  async function bloodlineSession(
    people = [],
    options = {}
  ) {

    const session =
      createSession({
        mode:
          options.mode ||
          MODES.FAMILY_BLESSING,

        language:
          options.language ||
          STATE.language,

        durationMinutes:
          options.durationMinutes ||
          15,

        people:
          Array.isArray(people)
            ? people
            : []
      });

    return performSession(
      session
    );
  }

  /* ==========================================================
     PRIVACY
     ========================================================== */

  function getPrivacyStatus() {
    return {
      transcriptRetained:
        CONFIG.privacy
          .retainTranscript,

      speechAudioRetained:
        CONFIG.privacy
          .retainSpeechAudio,

      uploadTranscript:
        CONFIG.privacy
          .uploadTranscript,

      externalAI:
        CONFIG.privacy
          .externalAI,

      privacyMode:
        STATE.settings
          .privacyMode
    };
  }

  function setPrivacyMode(
    enabled
  ) {

    STATE.settings
      .privacyMode =
      !!enabled;

    emit(
      "AUDIO_PRIVACY_MODE_CHANGED",
      {
        enabled:
          STATE.settings
            .privacyMode
      }
    );

    return getPrivacyStatus();
  }

  /* ==========================================================
     STATUS
     ========================================================== */

  function getStatus() {

    return {
      version:
        VERSION,

      state:
        STATE.state,

      mode:
        STATE.mode,

      language:
        STATE.language,

      voice:
        STATE.voice?.name ||
        null,

      speaking:
        STATE.speaking,

      paused:
        STATE.paused,

      queueLength:
        STATE.queue.length,

      session:
        STATE.session
          ? {
              id:
                STATE.session.id,

              status:
                STATE.session.status,

              mode:
                STATE.session.mode,

              language:
                STATE.session.language,

              itemCount:
                STATE.session.items.length
            }
          : null,

      settings:
        {
          ...STATE.settings
        },

      metrics:
        {
          ...STATE.metrics
        },

      privacy:
        getPrivacyStatus(),

      environment:
        getEnvironmentContext(),

      capabilities: {
        speechSynthesis:
          supported(),

        voices:
          STATE.voices.length,

        tonalEngine:
          !!TONAL,

        environmentEngine:
          !!ENV,

        liturgyEngine:
          !!LITURGY
      },

      errors:
        STATE.errors.slice(-10)
    };
  }

  /* ==========================================================
     COMMAND BUS
     ========================================================== */

  function registerCommands() {

    const commands = {

      "audio.performance.status":
        async () =>
          getStatus(),

      "audio.performance.voices":
        async () =>
          refreshVoices(),

      "audio.performance.language":
        async args =>
          setLanguage(
            args?.language
          ),

      "audio.performance.voice":
        async args =>
          setVoice(
            args?.name
          ),

      "audio.performance.settings":
        async args =>
          setSpeechSettings(
            args || {}
          ),

      "audio.performance.speak":
        async args =>
          speakText(
            args?.text || "",
            args || {}
          ),

      "audio.performance.declaration":
        async args =>
          declaration(
            args?.text || "",
            args || {}
          ),

      "audio.performance.chant":
        async args =>
          chant(
            args?.lines || [],
            args || {}
          ),

      "audio.performance.callResponse":
        async args =>
          callResponse(
            args?.call || "",
            args?.response || "",
            args || {}
          ),

      "audio.performance.response":
        async args =>
          submitResponse(
            args?.response || ""
          ),

      "audio.performance.meditation":
        async args =>
          meditation(
            args?.durationMs ||
            60000
          ),

      "audio.performance.createSession":
        async args =>
          createSession(
            args || {}
          ),

      "audio.performance.performSession":
        async args =>
          performSession(
            args?.session ||
            STATE.session
          ),

      "audio.performance.bloodline":
        async args =>
          bloodlineSession(
            args?.people || [],
            args || {}
          ),

      "audio.performance.question":
        async args =>
          answerQuestion(
            args?.question || "",
            args || {}
          ),

      "audio.performance.adapt":
        async () =>
          adaptPerformance(),

      "audio.performance.pause":
        async () =>
          pause(),

      "audio.performance.resume":
        async () =>
          resume(),

      "audio.performance.stop":
        async () =>
          stop(),

      "audio.performance.privacy":
        async args =>
          setPrivacyMode(
            args?.enabled
          )
    };

    try {

      if (
        LITURGY &&
        typeof
          LITURGY.registerCommand ===
          "function"
      ) {

        Object.entries(
          commands
        ).forEach(
          ([name, handler]) => {

            try {
              LITURGY.registerCommand(
                name,
                handler
              );
            } catch (_) {}

          }
        );
      }

    } catch (err) {

      recordError(
        err,
        "registerCommands.liturgy"
      );
    }

    try {

      if (
        window.ChirombeBus &&
        typeof
          window.ChirombeBus
            .registerCommand ===
          "function"
      ) {

        Object.entries(
          commands
        ).forEach(
          ([name, handler]) => {

            try {

              window.ChirombeBus
                .registerCommand(
                  name,
                  handler
                );

            } catch (_) {}

          }
        );
      }

    } catch (err) {

      recordError(
        err,
        "registerCommands.bus"
      );
    }

    return Object.keys(
      commands
    );
  }

  /* ==========================================================
     SYSTEM EVENTS
     ========================================================== */

  function registerSystemEvents() {

    const events = [
      "LIVING_WATCH_STARTED",
      "BLOODLINE_LITURGY_READY",
      "RITUAL_SESSION_CREATED",
      "FAMILY_UNITY",
      "SECURITY_ALERT",
      "WATCHDOG_ALERT",
      "RECOVERY",
      "AUDIO_SAFE_STOP",
      "ENGINE_INTEGRITY_FAILURE"
    ];

    events.forEach(
      eventName => {

        try {

          window.addEventListener(
            eventName,
            event => {

              emit(
                "AUDIO_PERFORMANCE_SYSTEM_EVENT",
                {
                  source:
                    eventName,

                  detail:
                    event?.detail ||
                    null
                }
              );

              if (
                eventName ===
                  "SECURITY_ALERT" ||
                eventName ===
                  "WATCHDOG_ALERT"
              ) {

                STATE.mode =
                  MODES.PROTECTION;

              }

              if (
                eventName ===
                "RECOVERY"
              ) {

                STATE.mode =
                  MODES.NIGHT_WATCH;
              }

              if (
                eventName ===
                "AUDIO_SAFE_STOP"
              ) {

                stop();
              }
            }
          );

        } catch (_) {}

      }
    );
  }

  /* ==========================================================
     INITIALISE
     ========================================================== */

  function initialise() {

    refreshVoices();

    if (
      supported()
    ) {

      try {

        window.speechSynthesis
          .addEventListener(
            "voiceschanged",
            refreshVoices
          );

      } catch (_) {}
    }

    registerCommands();
    registerSystemEvents();

    STATE.state =
      STATES.READY;

    emit(
      "AUDIO_PERFORMANCE_ENGINE_READY",
      {
        version:
          VERSION,

        speechSynthesis:
          supported(),

        voiceCount:
          STATE.voices.length
      }
    );

    return getStatus();
  }

  /* ==========================================================
     PUBLIC API
     ========================================================== */

  const API = {

    VERSION,

    STATES,
    MODES,
    LANGUAGES,
    CONFIG,

    initialise,
    supported,
    refreshVoices,
    findVoice,

    setLanguage,
    setVoice,
    setSpeechSettings,

    speakText,
    declaration,
    chant,

    callResponse,
    submitResponse,

    meditation,

    createSession,
    queueSession,
    performItem,
    performSession,

    bloodlineSession,

    answerQuestion,
    adaptPerformance,

    getEnvironmentContext,

    pause,
    resume,
    stop,

    isNovel,
    rememberSpeech,

    setPrivacyMode,
    getPrivacyStatus,

    getStatus
  };

  window.CHIROMBE_AUDIO_PERFORMANCE_ENGINE =
    API;

  window.CHIROMBE_AUDIO_PERFORMANCE =
    API;

  window.CHIROMBE_AUDIO =
    window.CHIROMBE_AUDIO ||
    {};

  window.CHIROMBE_AUDIO.Performance =
    API;

  /*
   * Capability initialisation only.
   * No automatic speech on page load.
   */

  initialise();

  console.log(
    "[CHIROMBE AUDIO] Part 7 Voice / Chant / Performance Engine " +
      VERSION +
      " ready."
  );

})();
/* ============================================================
   CHIROMBE AUDIO SAFETY CORE
   PART 8A
   VERSION 8.0.1
   ============================================================ */

(() => {
  "use strict";

  const VERSION = "8.0.1";

  const STATES = Object.freeze({
    OFFLINE: "OFFLINE",
    READY: "READY",
    ARMED: "ARMED",
    MONITORING: "MONITORING",
    SAFE_STOP: "SAFE_STOP",
    LOCKED: "LOCKED",
    ERROR: "ERROR"
  });

  const LIMITS = Object.freeze({
    MASTER_GAIN: 0.50,
    HARD_GAIN: 0.65,

    MAX_OSCILLATORS: 24,
    MAX_ACTIVE_SOURCES: 24,
    MAX_SCHEDULED_SOURCES: 64,

    MAX_TONE_MS: 3600000,
    MAX_SESSION_MS: 3600000,

    AUDIBLE_MIN_HZ: 20,
    AUDIBLE_MAX_HZ: 20000,

    ULTRASONIC_MAX_HZ: 96000,

    RF_METADATA_MIN_HZ: 100000,

    CLIP_THRESHOLD: 0.985,
    DC_THRESHOLD: 0.10
  });

  const STATE = {
    state: STATES.OFFLINE,

    armed: false,
    userGesture: false,

    masterGain: 0.22,

    activeSources: 0,
    scheduledSources: 0,

    clipping: false,
    dcOffset: false,

    lastFrequency: null,
    lastFrequencyClass: null,

    resourcePressure: 0,

    monitorTimer: null,

    metrics: {
      checks: 0,
      limits: 0,
      rejectedFrequencies: 0,
      clippingEvents: 0,
      safeStops: 0,
      invalidRequests: 0
    }
  };

  /* ==========================================================
     UTILITIES
     ========================================================== */

  function now() {
    return Date.now();
  }

  function clamp(value, min, max) {
    return Math.min(
      max,
      Math.max(
        min,
        Number(value)
      )
    );
  }

  function emit(type, detail = {}) {

    const payload = {
      type,
      timestamp: now(),
      version: VERSION,
      detail
    };

    try {
      window.dispatchEvent(
        new CustomEvent(
          "CHIROMBE_AUDIO_SAFETY_EVENT",
          { detail: payload }
        )
      );
    } catch (_) {}

    try {

      if (
        window.ChirombeBus &&
        typeof window.ChirombeBus.emit === "function"
      ) {

        window.ChirombeBus.emit(
          type,
          detail
        );
      }

    } catch (_) {}

    return payload;
  }

  /* ==========================================================
     AUDIO CONTEXT
     ========================================================== */

  function getContext() {

    const tonal =
      window.CHIROMBE_AUDIO_TONAL_ENGINE;

    if (
      tonal &&
      tonal.context
    ) {
      return tonal.context;
    }

    const audio =
      window.CHIROMBE_AUDIO;

    if (
      audio &&
      audio.context
    ) {
      return audio.context;
    }

    return null;
  }

  function capabilities() {

    const context =
      getContext();

    if (!context) {

      return {
        audioContext: false,
        sampleRate: null,
        nyquist: null,
        state: "UNAVAILABLE",
        speech:
          "speechSynthesis" in window,
        microphone:
          !!(
            navigator.mediaDevices &&
            navigator.mediaDevices.getUserMedia
          )
      };
    }

    return {

      audioContext: true,

      sampleRate:
        context.sampleRate,

      nyquist:
        context.sampleRate / 2,

      state:
        context.state,

      speech:
        "speechSynthesis" in window,

      microphone:
        !!(
          navigator.mediaDevices &&
          navigator.mediaDevices.getUserMedia
        )
    };
  }

  /* ==========================================================
     USER GESTURE
     ========================================================== */

  function registerUserGesture() {

    STATE.userGesture = true;

    emit(
      "AUDIO_USER_GESTURE_REGISTERED"
    );

    return true;
  }

  /* ==========================================================
     FREQUENCY SAFETY
     ========================================================== */

  function classifyFrequency(hz) {

    const frequency =
      Number(hz);

    if (
      !Number.isFinite(frequency) ||
      frequency <= 0
    ) {

      return {
        permitted: false,
        class: "INVALID",
        frequencyHz: frequency,
        reason: "Invalid frequency."
      };
    }

    const context =
      getContext();

    const nyquist =
      context
        ? context.sampleRate / 2
        : 22050;

    if (
      frequency >=
      LIMITS.RF_METADATA_MIN_HZ
    ) {

      return {
        permitted: false,
        class: "RF_METADATA",
        frequencyHz: frequency,
        reason:
          "RF/MHz is metadata only. Ordinary browser audio is not an RF transmitter."
      };
    }

    if (
      frequency > nyquist
    ) {

      STATE.metrics
        .rejectedFrequencies++;

      return {
        permitted: false,
        class: "NYQUIST",
        frequencyHz: frequency,
        reason:
          "Frequency exceeds the current AudioContext Nyquist limit."
      };
    }

    if (
      frequency < LIMITS.AUDIBLE_MIN_HZ
    ) {

      return {
        permitted: false,
        class: "SUB_AUDIO",
        frequencyHz: frequency,
        reason:
          "Sub-audio output is disabled by default."
      };
    }

    if (
      frequency > LIMITS.AUDIBLE_MAX_HZ
    ) {

      return {
        permitted: false,
        class: "ULTRASONIC",
        frequencyHz: frequency,
        reason:
          "Ultrasonic output is disabled by default."
      };
    }

    return {
      permitted: true,
      class: "AUDIBLE",
      frequencyHz: frequency,
      reason: "Audible frequency permitted."
    };
  }

  function validateFrequency(hz) {

    const result =
      classifyFrequency(hz);

    STATE.lastFrequency =
      result.frequencyHz;

    STATE.lastFrequencyClass =
      result.class;

    if (!result.permitted) {

      emit(
        "AUDIO_FREQUENCY_REJECTED",
        result
      );
    }

    return result;
  }

  /* ==========================================================
     GAIN GOVERNOR
     ========================================================== */

  function validateGain(
    gain
  ) {

    const requested =
      Number(gain);

    const safe =
      clamp(
        Number.isFinite(requested)
          ? requested
          : STATE.masterGain,
        0,
        LIMITS.HARD_GAIN
      );

    const limited =
      safe !== requested;

    if (limited) {

      STATE.metrics.limits++;
    }

    return {
      requested,
      applied: safe,
      limited,
      permitted: true
    };
  }

  function setMasterGain(
    gain
  ) {

    const result =
      validateGain(gain);

    STATE.masterGain =
      result.applied;

    try {

      const tonal =
        window.CHIROMBE_AUDIO_TONAL_ENGINE;

      if (
        tonal &&
        typeof tonal.setMasterGain === "function"
      ) {

        tonal.setMasterGain(
          result.applied
        );
      }

    } catch (error) {

      emit(
        "AUDIO_SAFETY_ERROR",
        {
          message:
            error.message
        }
      );
    }

    emit(
      "AUDIO_MASTER_GAIN_CHANGED",
      {
        gain:
          result.applied
      }
    );

    return result;
  }

  /* ==========================================================
     DURATION
     ========================================================== */

  function validateDuration(
    durationMs
  ) {

    const requested =
      Math.max(
        0,
        Number(durationMs) || 0
      );

    const applied =
      Math.min(
        requested,
        LIMITS.MAX_TONE_MS
      );

    return {
      requested,
      applied,
      limited:
        requested !== applied
    };
  }

  /* ==========================================================
     RESOURCE GOVERNOR
     ========================================================== */

  function resourceCheck() {

    const sourceRatio =
      STATE.activeSources /
      LIMITS.MAX_ACTIVE_SOURCES;

    const scheduleRatio =
      STATE.scheduledSources /
      LIMITS.MAX_SCHEDULED_SOURCES;

    STATE.resourcePressure =
      clamp(
        Math.max(
          sourceRatio,
          scheduleRatio
        ),
        0,
        1
      );

    return {

      pressure:
        STATE.resourcePressure,

      level:
        STATE.resourcePressure >= 0.90
          ? "CRITICAL"
          : STATE.resourcePressure >= 0.70
            ? "WARNING"
            : "NORMAL",

      permitted:
        STATE.resourcePressure < 0.90
    };
  }

  function sourceStarted() {

    STATE.activeSources++;

    return resourceCheck();
  }

  function sourceStopped() {

    STATE.activeSources =
      Math.max(
        0,
        STATE.activeSources - 1
      );

    return resourceCheck();
  }

  /* ==========================================================
     REQUEST VALIDATION
     ========================================================== */

  function validateRequest(
    request = {}
  ) {

    const frequency =
      request.frequencyHz !== undefined
        ? validateFrequency(
            request.frequencyHz
          )
        : {
            permitted: true
          };

    const gain =
      validateGain(
        request.gain ??
        STATE.masterGain
      );

    const duration =
      validateDuration(
        request.durationMs ??
        1000
      );

    const resources =
      resourceCheck();

    const oscillators =
      Math.min(
        Math.max(
          1,
          Number(
            request.oscillators || 1
          )
        ),
        LIMITS.MAX_OSCILLATORS
      );

    const permitted =
      frequency.permitted &&
      resources.permitted &&
      gain.applied <=
        LIMITS.HARD_GAIN &&
      oscillators <=
        LIMITS.MAX_OSCILLATORS;

    if (!permitted) {

      STATE.metrics
        .invalidRequests++;

      emit(
        "AUDIO_REQUEST_BLOCKED",
        {
          frequency,
          gain,
          duration,
          oscillators,
          resources
        }
      );
    }

    return {
      permitted,
      frequency,
      gain,
      duration,
      oscillators,
      resources
    };
  }

  /* ==========================================================
     SIGNAL ANALYSIS
     ========================================================== */

  function analyseSignal() {

    const tonal =
      window.CHIROMBE_AUDIO_TONAL_ENGINE;

    const analyser =
      tonal?.analyser ||
      window.CHIROMBE_AUDIO?.analyser;

    if (!analyser) {

      return {
        available: false,
        clipping: false,
        dcOffset: false
      };
    }

    try {

      const data =
        new Float32Array(
          analyser.fftSize
        );

      analyser.getFloatTimeDomainData(
        data
      );

      let peak = 0;
      let sum = 0;

      for (
        let i = 0;
        i < data.length;
        i++
      ) {

        const value =
          data[i];

        peak =
          Math.max(
            peak,
            Math.abs(value)
          );

        sum +=
          value * value;
      }

      const rms =
        Math.sqrt(
          sum /
          Math.max(
            1,
            data.length
          )
        );

      let dc = 0;

      for (
        let i = 0;
        i < data.length;
        i++
      ) {
        dc += data[i];
      }

      dc =
        Math.abs(
          dc /
          Math.max(
            1,
            data.length
          )
        );

      const clipping =
        peak >=
        LIMITS.CLIP_THRESHOLD;

      const dcOffset =
        dc >=
        LIMITS.DC_THRESHOLD;

      STATE.clipping =
        clipping;

      STATE.dcOffset =
        dcOffset;

      if (clipping) {

        STATE.metrics
          .clippingEvents++;

        emit(
          "AUDIO_CLIPPING_DETECTED",
          {
            peak,
            rms
          }
        );
      }

      return {
        available: true,
        peak,
        rms,
        dcOffset: dc,
        clipping,
        dcWarning: dcOffset,
        healthy:
          !clipping &&
          !dcOffset
      };

    } catch (error) {

      emit(
        "AUDIO_SAFETY_ERROR",
        {
          message:
            error.message
        }
      );

      return {
        available: false,
        clipping: false,
        dcOffset: false
      };
    }
  }

  /* ==========================================================
     SAFETY CHECK
     ========================================================== */

  function safetyCheck() {

    STATE.metrics.checks++;

    const resources =
      resourceCheck();

    const signal =
      analyseSignal();

    if (
      signal.clipping ||
      signal.dcWarning
    ) {

      const reduced =
        STATE.masterGain *
        0.70;

      setMasterGain(
        Math.min(
          reduced,
          LIMITS.MASTER_GAIN
        )
      );
    }

    if (
      !resources.permitted
    ) {

      safeStop(
        "RESOURCE_LIMIT"
      );
    }

    return {

      healthy:
        resources.permitted &&
        !signal.clipping &&
        !signal.dcWarning,

      resources,
      signal,

      masterGain:
        STATE.masterGain
    };
  }

  /* ==========================================================
     SAFE STOP
     ========================================================== */

  function safeStop(
    reason = "USER_STOP"
  ) {

    try {

      const tonal =
        window.CHIROMBE_AUDIO_TONAL_ENGINE;

      if (
        tonal &&
        typeof tonal.stopAll === "function"
      ) {

        tonal.stopAll();
      }

    } catch (_) {}

    try {

      if (
        window.speechSynthesis
      ) {

        speechSynthesis.cancel();
      }

    } catch (_) {}

    STATE.activeSources = 0;
    STATE.scheduledSources = 0;

    STATE.armed = false;

    STATE.state =
      STATES.SAFE_STOP;

    STATE.metrics.safeStops++;

    emit(
      "AUDIO_SAFE_STOP",
      {
        reason
      }
    );

    return {
      stopped: true,
      reason
    };
  }

  /* ==========================================================
     EMERGENCY STOP
     ========================================================== */

  function emergencyStop() {

    return safeStop(
      "EMERGENCY_STOP"
    );
  }

  /* ==========================================================
     ARM
     ========================================================== */

  function arm() {

    if (
      !STATE.userGesture
    ) {

      return {
        armed: false,
        reason:
          "USER_GESTURE_REQUIRED"
      };
    }

    if (
      !getContext()
    ) {

      return {
        armed: false,
        reason:
          "AUDIO_CONTEXT_UNAVAILABLE"
      };
    }

    STATE.armed = true;
    STATE.state =
      STATES.ARMED;

    emit(
      "AUDIO_SAFETY_ARMED"
    );

    return {
      armed: true
    };
  }

  function disarm() {

    STATE.armed = false;

    STATE.state =
      STATES.READY;

    return true;
  }

  /* ==========================================================
     MONITOR
     ========================================================== */

  function startMonitoring() {

    if (
      STATE.monitorTimer
    ) {
      return true;
    }

    STATE.state =
      STATES.MONITORING;

    STATE.monitorTimer =
      setInterval(
        safetyCheck,
        1000
      );

    emit(
      "AUDIO_SAFETY_MONITOR_STARTED"
    );

    return true;
  }

  function stopMonitoring() {

    if (
      STATE.monitorTimer
    ) {

      clearInterval(
        STATE.monitorTimer
      );

      STATE.monitorTimer =
        null;
    }

    STATE.state =
      STATES.READY;

    return true;
  }

  /* ==========================================================
     STATUS
     ========================================================== */

  function getStatus() {

    return {

      version:
        VERSION,

      state:
        STATE.state,

      armed:
        STATE.armed,

      userGesture:
        STATE.userGesture,

      masterGain:
        STATE.masterGain,

      activeSources:
        STATE.activeSources,

      scheduledSources:
        STATE.scheduledSources,

      resourcePressure:
        STATE.resourcePressure,

      clipping:
        STATE.clipping,

      dcOffset:
        STATE.dcOffset,

      lastFrequency:
        STATE.lastFrequency,

      lastFrequencyClass:
        STATE.lastFrequencyClass,

      capabilities:
        capabilities(),

      metrics:
        {
          ...STATE.metrics
        },

      limits:
        {
          ...LIMITS
        }
    };
  }

  /* ==========================================================
     COMMAND BUS
     ========================================================== */

  function registerCommands() {

    const commands = {

      "audio.safety.status":
        getStatus,

      "audio.safety.gesture":
        registerUserGesture,

      "audio.safety.arm":
        arm,

      "audio.safety.disarm":
        disarm,

      "audio.safety.check":
        safetyCheck,

      "audio.safety.frequency":
        args =>
          validateFrequency(
            args?.frequencyHz
          ),

      "audio.safety.gain":
        args =>
          validateGain(
            args?.gain
          ),

      "audio.safety.request":
        args =>
          validateRequest(
            args || {}
          ),

      "audio.safety.monitor.start":
        startMonitoring,

      "audio.safety.monitor.stop":
        stopMonitoring,

      "audio.safety.safeStop":
        args =>
          safeStop(
            args?.reason ||
            "USER_STOP"
          ),

      "audio.safety.emergencyStop":
        emergencyStop
    };

    try {

      if (
        window.ChirombeBus &&
        typeof
          window.ChirombeBus.registerCommand ===
          "function"
      ) {

        Object.entries(
          commands
        ).forEach(
          ([name, handler]) => {

            try {

              window.ChirombeBus
                .registerCommand(
                  name,
                  handler
                );

            } catch (_) {}

          }
        );
      }

    } catch (_) {}

    return commands;
  }

  /* ==========================================================
     LIFECYCLE
     ========================================================== */

  function initialise() {

    STATE.state =
      STATES.READY;

    registerCommands();

    window.addEventListener(
      "pagehide",
      () => {

        safeStop(
          "PAGE_HIDE"
        );

      }
    );

    emit(
      "AUDIO_SAFETY_ENGINE_READY",
      {
        version:
          VERSION
      }
    );

    return getStatus();
  }

  /* ==========================================================
     PUBLIC API
     ========================================================== */

  const API = {

    VERSION,

    STATES,

    LIMITS,

    STATE,

    initialise,

    capabilities,

    getContext,

    registerUserGesture,

    classifyFrequency,

    validateFrequency,

    validateGain,

    setMasterGain,

    validateDuration,

    resourceCheck,

    sourceStarted,

    sourceStopped,

    validateRequest,

    analyseSignal,

    safetyCheck,

    safeStop,

    emergencyStop,

    arm,

    disarm,

    startMonitoring,

    stopMonitoring,

    getStatus
  };

  window.CHIROMBE_AUDIO_SAFETY_ENGINE =
    API;

  window.CHIROMBE_AUDIO_SAFETY =
    API;

  window.CHIROMBE_AUDIO =
    window.CHIROMBE_AUDIO ||
    {};

  window.CHIROMBE_AUDIO.Safety =
    API;

  initialise();

})();
/* ============================================================================
   CHIROMBE AUDIO LIVING LITURGY
   PART 9 — ADAPTIVE EVOLUTION / SESSION MEMORY
   PART 10 — MASTER LIVING LITURGY ORCHESTRATION
   ----------------------------------------------------------------------------
   Extends the Part 1 kernel and Part 2 liturgy engine.
   Does not replace CHIROMBE_AUDIO, does not start playback on load,
   and does not rewrite application source.
   One Evolution API only. The old 9.0.1 status stub is not installed.
 ============================================================================ */

(() => {
  "use strict";

  if (window.__CHIROMBE_AUDIO_PART9__) return;
  window.__CHIROMBE_AUDIO_PART9__ = true;

  const AUDIO = window.CHIROMBE_AUDIO;
  if (!AUDIO || typeof AUDIO.getStatus !== "function" || typeof AUDIO.emergencyStop !== "function") {
    console.error("CHIROMBE AUDIO PART 9: Part 1 kernel not found.");
    window.__CHIROMBE_AUDIO_PART9__ = false;
    return;
  }

  const VERSION = "9.0.0";
  const SCHEMA_VERSION = 9;
  const STORAGE_KEY = "CHIROMBE_AUDIO_EVOLUTION_V9";

  const STATES = Object.freeze({
    DORMANT: "DORMANT",
    READY: "READY",
    LEARNING: "LEARNING",
    ANALYSING: "ANALYSING",
    ADAPTING: "ADAPTING",
    PROPOSING: "PROPOSING",
    VALIDATING: "VALIDATING",
    SANDBOX: "SANDBOX",
    ROLLBACK: "ROLLBACK",
    SAFE_STOP: "SAFE_STOP",
    LOCKED: "LOCKED",
    ERROR: "ERROR"
  });

  const ADAPTATION_TYPES = Object.freeze({
    TEMPO: "TEMPO",
    PAUSE: "PAUSE",
    VOLUME: "VOLUME",
    FREQUENCY: "FREQUENCY",
    HARMONICS: "HARMONICS",
    SCENE: "SCENE",
    LANGUAGE: "LANGUAGE",
    VOICE: "VOICE",
    SESSION_LENGTH: "SESSION_LENGTH",
    ENVIRONMENT_RESPONSE: "ENVIRONMENT_RESPONSE",
    PRAYER_SELECTION: "PRAYER_SELECTION",
    CHANT_STRUCTURE: "CHANT_STRUCTURE",
    RESOURCE_POLICY: "RESOURCE_POLICY"
  });

  const PROPOSAL_STATUS = Object.freeze({
    CREATED: "CREATED",
    PROPOSED: "PROPOSED",
    VALIDATING: "VALIDATING",
    REVIEW_REQUIRED: "REVIEW_REQUIRED",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    SANDBOXED: "SANDBOXED",
    APPLIED: "APPLIED",
    ROLLED_BACK: "ROLLED_BACK",
    EXPIRED: "EXPIRED"
  });

  const CONFIG = Object.freeze({
    persistence: { enabled: true, maximumSessions: 200, maximumObservations: 800, maximumProposals: 200, maximumAudit: 400, maximumSnapshots: 40 },
    learning: { enabled: true, minimumEvidence: 3, learningRate: 0.15, maximumPreferenceShift: 0.1, noveltyWindow: 100 },
    evolution: {
      autonomousCodeRewrite: false,
      autonomousProductionDeploy: false,
      autonomousSafetyModification: false,
      requireHumanApprovalForProduction: true
    },
    scoring: { qualityWeight: 0.3, coherenceWeight: 0.2, comfortWeight: 0.15, completionWeight: 0.15, stabilityWeight: 0.1, noveltyWeight: 0.1 }
  });

  const STATE = {
    state: STATES.DORMANT,
    initialised: false,
    learningEnabled: true,
    evolutionEnabled: true,
    generation: 0,
    lastSession: null,
    activeSession: null,
    sessions: [],
    observations: [],
    preferences: {},
    proposals: [],
    experiments: [],
    audit: [],
    snapshots: [],
    anchors: {},
    metrics: { sessions: 0, observations: 0, proposals: 0, applied: 0, rejected: 0, rolledBack: 0, adaptations: 0, validations: 0, regressions: 0, persistenceWrites: 0, persistenceReads: 0 },
    errors: [],
    commandsRegistered: false,
    eventsRegistered: false
  };

  function now() { return Date.now(); }
  function uid(prefix) { return (prefix || "evo") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10); }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, Number(value))); }
  function safeNumber(value, fallback) { const n = Number(value); return Number.isFinite(n) ? n : (fallback || 0); }
  function deepClone(object) { try { return JSON.parse(JSON.stringify(object)); } catch (e) { return null; } }

  function engine(name, alt) {
    try { return window[name] || (alt ? window[alt] : null) || null; } catch (e) { return null; }
  }

  async function digest(value) {
    const text = typeof value === "string" ? value : JSON.stringify(value);
    try {
      if (crypto && crypto.subtle) {
        const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
        return Array.from(new Uint8Array(buffer)).map(function (byte) { return byte.toString(16).padStart(2, "0"); }).join("");
      }
    } catch (e) {}
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return "fnv-" + (hash >>> 0).toString(16);
  }

  function emit(type, detail) {
    const event = { id: uid("audio-evolution-event"), type: type, timestamp: now(), version: VERSION, generation: STATE.generation, detail: detail || {} };
    try { if (typeof AUDIO.emit === "function") AUDIO.emit(type, event); } catch (e) {}
    try {
      window.dispatchEvent(new CustomEvent("CHIROMBE_AUDIO_EVOLUTION_EVENT", { detail: event }));
    } catch (e) {}
    try {
      if (window.ChirombeBus && typeof window.ChirombeBus.emit === "function") window.ChirombeBus.emit(type, detail || {});
    } catch (e) {}
    return event;
  }

  function recordError(error, context) {
    const item = { id: uid("evolution-error"), timestamp: now(), context: context, message: (error && error.message) || String(error) };
    STATE.errors.push(item);
    if (STATE.errors.length > 100) STATE.errors.shift();
    try { if (typeof AUDIO.log === "function") AUDIO.log("ERROR", context, item); } catch (e) {}
    emit("AUDIO_EVOLUTION_ERROR", item);
    return item;
  }

  function persistenceAvailable() {
    try { return typeof localStorage !== "undefined"; } catch (e) { return false; }
  }

  async function saveMemory() {
    if (!CONFIG.persistence.enabled || !persistenceAvailable()) return false;
    try {
      const payload = {
        schema: SCHEMA_VERSION,
        version: VERSION,
        savedAt: now(),
        generation: STATE.generation,
        sessions: STATE.sessions.slice(-CONFIG.persistence.maximumSessions),
        observations: STATE.observations.slice(-CONFIG.persistence.maximumObservations),
        preferences: STATE.preferences,
        proposals: STATE.proposals.slice(-CONFIG.persistence.maximumProposals),
        experiments: STATE.experiments.slice(-80),
        audit: STATE.audit.slice(-CONFIG.persistence.maximumAudit),
        snapshots: STATE.snapshots.slice(-CONFIG.persistence.maximumSnapshots),
        anchors: STATE.anchors,
        metrics: STATE.metrics
      };
      payload.integrity = await digest(payload);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      STATE.metrics.persistenceWrites++;
      return true;
    } catch (error) {
      recordError(error, "saveMemory");
      return false;
    }
  }

  async function loadMemory() {
    if (!CONFIG.persistence.enabled || !persistenceAvailable()) return false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data.schema !== SCHEMA_VERSION) {
        emit("AUDIO_EVOLUTION_SCHEMA_MISMATCH", { found: data.schema, expected: SCHEMA_VERSION });
        return false;
      }
      STATE.generation = safeNumber(data.generation, 0);
      STATE.sessions = Array.isArray(data.sessions) ? data.sessions : [];
      STATE.observations = Array.isArray(data.observations) ? data.observations : [];
      STATE.preferences = data.preferences || {};
      STATE.proposals = Array.isArray(data.proposals) ? data.proposals : [];
      STATE.experiments = Array.isArray(data.experiments) ? data.experiments : [];
      STATE.audit = Array.isArray(data.audit) ? data.audit : [];
      STATE.snapshots = Array.isArray(data.snapshots) ? data.snapshots : [];
      STATE.anchors = data.anchors || {};
      STATE.metrics = Object.assign({}, STATE.metrics, data.metrics || {});
      STATE.metrics.persistenceReads++;
      emit("AUDIO_EVOLUTION_MEMORY_LOADED", { generation: STATE.generation, sessions: STATE.sessions.length });
      return true;
    } catch (error) {
      recordError(error, "loadMemory");
      return false;
    }
  }

  async function audit(action, detail) {
    const previous = STATE.audit.length ? STATE.audit[STATE.audit.length - 1].hash : null;
    const entry = { id: uid("audio-audit"), timestamp: now(), action: action, detail: detail || {}, previous: previous };
    entry.hash = await digest(entry);
    STATE.audit.push(entry);
    if (STATE.audit.length > CONFIG.persistence.maximumAudit) STATE.audit.shift();
    try {
      if (window.ChirombeAudit && typeof window.ChirombeAudit.append === "function") {
        window.ChirombeAudit.append({ type: action, detail: detail || {}, sessionId: STATE.activeSession && STATE.activeSession.id });
      }
    } catch (e) {}
    try { if (typeof AUDIO.remember === "function") AUDIO.remember(action, detail || {}, 0.4); } catch (e) {}
    return entry;
  }

  function establishAnchors() {
    if (Object.keys(STATE.anchors).length) return STATE.anchors;
    STATE.anchors = {
      systemIdentity: "CHIROMBE_AUDIO_LIVING_LITURGY",
      devotionalVocabulary: ["Mwari", "Mudzimu Unoyera", "peace", "truth", "wisdom", "unity", "courage", "gratitude", "remembrance"],
      safetyFirst: true,
      autonomousProductionRewrite: false,
      interpretation: "DEVOTIONAL_PRACTICE_NOT_SCIENTIFIC_PROOF"
    };
    return STATE.anchors;
  }

  function beginSession(options) {
    options = options || {};
    const session = {
      id: uid("audio-session"),
      startedAt: now(),
      endedAt: null,
      mode: options.mode || "REFLECTION",
      language: options.language || "en-GB",
      scene: options.scene || options.mode || "REFLECTION",
      purpose: options.purpose || "DEVOTIONAL",
      people: Array.isArray(options.people) ? options.people.map(function (person) {
        return { id: person.id || person.personId || null, name: person.name || person.displayName || null, relationship: person.relationship || person.relation || null, source: "EXPLICIT" };
      }) : [],
      environment: null,
      settings: deepClone(options.settings || {}),
      events: [],
      observations: [],
      adaptations: [],
      metrics: { prayers: 0, repetitions: 0, interruptions: 0, safetyInterventions: 0, adaptations: 0 },
      outcome: null,
      score: null,
      status: "ACTIVE",
      microphoneStored: false
    };
    STATE.activeSession = session;
    STATE.sessions.push(session);
    if (STATE.sessions.length > CONFIG.persistence.maximumSessions) STATE.sessions.shift();
    STATE.metrics.sessions++;
    emit("AUDIO_EVOLUTION_SESSION_STARTED", { sessionId: session.id, mode: session.mode });
    return session;
  }

  function scoreSession(session) {
    const outcome = (session && session.outcome) || {};
    const weights = CONFIG.scoring;
    const parts = ["quality", "coherence", "comfort", "completion", "stability", "novelty"];
    const keys = ["qualityWeight", "coherenceWeight", "comfortWeight", "completionWeight", "stabilityWeight", "noveltyWeight"];
    let score = 0;
    parts.forEach(function (name, index) {
      score += clamp(safeNumber(outcome[name], 0.5), 0, 1) * weights[keys[index]];
    });
    return Number(clamp(score, 0, 1).toFixed(4));
  }

  function recordObservation(type, data) {
    if (!CONFIG.learning.enabled) return null;
    const observation = {
      id: uid("audio-observation"),
      timestamp: now(),
      type: type,
      sessionId: (STATE.activeSession && STATE.activeSession.id) || (STATE.lastSession && STATE.lastSession.id) || null,
      data: deepClone(data || {}),
      supernaturalClaim: false
    };
    STATE.observations.push(observation);
    if (STATE.observations.length > CONFIG.persistence.maximumObservations) STATE.observations.shift();
    if (STATE.activeSession) STATE.activeSession.observations.push(observation);
    STATE.metrics.observations++;
    emit("AUDIO_EVOLUTION_OBSERVATION", { id: observation.id, type: type });
    return observation;
  }

  async function endSession(outcome, feedback) {
    const session = STATE.activeSession;
    if (!session) return null;
    session.endedAt = now();
    session.status = "COMPLETE";
    session.outcome = deepClone(outcome || {});
    session.userFeedback = feedback;
    session.score = scoreSession(session);
    session.durationMs = session.endedAt - session.startedAt;
    STATE.lastSession = session;
    STATE.activeSession = null;
    recordObservation("SESSION_COMPLETED", { sessionId: session.id, score: session.score, durationMs: session.durationMs });
    await audit("SESSION_COMPLETED", { sessionId: session.id, score: session.score });
    await saveMemory();
    emit("AUDIO_EVOLUTION_SESSION_ENDED", { sessionId: session.id, score: session.score });
    return session;
  }

  function getEnvironmentSnapshot() {
    const environment = engine("CHIROMBE_AUDIO_ENVIRONMENT_ENGINE");
    try {
      if (environment && typeof environment.getStatus === "function") {
        const status = deepClone(environment.getStatus()) || {};
        status.note = "Measured environmental metadata. Not evidence of a supernatural event.";
        return status;
      }
    } catch (error) {
      recordError(error, "getEnvironmentSnapshot");
    }
    return { available: false, note: "Environmental engine unavailable.", supernaturalClaim: false };
  }

  function preferenceKey(dimension, value) { return String(dimension) + "::" + String(value); }

  function updatePreference(dimension, value, reward, evidence) {
    const key = preferenceKey(dimension, value);
    const existing = STATE.preferences[key] || { dimension: dimension, value: value, score: 0.5, evidence: 0, positive: 0, negative: 0, updatedAt: now() };
    const bounded = clamp(reward, -1, 1);
    const shift = clamp(bounded * CONFIG.learning.learningRate, -CONFIG.learning.maximumPreferenceShift, CONFIG.learning.maximumPreferenceShift);
    existing.score = clamp(existing.score + shift, 0, 1);
    const weight = Math.max(1, safeNumber(evidence, 1));
    existing.evidence += weight;
    if (bounded >= 0) existing.positive += weight;
    else existing.negative += weight;
    existing.updatedAt = now();
    STATE.preferences[key] = existing;
    emit("AUDIO_PREFERENCE_UPDATED", { dimension: dimension, value: value, score: existing.score });
    return existing;
  }

  function getPreference(dimension, value) { return STATE.preferences[preferenceKey(dimension, value)] || null; }

  async function calculateNovelty(candidate) {
    const hash = await digest(JSON.stringify(candidate));
    const recent = STATE.observations.slice(-CONFIG.learning.noveltyWindow);
    const seen = recent.some(function (observation) { return observation.data && observation.data.hash === hash; });
    return { hash: hash, novel: !seen, novelty: seen ? 0 : 1 };
  }

  async function createProposal(type, target, currentValue, proposedValue, rationale, options) {
    options = options || {};
    rationale = rationale || {};
    const novelty = await calculateNovelty({ type: type, target: target, currentValue: currentValue, proposedValue: proposedValue });
    const proposal = {
      id: uid("audio-proposal"),
      proposalId: null,
      createdAt: now(),
      timestamp: now(),
      generation: STATE.generation,
      type: type,
      target: target,
      category: type,
      reason: rationale.reason || "",
      evidence: rationale.evidence || options.evidence || 0,
      proposedChange: { from: currentValue, to: proposedValue },
      currentValue: currentValue,
      proposedValue: proposedValue,
      expectedBenefit: rationale.expectedBenefit || "Unmeasured until a later session records an outcome.",
      risk: rationale.risk || "LOW",
      rationale: deepClone(rationale),
      novelty: novelty,
      confidence: clamp(safeNumber(options.confidence, 0), 0, 1),
      status: PROPOSAL_STATUS.PROPOSED,
      sandbox: true,
      production: false,
      safetyReviewed: false,
      regressionChecked: false,
      rollbackAvailable: true,
      approvalRequired: true,
      measuredImprovement: false
    };
    proposal.proposalId = proposal.id;
    STATE.proposals.push(proposal);
    if (STATE.proposals.length > CONFIG.persistence.maximumProposals) STATE.proposals.shift();
    STATE.metrics.proposals++;
    await audit("PROPOSAL_CREATED", { proposalId: proposal.id, type: type, target: target });
    emit("AUDIO_EVOLUTION_PROPOSAL_CREATED", { proposalId: proposal.id, type: type });
    return proposal;
  }

  async function learnFromSession(session) {
    if (!session) return { ok: false, reason: "NO_SESSION" };
    STATE.state = STATES.LEARNING;
    const reward = (safeNumber(session.score, 0.5) - 0.5) * 2;
    updatePreference("mode", session.mode, reward);
    updatePreference("language", session.language, reward);
    updatePreference("scene", session.scene, reward);
    if (session.settings && session.settings.rate != null) updatePreference("rate", session.settings.rate, reward);
    if (session.settings && session.settings.volume != null) updatePreference("volume", session.settings.volume, reward);
    STATE.state = STATES.READY;
    return { ok: true, reward: reward, note: "Learned from session scores only. Sensor readings were not treated as spiritual events." };
  }

  async function analyseAdaptation() {
    STATE.state = STATES.ANALYSING;
    const environment = getEnvironmentSnapshot();
    const proposals = [];
    const noise = String(environment.noise || environment.classification || environment.state || "");
    if (/noisy|loud/i.test(noise) && STATE.metrics.sessions >= CONFIG.learning.minimumEvidence) {
      proposals.push(await createProposal(ADAPTATION_TYPES.TEMPO, "speech.rate", 1, 0.9, {
        reason: "Recent measured noise was high. This proposes clearer pacing.",
        evidence: noise,
        expectedBenefit: "Not claimed until a later measured session.",
        risk: "LOW"
      }, { evidence: STATE.metrics.sessions, confidence: 0.4 }));
    }
    STATE.state = STATES.READY;
    return { proposals: proposals, environment: environment, supernaturalClaim: false };
  }

  function validateProposalSafety(proposal) {
    const target = String(proposal && proposal.target || "").toLowerCase();
    if (target.includes("safety") || target.includes("privacy") || target.includes("hardmax") || target.includes("maximum")) {
      return { valid: false, reason: "PROTECTED_SAFETY_PARAMETER" };
    }
    if (proposal && proposal.type === ADAPTATION_TYPES.FREQUENCY) {
      if (typeof AUDIO.validateFrequency === "function") {
        const result = AUDIO.validateFrequency(proposal.proposedValue);
        if (result && result.supported === false) return { valid: false, reason: result.reason || result.classification };
      }
      const safety = engine("CHIROMBE_AUDIO_SAFETY_ENGINE", "CHIROMBE_AUDIO_SAFETY");
      if (safety && typeof safety.validateFrequency === "function") {
        const result = safety.validateFrequency(proposal.proposedValue);
        if (result && result.permitted === false) return { valid: false, reason: result.reason };
      }
    }
    return { valid: true, reason: "SAFETY_VALIDATED" };
  }

  function regressionCheck(proposal) {
    STATE.metrics.validations++;
    const checks = {
      hasId: !!(proposal && proposal.id),
      hasType: !!(proposal && proposal.type),
      hasTarget: !!(proposal && proposal.target),
      hasCurrent: proposal && proposal.currentValue !== undefined,
      hasProposed: proposal && proposal.proposedValue !== undefined,
      productionRewrite: CONFIG.evolution.autonomousProductionDeploy === false,
      safetyRewrite: CONFIG.evolution.autonomousSafetyModification === false,
      codeRewrite: CONFIG.evolution.autonomousCodeRewrite === false
    };
    const passed = Object.keys(checks).every(function (key) { return !!checks[key]; });
    if (!passed) STATE.metrics.regressions++;
    return { passed: passed, checks: checks };
  }

  function findProposal(proposalId) {
    return STATE.proposals.find(function (item) { return item.id === proposalId; }) || null;
  }

  async function sandboxProposal(proposalId) {
    const proposal = findProposal(proposalId);
    if (!proposal) return { ok: false, reason: "PROPOSAL_NOT_FOUND" };
    STATE.state = STATES.VALIDATING;
    const safetyResult = validateProposalSafety(proposal);
    if (!safetyResult.valid) {
      proposal.status = PROPOSAL_STATUS.REJECTED;
      STATE.metrics.rejected++;
      await audit("PROPOSAL_REJECTED", { proposalId: proposalId, reason: safetyResult.reason });
      STATE.state = STATES.READY;
      return { ok: false, reason: safetyResult.reason };
    }
    const regression = regressionCheck(proposal);
    if (!regression.passed) {
      proposal.status = PROPOSAL_STATUS.REJECTED;
      STATE.metrics.rejected++;
      STATE.state = STATES.READY;
      return { ok: false, reason: "REGRESSION_CHECK_FAILED", regression: regression };
    }
    proposal.safetyReviewed = true;
    proposal.regressionChecked = true;
    proposal.status = PROPOSAL_STATUS.SANDBOXED;
    proposal.sandboxResult = { simulated: true, productionChanged: false, safetyChanged: false, timestamp: now() };
    STATE.experiments.push({ id: uid("audio-experiment"), proposalId: proposalId, createdAt: now(), status: "SANDBOXED" });
    await audit("PROPOSAL_SANDBOXED", { proposalId: proposalId });
    STATE.state = STATES.READY;
    return { ok: true, proposal: proposal };
  }

  function approveProposal(proposalId, approvalToken) {
    const proposal = findProposal(proposalId);
    if (!proposal) return { ok: false, reason: "PROPOSAL_NOT_FOUND" };
    if (!approvalToken) return { ok: false, reason: "EXPLICIT_APPROVAL_REQUIRED" };
    proposal.status = PROPOSAL_STATUS.APPROVED;
    proposal.approvedAt = now();
    audit("PROPOSAL_APPROVED", { proposalId: proposalId });
    return { ok: true, proposal: proposal };
  }

  function applyRuntime(proposal) {
    const performance = engine("CHIROMBE_AUDIO_PERFORMANCE_ENGINE", "CHIROMBE_AUDIO_PERFORMANCE");
    if (proposal.type === ADAPTATION_TYPES.TEMPO && performance && typeof performance.setSpeechSettings === "function") {
      performance.setSpeechSettings({ rate: proposal.proposedValue });
      return true;
    }
    if (proposal.type === ADAPTATION_TYPES.LANGUAGE && performance && typeof performance.setLanguage === "function") {
      performance.setLanguage(proposal.proposedValue);
      return true;
    }
    if (proposal.type === ADAPTATION_TYPES.VOICE && performance && typeof performance.setVoice === "function") {
      performance.setVoice(proposal.proposedValue);
      return true;
    }
    if (proposal.type === ADAPTATION_TYPES.VOLUME && typeof AUDIO.setMasterGain === "function") {
      const current = AUDIO.state && AUDIO.state.masterGain;
      const limit = AUDIO.CONFIG && AUDIO.CONFIG.maximumMasterGain;
      const next = limit ? Math.min(Number(proposal.proposedValue), limit) : Number(proposal.proposedValue);
      if (current != null) proposal.currentValue = current;
      AUDIO.setMasterGain(next);
      return true;
    }
    return false;
  }

  async function applyProposal(proposalId, options) {
    options = options || {};
    const proposal = findProposal(proposalId);
    if (!proposal) return { ok: false, reason: "PROPOSAL_NOT_FOUND" };
    if (!options.runtime) return { ok: false, reason: "RUNTIME_FLAG_REQUIRED" };
    if (CONFIG.evolution.requireHumanApprovalForProduction && proposal.status !== PROPOSAL_STATUS.APPROVED) {
      return { ok: false, reason: "APPROVAL_REQUIRED" };
    }
    if (!proposal.safetyReviewed || !proposal.regressionChecked) return { ok: false, reason: "VALIDATION_REQUIRED" };
    STATE.state = STATES.ADAPTING;
    try {
      const applied = applyRuntime(proposal);
      if (!applied) {
        STATE.state = STATES.READY;
        return { ok: false, reason: "NO_RUNTIME_ADAPTER" };
      }
      proposal.status = PROPOSAL_STATUS.APPLIED;
      proposal.appliedAt = now();
      proposal.measuredImprovement = false;
      STATE.metrics.applied++;
      STATE.metrics.adaptations++;
      if (STATE.activeSession) {
        STATE.activeSession.adaptations.push({ proposalId: proposalId, type: proposal.type, value: proposal.proposedValue, timestamp: now() });
        STATE.activeSession.metrics.adaptations++;
      }
      await audit("PROPOSAL_APPLIED", { proposalId: proposalId, type: proposal.type });
      await saveMemory();
      STATE.state = STATES.READY;
      return { ok: true, proposal: proposal };
    } catch (error) {
      recordError(error, "applyProposal");
      proposal.status = PROPOSAL_STATUS.ROLLED_BACK;
      STATE.metrics.rolledBack++;
      STATE.state = STATES.READY;
      return { ok: false, reason: "APPLICATION_ERROR" };
    }
  }

  async function rollbackProposal(proposalId) {
    const proposal = findProposal(proposalId);
    if (!proposal) return { ok: false, reason: "PROPOSAL_NOT_FOUND" };
    try {
      const restore = { type: proposal.type, proposedValue: proposal.currentValue, currentValue: proposal.proposedValue, target: proposal.target };
      applyRuntime(restore);
      proposal.status = PROPOSAL_STATUS.ROLLED_BACK;
      proposal.rolledBackAt = now();
      STATE.metrics.rolledBack++;
      await audit("PROPOSAL_ROLLED_BACK", { proposalId: proposalId });
      await saveMemory();
      return { ok: true, proposal: proposal };
    } catch (error) {
      recordError(error, "rollbackProposal");
      return { ok: false, reason: "ROLLBACK_ERROR" };
    }
  }

  async function createSnapshot(label) {
    const snapshot = {
      id: uid("audio-snapshot"),
      label: label || "checkpoint",
      createdAt: now(),
      generation: STATE.generation,
      preferences: deepClone(STATE.preferences),
      masterGain: AUDIO.state && AUDIO.state.masterGain,
      mode: STATE.activeSession && STATE.activeSession.mode,
      integrity: null
    };
    snapshot.integrity = await digest({ preferences: snapshot.preferences, masterGain: snapshot.masterGain, generation: snapshot.generation });
    STATE.snapshots.push(snapshot);
    if (STATE.snapshots.length > CONFIG.persistence.maximumSnapshots) STATE.snapshots.shift();
    await audit("SNAPSHOT_CREATED", { snapshotId: snapshot.id });
    await saveMemory();
    return snapshot;
  }

  async function rollbackSnapshot(snapshotId) {
    const snapshot = STATE.snapshots.find(function (item) { return item.id === snapshotId; }) || STATE.snapshots[STATE.snapshots.length - 1];
    if (!snapshot) return { ok: false, reason: "SNAPSHOT_NOT_FOUND" };
    STATE.preferences = deepClone(snapshot.preferences) || {};
    if (snapshot.masterGain != null && typeof AUDIO.setMasterGain === "function") {
      try { AUDIO.setMasterGain(snapshot.masterGain); } catch (e) {}
    }
    await audit("SNAPSHOT_RESTORED", { snapshotId: snapshot.id });
    await saveMemory();
    return { ok: true, snapshotId: snapshot.id, sourceRewritten: false };
  }

  async function evolve() {
    if (!STATE.evolutionEnabled) return { ok: false, reason: "EVOLUTION_DISABLED" };
    if (STATE.state === STATES.LOCKED) return { ok: false, reason: "ENGINE_LOCKED" };
    STATE.generation++;
    const learning = STATE.lastSession ? await learnFromSession(STATE.lastSession) : null;
    const analysis = await analyseAdaptation();
    await saveMemory();
    return { ok: true, generation: STATE.generation, learning: learning, analysis: analysis, sourceRewritten: false };
  }

  function exportMemory() {
    return { schema: SCHEMA_VERSION, version: VERSION, exportedAt: now(), generation: STATE.generation, sessions: deepClone(STATE.sessions), proposals: deepClone(STATE.proposals), preferences: deepClone(STATE.preferences), snapshots: deepClone(STATE.snapshots), metrics: deepClone(STATE.metrics) };
  }

  async function importMemory(data, options) {
    options = options || {};
    if (!data || data.schema !== SCHEMA_VERSION) return { ok: false, reason: "INVALID_SCHEMA" };
    if (options.merge !== false) {
      STATE.sessions = STATE.sessions.concat(Array.isArray(data.sessions) ? data.sessions : []).slice(-CONFIG.persistence.maximumSessions);
      STATE.preferences = Object.assign({}, STATE.preferences, data.preferences || {});
      STATE.proposals = STATE.proposals.concat(Array.isArray(data.proposals) ? data.proposals : []).slice(-CONFIG.persistence.maximumProposals);
    }
    await audit("MEMORY_IMPORTED", { merge: options.merge !== false });
    await saveMemory();
    return { ok: true };
  }

  function getStatus() {
    return {
      name: "CHIROMBE_AUDIO_EVOLUTION",
      version: VERSION,
      status: STATE.state === STATES.READY || STATE.state === STATES.DORMANT ? "READY" : STATE.state,
      loaded: true,
      absorbedStubVersion: "9.0.1",
      schema: SCHEMA_VERSION,
      state: STATE.state,
      initialised: STATE.initialised,
      generation: STATE.generation,
      activeSession: STATE.activeSession ? { id: STATE.activeSession.id, mode: STATE.activeSession.mode, startedAt: STATE.activeSession.startedAt } : null,
      memory: { sessions: STATE.sessions.length, observations: STATE.observations.length, proposals: STATE.proposals.length, snapshots: STATE.snapshots.length },
      metrics: Object.assign({}, STATE.metrics),
      configuration: CONFIG.evolution,
      anchors: deepClone(STATE.anchors),
      recentProposals: deepClone(STATE.proposals.slice(-10)),
      errors: STATE.errors.slice(-10),
      supernaturalClaim: false,
      codeRewrite: false
    };
  }

  function registerCommands() {
    if (STATE.commandsRegistered || !window.ChirombeBus || typeof window.ChirombeBus.registerCommand !== "function") return false;
    const commands = {
      "audio.evolution.status": function () { return getStatus(); },
      "audio.evolution.begin": function (args) { return beginSession(args || {}); },
      "audio.evolution.end": function (args) { return endSession(args && args.outcome, args && args.feedback); },
      "audio.evolution.observe": function (args) { return recordObservation((args && args.type) || "MANUAL", (args && args.data) || {}); },
      "audio.evolution.evolve": function () { return evolve(); },
      "audio.evolution.proposal": function (args) { return createProposal(args && args.type, args && args.target, args && args.currentValue, args && args.proposedValue, (args && args.rationale) || {}, args || {}); },
      "audio.evolution.sandbox": function (args) { return sandboxProposal(args && args.proposalId); },
      "audio.evolution.approve": function (args) { return approveProposal(args && args.proposalId, args && args.approvalToken); },
      "audio.evolution.apply": function (args) { return applyProposal(args && args.proposalId, args || {}); },
      "audio.evolution.rollback": function (args) { return rollbackProposal(args && args.proposalId); },
      "audio.evolution.snapshot": function (args) { return createSnapshot(args && args.label); },
      "audio.evolution.export": function () { return exportMemory(); }
    };
    Object.keys(commands).forEach(function (name) {
      try { window.ChirombeBus.registerCommand(name, commands[name], { subsystem: "audio-evolution" }); } catch (e) {}
    });
    STATE.commandsRegistered = true;
    return true;
  }

  function registerEvents() {
    if (STATE.eventsRegistered) return;
    const names = ["AUDIO_SAFETY_EVENT", "AUDIO_CLIPPING_DETECTED", "AUDIO_RESOURCE_WARNING", "AUDIO_SAFE_STOP"];
    names.forEach(function (eventName) {
      window.addEventListener(eventName, function (event) {
        try { recordObservation(eventName, (event && event.detail) || {}); } catch (error) { recordError(error, eventName); }
      });
    });
    STATE.eventsRegistered = true;
  }

  async function initialise() {
    if (STATE.initialised) return getStatus();
    STATE.state = STATES.READY;
    await loadMemory();
    establishAnchors();
    registerCommands();
    registerEvents();
    STATE.initialised = true;
    emit("AUDIO_EVOLUTION_ENGINE_READY", { version: VERSION, sessions: STATE.sessions.length });
    if (!STATE.commandsRegistered) {
      let tries = 0;
      const timer = setInterval(function () {
        tries += 1;
        if (registerCommands() || tries > 10) clearInterval(timer);
      }, 500);
    }
    return getStatus();
  }

  const API = {
    VERSION: VERSION,
    SCHEMA_VERSION: SCHEMA_VERSION,
    STATES: STATES,
    ADAPTATION_TYPES: ADAPTATION_TYPES,
    PROPOSAL_STATUS: PROPOSAL_STATUS,
    CONFIG: CONFIG,
    initialise: initialise,
    beginSession: beginSession,
    endSession: endSession,
    recordObservation: recordObservation,
    scoreSession: scoreSession,
    updatePreference: updatePreference,
    getPreference: getPreference,
    calculateNovelty: calculateNovelty,
    createProposal: createProposal,
    learnFromSession: learnFromSession,
    analyseAdaptation: analyseAdaptation,
    validateProposalSafety: validateProposalSafety,
    regressionCheck: regressionCheck,
    sandboxProposal: sandboxProposal,
    approveProposal: approveProposal,
    applyProposal: applyProposal,
    rollbackProposal: rollbackProposal,
    createSnapshot: createSnapshot,
    rollbackSnapshot: rollbackSnapshot,
    evolve: evolve,
    getEnvironmentSnapshot: getEnvironmentSnapshot,
    establishAnchors: establishAnchors,
    saveMemory: saveMemory,
    loadMemory: loadMemory,
    exportMemory: exportMemory,
    importMemory: importMemory,
    getStatus: getStatus
  };

  const priorEvolution = window.CHIROMBE_AUDIO_EVOLUTION;
  if (!(priorEvolution && typeof priorEvolution.beginSession === "function")) {
    window.CHIROMBE_AUDIO_EVOLUTION_ENGINE = API;
    window.CHIROMBE_AUDIO_EVOLUTION = API;
    AUDIO.Evolution = API;
  }

  initialise().catch(function (error) {
    recordError(error, "initialise");
    STATE.state = STATES.ERROR;
  });
})();

(() => {
  "use strict";

  const AUDIO = window.CHIROMBE_AUDIO;
  if (!AUDIO || AUDIO.master || typeof AUDIO.emergencyStop !== "function") return;

  const VERSION = "10.0.0";
  const LIFECYCLE = Object.freeze({
    DORMANT: "DORMANT",
    READY: "READY",
    ARMED: "ARMED",
    INITIALISING: "INITIALISING",
    ACTIVE: "ACTIVE",
    MONITORING: "MONITORING",
    ADAPTING: "ADAPTING",
    REFLECTION: "REFLECTION",
    CLOSING: "CLOSING",
    SAFE_STOP: "SAFE_STOP",
    RECOVERY: "RECOVERY",
    ERROR: "ERROR"
  });
  const MODES = Object.freeze(["PROTECTION", "PEACE", "COURAGE", "UNITY", "GRATITUDE", "REMEMBRANCE", "FAMILY_BLESSING", "REFLECTION", "NIGHT_WATCH", "DAWN", "EVENING", "RECOVERY", "ALERT", "SILENT_WATCH", "CLOSING"]);

  const master = {
    version: VERSION,
    state: LIFECYCLE.DORMANT,
    initialised: false,
    session: null,
    privacy: true,
    adaptive: true,
    watch: false,
    loop: null,
    watchTimer: null,
    bound: false,
    commandsRegistered: false,
    capabilities: {},
    errors: [],
    warnings: [],
    resourceSkips: 0
  };
  AUDIO.master = master;

  function evolution() { return window.CHIROMBE_AUDIO_EVOLUTION || AUDIO.Evolution || null; }
  function liturgy() { return AUDIO.Liturgy || window.CHIROMBE_AUDIO_LITURGY_ENGINE || null; }

  function present(name) {
    try { return !!window[name]; } catch (e) { return false; }
  }

  function discover() {
    master.capabilities = {
      core: !!(window.CHIROMBE || window.ChirombeCore),
      bus: !!window.ChirombeBus,
      state: !!window.ChirombeState,
      audit: !!window.ChirombeAudit,
      watchdog: !!window.ChirombeWatchdog,
      health: !!window.ChirombeHealth,
      zcca: !!window.ZCCA,
      zion: !!window.ZionProtect,
      covenant: !!window.MwarindiCovenant,
      resonance: !!window.ChirombeResonance,
      autostart: !!window.CHIROMBE_AUTOSTART,
      tonal: present("CHIROMBE_AUDIO_TONAL_ENGINE"),
      environment: present("CHIROMBE_AUDIO_ENVIRONMENT_ENGINE"),
      performance: present("CHIROMBE_AUDIO_PERFORMANCE_ENGINE"),
      safety: present("CHIROMBE_AUDIO_SAFETY_ENGINE") || typeof AUDIO.emergencyStop === "function",
      evolution: !!(evolution() && typeof evolution().beginSession === "function"),
      liturgy: !!liturgy(),
      bloodline: present("CHIROMBE_AUDIO_BLOODLINE_ORCHESTRATOR") || !!(window.CHIROMBE && window.CHIROMBE.AudioBloodlineOrchestrator),
      approvedFamily: !!(liturgy() && liturgy().getStatus && liturgy().getStatus().bloodlineAvailable),
      kernel: true
    };
    return master.capabilities;
  }

  function emit(type, payload) {
    const event = { eventId: "living_" + Date.now().toString(36), timestamp: new Date().toISOString(), sessionId: master.session && master.session.sessionId, type: type, payload: payload || {} };
    try { if (typeof AUDIO.emit === "function") AUDIO.emit(type, event); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent(type, { detail: event })); } catch (e) {}
    return event;
  }

  function remember(action, detail) {
    try { if (typeof AUDIO.remember === "function") AUDIO.remember(action, detail || {}, 0.5); } catch (e) {}
    try {
      if (window.ChirombeAudit && typeof window.ChirombeAudit.append === "function") window.ChirombeAudit.append({ type: action, detail: detail || {}, sessionId: master.session && master.session.sessionId });
    } catch (e) {}
  }

  function fail(error, context) {
    const item = { at: new Date().toISOString(), context: context, message: (error && error.message) || String(error) };
    master.errors.push(item);
    if (master.errors.length > 80) master.errors.shift();
    emit("audio.living.error", item);
    return item;
  }

  function browserCaps() {
    const caps = { webAudio: false, speech: false, microphone: false, gestureRequired: true };
    try { caps.webAudio = !!(window.AudioContext || window.webkitAudioContext); } catch (e) {}
    try { caps.speech = "speechSynthesis" in window; } catch (e) {}
    try { caps.microphone = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia); } catch (e) {}
    return caps;
  }

  function safetyState() {
    const safety = window.CHIROMBE_AUDIO_SAFETY_ENGINE;
    try {
      if (safety && typeof safety.getStatus === "function") return safety.getStatus();
    } catch (e) { fail(e, "safetyState"); }
    return { available: typeof AUDIO.emergencyStop === "function", authority: "PART_1_KERNEL", emergency: false };
  }

  function createLivingLiturgySession(options) {
    options = options || {};
    const mode = MODES.indexOf(options.mode) >= 0 ? options.mode : "REFLECTION";
    const evo = evolution();
    const evoSession = evo && typeof evo.beginSession === "function" ? evo.beginSession({ mode: mode, language: options.language, people: options.people, settings: options.settings, purpose: "DEVOTIONAL" }) : null;
    const session = {
      sessionId: (evoSession && evoSession.id) || ("living_" + Date.now().toString(36)),
      createdAt: new Date().toISOString(),
      startedAt: null,
      endedAt: null,
      mode: mode,
      intention: options.intention || mode,
      language: options.language || "en-GB",
      participants: Array.isArray(options.people) ? options.people : [],
      inventedPeople: false,
      prayerSequence: [],
      tonalScene: mode,
      safetyState: safetyState(),
      environmentSnapshot: evo && evo.getEnvironmentSnapshot ? evo.getEnvironmentSnapshot() : { available: false },
      adaptations: [],
      metrics: { prayers: 0, interruptions: 0, adaptations: 0 },
      events: [],
      errors: [],
      outcome: null,
      evolutionProposals: [],
      snapshotId: null,
      speak: false,
      microphone: false,
      stages: ["OPENING", "DECLARATION", "PRAYER", "CHANT", "REFLECTION", "CALL", "RESPONSE", "REMEMBRANCE", "CLOSING"],
      stageIndex: 0,
      stage: "OPENING"
    };
    master.session = session;
    return session;
  }

  function selectLiturgy(session, options) {
    const engine = liturgy();
    if (!engine || !engine.commands) return { available: false, provenance: "UNKNOWN_SOURCE" };
    try {
      let content = null;
      if (session.mode === "FAMILY_BLESSING" && options.useApprovedFamily === true && typeof engine.commands.bloodline === "function") {
        content = engine.commands.bloodline({ mode: session.mode });
      } else if (session.participants.length && typeof engine.commands.personPrayer === "function") {
        content = engine.commands.personPrayer(session.participants[0], { mode: session.mode });
      } else if (typeof engine.commands.adaptive === "function") {
        content = engine.commands.adaptive({ mode: session.mode, purpose: session.intention });
      }
      if (content) {
        session.prayerSequence.push({ provenance: content.provenance || "ORIGINAL_GENERATED", id: content.id || null });
        session.metrics.prayers++;
      }
      return { available: true, content: content, spoken: false };
    } catch (error) {
      fail(error, "selectLiturgy");
      return { available: false, reason: "LITURGY_FAILED" };
    }
  }

  function stopLoop() {
    if (master.loop) { clearInterval(master.loop); master.loop = null; }
  }

  function tick() {
    if (!master.session || master.state !== LIFECYCLE.ACTIVE && master.state !== LIFECYCLE.MONITORING && master.state !== LIFECYCLE.ADAPTING) return;
    try {
      if (document && document.hidden) return;
    } catch (e) {}
    const kernel = AUDIO.state || {};
    if ((kernel.activeNodes || 0) > 24 || (kernel.errors || 0) > 12) {
      master.resourceSkips++;
      master.warnings.push({ at: new Date().toISOString(), code: "RESOURCE_PRESSURE" });
      if (master.warnings.length > 40) master.warnings.shift();
      return;
    }
    master.state = LIFECYCLE.MONITORING;
    const evo = evolution();
    if (evo && master.adaptive) {
      try {
        const environment = evo.getEnvironmentSnapshot();
        master.session.environmentSnapshot = environment;
        evo.recordObservation("ORCHESTRATOR_TICK", { mode: master.session.mode, environmentAvailable: !!environment.available, supernaturalClaim: false });
      } catch (error) { fail(error, "tick"); }
    }
    master.state = LIFECYCLE.ACTIVE;
  }

  function startLoop() {
    if (master.loop) return;
    master.loop = setInterval(tick, 8000);
  }

  async function startLivingLiturgy(options) {
    options = options || {};
    if (master.session && master.state === LIFECYCLE.ACTIVE) return { ok: false, state: "ALREADY_ACTIVE", sessionId: master.session.sessionId };
    discover();
    const safety = safetyState();
    if (safety && safety.emergency) return safeStop("SAFETY_EMERGENCY");
    master.state = LIFECYCLE.ARMED;
    const session = createLivingLiturgySession(options);
    session.startedAt = new Date().toISOString();
    master.state = LIFECYCLE.INITIALISING;
    selectLiturgy(session, options);
    if (options.gesture === true && typeof AUDIO.unlockAudio === "function") {
      try { await AUDIO.unlockAudio(); } catch (error) { fail(error, "unlockAudio"); }
    }
    session.speak = false;
    session.microphone = false;
    master.state = LIFECYCLE.ACTIVE;
    startLoop();
    remember("LIVING_LITURGY_STARTED", { sessionId: session.sessionId, mode: session.mode });
    emit("audio.living.started", { sessionId: session.sessionId, mode: session.mode });
    return { ok: true, state: master.state, sessionId: session.sessionId, playbackStarted: false, microphoneStarted: false };
  }

  function pauseLivingLiturgy() {
    if (!master.session) return { ok: false, reason: "NO_SESSION" };
    stopLoop();
    master.state = LIFECYCLE.REFLECTION;
    emit("audio.living.paused", { sessionId: master.session.sessionId });
    return { ok: true, state: master.state };
  }

  function resumeLivingLiturgy() {
    if (!master.session) return { ok: false, reason: "NO_SESSION" };
    if (master.state === LIFECYCLE.SAFE_STOP) return { ok: false, reason: "SAFE_STOP" };
    master.state = LIFECYCLE.ACTIVE;
    startLoop();
    emit("audio.living.resumed", { sessionId: master.session.sessionId });
    return { ok: true, state: master.state };
  }

  async function closeLivingLiturgySession(outcome) {
    master.state = LIFECYCLE.CLOSING;
    stopLoop();
    const session = master.session;
    if (session) {
      session.endedAt = new Date().toISOString();
      session.outcome = outcome || { completion: 1, quality: 0.5, comfort: 0.5, coherence: 0.5, stability: 0.5, novelty: 0.5 };
    }
    const evo = evolution();
    let closed = null;
    if (evo && typeof evo.endSession === "function") {
      try { closed = await evo.endSession(session && session.outcome, null); } catch (error) { fail(error, "endSession"); }
    }
    if (session && evo && typeof evo.analyseAdaptation === "function") {
      try {
        const analysis = await evo.analyseAdaptation();
        session.evolutionProposals = (analysis && analysis.proposals) || [];
      } catch (error) { fail(error, "analyse"); }
    }
    master.session = null;
    master.state = LIFECYCLE.READY;
    emit("audio.living.completed", { sessionId: session && session.sessionId });
    return { ok: true, session: closed || session };
  }

  function nextLivingStage() {
    if (!master.session) return { ok: false, reason: "NO_SESSION" };
    const stages = master.session.stages || [];
    if (!stages.length) return { ok: false, reason: "NO_STAGES" };
    master.session.stageIndex = Math.min(stages.length - 1, (master.session.stageIndex || 0) + 1);
    master.session.stage = stages[master.session.stageIndex];
    master.session.events.push({ at: new Date().toISOString(), type: "STAGE", stage: master.session.stage });
    emit("audio.living.stage", { stage: master.session.stage });
    return { ok: true, stage: master.session.stage, index: master.session.stageIndex };
  }

  function repeatLivingStage() {
    if (!master.session) return { ok: false, reason: "NO_SESSION" };
    master.session.events.push({ at: new Date().toISOString(), type: "REPEAT", stage: master.session.stage || "OPENING" });
    emit("audio.living.repeat", { stage: master.session.stage });
    return { ok: true, stage: master.session.stage, repeated: true };
  }

  function stopLivingLiturgy() { return closeLivingLiturgySession({ completion: 1, quality: 0.5 }); }

  function safeStop(reason) {
    stopLoop();
    stopQuietWatch();
    try { AUDIO.emergencyStop(reason || "ORCHESTRATOR_SAFE_STOP"); } catch (error) { fail(error, "emergencyStop"); }
    const safety = window.CHIROMBE_AUDIO_SAFETY_ENGINE;
    try { if (safety && typeof safety.safeStop === "function") safety.safeStop(reason); } catch (error) { fail(error, "safety.safeStop"); }
    if (master.session) master.session.metrics.interruptions++;
    master.state = LIFECYCLE.SAFE_STOP;
    emit("audio.living.safeStop", { reason: reason || "USER" });
    return { ok: true, state: master.state };
  }

  async function adaptLivingLiturgy() {
    if (!master.session) return { ok: false, reason: "NO_SESSION" };
    const evo = evolution();
    if (!evo) return { ok: false, reason: "EVOLUTION_UNAVAILABLE" };
    master.state = LIFECYCLE.ADAPTING;
    const analysis = await evo.analyseAdaptation();
    master.session.adaptations.push({ at: new Date().toISOString(), proposals: (analysis.proposals || []).length, applied: false });
    master.state = LIFECYCLE.ACTIVE;
    emit("audio.living.evolutionProposal", { count: (analysis.proposals || []).length });
    return { ok: true, applied: false, analysis: analysis };
  }

  async function createSnapshot(label) {
    const evo = evolution();
    if (!evo || typeof evo.createSnapshot !== "function") return { ok: false, reason: "EVOLUTION_UNAVAILABLE" };
    const snapshot = await evo.createSnapshot(label || (master.session && master.session.mode));
    if (master.session) master.session.snapshotId = snapshot.id;
    emit("audio.living.snapshot", { snapshotId: snapshot.id });
    return { ok: true, snapshot: snapshot };
  }

  async function rollback(snapshotId) {
    const evo = evolution();
    if (!evo || typeof evo.rollbackSnapshot !== "function") return { ok: false, reason: "EVOLUTION_UNAVAILABLE" };
    const result = await evo.rollbackSnapshot(snapshotId);
    emit("audio.living.recovery", result);
    return result;
  }

  function startQuietWatch() {
    if (master.watchTimer) return { ok: true, state: "ALREADY_WATCHING", recording: false };
    master.watch = true;
    master.watchTimer = setInterval(function () {
      try {
        if (document && document.hidden && master.resourceSkips > 0) return;
      } catch (e) {}
      discover();
      const safety = safetyState();
      if (safety && safety.emergency) safeStop("WATCH_SAFETY");
      remember("LIVING_WATCH_PULSE", { modules: master.capabilities, recording: false, microphone: false });
    }, 30000);
    emit("audio.living.watch", { recording: false });
    return { ok: true, recording: false, microphone: false };
  }

  function stopQuietWatch() {
    if (master.watchTimer) { clearInterval(master.watchTimer); master.watchTimer = null; }
    master.watch = false;
    return { ok: true };
  }

  function publicStatus() {
    return {
      version: VERSION,
      state: master.state,
      session: master.session ? { sessionId: master.session.sessionId, mode: master.session.mode, startedAt: master.session.startedAt, microphone: false } : null,
      watch: master.watch,
      privacy: master.privacy,
      adaptive: master.adaptive,
      capabilities: master.capabilities,
      errors: master.errors.slice(-8),
      playbackOnLoad: false,
      supernaturalClaim: false
    };
  }

  function getDiagnostics() {
    const kernel = typeof AUDIO.getStatus === "function" ? null : null;
    let audioState = "unknown";
    try { audioState = AUDIO.state && AUDIO.state.audioContextState; } catch (e) {}
    return {
      browser: browserCaps(),
      audioContext: audioState,
      modules: discover(),
      safety: safetyState(),
      evolution: evolution() && evolution().getStatus ? evolution().getStatus() : { available: false },
      liturgy: liturgy() && liturgy().getStatus ? liturgy().getStatus() : { available: false },
      session: publicStatus(),
      watch: { active: master.watch, recording: false },
      resources: { skips: master.resourceSkips, activeNodes: AUDIO.state && AUDIO.state.activeNodes },
      errors: master.errors.slice(-8),
      warnings: master.warnings.slice(-8)
    };
  }

  function runTests() {
    const results = [];
    function row(name, ok, detail) { results.push({ name: name, ok: !!ok, detail: detail || null }); }
    row("namespace", !!window.CHIROMBE_AUDIO);
    row("kernel status", typeof AUDIO.getStatus === "function");
    row("emergency stop", typeof AUDIO.emergencyStop === "function");
    row("living watch preserved", typeof AUDIO.startLivingWatch === "function");
    row("liturgy", !!(liturgy() && liturgy().commands && liturgy().commands.prayer));
    row("evolution", !!(evolution() && evolution().beginSession && evolution().createSnapshot));
    row("orchestrator", typeof AUDIO.startLivingLiturgy === "function");
    row("safe stop", typeof AUDIO.safeStop === "function" && typeof AUDIO.emergencyStop === "function");
    row("bus discovered", true, window.ChirombeBus ? "present" : "not on this page");
    row("no microphone flag", !master.session || master.session.microphone === false);
    row("single bind", master.bound === true);
    return { ok: results.every(function (item) { return item.ok; }), results: results, destructive: false };
  }

  function registerCommands() {
    if (master.commandsRegistered || !window.ChirombeBus || typeof window.ChirombeBus.registerCommand !== "function") return false;
    const commands = {
      "audio.living.start": function (args) { return startLivingLiturgy(args || {}); },
      "audio.living.pause": function () { return pauseLivingLiturgy(); },
      "audio.living.resume": function () { return resumeLivingLiturgy(); },
      "audio.living.stop": function () { return stopLivingLiturgy(); },
      "audio.living.safeStop": function (args) { return safeStop(args && args.reason); },
      "audio.living.status": function () { return publicStatus(); },
      "audio.living.capabilities": function () { return discover(); },
      "audio.living.session": function () { return master.session; },
      "audio.living.adapt": function () { return adaptLivingLiturgy(); },
      "audio.living.snapshot": function (args) { return createSnapshot(args && args.label); },
      "audio.living.rollback": function (args) { return rollback(args && args.snapshotId); },
      "audio.living.tests": function () { return runTests(); },
      "audio.living.diagnostics": function () { return getDiagnostics(); },
      "audio.living.watch.start": function () { return startQuietWatch(); },
      "audio.living.watch.stop": function () { return stopQuietWatch(); }
    };
    Object.keys(commands).forEach(function (name) {
      try { window.ChirombeBus.registerCommand(name, commands[name], { subsystem: "living-liturgy" }); } catch (e) {}
    });
    master.commandsRegistered = true;
    return true;
  }

  function initialise() {
    if (master.initialised) return publicStatus();
    discover();
    registerCommands();
    master.initialised = true;
    master.state = LIFECYCLE.READY;
    master.bound = true;
    emit("audio.living.ready", { version: VERSION, autoplay: false });
    if (!master.commandsRegistered) {
      let tries = 0;
      const timer = setInterval(function () {
        tries += 1;
        if (registerCommands() || tries > 10) clearInterval(timer);
      }, 500);
    }
    return publicStatus();
  }

  function reset() {
    stopLoop();
    stopQuietWatch();
    master.session = null;
    master.errors = [];
    master.state = LIFECYCLE.READY;
    return { ok: true, state: master.state };
  }

  AUDIO.startLivingLiturgy = startLivingLiturgy;
  AUDIO.pauseLivingLiturgy = pauseLivingLiturgy;
  AUDIO.resumeLivingLiturgy = resumeLivingLiturgy;
  AUDIO.stopLivingLiturgy = stopLivingLiturgy;
  AUDIO.nextLivingStage = nextLivingStage;
  AUDIO.repeatLivingStage = repeatLivingStage;
  AUDIO.getLivingLiturgyStatus = publicStatus;
  AUDIO.adaptLivingLiturgy = adaptLivingLiturgy;
  AUDIO.createLivingLiturgySession = createLivingLiturgySession;
  AUDIO.closeLivingLiturgySession = closeLivingLiturgySession;
  AUDIO.runLivingLiturgyDiagnostics = getDiagnostics;
  AUDIO.runLivingLiturgyTests = runTests;
  AUDIO.createEvolutionProposal = function (spec) {
    const evo = evolution();
    if (!evo) return { ok: false, reason: "EVOLUTION_UNAVAILABLE" };
    return evo.createProposal(spec && spec.type, spec && spec.target, spec && spec.currentValue, spec && spec.proposedValue, spec || {}, spec || {});
  };
  AUDIO.createSnapshot = createSnapshot;
  AUDIO.rollbackLivingSnapshot = rollback;
  if (typeof AUDIO.safeStop !== "function") AUDIO.safeStop = safeStop;
  if (typeof AUDIO.getCapabilities !== "function") AUDIO.getCapabilities = discover;
  if (typeof AUDIO.getDiagnostics !== "function") AUDIO.getDiagnostics = getDiagnostics;
  if (typeof AUDIO.runTests !== "function") AUDIO.runTests = runTests;
  if (typeof AUDIO.reset !== "function") AUDIO.reset = reset;
  if (typeof AUDIO.start !== "function") AUDIO.start = startLivingLiturgy;
  if (typeof AUDIO.pause !== "function") AUDIO.pause = pauseLivingLiturgy;
  if (typeof AUDIO.resume !== "function") AUDIO.resume = resumeLivingLiturgy;
  if (typeof AUDIO.stop !== "function") AUDIO.stop = stopLivingLiturgy;
  AUDIO.LIVING_LITURGY_ORCHESTRATOR = {
    VERSION: VERSION,
    LIFECYCLE: LIFECYCLE,
    MODES: MODES,
    initialise: initialise,
    start: startLivingLiturgy,
    pause: pauseLivingLiturgy,
    resume: resumeLivingLiturgy,
    stop: stopLivingLiturgy,
    next: nextLivingStage,
    repeat: repeatLivingStage,
    safeStop: safeStop,
    reset: reset,
    getStatus: publicStatus,
    getCapabilities: discover,
    getDiagnostics: getDiagnostics,
    runTests: runTests,
    getSession: function () { return master.session; },
    createSession: createLivingLiturgySession,
    closeSession: closeLivingLiturgySession,
    adapt: adaptLivingLiturgy,
    snapshot: createSnapshot,
    rollback: rollback,
    getEvolution: evolution,
    getEnvironment: function () { return window.CHIROMBE_AUDIO_ENVIRONMENT_ENGINE || null; },
    getSafety: function () { return window.CHIROMBE_AUDIO_SAFETY_ENGINE || null; },
    getPerformance: function () { return window.CHIROMBE_AUDIO_PERFORMANCE_ENGINE || null; },
    getTonal: function () { return window.CHIROMBE_AUDIO_TONAL_ENGINE || null; },
    startQuietWatch: startQuietWatch,
    stopQuietWatch: stopQuietWatch
  };

  const previousStatus = AUDIO.getStatus;
  if (typeof previousStatus === "function" && !AUDIO.__livingStatusWrapped) {
    AUDIO.getStatus = function () {
      const base = previousStatus();
      base.livingLiturgy = publicStatus();
      base.evolutionLayer = evolution() && evolution().getStatus ? evolution().getStatus() : null;
      return base;
    };
    AUDIO.__livingStatusWrapped = true;
  }

  initialise();
})();
