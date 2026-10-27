# TripCraft design system

The Home page is the visual reference. Pricing, Contact, and Dashboard use its
warm parchment / midnight slate palette, editorial type and restrained surfaces.
Home retains the unique illustrated scene and its synchronized 800ms day/night
crossfade. Other routes share surface and typography transitions only.

## Foundations

`app/theme.css` owns the theme-aware `--app-*` palette and the reusable `--tc-*`
layout, type, radius, elevation, control-height and motion tokens. Existing
Tailwind, Clerk, public-page and planner color aliases resolve to these tokens.

| Role | Light | Dark |
| --- | --- | --- |
| Page | `#f8f5ef` | `#151a20` |
| Header | `#f8f5ef` | `#19222b` |
| Surface | `#fffcf7` | `#242a2f` |
| Elevated | `#fffefb` | `#2d3235` |
| Text | `#252320` | `#f5f0e8` |
| Muted text | `#746d66` | `#b8b1a8` |
| Editorial accent | `#b84a19` | `#ca9676` |
| Primary action | `#191a19` | `#e5d5bf` |

Use Geist for product and editorial text. The existing TripCraft brand component
continues using its original Outfit wordmark and symbol. Page headings use a
fluid 34–64px scale; section headings use 26–38px; dashboard cards are deliberately
denser. The UI font alias is also available to shared Tailwind controls.

- Main containers: 1200px maximum, fluid 20–40px side gutters.
- Navbar: 1440px maximum, 72px tall; 64px at <=820px.
- Control height: 48px; compact controls/touch targets: at least 44px.
- Radii: 14px controls, 24px cards, 32px feature panels, pill actions.
- Motion: 180ms feedback, 240ms UI movement, 350ms theme surfaces, 800ms Home scene.
- Breakpoints: compact navigation <=820px, stacked forms <=600px; dashboard grids
  reduce to two columns <=1000px and one trip-card column <=600px.

## Shared components

- `HomeHeader`: the same navigation, Clerk account state, active links, sticky
  behavior, accessible mobile dialog and theme toggle across all four routes.
- `PageIntro`: shared editorial hierarchy; Pricing and Contact keep their own copy.
- `SiteFooter`: independent CSS module, shared widths, link groups and newsletter.
- Existing `Button`, `Input`, `Textarea`, `GlassModal` and dropdown/dialog primitives
  use theme surfaces and focus treatments. Modal close restores keyboard focus.
- `TripCardSkeleton`: stable, card-shaped loading placeholders for dashboard lists.
- `SiteMotion`: content stays visible by default. Optional, short reveals run once;
  navigation does not wait for a splash, fake progress sequence or nested parallax.

## Page treatments

Pricing retains Clerk's live plans, prices, billing switches, features and checkout.
Only the supported appearance slots and theme variables are styled. The actual
plan count determines the responsive grid; no fabricated plans are rendered.

Contact keeps native field validation, topic selection, and the current draft/copy
flow. The form uses the same control and primary-action styles as the dashboard.

Dashboard retains its Convex queries and filtering, sorting, pagination, saved
places and detail dialogs. Trip images use a consistent ratio; actual creation
dates are formatted in UTC. Keyboard users can open saved-place cards. Specific
Amalfi/Capri imagery is selected before the general Italy fallback.

## Verification and practical limits

`tests/design-system-browser.cjs` checks all four routes at 375, 390, 768, 1024,
1280, 1440 and 1920px in both themes: 56 combinations. It checks overflow, heading
and card bounds, navbar geometry, shared fonts/colors, control size and footer
bounds, and captures review screenshots under `artifacts/design-system`.

`tests/design-system-interactions.cjs` checks mobile navigation, live pricing
switches, contact validation and draft copy, theme-preserved inputs, newsletter
feedback, dashboard search/sort/pagination, trip links, keyboard dialogs, focus
restoration, and empty/loading states. `tests/hero-night.cjs` covers the cinematic
Home transition, synchronized playback, reduced motion, input and upload picker.

The protected dashboard is visually tested using its real production components
inside `tests/design-system-fixture`. Only account/data transports are isolated
in that test server; production routes, authentication and queries are unchanged.
No user account, payment, model, or database writes are needed for these UI checks.

To review locally, start the app on port 3000, then run:

```sh
node tests/design-system-fixture/server.cjs
node tests/design-system-browser.cjs
node tests/design-system-interactions.cjs
```

Browser scripts use Playwright and Microsoft Edge; `PLAYWRIGHT_MODULE` may point
to an existing external Playwright installation. The fixture uses the existing
esbuild package. No new application dependencies were introduced.

Existing product limits are preserved: Contact prepares/copies drafts instead of
sending online, and the newsletter reports that sign-ups are coming soon. The
Next.js middleware filename deprecation is unrelated to this visual scope and
has not been migrated as part of authentication-sensitive code.
