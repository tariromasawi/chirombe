# MWARINDIMWARI Dream Covenant

Additive Chirombe layer. It does **not** replace `index.html`, `app.html`, workers already attached by `chirombe-bridge.js`, or existing bus commands (`status`, `health`, `family.list`, …).

## What this is
A visualisation and reminder of the 26 September 2026 dream-seal:

`DREAM-SEAL-ALL-PLAY-EFFECT-ACTIVATE-SEAM-END-LOCK-ACTIVATE-ZVAPERA`

Outer lock: the remembered dream.  
Inner lock: the seam on the white garment / jacket cuff.  
Together they are treated here as a **covenant of closure** — a promise to keep peace, not a weapon.

## Public page
https://tariromasawi.github.io/chirombe/mwarindimwari-seal.html

## Optional bus commands
Only present after `js/mwarindimwari-covenant.js` loads:

- `ChirombeBus.executeCommand("covenant.status")`
- `ChirombeBus.executeCommand("covenant.remind")`
- `ChirombeBus.executeCommand("covenant.seal")`

Existing commands are unchanged.

## Optional worker
`workers/covenant-worker.js` posts a reminder tick. It is **not** auto-started by `chirombe-bridge.js`, so current worker counts and feeds stay the same unless you attach it yourself.

## Artwork
Place the Holy Resonance plate at:

`assets/mwarindimwari-holy-resonance.jpg`

The page still runs if the file is missing.

## Honesty
This module is symbolic. It cannot lock other minds, silence medical symptoms, or replace prayer, church, or care. Workers may *read* the covenant line as a house reminder. They must not rewrite core output.
