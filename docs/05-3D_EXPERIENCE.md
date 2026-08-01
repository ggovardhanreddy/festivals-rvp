# 05 — 3D Experience

## Purpose

The 3D village is a **storytelling gateway**, not a game engine demo. It orients visitors in Kondreddigaripalli before they open festival memories.

## Stack

- Three.js
- React Three Fiber
- Drei helpers
- Custom scene graph under `components/experience/`

Key modules:

- `CinematicHero` — orchestration, phases, UI overlay
- `VillageCanvas` / `VillageWorld` — scene
- `CameraRig` — pose interpolation
- Hotspots from `lib/experience.ts`
- Map companion: `InteractiveVillageMap`

## Scene content

Low-poly village language: entrance, temple, school, ground, fields, and related memory anchors. Hotspots fly the camera and deep-link into album buckets.

Lighting modes respond to time-of-day helpers (`lightingForHour`) and cinematic phase (night → morning → alive).

## Interaction model

1. Hover hotspot → glow + info panel
2. Click hotspot → camera fly-to + “Open memories”
3. Return → overview pose
4. Optional ambience audio toggle (user initiated)

Keyboard-friendly hotspot chips remain available below the canvas.

## Fallbacks

| Condition | Fallback |
|---|---|
| Reduced motion | Skip cinematic phases; show ready UI |
| Low-power | Simplified lighting / fewer effects |
| WebGL unavailable / SSR | Atmospheric image plane |
| Audio blocked | Silent until user gesture |

## Performance strategy

- Dynamic import of canvas (no SSR)
- Limit draw complexity on weak GPUs
- Prefer baked/simple materials over heavy PBR stacks
- Dispose geometries/materials on unmount (R3F defaults + careful custom resources)
- Keep textures few and compressed

## Future extensions

Architecture allows:

- Additional village landmarks
- Seasonal weather presets
- 360 photo spheres as hotspot destinations
- Optional VR mode behind capability detection
- Multi-village scene swapping via identity config

These must remain progressive enhancements and must not break the static export path.
