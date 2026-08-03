# System Diagrams

Mermaid sources and rendered PNG/SVG live in [`diagrams/`](./diagrams/). Render instructions: [README.md](./README.md#diagrams).

## Architecture

![Architecture](./diagrams/architecture.png)

```mermaid
flowchart LR
  User((Visitor / Member / Admin))
  CF[Cloudflare Pages]
  FN[Pages Functions]
  R2[(R2 MEDIA)]
  GH[GitHub main]
  User --> CF
  CF --> FN
  FN --> R2
  GH -->|Actions build+deploy| CF
  GH -->|content CMS| Build[prepare:site]
  Build --> CF
  R2 -->|media + community JSON| User
```

## Deployment

![Deployment](./diagrams/deployment.png)

```mermaid
flowchart TD
  Push[Push to main] --> Sparse[Sparse checkout exclude media blobs]
  Sparse --> CI[npm ci]
  CI --> Build[npm run build]
  Build --> Strip[npm run media:strip-local]
  Strip --> Deploy[wrangler pages deploy out]
  Deploy --> Live[www.reddivaripalli.com]
  PR[Pull request] --> Quality[ci.yml: lint typecheck validate test build]
```

## Authentication

![Authentication](./diagrams/authentication.png)

```mermaid
sequenceDiagram
  participant U as User
  participant A as /api/admin or /api/auth
  participant R as Cookie jar
  U->>A: POST login credentials
  A->>A: PBKDF2 verify (100k)
  A->>R: Set HttpOnly cookie + HMAC
  U->>A: GET session (credentials include)
  A-->>U: ok + role/username
```

## Notification flow

![Notification flow](./diagrams/notification-flow.png)

```mermaid
flowchart TD
  Data[members + events + developments + announcements]
  Prefs[localStorage prefs]
  Build[buildNotifications in lib/notifications.ts]
  UI[Notification center / banners / popups]
  Data --> Build
  Prefs --> Build
  Build --> UI
  UI -->|optional| Perm[Notification.requestPermission]
```

## Upload flow (Super Admin)

![Upload flow](./diagrams/upload-flow.png)

```mermaid
sequenceDiagram
  participant Admin
  participant API as /api/media/upload
  participant R2 as R2 MEDIA
  Admin->>API: multipart file + category
  API->>API: requireAdmin cookie
  API->>R2: put category/timestamp-name
  API-->>Admin: key + publicUrl or object path
```

## Gallery / CMS flow

![Gallery flow](./diagrams/gallery-flow.png)

```mermaid
flowchart TD
  Folders[content/YEAR/bucket media]
  Sync[scripts/sync-cms.ts]
  Albums[generated/albums.json]
  Rewrite[rewrite-albums-r2.ts]
  Site[Gallery + festival pages]
  Folders --> Sync --> Albums --> Rewrite --> Site
  R2[(R2 public URLs)] -.-> Rewrite
```

## Admin workflow

![Admin workflow](./diagrams/admin-workflow.png)

```mermaid
flowchart TD
  Login["/admin/ login"] --> Hub[AdminHub tabs]
  Hub --> Members[Members / Edit Mode]
  Hub --> Media[Media R2 upload]
  Hub --> Community[Directory Docs Heritage LostFound]
  Hub --> Approvals[Approve pending]
  Hub --> Backup[Backup JSON]
  Members --> R2m[community/members.json]
  Community --> R2c[community/*.json]
  Media --> R2b[R2 object keys]
```

## Project structure

![Project structure](./diagrams/project-structure.png)

```mermaid
flowchart TB
  Root[festivals-rvp]
  Root --> app[app/ static routes]
  Root --> components[components/ UI]
  Root --> lib[lib/ domain helpers]
  Root --> content[content/ CMS + data]
  Root --> scripts[scripts/ pipeline]
  Root --> functions[functions/ Pages Functions]
  Root --> public[public/ static + SW]
  Root --> generated[generated/ build artifacts]
  Root --> docs[docs/ this documentation]
```

## File map

| Diagram | Source | PNG |
|---|---|---|
| Architecture | [architecture.mmd](./diagrams/architecture.mmd) | [architecture.png](./diagrams/architecture.png) |
| Deployment | [deployment.mmd](./diagrams/deployment.mmd) | [deployment.png](./diagrams/deployment.png) |
| Authentication | [authentication.mmd](./diagrams/authentication.mmd) | [authentication.png](./diagrams/authentication.png) |
| Notifications | [notification-flow.mmd](./diagrams/notification-flow.mmd) | [notification-flow.png](./diagrams/notification-flow.png) |
| Upload | [upload-flow.mmd](./diagrams/upload-flow.mmd) | [upload-flow.png](./diagrams/upload-flow.png) |
| Gallery | [gallery-flow.mmd](./diagrams/gallery-flow.mmd) | [gallery-flow.png](./diagrams/gallery-flow.png) |
| Admin | [admin-workflow.mmd](./diagrams/admin-workflow.mmd) | [admin-workflow.png](./diagrams/admin-workflow.png) |
| Structure | [project-structure.mmd](./diagrams/project-structure.mmd) | [project-structure.png](./diagrams/project-structure.png) |
