# FAQ

### What is the live URL?

[https://www.reddivaripalli.com](https://www.reddivaripalli.com) (Cloudflare Pages project `festivals-rvp`).

### How do I add festival photos?

Put them in `content/<YEAR>/<festival-bucket>/`, commit to `main`, and ensure R2 migration has run for production media.

### How does Fun Fest login work?

Username is a case-sensitive name derived from the members roster; initial password equals the username. See [MEMBER_GUIDE.md](./MEMBER_GUIDE.md).

### Who is Super Admin?

The operator configured via `SUPER_ADMIN_USERNAME` + `ADMIN_PASSWORD_HASH`. Dashboard at `/admin/`.

### Is there a database?

No SQL DB. Git JSON + Cloudflare R2 JSON/objects. See [DATABASE.md](./DATABASE.md).

### Why is media not in the Pages deploy?

Cloudflare’s per-file size limit and performance — media is on R2; deploys strip local media when the public R2 URL is set.

### Can members edit the public gallery?

No. Members access Fun Fest and can submit some community items for approval. Public album CMS is Git + Super Admin tooling.

### Were blood donors removed?

Yes, in **1.2.0**. Old `/blood-donors` URLs redirect home.

### How do I deploy?

Push to `main` (Actions) or run `npm run deploy:cf` locally with Wrangler credentials. See [DEPLOYMENT.md](./DEPLOYMENT.md).

### Where is documentation?

Start at [docs/README.md](./README.md).
