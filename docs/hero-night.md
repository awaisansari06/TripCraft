# Midnight hero

The hero uses the original travel illustration in two frame-aligned grades. Both
contain the same two engraved clouds and unchanged landscape geometry.

- `public/hero/day.*`: optimized original video, 1920×1080, 24 fps, 193 frames.
- `public/hero/night.*`: independently graded sky, clay, foliage, and limestone.
- MP4 and WebM provide browser fallbacks; WebP posters prevent an empty scene.
- `components/HeroScene.tsx` keeps both clips running on the same timeline.
  Theme changes crossfade opacity for 800ms without remounting either video.
- Reduced motion pauses both at the first aligned frame. Hidden tabs also pause.
- Dark illustration and panel treatments remain local to the hero.
  Shared navigation and page surfaces use the global design-system palette.

The source is the existing Figma-hosted hero video, not generated scenery:
https://pollen-batch-41236914.figma.site/_components/v2/f0ee2dae7671c170c34f12e31c4cb41418976c98/769c564298c132f7919405cd9f17c1b1231f341d.769c5642.mp4

To regenerate the night media, run `python scripts/grade-hero-night.py` with
NumPy, Pillow, and FFmpeg available. `--preview` writes only a preview frame.
The grading script segments existing paper and engraved contours; its limestone
mattes protect pale monument interiors and do not draw new scene content.

Browser verification: `node tests/hero-night.cjs`, with Playwright installed or
`PLAYWRIGHT_MODULE` pointing to its existing package. It uses the local app at
http://localhost:3000 and Microsoft Edge. Screenshots and reports go into the
ignored `artifacts/hero-review` directory. Use `--interactions-only` for the focused
playback, theme-switch, prompt, upload-picker, and persistence checks.

The suite covers 375, 390, 768, 1024, 1280, 1440, and 1920px in both themes,
including geometry alignment, horizontal overflow, writing space, touch targets,
control overlap, and reduced-motion playback.
