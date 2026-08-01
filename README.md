# RVP Youth (`festivals-rvp`)

Premium interactive memory experience for **Govardhan Reddy**.

- **Brand:** RVP Youth  
- **Repo:** https://github.com/ggovardhanreddy/festivals-rvp  
- **Live (GitHub Pages):** https://ggovardhanreddy.github.io/festivals-rvp/

## Sections

Home · Sankranthi · Vinayaka Chavithi · RVP Birthdays · Fun Trips · Timeline · Search · About

## Import source (mandatory default)

```bash
/Users/govardhan.reddy.g.94gmail.com/Downloads/Fest
```

```bash
npm run import:folder
```

Organizes into:

```text
public/images/<YEAR>/sankranthi/
public/images/<YEAR>/vinayaka-chavithi/
public/images/<YEAR>/rvp-birthdays/
public/images/<YEAR>/fun-trips/
```

Exact duplicates skipped (SHA-256). Visually similar images go to `review/near-duplicates/` for admin review.

Publish only after confirmation:

```bash
npm run publish -- --confirm
```
