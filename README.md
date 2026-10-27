# TripCraft

TripCraft is an AI travel planner built with Next.js App Router, React, TypeScript and Tailwind CSS. Clerk provides authentication and existing billing plans; Convex stores profiles, trips, chat, saved places, credits and request limits. Gemini powers conversations and itinerary generation, with Google Places imagery and Mapbox maps.

## Local development

Use Node.js 24 and npm 11. Copy `.env.example` to `.env.local`, configure your own services, then run:

```sh
npm ci
npm run check:env
npm run dev
```

The app runs at http://localhost:3000. Configure the Clerk `convex` JWT template and the Convex backend's `CLERK_JWT_ISSUER_DOMAIN` and `TRIP_CREDIT_SECRET` as described in the deployment guide. The web host and Convex must share the same server-only credit secret.

## Validation and production

```sh
npm run check:env -- --production
npm run verify
npm start
```

`verify` runs lint, TypeScript, isolated API/authorization tests and a production build. Browser tests are described in [tests/README.md](tests/README.md). They use isolated transports for mutation and billing-sensitive flows; they are not a replacement for live acceptance testing with an approved account.

See [deployment instructions](docs/deployment.md), [production audit](docs/production-audit.md), [design system](docs/design-system.md) and [hero artwork/motion notes](docs/hero-night.md).

## Existing product boundaries

Contact currently prepares and copies a message draft; it does not send email. Newsletter enrollment is coming soon. The hero chatbox accepts text; its upload control has been removed. Preserve these honest states when integrating external services.

Keep all private credentials server-side. Public `NEXT_PUBLIC_` configuration is embedded during compilation. Never commit `.env.local` or use development Clerk credentials for a production release. No hosting destination or production domain is assumed by the repository.
