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
