# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js App Router entry points (`page.tsx`, `dashboard/page.tsx`) and API routes (`/api/auth/*`).
- `src/components`: client components (OTP form) and associated styles.
- `src/lib`: Supabase helpers (browser/server clients) and `src/types` holds typed DB schema.
- `supabase/migrations` and `supabase/seed.sql`: SQL assets tracked by the Supabase CLI; `.env.example` and `.env.local` document required keys.
- `package.json`, `tsconfig.json`, `next.config.ts`, and lint configs control tooling; no dedicated `tests/` folder yet, so feature tests live alongside components if added.

## Build, Test, and Development Commands
- `npm run dev`: starts Next.js dev server (App Router) on `http://localhost:3000`.
- `npm run build`: performs a production compile and type check via Next.js.
- `npm run lint`: runs ESLint configured by `eslint.config.mjs`.
- `npm run typecheck`: executes `tsc --noEmit` for static typing validation.
- `npm run supabase:start` / `stop`: manage local Supabase containers once Docker is available.
- `npm run db:status`: inspects Supabase local status; `npm run db:reset` re-applies migrations + seed via CLI (requires `.env` values).

## Coding Style & Naming Conventions
- Source files use 2-space indentation, TypeScript with strict mode, and Next.js App Router conventions (`page.tsx`, `layout.tsx`).
- Component files live under `src/components/<feature>`, matching the React hook naming pattern (`OtpForm`, etc.).
- Styling uses CSS modules (`*.module.css`) scoped per component or route and leverages CSS custom properties defined in `globals.css`.
- Pre-commit formatting follows ESLint and TypeScript defaults; run `npm run lint`/`typecheck` before PRs.

## Testing Guidelines
- No automated test suite yet—add targeted unit or integration tests near the feature they cover in `src/` (e.g., `src/components/auth/otp-form.test.tsx`).
- Prefer descriptive test names that include the component and behavior (e.g., `OtpForm handles OTP verification`).
- Run `npm run test` once a suite exists; for now validate manually via `npm run dev` plus Supabase migrations/seed.

## Commit & Pull Request Guidelines
- Commit messages follow `<scope>: <short description>` (e.g., `supabase: add seed data`). Keep lines under 72 characters.
- Pull requests require a concise description of changes, linked issue/ticket if available, and whether Supabase migrations or env updates need release notes.
- Include screenshots or video links for UI changes when possible; mention any manual steps to seed Supabase or configure Vercel envs in the PR description.

## Configuration & Security Tips
- Keep `.env.local` out of Git; use `.env.example` as the template for `NEXT_PUBLIC_SUPABASE_*` and `SUPABASE_SERVICE_ROLE_KEY`.
- Regenerate service-role keys in the Supabase dashboard if leaked; update `.env.local` and Vercel secrets simultaneously.

