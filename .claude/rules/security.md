---
paths:
  - "src/app/api/**/*.ts"
  - "src/middleware.ts"
---

# RetroShift API Security

- Middleware whitelist: only `/api/stripe/webhook` and `/api/auth/token` skip auth
- Stripe webhook: verify signature with `stripe.webhooks.constructEvent()`
- JWT bridge (`/api/auth/token`): validate WorkOS session before minting
- Summary endpoint (`/api/summary`): requires authenticated session
