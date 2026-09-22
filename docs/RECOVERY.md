# Recovery
1. Clone the repo.
2. `node scripts/bootstrap.mjs`
3. Serve the folder or enable Pages.
4. Open app.html.
5. If SW is stale: Application → unregister → hard refresh, or postMessage FORCE_REFRESH.
6. Last known-good site is the last successful Pages deploy, independent of cron.
