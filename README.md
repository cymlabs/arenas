# ARENAS

ARENAS is a minimalist, futuristic Tinder-style battle arena built with Next.js 14, Supabase, Tailwind CSS, and Framer Motion. Upload visuals, battle them head-to-head, and climb the Elo leaderboard.

## Features
- Email-only Supabase OTP auth (session based)
- Arena explorer with creation modal
- Arena hub with Battle, Submit, Leaderboard entry points
- Battle view with instant voting and Elo updates (K=32)
- Supabase Storage uploads to the public `images` bucket
- Futuristic glassmorphism UI with motion
- Admin tuning panel for algorithm defaults

## Getting started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Environment variables**
   Copy `.env.example` to `.env.local` and fill in your Supabase project values.
   ```bash
   cp .env.example .env.local
   ```
3. **Run the dev server**
   ```bash
   npm run dev
   ```
4. **Production build**
   ```bash
   npm run build
   npm start
   ```

## Preview locally
To see ARENAS in action during development:

1. Start the dev server: `npm run dev` (after installing deps and setting env vars).
2. Open http://localhost:3000 in your browser.
3. Create or pick an arena on the home page, then navigate to **Battle**, **Submit**, and **Leaderboard** to exercise the flows.
4. Use the email OTP sign-in dialog (Supabase auth) when prompted; magic links must resolve against the `SITE_URL` you set in Supabase.

If you lack Supabase credentials locally, you can still explore static UI flows, but uploads, auth, and database actions will be disabled.

## Auth flow
- Authentication uses email-only magic links through Supabase. Users enter their email, receive a one-time link, and return to the app with a session cookie.
- Set `NEXT_PUBLIC_SITE_URL` to the base URL of your deployment (or `http://localhost:3000` for local dev) and add it to Supabase **Auth → URL configuration**.
- Add every allowed redirect origin (comma-separated) to `NEXT_PUBLIC_REDIRECT_ALLOWLIST` to prevent untrusted redirect targets when sending magic links.
- Magic links are generated client-side; the app picks the current origin when it is in the allowlist, otherwise it falls back to the first allowlisted URL.

## Supabase setup
- Create a bucket called `images` (public).
- Ensure the tables `arenas`, `submissions`, `battles`, `votes`, and `ratings` match the provided schema.
- Enable row level security and policies to allow authenticated users to insert arenas, submissions, votes, and to read public data.
- Email OTP magic links should redirect to your deployed domain (configure `SITE_URL`).
- Create an `admin_settings` table with columns `key (text, primary key)` and `value (jsonb)` to persist admin tuning sliders. Allow authenticated admins to upsert to this table.
- Suggested RLS policies (adjust roles as needed):
  - `arenas`: authenticated users can insert when `auth.uid() = created_by`; all can select.
  - `submissions`: authenticated insert when `auth.uid() = user_id`; all can select approved rows (`status = 'active'`).
  - `votes`: authenticated insert when `auth.uid() = voter_user_id` (unique constraint enforced in DB).
  - `admin_settings`: allow authenticated users (or a specific role) to select and upsert by key.

## Deployment (Vercel)
1. Create a Supabase project and configure buckets/tables above. Enable URL configuration for your production domain.
2. In Vercel, set env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_REDIRECT_ALLOWLIST`.
3. Optional: seed an arena (`insert into arenas(...)`) plus at least two submissions to test battles.
4. Deploy; the admin page will read/write algorithm settings from `admin_settings` and battles will respect your K-factor and pair limits.

## Deployment
Ready for Vercel: push the repo, add environment variables in Vercel, and deploy. Supabase URL and anon key must be present at build and runtime.

## Testing
- Lint: `npm run lint`
- E2E smoke: `npm run test:e2e` (requires Supabase env vars; uses Playwright). Run `npx playwright install` once locally.

## Notes
- Unique battle pairs per session rely on battle creation per request and database constraints on votes (`unique(battle_id, voter_user_id)`).
- Admin sliders persist to `admin_settings` and are respected by battle creation (min submissions, max pairs) and Elo updates (K factor).
