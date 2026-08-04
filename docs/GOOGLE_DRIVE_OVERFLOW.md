# Free Google Drive overflow (when R2 ≈ 90% full)

Cloudflare R2 free tier is about **10 GB** storage. This project tracks usage and, at **≥ 90%** of a soft limit (default **9 GiB**), routes **public** admin uploads to your **personal Google Drive** (15 GB free) instead of buying more R2.

Private Fun Fest / documents **never** go to Drive (no public links).

## What you need (all free)

1. A Google account with Drive space  
2. A free Google Cloud project with **Google Drive API** enabled  
3. OAuth Desktop client ID + secret  
4. A one-time refresh token  
5. Optional: a Drive folder ID for `reddivaripalli-media`

## Secrets (Cloudflare Pages → festivals-rvp → Settings → Variables)

| Secret | Required |
|--------|----------|
| `GOOGLE_DRIVE_CLIENT_ID` | yes |
| `GOOGLE_DRIVE_CLIENT_SECRET` | yes |
| `GOOGLE_DRIVE_REFRESH_TOKEN` | yes |
| `GOOGLE_DRIVE_FOLDER_ID` | recommended |
| `R2_SOFT_LIMIT_BYTES` | optional (default `9663676416` = 9 GiB) |

Also keep existing `RATE_LIMIT` KV (usage counter) and `MEDIA` R2 bindings.

## One-time refresh token (local)

```bash
# 1) Put client id/secret in env, then open the printed URL, approve, paste code:
export GOOGLE_DRIVE_CLIENT_ID=...
export GOOGLE_DRIVE_CLIENT_SECRET=...

node --input-type=module <<'JS'
import http from 'node:http';
import { URL } from 'node:url';
const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const redirect = 'http://127.0.0.1:53682/oauth2callback';
const scope = encodeURIComponent('https://www.googleapis.com/auth/drive.file');
const authUrl =
  `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}` +
  `&redirect_uri=${encodeURIComponent(redirect)}&response_type=code` +
  `&scope=${scope}&access_type=offline&prompt=consent`;
console.log('Open:\n', authUrl);
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, redirect);
  const code = u.searchParams.get('code');
  res.end('OK — you can close this tab.');
  server.close();
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirect,
      grant_type: 'authorization_code',
    }),
  });
  const json = await tokenRes.json();
  console.log('\nRefresh token:\n', json.refresh_token);
  process.exit(0);
});
server.listen(53682);
JS
```

Put the printed refresh token into Pages secrets. Add your Google account as a **test user** on the OAuth consent screen while the app is in Testing.

## Behaviour

- Admin `POST /api/media/upload`  
  - R2 under soft limit → store bytes in R2 (as today)  
  - R2 ≥ 90% **and** Drive secrets set → upload bytes to Drive, store a tiny JSON pointer in R2, return Drive `publicUrl`  
- `GET /api/media/object?key=` redirects pointer keys to Drive  
- `GET /api/media/usage` (admin) — bytes / limit / overflow flag  
- `GET /api/media/usage?recount=1` — full bucket recount into KV  

## Cost rule

No paid Google Workspace / Cloudflare add-ons required. If Drive also fills up, free up space or prune old media — do not enable paid tiers for this flow.
