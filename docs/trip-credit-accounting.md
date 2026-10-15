# Trip credits

Balances now live in Convex instead of using Arcjet token-bucket requests as a balance query. Arcjet rejects a zero-token request; the old UI replaced that failure with the full capacity.

- Free accounts have a capacity of 2 and premium accounts 100.
- The existing refill policy of one credit every 24 hours is preserved.
- Initial balances subtract already saved trips so existing use is not silently erased.
- An atomic mutation stores a generated plan and deducts one credit together.
- A repeated request ID returns the stored plan and does not debit again.
- Failed generation does not debit; concurrent requests cannot overdraw the balance.
- Clerk billing determines the plan, with existing admin-assigned database subscriptions retained.
- The browser receives the updated balance directly with the plan. Status reads never change it.

## Deployment

The local environment and existing **development** Convex deployment are configured. Production needs the same high-entropy `TRIP_CREDIT_SECRET` in the Next.js server environment and its corresponding Convex deployment. It must never use a `NEXT_PUBLIC_` prefix or be sent to browser code. Deploy the new Convex schema/functions before the frontend. No production deployment was performed.

Credit operations reject missing or invalid server credentials. The app displays an unavailable state instead of a fabricated balance when the service cannot be reached.

## Verification

Run `node --test tests/api-routes.test.cjs` for route contracts and credit-policy checks with external transports mocked. Live development verification also covered 100→99, duplicate replay, zero-balance denial, concurrent last-credit requests, and unauthorized access. Synthetic test accounts and the temporary internal cleanup function were removed afterward.
