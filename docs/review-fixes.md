# Project review fixes — 16 October 2026

All seven findings from `artifacts/project-review/REVIEW.md` have fixes and regression coverage.

## Changes

1. **Ownership and authentication**: added `convex/access.ts` and Clerk's Convex provider integration. Public profile, trip, chat, and saved-place operations require a verified identity and enforce ownership. Existing users bind to their Clerk subject after verified-email matching; browser input cannot change subscription entitlement. Account switches reset cached user/trip state. New accounts can read an empty profile while initialization finishes.
2. **Trip persistence**: the planner saves under its URL/conversation ID. Saving an existing plan updates it instead of inserting a duplicate. A session ownership record protects conversations before their first itinerary exists. Switching planner sessions remounts the chat. Landing-page prompts wait for account/session initialization before being sent.
3. **Edited details**: final generation sends a whitelisted, validated trip specification. The model receives these confirmed values with precedence over earlier answers. Invalid duration or oversized values are rejected. Retry IDs incorporate the specification so edits cannot accidentally replay an old itinerary.
4. **Provider request limits**: shared Convex transactions enforce 12 AI requests/minute/account, one active AI request/account, and 30 photo lookups/minute/account. The AI limiter uses the stable Clerk subject, independent of email changes. Duplicate in-flight requests are rejected before provider work. Retry-After headers explain when to retry; leases expire after crashes and are released on completion/failure. Individual model attempts have 60-second timeouts. Completed generation receipts still return without another model call or credit charge.
5. **Scroll animation**: observers rearm at their actual exit boundary, rather than waiting for a position that never generates another callback. A sufficient visible area prevents entrances restarting at the boundary. Section wrappers stay fully opaque. Reduced-motion, focus cancellation, and final full visibility remain supported.
6. **Deletion**: the menu calls an owner-checked mutation which deletes the itinerary and its conversation. A tombstone prevents late requests from recreating a deleted session. Billing receipts remain intact. The UI waits for deletion, reports errors, and navigates only after success.
7. **Notes**: empty text is written back for an existing saved place. New notes can save the place and its initial note in one mutation. The modal exposes a labeled private-notes field and reports save failures.

Generation-save failures retain the original request ID until persistence succeeds. Retrying receives the existing generation receipt, so a failed save does not require another charged generation.

## Development configuration applied

- Created the missing Clerk JWT template named `convex` on the existing development Clerk instance.
- Claims include audience `convex`, the primary email, verified-email status, name, and picture; Clerk supplies the signed subject/issuer.
- Set `CLERK_JWT_ISSUER_DOMAIN` on the existing Convex development deployment.
- Pushed the authenticated functions, schema additions, and indexes to that development deployment.
- Verified anonymous profile/trip/chat/saved-place reads are rejected against the actual development endpoint. No existing user records were read or edited by those smoke tests.

The matching frontend must be deployed to Vercel: it now attaches Clerk tokens to Convex requests. An older frontend using plain `ConvexProvider` is incompatible with the secured backend. For a separate production Convex/Clerk pair, configure the same JWT template and its production issuer, deploy the backend, and deploy the frontend together. Retain the matching `TRIP_CREDIT_SECRET` in Convex and Vercel.

Configuration follows the [Convex Clerk integration](https://docs.convex.dev/auth/clerk) and [Clerk JWT template documentation](https://clerk.com/docs/guides/sessions/jwt-templates).

## Verification

- `node --test tests/backend-access.test.cjs tests/api-routes.test.cjs`: **13 passed**. Covers anonymous/cross-account rejection, verified legacy binding, new-account initialization, stable plan upsert, deletion/tombstones, preserving billing receipts, orphan-chat protection, note clearing, durable limits, edited generation inputs, API validation, and credit accounting.
- `node tests/planner-edge-browser.cjs`: passed at 390px and 1440px. Covers edited inputs reaching the request, stable save IDs, generation failure/retry, credit display, keyboard/focus, themes, reduced motion, and reader position.
- `node tests/review-fixes-browser.cjs`: passed at 390px and 1440px. Covers save failure followed by retry using the same receipt ID, successful and failed deletion, and clearing the real notes field.
- `node tests/motion-regression.cjs`: passed at 1280px/light and 390px/dark. Tests gradual exit/re-entry, scroll-up replay, no boundary restart loop, full final opacity, no horizontal overflow, and reduced motion.
- Development endpoint smoke check: **four anonymous query paths rejected**.
- `npm run build -- --webpack`: passed.
- `npx tsc --noEmit`: passed after the production build.
- `npm run lint`: zero errors, six existing warnings.
- `git diff --check`: passed.

Browser tests use `PLAYWRIGHT_MODULE` for the installed Playwright runtime. Motion tests accept `APP_BASE_URL`; the default is the local production preview on port 3112. Planner fixtures replace external services and do not create real trips or incur model charges. Logs and screenshots are in `artifacts/review-fixes/`.

## Limits

Old conversations that were never associated with an owner cannot safely be assigned automatically. They are denied instead of exposing or handing them to the first caller. Existing saved trips with an owner remain readable. No automatic recovery of historically orphaned conversations is claimed.

Vercel frontend deployment and a real signed-in paid generation/checkout were not performed. Provider calls are mocked in regression tests; live smoke tests verify the unauthenticated boundary. Next.js still reports its existing middleware-to-proxy migration notice.
