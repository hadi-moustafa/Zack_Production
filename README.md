# Zack Photography — one-page site

A single-page photographer website with a small admin panel to manage photos, pricing,
page text, social links, and contact messages.

**Stack:** Next.js (App Router) on Vercel, Supabase (Postgres + Storage + Auth), Resend for
contact-form email notifications, Tailwind CSS.

## 1. Create the Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the contents of [`supabase/schema.sql`](./supabase/schema.sql).
   This creates all tables, seeds default content, sets up Row Level Security policies
   (public read, admin-only write), and creates a public `photos` storage bucket.
3. In **Authentication → Users**, create the single admin user (email + password) that will
   log in at `/admin`. This site supports exactly one admin account — no public sign-up.

## 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API → Publishable (anon) key |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys. Contact-form emails are skipped (message is still saved) if this is unset. |
| `CONTACT_NOTIFICATION_EMAIL` | The photographer's email address that should receive contact-form notifications. |

These same variables need to be added in **Vercel → Project Settings → Environment
Variables** for the deployed site.

## 3. Run locally

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the public site and
[http://localhost:3000/admin/login](http://localhost:3000/admin/login) to sign in with the
admin account created in step 1.

## 4. Push to GitHub

```bash
git remote add origin <your-repo-url>   # already set if you cloned this repo
git push -u origin main
git push -u origin development
```

## 5. Deploy on Vercel

1. Import the GitHub repository into [Vercel](https://vercel.com/new).
2. Set the **Production Branch** to `main` — every push to `main` auto-deploys to
   production. Pushes to `development` (and other branches) get their own Vercel preview
   deployments, so you can test admin changes before merging to `main`.
3. Add the environment variables from step 2 in the Vercel project settings.
4. Deploy. Vercel will build and host the site on every push automatically from then on.

## Project structure

```
/app
  page.tsx              public one-page site
  /admin
    login/page.tsx       admin sign-in
    dashboard/page.tsx    admin dashboard (photos, pricing, text, social, messages)
  /api
    contact/route.ts      save + email contact form submissions
    photos/route.ts       upload/delete/reorder/edit photos (admin only)
    pricing/route.ts       CRUD for pricing packages (admin only)
    content/route.ts       update page copy (admin only)
    social/route.ts        update social links (admin only)
/components              public-site sections
/components/admin        admin dashboard widgets
/lib
  supabaseClient.ts       browser Supabase client
  supabaseServer.ts       server Supabase client (cookie-based session)
  supabasePublic.ts       sessionless client for public reads
  requireAdmin.ts         auth check used by admin API routes
/supabase/schema.sql      database schema, RLS policies, storage bucket
proxy.ts                  protects /admin/* routes, redirects to /admin/login if signed out
```

## Notes

- Uploaded photos are validated by inspecting the file itself (not just its extension/MIME
  header), converted to WebP, and resized to a max of 2400px on the longest edge before
  being stored — keeps the gallery fast without a separate image CDN.
- All writes (photos, pricing, page text, social links) are protected by both an API-level
  auth check and Postgres Row Level Security, so the data is safe even if a request bypasses
  the app.
- No user accounts beyond the single admin login: `contact_submissions` accepts public
  inserts only; every other write requires an authenticated session.
