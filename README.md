# CHIROMBE

Survivable House command system.

## Public surface
- Legacy live page: https://tariromasawi.github.io/chirombe/
- Survivable core (static ZCCA in source): https://tariromasawi.github.io/chirombe/app.html
- Command page: https://tariromasawi.github.io/chirombe/zcca.html
- Source: https://github.com/tariromasawi/chirombe

## Principle
The repository is the reconstruction blueprint.
GitHub Actions is optional automation. If schedules stop after 60 days of inactivity, Pages can still serve the last deploy and the browser core still runs.

Automation states: FRESH / AGING / STALE / CRITICAL_STALE / UNKNOWN.
The UI must not say “24/7 guaranteed.”

## Layers
1. Git source of truth
2. GitHub Pages static app
3. Browser runtime (JS, workers, one service worker)
4. Headless engine (`engine/headless-runner.mjs`)
5. Versioned JSON state
6. Audit / schema
7. Recovery scripts
8. Releases/tags (create when you freeze a version)
9. Optional future scheduler adapter (not required now)

## Recover from a clean checkout
```
git clone https://github.com/tariromasawi/chirombe
cd chirombe
node scripts/bootstrap.mjs
```

## Commands
`window.ChirombeBus.executeCommand("status")`
`window.ZCCA.command("activate system")`

## Docs
See `docs/`.
