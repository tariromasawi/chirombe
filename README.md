# Chirombe

Paste-ready matrix page. Existing ZionCore repos were not modified.

## Page
https://tariromasawi.github.io/chirombe/

If that 404s: repo Settings → Pages → Source = GitHub Actions.

## Where to paste your script
1. Open `js/user-script.js` and paste there (preferred for large scripts), or
2. Paste inside the marked block at the bottom of `index.html`.

Then tell me to tighten it.

## Layout
- `index.html` — command surface + node map
- `js/chirombe.js` — graph, health, local store
- `js/user-script.js` — **your** script slot
- `sw.js` + `sw-cache.js` — service workers
- `workers/` — discovery, watch, graph, pulse workers
- `.github/workflows/` — Pages + 6-hour watch tick
- `data/state.json` — scheduled backend snapshot
