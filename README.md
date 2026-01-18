This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

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
>>>>>>> 3f79c0b597c8876d28da63395d5deb061f6818f9
