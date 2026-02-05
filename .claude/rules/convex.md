---
paths:
  - "convex/**/*.ts"
---

# Convex Rules

- Convex IS the backend — no API routes for CRUD operations
- API routes exist ONLY for: Stripe webhook, auth token bridge, AI summary
- Use `queryWithRLS`/`mutationWithRLS` from `convex/functions.ts` for authenticated endpoints
- Public participant endpoints (entries.create, votes.upsert) use standard `mutation` — document WHY they're public
- Webhook-only functions use `internalMutation`/`internalQuery` (not callable from client)
- RLS rules are centralized in `convex/rules.ts` — never scatter auth checks
- Auth helpers in `convex/auth.ts` (`getCurrentUser`, `requireCurrentUser`)
- Schema defined in `convex/schema.ts` — validate all new fields with Convex validators
- Bridge layer for Stripe in `convex/stripe.ts` — public actions that call internal mutations
