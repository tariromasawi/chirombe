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
