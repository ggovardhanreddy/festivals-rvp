# Media pipeline (compression & conversion)

Production-ready path for Admin / Gallery / Fun Fest / future uploads, designed around a hard platform fact:

> **Cloudflare Pages Functions / Workers cannot reliably run Sharp/libvips or system FFmpeg.**  
> Do not expect the edge to transcode a 1 GB video.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│ A. Shared rules — lib/media-pipeline/                           │
│    constants · validate (MIME/size/magic) · stage labels          │
└─────────────────────────────────────────────────────────────────┘
          │                    │                      │
          ▼                    ▼                      ▼
┌──────────────────┐  ┌────────────────────┐  ┌──────────────────────┐
│ B. Browser       │  │ C. Node / CI       │  │ D. Worker upload     │
│ client-optimize  │  │ node-optimize +    │  │ /api/media/upload    │
│ Canvas → WebP    │  │ npm run            │  │ validate · R2 put    │
│ ≤500KB, thumbs   │  │ media:optimize     │  │ optional thumb       │
│                  │  │ Sharp + FFmpeg     │  │ reject raw HEIC/MOV  │
└────────┬─────────┘  └─────────┬──────────┘  └──────────┬───────────┘
         │                      │                        │
         └──────────► POST /api/media/upload ◄───────────┘
                              │
                              ▼
                    R2 gallery/… + gallery/thumbs/…
                              │
                              ▼
                    POST /api/media/reindex → catalog/albums.json
```

| Layer | Role | Can convert HEIC? | Can transcode video? |
|---|---|---|---|
| Admin browser (`client-optimize`) | Pre-process stills before upload | Usually **no** (Safari maybe) | **No** (honest limit) |
| `npm run media:optimize` / GH Action | Full Sharp + FFmpeg batch | **Yes** (sips/ffmpeg/magick) | **Yes** (H.264/AAC ≤1080p) |
| Pages Function upload | Validate, store, reindex | **No** | **No** |
| `sync-cms` (Git CMS) | Existing album optimize into `public/` | Yes | Yes (when ffmpeg present) |

---

## Image rules (Node + client)

| Rule | Value |
|---|---|
| Accept | jpg/jpeg/png/webp/heic/heif/avif/bmp/tiff/gif · svg store/sanitize |
| Output | WebP preferred; PNG if transparency needed |
| Orientation | Corrected (Sharp `rotate()` / canvas redraw strips EXIF+GPS) |
| Max edge | **1920px** (full) · 1280 medium · 600 thumb |
| Target size | **≤ 500 KB** (quality loop) |
| Worker hard cap | 2 MB image upload |

**R2 layout (compatible with existing gallery):**

```text
gallery/{year}/{album}/[person/]{ts}-{name}.webp     ← full
gallery/thumbs/{year}/{album}/[person/]{ts}-{name}.webp  ← thumb
videos/{year}/{album}/… .mp4
funfest/{year}/{album}/…   (private — signed via /api/media/sign)
```

Node batch also writes `medium/` locally; Admin uploads full + thumb (enough for catalog `thumbKeyFor`).

**`hero.webp`:** never overwritten — API rejects protected hero keys.

---

## Video / audio (Node / CI only)

| Kind | Output |
|---|---|
| Video | MP4 H.264 + AAC, max **1080p**, ≤ **200 MB** (+ poster WebP) |
| Audio | MP3 **128 kbps** stereo |

Admin UI **rejects** raw MOV/AVI/MKV on gallery-like categories with a clear message to run:

```bash
npm run media:optimize -- --input ./inbox --out .tmp/media-optimized
```

Or GitHub → Actions → **Media Optimize** (`workflow_dispatch`) → download artifact → migrate/upload.

---

## How to use

### Admin (production images)

1. Sign in → Media → set **Year** + **Festival**.
2. Choose JPEG/PNG/WebP (or browser-decodable images).
3. Click **Optimize & upload to R2**.
4. Watch stages: Compressing → Converting → Generating Preview → Uploading to R2 → Updating Gallery → Completed.
5. Size line shows **original → compressed**.

HEIC from iPhone: export JPEG, or run `media:optimize` / local Import folder first.

### Local / CI batch

```bash
# Requires: Node + sharp (npm) + ffmpeg on PATH for video/audio
npm run media:optimize -- --input ~/Downloads/Photos --out .tmp/media-optimized

# Map into site CMS then R2:
#   .tmp/.../images → public/images (or content/<YEAR>/<album>/ + npm run sync)
#   .tmp/.../thumbs → public/thumbs
#   .tmp/.../videos → public/videos
npm run media:migrate:r2
```

### GitHub Action

Workflow: `.github/workflows/media-optimize.yml`  
Put sources in `inbox/` (or use the smoke fixture), run **Media Optimize**, download `media-optimized` artifact.

---

## Worker policy (`POST /api/media/upload`)

- Auth: admin cookie.
- Validates MIME/extension, size caps, light magic-byte sniff.
- Rejects HEIC/TIFF/MOV for gallery-like categories (`needs_node_convert` / `needs_ffmpeg`).
- Accepts `clientOptimized=1`, `originalBytes`, optional `thumb` File → `gallery/thumbs/…`.
- Fun Fest / documents remain private (HMAC sign + object stream).
- Does **not** re-encode bytes (no Sharp/FFmpeg at the edge).

---

## Module map

| Path | Runtime |
|---|---|
| `lib/media-pipeline/constants.ts` | Shared |
| `lib/media-pipeline/validate.ts` | Shared + Worker |
| `lib/media-pipeline/client-optimize.ts` | Browser |
| `lib/media-pipeline/node-optimize.ts` | Node/CI only |
| `scripts/media-optimize.ts` | CLI |
| `functions/api/media/[[route]].ts` | Pages Function |
| `components/AdminClient.tsx` | Admin UX stages |

---

## Honest limits

1. **Workers will never replace FFmpeg** for large video — use Node script or the Media Optimize Action.
2. **Browser HEIC** is unreliable; treat HEIC as a Node/CI input.
3. **Medium** derivatives are produced by Node; Admin ships full + thumb for catalog parity.
4. **SVG** is sanitized/stored, not rasterized by default.
5. Legacy doc `07-MEDIA_PIPELINE.md` described Git-CMS-only days; this file is the upload + optimize SSOT.

See also: [CONTENT_PIPELINE.md](./CONTENT_PIPELINE.md) · [CLOUDFLARE_R2.md](./CLOUDFLARE_R2.md) · [MEDIA_MANAGEMENT.md](./MEDIA_MANAGEMENT.md)
