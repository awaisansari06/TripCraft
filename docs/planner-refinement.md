# TripCraft planner refinement

The supplied recording showed the questionnaire being squeezed into a sidebar while its grids were using desktop viewport breakpoints. The old percentage-based assistant width, stacked mobile layout, large credit capsule and unconditional scroll-to-bottom behavior compounded the problem.

## What changed

- The shared header uses a 64px desktop / 60px mobile height, balanced navigation, consistent focus targets, and a loading placeholder that stays in place until authentication is ready.
- The planner has one mounted assistant and map across screen sizes. Desktop starts at a 420px assistant with keyboard/pointer resizing; mobile uses Chat / Explore map / Itinerary controls. Drafts and conversation state survive switching panels and crossing breakpoints.
- The composer sits outside the conversation scroller. Visual viewport resizing and safe-area padding keep it reachable when the available mobile viewport shrinks.
- Credits are a compact, real-data usage row. Loading, unavailable, Premium and free-plan upgrade states are supported. Fresh response data does not require remounting the component; pending older reads are cancelled.
- Questionnaire cards share one pattern and adapt to container width. Travelers, budget, vibe and pace use semantic buttons with selected states. Interests use compact checkmarks without changing chip dimensions.
- Duration accepts 1–30 whole days and explicitly confirms custom input, avoiding a request after the first typed digit. Presets still submit directly.
- Completed questions become expandable read-only summaries. Interest answers are formatted for display while backend values remain unchanged.
- Assistant text safely renders basic bold, emphasis, code and lists as React nodes; raw HTML is never executed.
- Auto-scroll follows only while the reader is near the latest content. Dynamic size changes are observed; readers can return with “Latest messages.” Their reading position survives mobile panel switching.
- The confirmation card handles long text, missing values and canonical saved-trip field names. Edit uses the existing Radix dialog library for focus trapping and Escape support. Generation has aligned actions, useful status text, duplicate protection and an explicit retry after failure.
- Mapbox observes container size changes, resizes after becoming visible, retains its canvas, respects reduced motion and pauses automatic movement while hidden. Search works at mobile widths. Filters have selected semantics; attribution remains visible. Live map loading has a status row.
- The three existing pace values are preserved. The current app and AI contract support Relaxed / Moderate / Packed; no extra unsupported option was invented.

## Application files

| Files | Purpose |
| --- | --- |
| app/_components/HomeHeader.tsx; app/tripcraft.css | Shared compact navigation |
| app/create-new-trip/page.tsx; app/create-new-trip/planner.css | Responsive planner, visual tokens and component styling |
| app/create-new-trip/_components/ChatBox.tsx | Conversation, history summaries, composer, menu and generation feedback |
| app/create-new-trip/_components/useChatScroll.ts | New reader-aware scroll management |
| app/create-new-trip/_components/MessageContent.tsx | New safe text formatting |
| app/create-new-trip/_components/ChatQuestionCard.tsx | New shared card / option components |
| app/create-new-trip/_components/GroupSizeUi.tsx; BudgetUi.tsx | Compact accessible traveler and budget options |
| app/create-new-trip/_components/InterestsUi.tsx; TripDurationUi.tsx | Selection chips and explicit custom duration confirmation |
| app/create-new-trip/_components/TripStyleUi.tsx; TravelPaceUi.tsx | Container-responsive option grids |
| app/create-new-trip/_components/UiRenderer.tsx | Disabled/loading propagation and responsive hotel recommendations |
| app/create-new-trip/_components/GenerativeTripUi.tsx; EditTripDialog.tsx | Summary, generation actions and accessible editor |
| app/create-new-trip/_components/CreditDisplay.tsx | Compact live usage indicator |
| app/create-new-trip/_components/GlobalMap.tsx | Resize, visibility, motion, controls and loading behavior |

Existing landing-page work in the checkout was retained. No authentication rules, database schemas, API routes or credit-accounting code were changed.

## Verification performed

- `npm run lint`: no errors; seven existing warnings (four ChatBox hook-dependency warnings, one TripItemModal hook warning, two shared image-component warnings).
- `npx tsc --noEmit`: passed.
- `node --test tests/api-routes.test.cjs`: all five passed.
- `npm run build -- --webpack`: production build passed. Next reports the existing middleware naming deprecation.
- `git diff --check`: passed.
- `tests/planner-browser.cjs`: the actual planner components passed the full questionnaire, editing, selected-state geometry, credits, mobile draft preservation, viewport shrink, keyboard resizing, canvas geometry, overflow and reader-position checks in both themes at 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920px. No page errors were recorded.
- `tests/planner-edge-browser.cjs`: passed generation failure/retry with stable request identity, zero/free credits, unavailable credits, Shift+Enter, focus restoration, theme switching, reduced motion and mobile state persistence.
- `tests/planner-public-browser.cjs`: shared navigation passed on landing, pricing and contact pages in both themes at 320, 390, 768, 1024 and 1440px (30 combinations), with no page errors.
- `tests/planner-capture.cjs`: final desktop/mobile light/dark screenshots were captured after the real Mapbox map reported idle and fonts finished loading.

The planner browser fixture bundles the real application components and substitutes only account, navigation, database and AI transports. It runs on loopback, is outside application routes, and does not spend real credits or write user trips. The Mapbox globe uses the existing public map token and real map rendering.

## Screenshots and results

Artifacts are in `artifacts/planner-refinement/`:
- `final-dark-1440-map.png` and `final-light-1440-map.png`
- `final-dark-390-chat.png` and `final-light-390-chat.png`
- `final-dark-390-map.png` and `final-light-390-map.png`
- `browser/results.json`, `edge-results.json`, `public-regressions.json`, `map-results.json`
- Final lint, type-check, build and API test logs

## Verification limits

Real authenticated AI generation, subscription changes and live database writes were not exercised; those transports were simulated in UI checks and the existing API route tests were run. Mobile viewport/keyboard resizing was simulated in Edge; a physical phone keyboard was not tested. Browser checks verified rendering, selected semantics, focus and overflow but did not run a formal automated WCAG audit. Changes are local and have not been deployed.

