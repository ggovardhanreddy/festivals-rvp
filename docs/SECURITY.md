# Security

## Secrets (never commit)

Use Cloudflare Pages secrets / GitHub secrets / local `.env.local` only. Template: [`.env.example`](../.env.example).

Critical:

- `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, `SUPER_ADMIN_USERNAME`
- `MEMBER_SESSION_SECRET`
- `MEDIA_SIGNING_SECRET`
- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (CI)
- Optional R2 S3 API keys for migration scripts

`member-auth.json` stores **hashes only**, not plaintext passwords.

## Session cookies

| Cookie | Privilege | Notes |
|---|---|---|
| `rvp_admin` | Full community write + media upload | SameSite=Strict, 24h |
| `rvp_member` | Fun Fest + sign private media | SameSite=Lax, 7d |

All verified with HMAC-SHA256 over base64url payload. Expired `exp` rejected.

## Password hashing

PBKDF2-SHA256, **100,000** iterations, random salt — Workers-safe. Generate admin hashes with `npm run admin-hash`.

## Private media

Keys under `funfest/`, `fun-trips/`, `documents/`, or `/private/`:

- Sign requires admin **or** member session
- Object stream requires valid `exp` + `sig` query params (15-minute sign TTL)

Public objects may use `R2_PUBLIC_BASE` direct URLs.

## CORS

API handlers echo request origin with `access-control-allow-credentials: true` for same-site cookie use. Do not widen casually.

## Content privacy

Site settings flags (seed + R2):

- `allowPublicMediaDownload` (default false)
- `hideDirectoryContactsByDefault` (default true)
- `requireConsentForPersonalData` (default true)
- `maintenanceMode`

## Known soft spots (honest)

- Dev fallback session secrets exist in Functions code for local/missing env — **must set real secrets in production**
- Client role matrix includes aspirational capabilities; enforce trust at the API cookie checks
- Static export means no Next middleware auth — edge Functions + cookie checks are the gate
- Analytics POST is unauthenticated by design (best-effort hit log)

## Related

[AUTHENTICATION.md](./AUTHENTICATION.md) · [CLOUDFLARE_R2.md](./CLOUDFLARE_R2.md) · [API_REFERENCE.md](./API_REFERENCE.md)
