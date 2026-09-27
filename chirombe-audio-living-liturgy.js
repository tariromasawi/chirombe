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