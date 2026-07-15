# Yoshi & Milo: A Day at Pawprint Bay

Pawprint Bay is a cozy 3D browser adventure about two much-loved dogs, Yoshi and Milo, spending a gentle day with their owners, Paula and Jam.

Explore a storybook island village, follow winding paths through meadows and orchards, visit the pond and hilltop lookout, and help the family with small, feel-good errands. There is no timer and no pressure—just a warm world to wander through one happy pawprint at a time.

## Play online

**[Play Yoshi & Milo on GitHub Pages](https://jamonlineph.github.io/MiloAndYoshi/)**

The game runs directly in a modern desktop or mobile browser. On iPhone, open the link in Safari and use the on-screen controls.

## What you can do

- Explore Pawprint Bay’s cozy plaza, Maple House, garden, meadow, pond, orchard, and hilltop paths.
- Play as Yoshi while Milo follows along as a loyal companion.
- Meet Paula and Jam, the dogs’ owners and the village’s main quest givers.
- Complete gentle quests about welcome baskets, flower picnics, Milo’s pocket garden, family memories, and lanterns leading home.
- Discover small environmental details including trees, flowers, fences, market stalls, benches, bridges, lanterns, water, and rolling terrain.
- Enjoy soft storybook visuals, procedural cozy materials, ambient particles, sound effects, and a helpful minimap.

## Controls

### Keyboard

| Action | Key |
| --- | --- |
| Move | `W` `A` `S` `D` |
| Run | `Shift` |
| Jump | `Space` |
| Interact / talk | `E` |
| Bark | `Q` |
| Pause | `Esc` |

### Touch

On supported mobile layouts, use the virtual joystick and action buttons shown on screen.

## Run locally

### Prerequisites

- Node.js 20 or newer
- npm

### Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Validate a production build

```bash
npm run lint
npm run build
```

The production bundle is written to `dist/`.

## Deployment

GitHub Pages deployment is configured in [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml). Pushes to `main` build the Vite app with the `/MiloAndYoshi/` base path and publish the result to GitHub Pages.

## Project notes

The game is built with React, TypeScript, Vite, React Three Fiber, Three.js, Drei, Rapier physics, Zustand, and Howler. The environment and characters are assembled from reusable code-built 3D components so the village, quests, materials, and animation can continue to grow together.

## Credits

Created with love for Milo and Yoshi, with Paula and Jam as the heart of their cozy little world.
