# Deployment Guidelines

## Pre-deploy checklist
- Link this repo to your Supabase project (`npx supabase link --project-ref <ref>`). Confirm `.env.local` mirrors the required keys from `.env.example`.
- Ensure migrations are applied and sample data seeded locally: `npm run db:reset` (Docker required).
- Update `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in your production env and Vercel project secrets.

## Local workflow
- Copy `.env.example` to `.env.local` and fill the Supabase URL/keys.
- Start Supabase containers when developing: `npm run supabase:start` and stop them with `npm run supabase:stop` after work.
- Run `npm run dev` to launch the Next.js server locally, then open `http://localhost:3000` to view the current landing page served from `src/app/page.tsx`.
- If you only want to preview the homepage, Supabase containers are not required; they are only needed for auth, migrations, and local database work.
- When the server starts, Next.js prints the active local URL and any alternate port if `3000` is busy.
- Use `supabase studio` (http://localhost:54322) or `npx supabase db dump --linked` for schema inspection while iterating.

## One-command public preview
- Make the launcher executable once: `chmod +x ./start_server.sh`
- Run `./start_server.sh` from the repo root.
- The script checks for `cloudflared`, installs it if needed, starts Next.js on port `3000`, creates an anonymous quick tunnel, and prints a public `trycloudflare.com` URL.
- Keep the script running while sharing the page; press `Ctrl+C` to stop both the local server and the tunnel.

## Supabase production prep
- Keep `supabase/migrations/*.sql` and `supabase/seed.sql` in sync; run `npx supabase db push` after editing SQL assets.
- Use `npx supabase gen types typescript --local > src/types/database.ts` when schema changes to keep client helpers typed.
- Rotate `service_role` or anon keys from the Supabase dashboard if migrating environments, and update `.env.example`/`.env.local` accordingly.

## Vercel deployment
- Import the repository through the Vercel dashboard; it auto-detects Next.js (App Router).
- Configure these Environment Variables under the project settings:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (only in preview/production if backend tasks need it; keep secret)
- Point the build command to `npm run build` and the output directory remains the default `.next`.
- Deploy and monitor logs via Vercel; rerun `npm run lint`/`typecheck` locally before creating a deployment pull request.

## Post-deploy verification
- Visit the deployed site and confirm the OTP auth flow works (email link should arrive via Supabase).
- Check `/dashboard` to ensure seeded `projects` and `project_updates` render without errors.
- If there are Supabase connection issues, confirm the `NEXT_PUBLIC_SUPABASE_*` values in Vercel match the linked project.

## Optional steps
- For repeatable builds, document your Supabase project ref and API key rotation schedule in this README or a companion note.
- Keep `.env.local` out of version control; commit only `.env.example`.
