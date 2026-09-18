# ClientFlow — Run Doc (Preview)

Stack: Next.js 16 (App Router, Turbopack) + Supabase. Windows host, commands run in Git Bash.

## 1. Reproduce uncommitted artifacts

- `node_modules`: install with the project's package manager (no lockfile in repo → npm):
  `npm install`
- `.env.local`: this repo's `.env.local` is committed in the main checkout
  (`D:\Projects\clientflow`). For a *fresh worktree*, copy it from the main
  checkout to the worktree root:
  `cp /d/Projects/clientflow/.env.local .env.local`
  It only contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  (no secret values recorded here). `.env.example` documents the shape.

## 2. Run the server

- Default port **3000** (checked free before starting). Command:
  `npm run dev`
- Detached (PowerShell, stdout/stderr to separate files):
  ```
  powershell -NoProfile -Command "(Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -RedirectStandardOutput '<log>' -RedirectStandardError '<log>.err' -WindowStyle Hidden -PassThru).Id"
  ```
- Confirm alive: `powershell -NoProfile -Command "Get-Process -Id <pid>"`, then wait for `http://localhost:3000` to answer before registering the preview.
