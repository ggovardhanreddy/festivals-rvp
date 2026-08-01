Optional ZIP drop folder (Google Takeout, etc.).

For normal local photos, do NOT use ZIP files.
Prefer:

  npm run import:folder -- --dir "~/Downloads"

or use the /admin "Local photos import" panel while npm run dev is running.

Import never publishes. After review:

  npm run publish -- --confirm
