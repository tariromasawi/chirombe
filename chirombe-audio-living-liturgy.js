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
    (CHIROMBE_AUDIO_LITURGY_ENGINE =
      CHIROMBE_AUDIO_LITURGY_ENGINE || {});

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

  CHIROMBE_AUDIO_TRADITION_LIBRARY =
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