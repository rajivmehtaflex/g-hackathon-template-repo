# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: App Router pages and route handlers. The main landing page is `src/app/page.tsx`; `src/app/dashboard/page.tsx` now supports both authenticated and anonymous demo mode; auth endpoints live under `src/app/api/auth/*`.
- `src/components`: client-side UI such as the OTP form and its CSS module.
- `src/lib/supabase`: browser and server Supabase helpers. The server helper is async and must be awaited in server components and route handlers.
- `src/types/database.ts`: typed database contract used by Supabase clients.
- `supabase/migrations` and `supabase/seed.sql`: schema and demo data; `start_server.sh` provides a one-command local + Cloudflare preview flow.

## Build, Test, and Development Commands
- `npm run dev`: starts Next.js dev server (App Router) on `http://localhost:3000`.
- `npm run build`: performs a production compile and type check via Next.js.
- `npm run lint`: runs ESLint configured by `eslint.config.mjs`.
- `npm run typecheck`: executes `tsc --noEmit` for static typing validation.
- `npm run supabase:start` / `stop`: manage local Supabase containers once Docker is available.
- `npm run db:status`: inspects Supabase local status; `npm run db:reset` re-applies migrations + seed via CLI (requires `.env` values).
- `./start_server.sh`: ensures `cloudflared` is installed, starts the app on port `3000`, and prints a temporary public `trycloudflare.com` URL.

## Coding Style & Naming Conventions
- Source files use 2-space indentation, TypeScript with strict mode, and Next.js App Router conventions (`page.tsx`, `layout.tsx`).
- Component files live under `src/components/<feature>`, matching the React hook naming pattern (`OtpForm`, etc.).
- Styling uses CSS modules (`*.module.css`) scoped per component or route and leverages CSS custom properties defined in `globals.css`.
- Route-local styles should follow the actual file on disk (`page.module.css` beside the route file); keep imports aligned with filenames.
- Server-side Supabase access must use `await createServerSupabaseClient()`; do not treat the helper as synchronous.
- Public demo reads in the dashboard are intentionally separated from authenticated reads; preserve the distinction when changing dashboard queries or access behavior.
- Pre-commit formatting follows ESLint and TypeScript defaults; run `npm run lint`/`typecheck` before PRs.

## Testing Guidelines
- No automated test suite yet—add targeted unit or integration tests near the feature they cover in `src/` (e.g., `src/components/auth/otp-form.test.tsx`).
- Prefer descriptive test names that include the component and behavior (e.g., `OtpForm handles OTP verification`).
- Run `npm run test` once a suite exists; for now validate manually with `npm run dev`, anonymous `/dashboard` access, and signed-in Supabase-backed auth/data flows.

## Commit & Pull Request Guidelines
- Commit messages follow `<scope>: <short description>` (e.g., `supabase: add seed data`). Keep lines under 72 characters.
- Pull requests require a concise description of changes, linked issue/ticket if available, and whether Supabase migrations or env updates need release notes.
- Include screenshots or video links for UI changes when possible; mention any manual steps to seed Supabase, run `start_server.sh`, or configure Vercel envs in the PR description.

## Configuration & Security Tips
- Keep `.env.local` out of Git; use `.env.example` as the template for `NEXT_PUBLIC_SUPABASE_*` and `SUPABASE_SERVICE_ROLE_KEY`.
- Regenerate service-role keys in the Supabase dashboard if leaked; update `.env.local` and Vercel secrets simultaneously.
- Cloudflare quick tunnels are temporary and public by default; use them for demos, not as a production deployment path.
