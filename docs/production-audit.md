# TripCraft production audit — 27 October 2026

## Release assessment

The application has a verified production build and local production smoke tests. **Production deployment is not yet approved by this report:** the current environment uses development Clerk keys and has no `SITE_URL`. Configure the intended live services, then complete an authenticated acceptance pass before releasing.

No production deployment, DNS change, credential rotation, purchase, real contact submission, database mutation, migration, reset or deletion of user data was performed. Existing uncommitted design work was preserved. This audit does not certify infrastructure security or complete WCAG compliance.

## A. Architecture and safe cleanup

The verified stack is Next.js App Router / React / TypeScript / Tailwind 4, installed through npm's lockfile. Clerk supplies authentication and billing UI; Convex supplies indexed profiles, trips, chat, saved places, transactional credit accounting and request leases. Server routes call Gemini and Google Places; Mapbox has an intentionally public browser token. No checked-in hosting binding identifies an actual production destination. The previous README's sample repository/support/deployment links were not treated as production configuration.

Findings were classified before removal:

| Finding | Classification | Action and safety evidence |
| --- | --- | --- |
| `@arcjet/inspect`, `@arcjet/next`, `arcjet` | Verified unused direct dependencies | Removed after source, dynamic-import, configuration, test and documentation searches found no active imports. The Convex limiter and legacy `/api/arcjet` compatibility route remain. |
| `lib/metadata.ts` | Verified unreferenced duplicate metadata definitions | Deleted after its exports had no callers. Public metadata now uses one actually referenced helper. |
| `middleware.ts` | Framework-convention compatibility | Renamed to `proxy.ts`; Clerk route protection and static/media matching retained, with public robots/sitemap routes explicitly allowed. |
| Provider diagnostics and routine AI attempt logs | Sensitive/redundant logging | Removed raw upstream exception dumps from audited AI/credit paths; kept safe operational messages and generic responses. |
| Legacy UI, responsive/theme CSS, keyframes, artwork and media variants | Usage not safe to disprove, or intentionally conditional | Preserved. No heuristic CSS purge, asset deletion, animation removal or speculative dependency pruning. |
| Local `.env`, `.env.local`, `.next`, test output and caches | Legitimate local/generated state | Confirmed ignored; no tracked local secrets or build output found. `.env.example` alone is explicitly allowed in Git. |

All 43 public assets have identical SHA-256 hashes before/after, including the logo and six day/night hero files. No image or video was recompressed during this audit. The original two-cloud composition and animation code remain intact. No database schema changed.

### Files changed by this audit

Earlier design changes were already present in the worktree; this list describes the additional audit work, not every file shown by `git status`.

| Area | Files |
| --- | --- |
| Runtime/dependencies/configuration | `package.json`, `package-lock.json`, `.nvmrc`, `.env.example`, `.gitignore`, `next.config.ts`; `middleware.ts` renamed to `proxy.ts` |
| Request/security helpers | `lib/request-body.ts`, `lib/trip-credits.ts`, `app/api/aimodel/route.tsx`, `app/api/credits/route.ts`, `app/api/google-place-detail/route.ts` |
| Reliability | `app/provider.tsx`, `app/ConvexClientProvider.tsx`, planner `ChatBox.tsx`, `HotelCardItem.tsx`, `PlaceCardItem.tsx`, `TripItemModal.tsx`, `useChatScroll.ts` |
| Narrow-screen bug | One `max-width: 360px` navbar rule in `app/theme.css`; no palette, font, artwork or normal-width layout changes |
| SEO | `lib/site-metadata.ts`, `app/layout.tsx`, Pricing/Contact/Dashboard/planner/auth layouts, `app/robots.ts`, `app/sitemap.ts`; removed unused `lib/metadata.ts` |
| Verification | API and production-hardening tests; production smoke/visual tests; account lifecycle and planner initialization tests; existing browser test URLs/assertions and isolated fixture servers updated for the actual production styles |
| Audit utilities/docs | `scripts/audit-{build,source,services,client-secrets}.mjs`, `scripts/check-env.mjs`, `scripts/compare-production.py`, `README.md`, `tests/README.md`, this report and `docs/deployment.md` |

No unrelated user changes were reverted, no Git history was rewritten, and no commit was created automatically.

## B. Bugs and reliability fixes

| Issue and root cause | Fix | Verification |
| --- | --- | --- |
| Authenticated request bodies could be buffered/parsing attempted before a byte limit | Streaming bounded JSON reader: AI 2 MiB, Places 16 KiB; early Content-Length rejection and chunked-body cancellation | Actual route tests reject malformed/null/array and oversized input before provider work; utility tests verify broken-stream cleanup |
| Account initialization rejection only logged an error, leaving dependent screens loading indefinitely | Guarded failure reaches the existing application error boundary with a safe retry message | Actual provider mounted in a browser with isolated rejecting/succeeding transports; failure and retry passed |
| Planner effects referenced later declarations and captured stale callbacks; URL/session synchronization produced unnecessary post-paint updates | Preserve the existing keyed session boundary, derive its ID from the URL, reconcile database snapshots before commit, send generation from its action, and cancel deferred landing submission if readiness/navigation changes | Full conversational flow at 18 theme/width combinations; one-time landing prompt, stable saved ID, no replay of existing conversations and cached legacy plan restoration |
| In-flight place-image responses could outlive their cards | Effect-local requests with AbortController cleanup and complete dependencies | Lint/types/build and actual card/dialog browser regressions |
| Note synchronization could overwrite in-progress edits; keyboard carousel listeners used stale handlers and intercepted text editing | Item-scoped note drafts, pre-render item/index reset, functional carousel updates, and input-aware keyboard listener | Saved-place dialog keyboard/focus checks, private-note clearing, and planner failure-path browser tests |
| Upstream errors could be dumped to logs or reflected through credit-service error text | Safe fixed diagnostics and user responses; credit responses are explicitly non-cacheable, including errors | API retry test checks three attempts, one lease release and no upstream diagnostic disclosure; production anonymous API smoke tests |
| Missing Convex URL silently connected to a fake placeholder host | Explicit configuration error; environment preflight checks required values | Valid production compilation and local environment checks; missing-config branch inspected |
| Sign-in navbar overflowed to 322px on a 320px viewport | Narrow-phone-only spacing and authentication placeholder sizing, retaining logo and 44px controls | Real Clerk sign-in/sign-up at 320/390/768/1024/1440 in both themes; no account submission |
| Metadata contained an assumed domain and private pages inherited public indexing | Operator-supplied origin helper, distinct public metadata, private noindex layouts, public-only sitemap and robots rules | Origin validation and sitemap tests; production HTTP metadata/robots/auth smoke tests |

No lint rule or type check was disabled to obtain a successful build. Browser fixture expectations were updated for the already approved navbar tokens and asynchronous focus restoration, rather than changing production geometry to match obsolete tests.

## C. Performance and preservation evidence

Measurements are sums of all emitted `.next/static` chunks, **not** the initial payload of one route or a Core Web Vitals score. Gzip uses the same local compressor for both builds. Dependency/compiler changes account for the measured difference; no claim is made that deleting an unused package alone caused it.

| Output | Before | After | Change |
| --- | ---: | ---: | ---: |
| JavaScript, raw | 3,391,110 B | 3,169,830 B | −6.53% |
| JavaScript, summed gzip | 990,380 B | 921,215 B | −6.98% |
| CSS | 280,150 B | 268,663 B | −4.10% |
| Public assets | 43 | 43 | All hashes unchanged |

No route splitting, speculative memoization, dependency major-version migration, expensive visual effect or animation change was introduced. Real-user LCP/INP/CLS and device/GPU profiling were not measured; no improvement in those metrics is claimed.

### Visual comparison

Captured 56 baseline and 56 after screenshots across Home, Pricing, Contact and Dashboard at 375, 390, 768, 1024, 1280, 1440 and 1920px in both themes, including 1280×720. Dashboard screenshots render the real components with isolated account/data transports, not a live user's dashboard.

All screenshot sizes and measured coordinates/sizes match. Generated CSS-module names were excluded from geometry comparison because the compiler changed their hashes. Forty-three screenshot pairs are byte-for-byte equivalent in decoded RGB pixels. The remaining differences include asynchronous signed-out navbar placeholders and tiny rasterization differences in the same Planned badge; maximum changed area below the first 100px is 0.0285% using a >8 channel-level threshold. Raw full-image differences were retained alongside this diagnostic metric. This is **not** a claim that every screenshot is pixel-perfect.

Hero-specific browser assertions additionally verified aligned day/night scene bounds, intermediate crossfade opacity, playback synchronization, unchanged heading position through theme switches, reduced-motion pause, input/CTA separation, touch-target size and unclipped examples. The two clouds remain in the unchanged original media composition.

## D. Dependency/security and deployment readiness

Initial `npm audit` reported **37 advisories**: 3 critical, 19 high, 14 moderate and 1 low. Final audit reports **0**. Updates remain within the original major versions: Next/eslint-config-next 16.4.3, React/React DOM 19.2.9, Clerk 6.39.8, Axios 1.20.0 and uuid 13.0.1, plus compatible lockfile security fixes. No `--force`, overrides or unreviewed major upgrade was used.

`npm ci --ignore-scripts --no-audit --no-fund` successfully reproduced the lockfile installation; the installed app then passed build/tests. `npm ls --depth=0` passed, and root dependency/engine metadata matches the lockfile. npm emitted deprecation warnings for Clerk 6's transitive `@clerk/types` and `@clerk/clerk-react`; migrating to Clerk 7 needs a separate compatibility review. A zero npm audit count is not a universal security guarantee or an audit of Node/OS/hosting vulnerabilities.

Current-worktree source pattern scans found no embedded private credentials. An exact-value scan of the emitted browser JS/CSS found no configured Clerk secret, Gemini key, Google Places key or shared credit secret. Values were never written to the report. This does not constitute a historical Git-secret scan.

Production HTTP smoke tests verified `nosniff`, same-origin framing, strict-origin referrer policy and absence of the powered-by header. Anonymous protected APIs reject requests; dashboard/planner redirect to authentication; forged photo signatures are rejected. Backend-policy tests execute the real Convex handlers with isolated storage/identity to cover ownership, legacy records, atomic accounting, idempotency and request leases. No production database write was needed.

### Required operator actions before release

1. Supply matching live Clerk publishable/secret keys. Both current keys are development-instance keys.
2. Set the actual HTTPS `SITE_URL`. No production domain is guessed; an unset local origin intentionally produces no canonical/public sitemap entries.
3. Confirm the intended production Convex deployment, Clerk issuer and `convex` JWT template, shared credit secret, origins/redirects, plan entitlements and provider restrictions. Current read-only connectivity checks do not prove the future production configuration.
4. Use a supported security patch of Node 24 and a Next-capable host with the existing AI route's 60-second execution allowance. Real AI latency/retry behavior under the host's limit needs acceptance testing.
5. Run a dedicated authenticated test-account acceptance pass against the intended environment, covering generation/save/reopen/credits and checkout navigation without a real purchase.

Local web environment validation passes. Production validation deliberately fails with three issues: missing `SITE_URL`, test publishable key and test secret key. The backend Clerk issuer is an additional operator verification item, not proof that it is absent. No schema migration was introduced or executed.

## E. Final verification matrix

PASS means the stated test actually ran; isolated and live checks are distinguished.

| Area | Status | Evidence / limit |
| --- | --- | --- |
| Clean lockfile installation / dependency tree | PASS | npm ci with scripts disabled; npm ls; lock root checks |
| Lint | PASS | Zero errors; two existing no-img-element optimization warnings retained |
| TypeScript | PASS | `tsc --noEmit` |
| Isolated API/database-policy tests | PASS | 18 tests in `npm test`; real handler code with isolated transports/storage |
| Production compilation | PASS | `npm run verify` includes `next build` |
| Production startup | PASS | Actual `next start` on port 3100; HTTP and browser smoke checks |
| Home layout/input/upload selection | PASS | Seven viewport sizes, both themes, file chooser and selected-file status |
| Typewriter / cinematic theme / reduced motion | PASS | Multiple examples, focus/input behavior, crossfade, synchronization, persistence and reduced motion |
| Pricing plans and existing billing switch | PASS | Live Clerk table; prices preserved; keyboard switch round-trip; no checkout/purchase |
| Contact validation and draft/copy workflow | PASS | Required fields, topic, preserved inputs, success status and clipboard test transport |
| Contact email delivery / newsletter enrollment / attachment ingestion | NEEDS CONFIGURATION | Existing product lacks these service workflows; draft/coming-soon/selection feedback is preserved |
| Dashboard rendering / controls / states | PASS | Actual components with isolated populated, empty and loading data; search/sort/pagination/trip links/dialog |
| Planner conversation, edit, retry and save/delete outcomes | PASS | Isolated browser flows; 18 theme/width conversational combinations plus failure-path and initialization regressions |
| Authentication route protection | PASS | Real production anonymous redirects and safe API 401s |
| Clerk sign-in/up rendering and safe return URLs | PASS | Real forms in both themes at five widths, including 320px; no forms submitted |
| Account initialization failure / retry | PASS | Actual provider in isolated browser fixture; generic error boundary and successful retry |
| Live authenticated login, trip CRUD and credit debit | NOT TESTED | No approved authenticated test session; no real trips created/modified/deleted |
| Live Gemini generation | NOT TESTED | Model metadata GET succeeded; actual responses/credit-consuming generation tested only through isolated transport |
| Live checkout / subscription transitions | NOT TESTED | No authenticated checkout or purchase performed |
| Read-only external service connectivity | PASS | Gemini model metadata, Mapbox style, Convex shared-credit read and anonymous account rejection |
| Database schema migration | NOT TESTED | No schema change; no migration required by this audit or executed |
| Navbar/mobile navigation/focus/dialogs | PASS | Public navigation, mobile account actions, focus restoration and keyboard controls |
| Responsive visual preservation | PASS | 56 matched pairs and numeric geometry comparisons; narrow-screen auth overflow separately fixed |
| Full WCAG / assistive-technology / all contrast combinations | NOT TESTED | Keyboard, labels, touch targets and motion verified; not a complete contrast or screen-reader certification |
| Bundle and asset measurements | PASS | Before/after chunk metrics; all 43 asset hashes identical |
| Real-user Core Web Vitals / cross-browser-device profiling | NOT TESTED | Edge automated checks only; no field data, Lighthouse or Safari/iOS hardware run |
| Dependency security / known-secret browser scan | PASS | npm audit zero; exact configured secret values absent from emitted browser assets |
| Robots/private indexing/local metadata behavior | PASS | Production HTTP checks plus configured-origin/sitemap unit tests |
| Production canonical/social domain and live auth/services | NEEDS CONFIGURATION | Actual origin/live instance setup and post-release checks remain |
| Production deployment | NOT TESTED | Deliberately not deployed; no infrastructure changes authorized |

## F. Documentation and evidence

`.env.example` documents required/optional, server-only/browser-public and Convex-backend settings using placeholders only. `docs/deployment.md` documents runtime, installation, production start/build, services, safe database rollout, hosting requirements, verification and rollback. README no longer claims sample hosting/support details as real configuration. `tests/README.md` explains the actual browser fixtures and commands.

Local evidence is retained under ignored `artifacts/production-audit/`: initial worktree patch, initial/final npm audit JSON, validation log, dependency tree, environment reports, before/after build assets, 112 screenshots, pixel/geometry comparisons, route smoke results, provider lifecycle and planner initialization results. Browser interaction, authentication and planner reports also live under their documented ignored artifact directories. The report intentionally remains readable without committing generated screenshots or secret-bearing local environment files.
