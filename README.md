# Festivals RVP / RVP Memories

A premium private memory book for **Govardhan Reddy**.

- **Repo:** https://github.com/ggovardhanreddy/festivals-rvp  
- **Live:** https://ggovardhanreddy.github.io/festivals-rvp/

## Sections

- Home
- Timeline
- Festivals (**Sankranthi** and **Vinayaka Chavithi** only)
- Birthdays
- Search
- About

No trips, family, documents, videos, or other festival categories.

## Local development

```bash
npm install
npm run admin-hash "your-password"   # paste into .env.local
npm run sample-data
npm run generate
npm run dev
```

## Import local photos (no ZIP required)

```bash
npm run import:folder -- --dir "~/Downloads/Sankranthi-2026" --category festivals --album sankranthi
npm run import:folder -- --dir "~/Downloads/Birthday" --category birthdays
```

Import never publishes. After review:

```bash
npm run publish -- --confirm
```

## Design

Premium glass UI, Playfair Display + Inter + Poppins, light/dark mode, Framer Motion animations with `prefers-reduced-motion` support, and static export for free GitHub / Cloudflare Pages hosting.
