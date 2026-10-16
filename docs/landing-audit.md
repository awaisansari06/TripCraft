# TripCraft landing-page audit

Implemented directly in the existing Next.js application. Existing routes, providers, branding, light/dark photography, and planning links are retained.

## Findings and fixes

| Finding | Cause and resolution |
| --- | --- |
| Missing destination photography in full-page mobile captures | Reproduced blank below-the-fold images despite loaded-image metadata. Images now load eagerly with reserved space; capture checks await decoding. All six destinations use one DestinationCard and stable local assets with a local SVG fallback. |
| Low-contrast lower sections | Small 10–12px responsive text, fragmented surface colors, and whole-element opacity animations. Added semantic surfaces, secondary text, borders, overlays, focus and shadow tokens; raised body and footer text sizes. |
| Animation visibility hazards | Overlapping homepage animation definitions and shared intersection-triggered opacity effects. Removed stale reveal CSS and opacity entrances. Motion has since been restored with visible-first Framer Motion reveals, bounded card/heading opacity, transform-only section wrappers, and reduced-motion support; see landing-motion.md. |
| Inspiration heading duplication | The checked-out page already had one heading; a duplicate was not reproducible in its markup. Kept one heading and added a browser assertion in each theme at every requested width. |
| Header consistency | Retained one shared sticky header and Radix mobile menu. Theme-dependent icons use CSS so they match the initial theme without waiting for hydration. Kept authentication controls and focus behavior. |
| Mobile destination layout | Old mobile rules still specified two columns. Added explicit three/two/one-column destination breakpoints and one-column inspiration cards on phones. |
| Planner clarity | Animated placeholder could be empty at capture time. Replaced it with stable guidance, retained accessible naming and example buttons, and added empty-submit prevention and loading semantics. Button and Enter both submit the same form. |
| CTA readability | Previous light overlay depended on the current theme and reused the hero image. Both themes now use an explicit dark image overlay, readable white text, and the existing Capri asset. |
| Development controls | Disabled the Next.js development indicator through supported configuration. Production browser assertions confirm no Next.js development portal. |

## Changed implementation files

- `app/page.tsx`: photo recovery, shared destination card, planner behavior, example label, step wording, Capri CTA.
- `app/home.module.css`: responsive layouts, typography, contrast, focus, overlays, motion cleanup.
- `app/tripcraft.css`: semantic public-interface theme tokens and theme icons.
- `app/layout.tsx`: next-themes persistence/system initialization retained; subsequent motion restoration allows smooth surface/color transitions.
- `app/_components/HomeHeader.tsx`: theme-aware sun/moon icons; existing shared navigation retained.
- `app/_components/SiteMotion.tsx`: visible-first, once-only Framer Motion reveals with completion cleanup and failure recovery.
- `app/_components/TripPromptInput.tsx`: stable accessible prompt input.
- `next.config.ts`: development indicators disabled.
- `public/image-fallback.svg`: local graceful image placeholder.
- `tests/landing-browser.cjs`, `tests/landing-resilience.cjs`: production browser checks.

## Validation

- `npm run lint`: zero errors, seven pre-existing warnings in chat, trip modal, and UI components.
- `npx tsc --noEmit`: passed.
- `node --test tests/api-routes.test.cjs`: five passed.
- `npm run build`: passed. Downloading the existing Outfit Google Font required network access. Existing middleware naming deprecation remains.
- `node tests/landing-browser.cjs`: both themes at 1440, 1280, 1024, 768, and 390px. Checks image loading/decoding, six visible cards, responsive column counts, one inspiration heading, no horizontal overflow, no section opacity, visible header, no development portal, theme persistence, keyboard focus, and mobile dialog/Escape behavior. Browser console/page error collections were empty.
- `node tests/landing-resilience.cjs`: initial saved theme before hydration, system preference, forced image failure, example prompt, Enter submission, and visible cards without JavaScript.
- Ten full-page screenshots and machine-readable results are saved under `artifacts/landing-audit/` and visually reviewed section by section.

Browser scripts require Playwright and installed Microsoft Edge. Set `PLAYWRIGHT_MODULE` to a Playwright module path if it is supplied by the environment rather than installed in the project. Start the production server on port 3101 before running them.

## Limits

No deployment was performed. Browser checks used public/signed-out views. Local server logs recorded external Clerk handshake fetch failures, so a complete signed-in account flow still needs verification in an environment with working Clerk access. Newsletter submission retains its existing honest coming-soon response; no mailing-list service was added. There were no separate landing-page reference screenshots or PDFs attached to this request; the existing page and supplied design requirements guided the implementation.
