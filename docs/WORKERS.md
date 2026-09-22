# Workers
One service worker: sw.js.
sw-cache.js is a compatibility shim.
Page workers under workers/ are task-specific and optional.
ZCCA uses a pooled blob Worker (cap 64) — allocated vs active vs queued must not be confused with 32 permanent threads per person.
