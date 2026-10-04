# Zack Production — working rules

Public site for zackproduction.com (canonical: https://www.zackproduction.com). Next.js App
Router + Supabase. Single-page site plus /privacy, /thank-you and a custom 404.

These standards are mandatory for every change.

## Single source of truth
- Static site constants (domain, brand name, location, response-time promise, credits) live in
  `lib/site.ts`. Admin-editable details (phone, WhatsApp, email, social links, page copy) live in
  Supabase and are read through `getSiteData()` in `lib/siteData.ts`. Never hard-code either
  anywhere else.
- Organization structured data is built in one place: `lib/structuredData.ts`.

## Mobile-first
- Design for small phones (320px) first, then scale up. Test every change at phone width
  before desktop.
- Touch targets ≥ 44×44px; body text ≥ 16px.
- No horizontal scrolling at 320px. Nothing may work only on hover.
- Heavy visual effects (film grain, vignette, Ken Burns) only on
  `(min-width: 1024px) and (pointer: fine)`.

## Brand
- The logo appears on every page through `components/BrandLogo.tsx`.
- Dark theme only. Use the palette tokens in `app/globals.css`; small text never uses a
  low-contrast accent.
- Fonts (fixed set): Cormorant Garamond = headings and italic accents, Instrument Sans =
  body, DM Mono = small uppercase labels, Limelight = the hero's cinematic closing line only.
- Social profiles are linked in the nav/footer and listed in the structured data (`sameAs`).

## Every page needs
- A unique title and meta description, a canonical, and exactly one unique `<h1>`.
- Content that is server-rendered (visible in view-source).
- Breadcrumbs with matching BreadcrumbList structured data (all pages except home).
- An Open Graph image.
- An entry in `app/sitemap.ts` (unless noindex) and in `app/llms.txt/route.ts`.
- Descriptive internal links to and from related pages.

## Site-wide
- sitemap, robots.txt, llms.txt, custom 404, privacy policy, noindex thank-you page.
- Custom icons only (no framework or hosting branding); `poweredByHeader: false`.
- Analytics only via `NEXT_PUBLIC_GA_MEASUREMENT_ID`; the privacy policy lists every tracker
  and third-party processor.
- The contact form hands off to WhatsApp, saves the lead, then redirects to /thank-you.

## Conversion
- A sticky mobile CTA and the response-time promise ("within 24 hours"). The hero's only
  button is "View my work": the owner asked (2026-10-02) for no "Book a shoot" button in the
  hero or the nav, so don't add one back there.

## Content integrity
- No placeholders, ever. Reviews, testimonials and photos must be real, and their components
  render nothing while the data is empty.
- Every image has meaningful alt text, or `alt=""` + `aria-hidden` if decorative.

## Performance and hygiene
- Zero console errors/warnings and zero build warnings. No production source maps.
- Dynamically import heavy libraries; check bundle sizes after each build.
- `npm run lint` and `npm run build` must pass before any commit. Commit and push to `main`.
