# TripCraft deployment

## Runtime and services

This is a Next.js App Router application, not a Vite SPA. Use Node.js 24 and npm 11 (`.nvmrc`, `packageManager`, and `package-lock.json` pin the supported line). The audit ran on Node 24.12.0 / npm 11.6.2. Keep the hosting runtime on a supported security patch of Node 24.

Required services are Clerk (authentication and the existing billing plans), Convex (profiles, trips, chat, saved places, transactional credits and request limits), Google Gemini, Google Places, and Mapbox. Vercel is mentioned in the original project documentation, but no checked-in hosting project binding establishes the production destination. A Node-capable Next.js host is required; static export is unsuitable for these server APIs.

## Environment setup

Copy `.env.example` to `.env.local` for local work. Put production values in the host's environment manager. Never commit secrets or copy development credentials into production.

| Variable | Exposure | Requirement |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Browser public | Required; production Clerk instance |
| `CLERK_SECRET_KEY` | Server only | Required; must match the publishable key's instance |
| `NEXT_PUBLIC_CONVEX_URL` | Browser public | Required; intended Convex deployment |
| `TRIP_CREDIT_SECRET` | Server only | Required, cryptographically random, at least 32 characters; identical in the web host and Convex |
| `GEMINI_API_KEY` | Server only | Required for AI conversations/generation |
| `GOOGLE_PLACE_API_KEY` | Server only | Required for place images and signed photo URLs |
| `NEXT_PUBLIC_MAPBOX_API_KEY` | Browser public | Required for maps; use a public token restricted to approved site origins |
| `SITE_URL` | Server configuration | Required in production; actual HTTPS origin, without route/query/fragment; controls canonical, Open Graph and sitemap URLs |
| `GEMINI_MODEL` | Server configuration | Optional; default `gemini-3.5-flash-lite`; confirm availability before changing |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Browser public | Optional; defaults in example reflect existing routes |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Browser public | Optional; dashboard/planner fallback paths |
| `CONVEX_DEPLOYMENT` | Operator/CLI only | Required when linking/deploying Convex through its CLI |

Configure `CLERK_JWT_ISSUER_DOMAIN` on **Convex**, using the intended Clerk issuer. It need not be set on the web host. Configure Clerk's `convex` JWT template, allowed origins, sign-in/sign-up URLs and redirects for the real domain. Confirm the existing `monthly` and `annually` plan identifiers and entitlements in the production Clerk instance; do not substitute new pricing or make test purchases against live billing.

Restrict Google credentials to the required APIs and appropriate server restrictions. Browser map tokens are intentionally public; privileged model, Clerk, Google Places and credit secrets must never use `NEXT_PUBLIC_`.

Changing browser-public variables requires rebuilding. Preview deployments must use compatible Clerk/Convex environments and explicitly approved preview origins.

## Install, validate, build and start

```sh
npm ci
npm run check:env
npm run check:env -- --production
npm run verify
npm start -- --port 3000
```

`verify` runs lint, TypeScript, isolated API/database-policy tests and the actual production compiler. Production environment checking intentionally rejects development Clerk keys and missing/local/example `SITE_URL`. A passing build alone does not certify external service configuration.

Use the host's Next.js integration, install with `npm ci`, and build with `npm run build`. For a self-managed Node host, run `npm start` behind an HTTPS reverse proxy with process supervision. Serve `public/` and `/_next/` assets without requiring login. `proxy.ts` handles Clerk route protection; preserve it and Next's generated server output. Do not deploy only the static directory.

The six local hero assets must remain available at `/hero/`; MP4/WebM variants share aligned geometry and synchronized playback. The day/night assets and animation CSS are part of the approved design.

## Database deployment

No schema migration or data reset was introduced by this audit. Deploy the checked-in Convex schema/functions to the intended Convex project through its normal reviewed deployment workflow when needed. Do not point a production frontend at an unverified development database. Confirm the Clerk issuer and shared credit secret in that backend before serving traffic. Never reset, truncate or backfill production data as an installation step.

## Release verification

1. Run production environment validation in the intended hosting environment before building.
2. Open Home, Pricing, Contact, legal pages, sign-in and sign-up. Confirm assets, metadata and public navigation.
3. Verify anonymous dashboard/planner access redirects to authentication, and anonymous protected APIs return a safe 401.
4. With an approved test account, verify session refresh, profile initialization, own-trip listing, saving/reopening a newly created test trip, credit accounting and permitted edit/delete actions. Use dedicated test data, never another person's trips.
5. Confirm Clerk billing plans and checkout navigation without completing a real purchase. Check Maps/Places and AI generation within the agreed test budget.
6. Review both themes and mobile/laptop layouts; verify theme persistence, two clouds, upload selection, typewriter and the synchronized day/night transition.
7. Confirm `/robots.txt`, `/sitemap.xml` and canonical/social URLs contain the actual production origin and exclude private routes.
8. Monitor generic API error rates, slow upstream calls and account initialization failures without logging credentials, prompts or personal records.

The current Contact page prepares/copies a message draft; it does not send mail. Newsletter enrollment is explicitly coming soon. Hero attachments currently support selection feedback, not document ingestion. These are existing product limitations, not services added by the audit. Do not advertise delivery, enrollment or ingestion until their service workflows exist and are tested.

## Rollback

Keep the previous deployment and its matching lockfile, environment version and static assets. Roll back through the host's normal release controls, or rebuild that release with its matching browser-public configuration. Check authentication and credit reads after rollback. This audit did not change the database schema, so it requires no database rollback. Do not revert shared backend functions or data without a separate compatibility review. Previously vulnerable dependency versions should not be restored as a long-term fix.

See [production-audit.md](production-audit.md) for measured evidence and outstanding release requirements. No production deployment, DNS change, real purchase, real contact submission or destructive database action was performed.
