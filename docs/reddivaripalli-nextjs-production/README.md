# Reddivaripalli — Production Next.js Website

Independent Next.js 15 + React 19 + TypeScript website with Supabase authentication, PostgreSQL content storage, RLS policies, and media storage.

## What is included
- Public homepage and separate pages for village, heritage, temples, festivals, people, development, gallery, news and contact.
- Content detail pages for each category.
- Admin login and protected admin dashboard.
- Create, edit, publish/unpublish and delete content.
- Media upload to Supabase Storage.
- Database schema, Row Level Security policies and admin promotion SQL.
- Metadata, Open Graph basics, robots and sitemap.
- Responsive layouts for desktop and mobile.

## Prerequisites
- Node.js 20.9+ (recommended current LTS)
- npm
- A Supabase project
- Access to the current domain's DNS and hosting control panel

## 1. Install locally
```bash
npm install
cp .env.example .env.local
```
Fill `.env.local` with the Supabase project URL and publishable/anon key. Do not put the service-role key in a `NEXT_PUBLIC_` variable. The current implementation does not require the service-role key at runtime.

```bash
npm run dev
```
Open http://localhost:3000.

## 2. Configure Supabase
1. Create a Supabase project in the region appropriate for your audience.
2. In SQL Editor, run `supabase/migrations/001_initial_schema.sql`.
3. Optionally run `supabase/migrations/002_seed_content.sql`.
4. In Authentication -> Providers, enable Email/password.
5. In Authentication -> URL Configuration, add your production URL and local development URL to the allowed redirect URLs.
6. Create the first admin identity using Supabase Authentication -> Users -> Add user. Use a strong unique password.
7. Run `supabase/admin-promote.sql` after replacing `YOUR_ADMIN_EMAIL` with that exact email.
8. Sign in at `/admin/login`.

New users receive the `viewer` role by default. Do not enable public self-registration unless there is a clear operational reason. Admin/editor accounts must be granted by an administrator.

## 3. Environment variables
Copy `.env.example` to `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`

`SUPABASE_SERVICE_ROLE_KEY` is shown as an optional secret for future server-only maintenance tasks. Never expose it to browser code, source control or client-side environment variables. Keep `.env.local` private.

## 4. Production build
```bash
npm run build
npm run start
```
Test all public routes, admin login, draft visibility, publishing, media upload, mobile navigation, and 404 handling before changing DNS.

## 5. Hosting and existing domain migration
This app requires a Node.js hosting environment. A static-only shared hosting plan that only serves PHP/HTML cannot run a Next.js server application.

Recommended low-risk migration:
1. Keep the existing website and domain live.
2. Check the current hosting plan for Node.js application support, supported Node version, process manager, environment variables, and deployment method.
3. If supported, deploy this project to a temporary subdomain such as `preview.reddivaripalli.com` first. Do not overwrite the existing website directory.
4. Add the Supabase environment variables in the hosting panel.
5. Build and start the app using `npm run build` and `npm run start` (or the host's Next.js deployment integration).
6. Test the preview and have village representatives verify all historical and cultural content.
7. Back up the old website files, database, DNS records and any existing email configuration.
8. Only after approval, point the root/www domain to the new deployment using the hosting provider's documented DNS/proxy instructions.
9. Configure HTTPS, canonical redirect (www vs non-www), and verify sitemap/robots.
10. Keep the previous website backup until the new website has been stable.

### Hostinger note
If the current hosting is Hostinger, confirm the exact plan first. Hostinger plans and Next.js support vary. Use its Node.js app deployment feature only if available on your plan. If the current plan is shared hosting without Node.js support, keep the domain registered and DNS managed at Hostinger, but deploy the Next.js app to a Node-compatible host and point the domain to it. This does not require transferring the domain.

Do not change nameservers or DNS records until the new app is deployed and verified. Changing DNS can affect website and email service.

The current live site contains more than a simple brochure: village map/storytelling sections, temple descriptions, a community directory, events, village stories, development updates, gallery albums, and policy pages. This project provides replacement content categories, but it does **not** automatically scrape or import the live site's content or media. Before cutover, export/copy approved material into the CMS, map each item to its category, and have the community verify it. Do not assume that all current-site sections or data have been migrated just because the new routes exist.


The design uses remote Unsplash photographs only as visual placeholders. They are not photographs of Reddivaripalli. Replace them with photographs you own or have permission to publish.
- Upload approved images in Admin -> Media library.
- Copy the returned public URL into the relevant content record's Cover image URL field.
- Add captions, approximate dates, location and photographer/permission notes to the article body or your editorial records.
- Verify temple names, dates, historical claims, people profiles and development status with community representatives before publication.
- Do not publish personal phone numbers, home addresses or profiles without explicit consent.
- Keep donation and financial reporting disabled until a responsible committee and verification process are established.

The current Telugu fields are stored in the database and admin editor. Public-facing bilingual rendering and language switcher are not yet wired across every page; complete and proofread translations before presenting the site as fully bilingual.

## 7. Important production hardening before launch
- Add CAPTCHA/rate limiting to any public submission form if one is added.
- Restrict admin creation to owner-controlled invitations; do not expose service role keys.
- Configure Supabase backups and review retention/access policies.
- Add a privacy notice, terms, content takedown contact and cookie/analytics notice if analytics are enabled.
- Add image transformation/CDN and video size limits appropriate to the chosen host.
- Configure error monitoring and uptime checks.
- Run dependency audits and update packages regularly.
- Test role boundaries with a viewer, editor and admin account.

## 8. Current limitations / next implementation phase
This is a deployable foundation, not a fully populated or independently audited production service. It includes a basic CMS and storage uploader. It does not yet include:
- A visual WYSIWYG editor, image cropper or bulk media manager.
- A community member directory with consent workflows.
- A public event calendar with RSVP.
- Search indexing across article body text.
- Automated translation.
- Analytics dashboard or donation/payment collection.
- A full audit log and multi-factor authentication enforcement.

These should be added only after the community agrees on ownership, moderation and privacy rules.
