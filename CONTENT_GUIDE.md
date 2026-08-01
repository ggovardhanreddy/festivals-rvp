# Content Guide

RVP Youth publishes memories for **Kondreddigaripalli (Reddivaripalli)** using folders in GitHub.

## Folder layout

```text
content/
  2024/
    sankranthi/
    vinayaka-chavithi/
    rvp-birthdays/
    fun-trips/
  2025/
    sankranthi/
    ...
```

Create a year folder (`YYYY`) if it does not exist, then drop media into the correct album.

## Supported media

- **Images:** jpg, jpeg, png, webp, heic/heif (as configured), gif
- **Video:** mp4, mov, webm, m4v (pipeline-dependent)
- **Audio:** mp3, m4a, wav, aac, ogg
- **Documents:** pdf and other mapped document types

See `lib/media-formats.ts` and [CONTENT.md](./CONTENT.md) for the authoritative extension list.

## Optional album override

Create `album.json` inside an album folder to set title, description, cover, publish flag, or per-media extras.

## Publishing

1. Upload/copy files into the folder
2. Commit
3. Push to `main`
4. Wait for Actions → live site updates

Years, albums, search, and timeline regenerate automatically.

## Tips for beautiful albums

- Prefer well-lit, sharp photos for covers (or mark favorites)
- Avoid duplicate filenames in the same album
- Use clear names (`sankranthi-rangoli-01.jpg`)
- Keep private/sensitive media out unless approved
- Large dumps are fine; CI may take longer while optimizing

## What not to do

- Do not commit optimized outputs back into `content/` as new sources when avoidable
- Do not expect a website upload form — it intentionally does not exist
- Do not put media outside year/album folders if you want them published
