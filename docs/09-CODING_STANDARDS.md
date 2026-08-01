# 09 — Coding Standards

## Language & tooling

- TypeScript strict typing
- Next.js App Router
- ESLint (`eslint-config-next` + Prettier integration)
- Prettier for formatting
- Tailwind v4 + CSS tokens

Scripts:

```bash
npm run lint
npm run typecheck
npm run format
npm run format:check
npm run validate
npm run build
```

## Architecture rules

1. Feature folders over grab-bag utilities
2. Composition over inheritance
3. UI reads generated content only
4. Build pipelines own filesystem side effects
5. Design tokens own visual constants

## Naming

- Components: `PascalCase.tsx`
- Hooks/helpers: `camelCase.ts`
- Constants: `SCREAMING_SNAKE` or `as const` objects
- CSS classes: kebab semantic names aligned with existing globals
- Routes: kebab-case segments

## TypeScript

- Prefer explicit domain types in `lib/types.ts`
- Avoid `any`; narrow unknowns at boundaries
- Prefer discriminated unions for media types
- Keep server/client boundaries clear (`"use client"` only when needed)

## React

- Prefer modern patterns already used in the repo
- Do not add `useMemo` / `useCallback` by default
- Avoid setState-in-effect anti-patterns; prefer derived state / external stores / rAF boots for client-only phases
- Dynamic-import heavy 3D clients

## Forbidden

- Placeholder / dummy implementations
- TODO comments left in production paths
- Dead or unused components
- Duplicated business logic across scripts and UI
- Hardcoded token values when a token exists
- Browser upload backends pretending to replace GitHub CMS

## Pull requests

- Small, reviewable diffs
- Include sync/validate implications when touching content pipelines
- Update `/docs` when architecture or contributor workflow changes
- Match existing commit message style
