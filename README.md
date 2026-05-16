# Adventure Planner

Your year-at-a-glance visual planner. Click any day to add an entry, drag to move, customize categories and colors, generate a shareable read-only link, and print to tabloid landscape.

Built with **Next.js + Supabase + Vercel**. Same stack as your other sites.

---

## Setup checklist

You'll need accounts on: GitHub, Vercel, Supabase, and Google Cloud Console (free, used for OAuth credentials).

### 1. Push this code to GitHub

```bash
cd adventure-planner
git init
git add .
git commit -m "Initial commit"
```

Create a new empty repo on GitHub (private is fine), then:

```bash
git remote add origin https://github.com/YOUR-USERNAME/adventure-planner.git
git branch -M main
git push -u origin main
```

### 2. Create the Supabase project

1. Go to https://supabase.com and create a new project. Save the database password somewhere safe.
2. Once it spins up, go to **SQL Editor** in the left sidebar.
3. Open `supabase/migrations/001_init.sql` from this repo, copy the entire contents, paste into a new query in the SQL Editor, and click **Run**. This creates the tables, indexes, and Row Level Security policies.
4. Go to **Project Settings → API**. Copy two values for later:
   - **Project URL** → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Set up Google OAuth

1. Go to https://console.cloud.google.com/. Create a new project (or pick an existing one).
2. Go to **APIs & Services → OAuth consent screen**. Choose **External**, fill in app name (e.g. "Adventure Planner"), your email, and save. You can leave most things at defaults.
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
4. Application type: **Web application**. Name it whatever.
5. **Authorized redirect URIs**: add this exact URL (replace `YOUR-PROJECT` with your Supabase project ref):
   ```
   https://YOUR-PROJECT.supabase.co/auth/v1/callback
   ```
   You can find your project ref in the Supabase URL — it's the part before `.supabase.co`.
6. Click **Create**. Copy the **Client ID** and **Client secret**.

### 4. Connect Google OAuth in Supabase

1. In Supabase, go to **Authentication → Providers**.
2. Find **Google**, toggle it on.
3. Paste the **Client ID** and **Client secret** from Google. Save.

### 5. Deploy to Vercel

1. Go to https://vercel.com and click **Add New → Project**.
2. Import your `adventure-planner` GitHub repo.
3. Vercel auto-detects Next.js — leave the defaults.
4. Expand **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | (from Supabase, step 2) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (from Supabase, step 2) |
   | `NEXT_PUBLIC_SITE_URL` | leave blank for now; you'll fill this in after first deploy |

5. Click **Deploy**. Wait ~1 minute.
6. Once deployed, copy your Vercel URL (something like `https://adventure-planner-xxxx.vercel.app`).
7. Go back to Vercel project **Settings → Environment Variables** and set `NEXT_PUBLIC_SITE_URL` to that URL.
8. **Settings → Deployments → Redeploy** to pick up the new env var.

### 6. Tell Supabase your site URL

1. Supabase → **Authentication → URL Configuration**.
2. **Site URL**: paste your Vercel URL (e.g. `https://adventure-planner-xxxx.vercel.app`).
3. **Redirect URLs** (add both, one per line):
   ```
   https://adventure-planner-xxxx.vercel.app/**
   http://localhost:3000/**
   ```

That's it. Visit your Vercel URL, click "Sign in with Google", and you should land on a blank planner for the current year.

---

## Running locally

```bash
npm install
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# (NEXT_PUBLIC_SITE_URL stays as http://localhost:3000)
npm run dev
```

Open http://localhost:3000.

---

## How it works

- **Year-scoped planners**: each user gets one planner per year. Use the ◄ ► arrows in the toolbar to switch years; an empty planner is auto-created on first visit. Default categories (Misogi, Kevin's Rule, Mini Adventures, Habits, Biz Trips, Daily Vitamins) are seeded each year.
- **Click any day** to add an entry. Multi-day entries span across cells. **Drag the leftmost pill** of a multi-day entry to move the whole thing.
- **Categories** button → rename, recolor, add, remove categories.
- **Share** button → generate a public read-only URL like `/share/{token}`. Anyone with the link can view but not edit. Disable anytime to invalidate.
- **Print** → tabloid landscape by default. Adjust `@page` size in `components/PlannerApp.tsx` (search for `@page`) if you print on a different paper size.
- All changes save to Supabase automatically. Text fields debounce ~600ms; entry add/edit/delete saves immediately.

---

## File structure

```
app/
  page.tsx                  Main planner (auth-gated)
  login/page.tsx            Google sign-in
  auth/callback/route.ts    OAuth callback
  share/[token]/page.tsx    Public read-only view
  api/
    planners/[id]/          Update title/owner; share token
    categories/             CRUD
    entries/                CRUD
components/
  PlannerApp.tsx            Main UI (grid, modals, share)
lib/
  supabase/                 Client + server Supabase helpers
  types.ts                  Shared types + defaults
middleware.ts               Auth gate
supabase/migrations/
  001_init.sql              Database schema + RLS
```

---

## Common gotchas

- **"redirect_uri_mismatch" on Google sign-in**: the redirect URI in Google Cloud Console must be exactly `https://YOUR-PROJECT.supabase.co/auth/v1/callback`, not your Vercel URL.
- **Sign-in works but lands on /login again**: check that Supabase Site URL and Redirect URLs include your Vercel domain. Also confirm `NEXT_PUBLIC_SITE_URL` is set in Vercel and you've redeployed.
- **Empty planner doesn't appear / database errors**: re-run the SQL migration. Check that RLS is enabled in Supabase → Database → Tables (each table should show "RLS enabled").
- **Share link shows "Not found"**: ensure the migration ran fully — the `planners_public_read_by_token` policy must exist.
