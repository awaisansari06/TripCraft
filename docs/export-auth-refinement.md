# Trip export and account pages

## Changes

The download action now opens a travel-guide preview with a Save as PDF action. It uses the existing browser PDF workflow, with a dedicated document instead of printing the interactive workspace.

The guide includes TripCraft branding, destination/origin, the actual trip facts, an overview, hotel recommendations, and complete daily activity details. It preserves prices, ratings, addresses, timings and descriptions from the saved trip. Print layout uses A4 pages, deliberate section starts, page numbers, light paper colors in either app theme, and card break protection. No backend, generation, billing or authentication rules changed. Export photos are deferred until the preview is opened; local photos use the existing Next image optimizer. Unknown or failed images are omitted gracefully without hiding their text.

Sign-in and sign-up now share a responsive branded layout. The broad marketing-page heading styles no longer affect Clerk headings. Scoped styles and semantic variables apply to fields, buttons and cards in both themes. Clerk's own authentication components continue to handle email/password, Google sign-in, verification and errors. Explicit account-switch links preserve an in-progress trip, including same-origin absolute return URLs; untrusted external return URLs are not copied into those links.

The global rules that hid the whole Clerk footer and its sign-up link were removed. Native duplicate account-switch text is replaced only within the new auth screen; Clerk branding/development information remains visible.

## Files

- app/_components/AuthScreen.tsx and auth.css: shared sign-in/sign-up shell, theme styling, safe account-switch links.
- app/(auth)/sign-in/[[...sign-in]]/page.tsx and app/(auth)/sign-up/[[...sign-up]]/page.tsx: use the shared screen.
- app/layout.tsx: consistent Clerk typography/branding and TripCraft welcome copy.
- app/globals.css: remove global footer-hiding rules.
- app/create-new-trip/_components/TripExport.tsx: accessible preview, image/font readiness and native PDF save action.
- app/create-new-trip/_components/TripPrintDocument.tsx and trip-export.css: dedicated travel-guide document and print styles.
- app/create-new-trip/page.tsx: replace workspace printing with the new export action, available from either map or itinerary view.
- tests/auth-pages-browser.cjs, trip-export-browser.cjs, export-fixture-data.cjs and existing planner fixture helpers: verification only.

## Verification

- Production build: npm run build -- --webpack.
- Type check: npx tsc --noEmit.
- Lint: no errors; seven existing warnings.
- Existing API tests: all five passed.
- Actual Clerk sign-in and sign-up: checked at 320, 390, 768, 1024 and 1440px in light/dark mode (20 combinations). Verified field/card dimensions, focus, no horizontal overflow, corrected headings and account-switch return links. No account forms were submitted.
- Export fixture: bundles the real application/export components with test-only trip/account data. Verified preview at desktop/mobile sizes, deferred image loading, PDF action, title handling, focus restoration and print-only content.
- Generated three QA PDFs: light, dark/mobile and long-trip stress case. Base PDFs each contain four intentional pages; stress case contains fourteen. Every page contains document text. All supplied test sections remain present, with no assistant/chat content in the PDFs.
- Rendered and visually inspected the pages. Page numbering, light/dark parity, long titles, image placement and multi-page hotel/day sections were checked.

Results and screenshots are under artifacts/export-auth/. QA PDFs contain sample trip data and are not the user's saved itinerary.

## Remaining limits

Saving uses the browser's print dialog: choose Save as PDF and A4. The app does not control the chosen filename, output location or all browser print preferences.

Clerk still shows Development mode while the project uses Clerk test keys. Switching the Clerk instance to production keys is an account/deployment configuration change; the badge was not hidden in CSS.

Real account creation, Google consent and verification-code submission were not performed. No saved trips, accounts or credits were changed by the browser tests. Changes remain local and are not deployed.
