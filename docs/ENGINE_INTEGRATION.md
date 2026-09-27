# CHIROMBE ENGINE integration plan

Governing rule: preserve the past, connect the present, evolve only through a reviewed change.

Baseline before this work: `2c26b57`.

## What was not done

- `chirombe engine` was not edited, formatted, or loaded.
- `add 1` was not edited.
- `index.html` was not edited.
- Family JSON, ZCCA family text, and `docs/DATA_MODEL.md` were not edited.
- No worker file was replaced.
- No force-push.

## Repair (separate from the integration layer)

| | |
|---|---|
| file | `js/command-bus.js` |
| function | `registerCommand` |
| before | file did not parse. SHA-256 `3c43ae2f5436d512bbff864e48a8c8a1b5dd909788d82dbc42b7f499fd5d8960` |
| change | close `registerCommand` after the command map assignment so `executeCommand` and `listCommands` stay siblings |
| risk | low. The previous file could not run |
| test | `node --check js/command-bus.js`, `tests/engine-integration.test.mjs` |
| rollback | restore that one line. The bus will fail to parse again, so roll back only together with another bus |

## Phase A — discovery

Files: `js/engine/policy.js`. Catalogue of real globals versus missing optional names. Artifact hash recorded: `f1df5408bf0374365fb6149dc35a9b992a5645a671d921e804634f3e2f844ddc`.

Risk: none to live modules. Rollback: delete `js/engine/policy.js`.

## Phase B — adapters

File: `js/engine/adapters.js`.

Memory reads `ChirombeState` under `data.engineIntegration.records` (append). It does not replace `family`. A native `CHIROMBE_MEMORY` global is used only if it appears later.

Workers: logical `ENGINE_*` records plus the existing `workers/*.js` list. Existing files are not spawned by the engine.

Orchestrator: records tasks. It may call `ChirombeBus.executeCommand` only for commands already registered. It does not call `ZCCA.command`.

Other adapters: knowledge, evolution (propose only), build (plan only), bloodline (read only), intention, resonance (status and measure, no auto-audio), defence, watchdog (does not call `tick` during status), external AI (no network, no credentials).

Risk: low. Rollback: remove the script tags that load `js/engine/adapters.js`.

## Phase C — connection graph

File: `js/engine/chirombe-engine.js` (`discover`, `connect`). Edges carry source, target, interface, status, confidence, lastVerified, failureCount, rollbackAvailable.

## Phase D — health and integrity

`selfTest` returns `NOT_AVAILABLE` when a global is absent and `FAILURE` only when a present module throws or a required method fails. `INTEGRITY` checks policy flags and the journal chain. `INTEGRITY` with `{verify:true}` hashes the artifact with SHA-256 and does not execute it.

## Phase E — memory and knowledge

Journal keys, append-only:

- `CHIROMBE_ENGINE_JOURNAL_V1`
- `CHIROMBE_ENGINE_JOURNAL_ARCHIVE_V1` (overflow, not deletion)
- `CHIROMBE_ENGINE_ERRORS_V1`
- `CHIROMBE_ENGINE_RECOVERY_V1`

Knowledge items keep status `KNOWN`, `CONFLICTING`, or `UNVERIFIED`. Assumptions are not promoted.

## Phase F — evolution and build

`evolution.apply` always returns `NO_BLIND_DEPLOY`. `build.propose` records a plan and does not run `engine/headless-runner.mjs`.

## Phase G — bloodline, intention, resonance

Bloodline reports runtime records plus an audit snapshot of the Tarry conflict. Nothing is written back. Covenant `seal` is not called during boot. Resonance is not armed during boot.

## Phase H — external AI

Provider labels allowed: `GROK`, `OTHER_AI`, `LOCAL_MODEL`, `NONE`. Default `NONE`. Responses use the structured envelope (`requestId`, `requiresApproval`, empty `codeChanges`). No fetch to a model.

## Phase I — recovery and continuity

Recovery states recorded at boot:

- artifact: `ANALYSING` (preserved, not executed)
- command bus: `RECOVERED` (brace repair)

Boot order is the required staged sequence: discover, connect, verify, memory, self-test, ready.

## Phase J — optimisation

Not started. Open proposals, unapplied:

1. Keep the artifact unexecuted until a reviewed split exists.
2. Do not create the missing `chirombe-*.js` names as replacements.
3. Zion's 400-entry trim conflicts with history preservation. Not changed.
4. Tarry's spouse/son conflict waits for an explicit data operation.

## Pages touched

| file | change |
|---|---|
| `engine.html` | new console |
| `app.html` | link plus four script tags after existing scripts |
| `js/chirombe.js` | ordered loader appended; existing `load()` calls unchanged |
| `sw.js` | cache name `CHIROMBE_STATIC_v3`, engine files added to precache |
| `scripts/self-check.mjs` | requires the new files and syntax-checks them |
| `.github/workflows/test.yml` | runs the new test |
| `README.md` | pointer |

## Rollback of the integration

Remove `js/engine/`, `engine.html`, the four script tags and the engine link on `app.html`, the `loadOrdered` block in `js/chirombe.js`, and restore `sw.js` `CHIROMBE_STATIC_v2` if a cache rollback is required. Live modules keep working. Journal keys in localStorage can remain; the engine never needs them deleted.

## Kernel load (requested after the first integration)

The preserved file `chirombe engine` is still byte-for-byte the audited artifact. `js/engine/kernel-bridge.js` fetches it and builds an executable projection in memory:

- the git splice at line 1869 is kept inside a comment
- raw `<script>` tags are kept inside comments
- a loose `await` fragment is wrapped so the bloodline intention still registers
- two illegal `??` / `||` mixes are parenthesised
- CHEP-14 gains the `average` helper it calls
- CHEP-15 boot is guarded so a canvas failure cannot stop CHEP-17
- CHEP-17 gets `VERSION = "1.0.0"`, matching its identity block

`index.html` is still not rewritten. `js/chirombe.js`, which the main index already loads, now loads the bridge after the integration engine. `app.html` and `engine.html` load it too.

On load the bridge starts the kernel, keeps any global that already existed (`CHIROMBE_GUARDIAN` stays the matrix; the sentinel entity remains on `CHIROMBE_SENTINEL`), registers `data/family.json` into `CHIROMBE_BLOODLINE` without resolving the Tarry conflict, arms ZCCA, Zion, defence, and the sentinel, and starts the existing `workers/*.js` files. Part 03 is still absent from the artifact. A bridge named `CHIROMBE_WORKERS` forwards registration into the core kernel. It does not delete workers.

Rollback: remove the `kernel-bridge.js` script. The original file does not need to be restored because it was not edited.

## Full activation

`js/engine/activation.js` absorbs the preserved 40,009-line source after the kernel projection is running.

- `KERNEL_FUNCTION_MANIFEST` is a lexical catalogue. It does not pretend each function was unit-tested.
- PART 03 stays `DEPENDENCY_REQUIRED`. The worker bridge is not described as the original swarm.
- One scheduler owns the integration pulse. The preserved kernel still has its own timers. A hidden tab slows the scheduler. This is not a 24/7 runtime.
- `CHIROMBE_ENGINE.activate()` returns `ALREADY_ACTIVE` when the kernel is already up.
- `CHIROMBE_ENGINE.selfKnowledge()` and `CHIROMBE_ACTIVATION.protection()` are computational. They do not claim supernatural protection.
- `ChirombeResonance` is linked, not replaced.
- Service worker cache is `CHIROMBE_STATIC_v4`. A mismatch is recorded as `ENGINE_VERSION_MISMATCH`, not as an attack.
- Unknown anomalies stay `UNKNOWN`.

Rollback: remove `js/engine/activation.js` and `js/engine/kernel-bridge.js`. The original `chirombe engine` file does not need to be restored.
