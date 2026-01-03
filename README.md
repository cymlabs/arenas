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

## Supabase setup
- Create a bucket called `images` (public).
- Ensure the tables `arenas`, `submissions`, `battles`, `votes`, and `ratings` match the provided schema.
- Enable row level security and policies to allow authenticated users to insert arenas, submissions, votes, and to read public data.
- Email OTP magic links should redirect to your deployed domain (configure `SITE_URL`).

## Deployment
Ready for Vercel: push the repo, add environment variables in Vercel, and deploy. Supabase URL and anon key must be present at build and runtime.

## Notes
- Unique battle pairs per session rely on battle creation per request and database constraints on votes (`unique(battle_id, voter_user_id)`).
- The admin sliders currently store values locally; wire them to a configuration table or Supabase KV for persistence.
