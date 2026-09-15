# Claude Code Prompt — Photographer One-Page Site

Copy everything below into Claude Code as a single prompt.

---

Build a single-page photographer website with a simple admin panel. Keep the stack minimal and boring — this needs to run reliably on cheap shared hosting for years with zero maintenance.

## Tech stack
- Next.js (App Router), deployed on Vercel, code pushed to a GitHub repo for auto-deploy on push
- Supabase for: the database (Postgres), file storage (photos), and admin authentication (Supabase Auth, single admin user via email/password)
- Plain CSS (or Tailwind if it speeds things up) — no heavy UI library needed for a page this size
- Keep it to the minimum Next.js needed: a handful of pages/routes, no unnecessary abstraction

## Public page — single page, sections in this order
1. **Hero** — full-width photo, photographer name, one-line tagline
2. **About** — headshot/photo + bio text (editable from admin)
3. **Portfolio/Gallery** — grid of photos, click to enlarge (lightbox), grouped by category if useful (e.g. Weddings, Portraits, Events)
4. **Pricing** — 2-4 package cards (name, price, list of what's included), all editable from admin
5. **Contact form** — name, email, phone (optional), message, submit button. On submit: save the message to a Supabase table AND send an email notification to the photographer (use a simple email API like Resend — note in the README that an API key needs to be added)
6. **Social links** — icons linking to Instagram, Facebook, etc. (URLs editable from admin)
7. **Footer** — copyright, contact email

Design: clean, photo-forward, generous whitespace, mobile-responsive. Photos are the product — they should be large and load well (lazy-load images below the fold).

## Admin panel (`/admin`)
- Protected route using Supabase Auth (single admin user, email/password login, redirect to login if no session)
- **Photos**: upload new photos to Supabase Storage, delete photos, reorder (drag-and-drop or up/down buttons), assign to a gallery category, edit caption/description per photo
- **Pricing**: edit package name, price, and the list of included items for each package (stored in a Supabase table)
- **Text content**: edit the About bio, hero tagline, and any other section copy (stored in a Supabase table)
- **Social links**: edit URLs for each platform
- **Contact submissions**: simple list view of messages received through the form (read-only is fine)

## Structure
```
/app
  page.tsx              (public one-page site)
  /admin
    login/page.tsx
    dashboard/page.tsx
  /api
    contact/route.ts
    photos/route.ts
    pricing/route.ts
    content/route.ts
/lib
  supabaseClient.ts
/components
  Hero.tsx, About.tsx, Gallery.tsx, Pricing.tsx, ContactForm.tsx, SocialLinks.tsx
supabase/
  schema.sql              (tables: photos, pricing_packages, page_content, social_links, contact_submissions)
.env.local.example
README.md
```

## Requirements
- Sanitize all inputs, use Supabase's parameterized queries (never build raw SQL strings)
- Validate uploaded files are actual images (check MIME type, not just extension), and reasonably compress/resize before upload so the site stays fast
- Set a reasonable max upload size
- Use Supabase Row Level Security: public read access on photos/pricing/content/social links, write access restricted to the authenticated admin user
- Include a README covering: creating the Supabase project and tables (via `supabase/schema.sql`), setting the required environment variables, creating the admin user in Supabase Auth, pushing to GitHub, and connecting the repo to Vercel for auto-deploy

## Explicitly avoid
- No heavy state-management libraries or unnecessary dependencies — this is a small one-page site, keep it simple
- No user accounts beyond the single admin login
- No custom backend server — everything runs through Next.js API routes on Vercel and Supabase

Start by creating the Supabase schema, then scaffold the Next.js project and connect it to Supabase, then build the public page, then the admin panel, then wire up the contact form email. Finish with the GitHub repo setup and Vercel deployment instructions in the README.
