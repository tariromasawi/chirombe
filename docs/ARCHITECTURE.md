# Architecture
CHIROMBE-2.0. Existing index.html is preserved (legacy glued command centre).
app.html is the survivable static entry with ZCCA in page source.
Boot order on app.html: boot → command-bus → state → audit → health → watchdog → zcca → core → sw.
Canonical family registry: data/family.json.
Derived state: runtime.json, health.json, audit-head.json — rebuildable.
