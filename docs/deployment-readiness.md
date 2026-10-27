# Current deployment readiness — 27 October 2026

The generated-artwork update is implemented and locally verified. Deployment remains gated on the operator's production service configuration; nothing has been deployed.

| Check | Result |
| --- | --- |
| Lint | PASS — zero errors, two existing image-optimization warnings |
| TypeScript | PASS |
| API/authorization/request-hardening tests | PASS — 18 tests |
| Actual production compilation and startup | PASS — Next.js production build, fresh local server on port 3110 |
| Dependency audit | PASS — zero known advisories |
| New static images | PASS — all 24 descriptive WebP URLs return 200; all 12 pairs share dimensions |
| Browser artwork checks | PASS — 390px mobile and 1280px laptop, both themes; descriptive alt text, no horizontal overflow, correct auth/dashboard image layering |
| Production route smoke | PASS — public routes, anonymous API protection, dashboard/planner redirects, signed-photo rejection and guest prompt continuation |
| Removed upload control | PASS — no hero file input; text planning remains functional |
| Missing-image fallbacks | PASS — references to deleted beach/food/mountain files replaced with generated assets |
| Known private credentials in browser assets | PASS — configured private values not found in emitted client JS/CSS |
| Production environment release gate | NEEDS CONFIGURATION — real HTTPS `SITE_URL` and matching live Clerk keys |
| Live authenticated trip mutations, paid AI generation and checkout | NOT TESTED — requires an approved test account/environment; no real data writes or purchases performed |

Use `npm run build:production` as the hosting build command. It runs the production environment gate before the Next.js compiler. `npm run verify` remains the local lint/types/tests/build validation command.

Before release, configure the live Clerk instance, intended Convex deployment and issuer/JWT template, shared credit secret, allowed origins/redirects and provider restrictions. Rebuild after setting browser-public environment variables. Complete an authenticated acceptance pass with dedicated test data. Contact remains draft-only and newsletter enrollment remains unimplemented.

Current evidence is under ignored `artifacts/illustration-generation/`: `final-validation.log`, `npm-audit.json`, `browser-verification.json`, mobile/desktop screenshots, `asset-report.json`, and `client-secrets.json`. The original API/route smoke runner also records `artifacts/production-audit/route-smoke.json`.

See [deployment instructions](deployment.md), [environment template](../.env.example), and the [illustration catalog and prompts](travel-illustrations.md). Earlier audit measurements are historical; the artwork update adds 24 new assets and does not claim pixel equality with the former photographs. The original 24 light/dark photographs remain backed up in their existing directories.
