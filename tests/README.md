# Tests

Run the API and backend regression checks from the repository root:

```sh
node --test tests/api-routes.test.cjs tests/backend-access.test.cjs
```

Browser checks require Playwright, Microsoft Edge, and a running application or
the planner fixture server. Scripts that accept `PLAYWRIGHT_MODULE` can use an
external Playwright installation. Check each script for its server URL and
environment options before running it.

For landing-page scroll stability:

```sh
LANDING_URL=http://localhost:3000 node tests/landing-scroll-stability.cjs
```

Set environment variables using your shell's syntax (for example,
`$env:LANDING_URL='http://localhost:3000'` in PowerShell).

Screenshots, exported PDFs, and diagnostic results are generated under
`artifacts/` and ignored by Git. Fixture bundles under `tmp/` are also ignored.
Keep test source and fixtures in this directory; do not commit generated output.

## Four-page design-system review

With the app running on port 3000, run `node tests/design-system-fixture/server.cjs`
in a second terminal. This test-only server renders the actual dashboard components
with isolated account/data transports; it never changes production authentication
or writes to a user database. Then run:

```sh
node tests/design-system-browser.cjs
node tests/design-system-interactions.cjs
```

The browser review covers all four pages in both themes at seven viewport sizes.
The interaction checks include the live pricing switch (no checkout), draft-only
contact handling, and dashboard populated/empty/loading states. Reports and
screenshots are saved to the ignored `artifacts/design-system` directory.

## Production audit

`npm run verify` runs lint, types, the isolated API/Convex-policy tests, and an
actual production build. `npm run check:env -- --production` is a separate
release gate: development Clerk keys and an absent production origin must fail.

Browser tests require Playwright and an installed Edge browser. They introduce
no production dependency. Set `PLAYWRIGHT_MODULE` to an available Playwright
module path if it is not on Node's module search path. Set `APP_BASE_URL` to the
production server's local origin (the audit used `http://localhost:3100`).

With the production app running, start the dashboard and planner fixture servers
in separate terminals using the same `APP_BASE_URL`. These fixtures bundle real
components with isolated service transports and must never be deployed.

```sh
node tests/design-system-fixture/server.cjs
node tests/planner-fixture/server.cjs
```

Run these checks from another terminal:

```sh
node tests/production-smoke.cjs
node tests/production-visual.cjs after
node tests/hero-night.cjs
node tests/design-system-interactions.cjs
node tests/planner-browser.cjs
node tests/planner-edge-browser.cjs
node tests/planner-init.cjs
node tests/review-fixes-browser.cjs
node tests/provider-lifecycle.cjs
node tests/auth-pages-browser.cjs
node scripts/audit-build.mjs after
node scripts/audit-client-secrets.mjs
```

The visual script uses `baseline`/`after` output directories. Capture the baseline
before editing; `scripts/compare-production.py` (Pillow + NumPy) compares actual
pixel data and measured geometry. It retains raw full-image differences and
separately reports differences below the authentication header. It does not
claim every pixel is identical or replace a complete accessibility audit.

No browser check purchases a plan, submits real contact mail, or edits real
user trips. A live authenticated acceptance pass and production service setup
are still required; see [the audit report](../docs/production-audit.md).
