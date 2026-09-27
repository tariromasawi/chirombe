# CHIROMBE ENGINE architecture audit

Audit date: 2026-09-27. Baseline commit: `2c26b57` (`Update chirombe engine`).
No repository file was rewritten in order to produce this audit. Later integration commits are separate and listed in `ENGINE_INTEGRATION.md`.

The file named `chirombe engine` is a preserved artifact. It is not the live kernel. It does not parse, and no HTML page loads it.

## A. Repository structure

Static GitHub Pages site. No package.json. Layers already documented in `docs/ARCHITECTURE.md`: legacy `index.html`, survivable `app.html`, browser scripts, one service worker, headless `engine/headless-runner.mjs`, versioned JSON.

Top level: HTML pages, `js/`, `workers/`, `data/`, `docs/`, `css/`, `engine/`, `scripts/`, `tests/`, `.github/workflows/`, `sw.js`.

## B. Existing files

114 tracked files at audit. Largest:

| file | bytes | role |
|---|---:|---|
| `chirombe engine` | 728908 | concatenated historical kernel, unparseable |
| `add 1` | 411510 | HTML archive, 18 doctypes, not a live entry |
| `index.html` | 298620 | legacy page, 3 concatenated documents |
| `js/pioneer-brain.js` | 17703 | pioneer brain |
| `js/zcca.js` | 10510 | command shell |

## C. Existing modules

Live modules are under `js/` and `workers/`. They do **not** use the `CHIROMBE_*` filenames named inside the artifact.

Present and loadable: `boot.js`, `command-bus.js`, `state-store.js`, `audit-chain.js`, `health.js`, `watchdog.js`, `chirombe-core.js`, `chirombe.js`, `zcca.js`, `zion-protection-core.js`, `mwarindimwari-covenant.js`, `resonance-engine.js`, liturgy scripts, CM90 scripts, pioneer scripts, guardian, autostart.

## D. Existing globals

| global | file |
|---|---|
| `ChirombeSystem` | `js/boot.js` |
| `ChirombeBus` | `js/command-bus.js` |
| `ChirombeState` | `js/state-store.js` |
| `ChirombeAudit` | `js/audit-chain.js` |
| `ChirombeHealth` | `js/health.js` |
| `ChirombeWatchdog` | `js/watchdog.js` |
| `ChirombeCore` | `js/chirombe-core.js` |
| `Chirombe` | `js/chirombe.js` (bridge only fills it if absent) |
| `ZCCA` | `js/zcca.js` |
| `ZionProtect`, `ZionProtectionCore` | `js/zion-protection-core.js` |
| `MwarindiCovenant` | `js/mwarindimwari-covenant.js` |
| `ChirombeResonance` | `js/resonance-engine.js` |
| `CHIROMBE_AUTOSTART` | `js/chirombe-autostart.js` |
| `CHIROMBE_GUARDIAN` | `js/guardian-matrix.js` |
| `CHIROMBE_LITURGY` | `js/liturgy-matrix.js` |
| `CHIROMBE_PIONEER_BRAIN` | `js/pioneer-brain.js` |

Inside the unparsed artifact only (not live): `CHIROMBE`, `CHIROMBE_CORE`, `CHIROMBE_MEMORY`.

## E. Existing public APIs

- `ChirombeBus.registerCommand / executeCommand / listCommands`
- `ChirombeCore.pray / evolve` plus `family`
- `ChirombeState.load / save` plus `data`
- `ChirombeHealth.snapshot / capabilities`
- `ChirombeWatchdog.tick`
- `ChirombeAudit.head / append / verify / export`
- `ZCCA.command / activate / protect / getFamily / status`
- `ZionProtect.snapshot` and the class methods on `ZionProtectionCore`
- `MwarindiCovenant.status / remind / seal`
- `ChirombeResonance.status / measure / activate`
- `CHIROMBE_AUTOSTART.status / discover / cycle / start / stop`

## F. Script-loading order

`app.html`: boot, command-bus, state-store, audit-chain, health, watchdog, zion-protection-core, zcca, chirombe-core, liturgy-attach, chirombe-autostart, then service worker.

`index.html` external scripts: `js/chirombe.js`, `js/user-script.js`, `js/seam-autoload.js`, plus large inline documents. `chirombe.js` then injects the survivable scripts.

`engine.html` (added after this audit) loads the survivable readers plus `js/engine/*`. It does not load the artifact.

## G. Dependency graph

`ChirombeBus` reads `ChirombeSystem`, `ChirombeCore`, `ChirombeHealth`.
`ChirombeWatchdog` writes `ChirombeSystem.health` from `ChirombeHealth.snapshot`.
`ChirombeCore` optionally mirrors into a legacy `CORE` global and calls `Chirombe.log`.
`ZCCA` calls `ChirombeCore.pray` if present and listens for `ZCCA_COMMAND`.
`chirombe-autostart.js` calls into ZCCA, guardian, pioneer, liturgy, and protection if those globals exist.
`engine/headless-runner.mjs` reads `data/family.json` and writes derived JSON. It is not a browser global.

## H. Broken references

- `js/command-bus.js` did not parse at audit time: `registerCommand` was missing its closing brace (`SyntaxError: Unexpected token ')'`). The bus could not register commands. Repaired in a separate one-brace change. See integration doc.
- `chirombe engine` line 1869 contains the text `Expected branch to point to` spliced into JavaScript. `node --check` fails. Embedded `<script src="./chirombe-memory.js">` (and knowledge, build, orchestrator, backend, defence, bloodline, legacy, intention, resonance-chamber) point at files that **do not exist**.
- `add 1` references `./script.js`, Firebase CDN scripts, and `https://yourdomain.com/XaZ888-activation.js`.
- `index.html` contains three documents (`<!DOCTYPE` at lines 1, 4017, 14735).

## I. Duplicate functionality

Family rosters are copied in `data/family.json`, `ChirombeCore` fallback, `ZCCA`, `workers/family-worker.js`, and `workers/prayer-worker.js`. Prayer and cover cycles also exist in core, ZCCA, and workers. Watch exists as `js/watchdog.js` and `workers/watch-worker.js`. `sw-cache.js` is a shim beside `sw.js`. The artifact repeats several kernel generations in one file. None of these copies were deleted.

## J. Missing functionality

Marked `MISSING_OPTIONAL_COMPONENT`, not invented as if they already ran:

`CHIROMBE_WORKERS` global, `CHIROMBE_EVOLUTION` global, `CHIROMBE_PATHWAYS`, `CHIROMBE_KNOWLEDGE` global, `CHIROMBE_BUILD` browser global, `CHIROMBE_ORCHESTRATOR` under that exact name, `CHIROMBE_BACKEND`, `CHIROMBE_BLOODLINE` global, `CHIROMBE_LEGACY` global, `CHIROMBE_INTENTION` under that exact name, `chirombe-chep16.js`, `chirombe-sentinel-entity.js`.

Closest live neighbours are listed in section D. They are not substitutes and were not renamed.

## K. Existing persistence

| store | key or file |
|---|---|
| localStorage | `CHIROMBE_CORE_V1`, `CHIROMBE_STATE_V2`, `CHIROMBE_MASTER_AUTOSTART`, `MWARINDIMWARI_COVENANT_V1` |
| canonical JSON | `data/family.json`, `data/nodes.json` |
| derived JSON | `runtime.json`, `health.json`, `audit-head.json`, `state.json` |
| audit | in-memory `ChirombeAudit` and Zion chain (Zion trims to 400) |
| indexedDB | detected, not used as the store |
| service worker | `sw.js` network-first cache |

## L. Existing security

`docs/SECURITY.md`: no secrets in the repo, command whitelist, do not eval JSON. Scan at audit found no private keys or API keys. Zion generates an in-session HMAC key and documents that a page key is not a server secret. `index.html` mentions the word secret inside scripture and a denylist, not a credential.

## M. GitHub Pages architecture

`.github/workflows/pages.yml` uploads the repository root on push to `main`. Public URL: https://tariromasawi.github.io/chirombe/

## N. Backend capability

No application server. `docs/ENDPOINTS.md` lists static files. The artifact's part 10 talks about a backend URL placeholder (`https://your-backend.example/api`) and says to keep it empty. Headless runner only rewrites derived JSON in CI.

## O. AI integration

No live model calls. ZCCA's "COMMAND AI" is a local command interpreter. Pioneer brain is local heuristics. There is no Grok client and no token.

## P. Bloodline / legacy

Canonical roster: `data/family.json` (House of Masawi). `ChirombeCore` keeps a fallback roster and merges `family.json`. `ZCCA` carries its own family array. `index.html` is the legacy surface. Descendants in `family.json` are an unnamed placeholder, not invented people.

Conflict, left untouched: Tarry is `spouse` in `data/family.json` and the core fallback, and `son` in `js/zcca.js` and `docs/DATA_MODEL.md`.

Superseded on 2026-09-27 by an explicit owner statement: Tarry is his son. The spouse label is kept as `previousGeneration`. Nobody was removed.


## Q. Intention / resonance

`MwarindiCovenant` is an additive symbolic reminder (`Mwari ndi Mwari. Zvapera.`). Liturgy scripts compose prayer text. `ChirombeResonance` is a user-gesture oscillator at 136.1 Hz and its own comment says it is not a curse-removal frequency. These stay symbolic or acoustic. The engine does not claim supernatural causation.

## R. Watchdog / defence

`ChirombeWatchdog.tick` every 15s updates health text. `ZionProtect` is HMAC audit plus node reinforcement. Guardian matrix and CM90 scripts are additional surfaces. Workers include cloak, decoy, threat. The engine must not disable these to make another module load.

## S. Build / evolution

`ChirombeCore.evolve` advances an in-browser cover counter. `workers/evolve-worker.js` posts strategy names. `engine/headless-runner.mjs` refreshes derived JSON. There is no sandbox deploy pipeline in the browser. CI workflows: test, engine, pages, health, watch, release, recovery-check.

## T. Recommended integration points

Connect through existing globals. Add `js/engine/` as a reader and journal. Surface it on `engine.html`. Append scripts on `app.html` and, for the legacy page, an ordered loader at the end of `chirombe.js`. Do not modify `index.html` bytes. Do not load `chirombe engine`.

## U. Potential conflicts

- Executing the artifact would throw and could double-define globals the live core already owns.
- Registering bus commands that already exist (`status`, `health`) would need overwrite. Do not.
- Autostart already calls ZCCA activate paths. An engine boot must not call `ZCCA.command`.
- Service worker cache name change is a version bump (`v2` to `v3`), not a wipe of family data.
- Lineage writes would destroy the Tarry conflict instead of reporting it.

## V. Recovery opportunities

- `command-bus.js` brace: recoverable and small. Done as an explicit repair.
- Artifact text before line 1869 may still contain an earlier kernel. Status: `ANALYSING`. Not extracted, because extraction would be a new file and must be a reviewed proposal.
- Git history remains the memory of previous generations. Do not force-push.

## W. Proposed next changes

See `ENGINE_INTEGRATION.md`. Phase J (optimisation) is not started. No proposal is applied automatically.
