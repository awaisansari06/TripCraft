# TripCraft motion restoration

Recovered the original intent from Git HEAD (`4ffcebe`), including `SiteMotion`, homepage CSS, and `useHomepageMotion`. Restored motion in the existing components while keeping the landing-page accessibility, layout, local image recovery, contrast, and responsive fixes.

## Restored effects

- Framer Motion scroll reveals: 520ms, 18px vertical travel, 60ms stagger, once per element mount. Hero text/form, inspiration, workflow, feature cards, itinerary, destination cards, CTA and footer participate.
- Individual cards/headings fade from 0.55 to 1. Whole section/footer wrappers only translate; they never fade or dim their children.
- Cards lift 4px with restrained pointer tilt and 1.045 image zoom; feature icons and link arrows respond on hover. Feedback lasts 200–250ms.
- Buttons/example chips have hover lift, keyboard focus rings/shadows and 0.98 press scale. Main actions retain subtle pointer tracking.
- Sticky header retains scroll-responsive translucent background, border and shadow transitions, refined to 220ms.
- Decorative airplane arrival and dotted-path movement run briefly for 600ms, without continuous looping or changing layout.
- Hero image scroll movement is bounded to 27px on fine-pointer devices only, inside the existing organic crop.
- Theme surfaces/text/borders transition in 220ms. next-themes still sets the initial saved/system theme before hydration; there is no added mount-time theme fade.

## Visibility and lifecycle safeguards

CSS never sets waiting/offscreen reveal content to opacity zero. IntersectionObserver starts animation only on entry; an unvisited element is already visible. Images and loading events do not gate reveals. Each completed reveal cancels its animation effect, removes inline opacity/translate, and retains a once-only marker. A 950ms watchdog performs the same cleanup if completion is interrupted. Focus entering an animating card finishes it immediately. Initialization exceptions restore baseline styles.

Observers, mutation observation, media listeners, timeouts, pointer listeners and animation frames are cleaned up. Reduced-motion changes finish active reveals and remove nonessential CSS transitions and decoration. Touch/coarse-pointer devices do not get hover tracking or hero parallax. Native scrolling is retained.

For screenshots, either use `reducedMotion: 'reduce'` or scroll the page and wait until `[data-revealing="true"]` has no matches. No animation-ready or hidden CSS class needs to be forced.

## Validation

- `npm run lint`: zero errors, seven existing unrelated warnings.
- `npx tsc --noEmit`: passed.
- `node --test tests/api-routes.test.cjs`: five tests passed.
- `npm run build`: passed; existing Google font fetch needed network access. Existing middleware naming deprecation remains.
- `node tests/landing-browser.cjs`: all five widths, both themes, reduced-motion screenshots, stable images/geometry, mobile menu, persistence and keyboard focus passed.
- `node tests/landing-resilience.cjs`: saved initial theme, system preference, forced image fallback, example action, Enter submit, and no-JavaScript visibility passed.
- `node tests/landing-motion.cjs`: normal motion in light/dark at 1440, 1280, 1024, 768 and 390px; scroll hero→footer→hero, actual reveal activity, all six destination reveals, no replay, settled opacity/translate, hover/image zoom, press, keyboard focus, sticky header state, theme changes before/after scroll, stable geometry, touch behavior, reduced motion, and missing-observer/no-JavaScript visibility passed. Browser console/page error arrays were empty.

Settled full-page screenshots and results: `artifacts/landing-motion/`. Reduced-motion captures: `artifacts/landing-audit/`. Existing browser tests accept `LANDING_URL` (default `http://localhost:3102`) and optional `PLAYWRIGHT_MODULE`; they use installed Microsoft Edge. Start a production server on the chosen port first.

No new animation dependency was added. Public/signed-out browser flows were tested; a full signed-in account flow was outside this motion restoration. No deployment was performed.

## Glow and hero-loading refinement

Added a soft hero halo (two finite pulses), theme-aware action glows, masked conic-gradient card border sweeps on entry and hover/keyboard focus, and a native anchor scroll cue. Hero headline lines now enter individually, with a 650ms image/text entrance; the existing 520ms section reveals and pointer-only parallax are retained. Borders animate only decorative pseudo-elements; text and layout remain unaffected. Reduced-motion and forced-color modes suppress decorative animation.

Validation: production build, type checking, five existing tests, and lint passed (zero errors; seven existing warnings). Updated browser checks passed at all five widths in both themes, including border sweep activation, hero-to-footer round trips, no replay of completed reveals, theme geometry, keyboard/press/hover feedback, initialization failure, and reduced motion. Normal screenshots explicitly wait for all finite animations to settle. Current screenshots and results remain in artifacts/landing-motion; reduced-motion captures remain in artifacts/landing-audit.

## Hero reload refinement
The supplied recording exposed a gap in settled-state screenshot testing: individual heading lines were being translated after the server-rendered hero had already appeared. The image frame and supporting controls also had independent observer entrances.

The hero now uses a 600ms first-paint CSS entrance on the copy as one unit, without fading its text. The fixed image frame contains a subtle 650ms image scale settle. Hydration never starts these effects. Reduced-motion users receive the static layout. The decorative glow is steady; card border sweeps and hover effects remain. Scroll reveal cleanup stops the existing animation rather than cancelling it back to its starting state.

The new tests/hero-loading.cjs delays JavaScript requests and samples heading-line geometry on animation frames in desktop/mobile and both themes. This complements the existing full-page motion and resilience tests.
