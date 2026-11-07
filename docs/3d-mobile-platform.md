# Reddivaripalli 3D + Mobile Platform

## What Was Added

- Progressive 3D web experience with automatic fallback:
  - `components/three/VillageLandingScene.tsx`
  - `components/three/VillageMapScene.tsx`
  - `components/three/TempleShowcaseScene.tsx`
  - `components/three/Progressive3D.tsx`
- 3D integration points:
  - `components/home/VillageHero.tsx` (cinematic 3D landing layer)
  - `components/home/HomeTemples.tsx` (3D temple showcase + 3D village map)
- Shared public content API for web/mobile:
  - `functions/api/public/content.ts`
  - `functions/api/public/subscribe.ts` (push token intake endpoint)
  - `lib/mobile-content.ts` (shared fetch contract)
- Cross-platform mobile app scaffold:
  - `apps/mobile/*` (Expo + React Native + Expo Router)

## Preview / Development

### Web (3D + fallback)

```bash
npm run dev
```

3D is enabled only for capable devices. Reduced-motion and low-end devices keep the standard 2D UX.

### Mobile App

```bash
cd apps/mobile
npm install
npm run start
```

Then launch:

- Android: `npm run android`
- iOS: `npm run ios`

## Shared Content/API Contract

Mobile and web consume:

- `GET /api/public/content` for members, events, announcements, developments.
- `POST /api/public/subscribe` for notification token registration.

## Production Deployment

### Website + API (Cloudflare Pages)

```bash
npm run deploy:cf
```

This builds static output and deploys Pages + Functions.

### Android (APK / AAB)

```bash
cd apps/mobile
npx expo prebuild
npx eas build -p android --profile preview   # APK preview
npx eas build -p android --profile production # AAB for Play Store
```

### iOS (App Store)

```bash
cd apps/mobile
npx expo prebuild
npx eas build -p ios --profile production
```

Submit:

```bash
npx eas submit -p ios
```

## Performance Notes

- 3D is progressive and optional.
- Existing 2D pages remain canonical for SEO and low-end performance.
- 3D layers do not block content interactivity and degrade gracefully.
