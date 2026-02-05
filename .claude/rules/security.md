# Security Rules

- Every authenticated Convex query/mutation MUST use RLS (`queryWithRLS`/`mutationWithRLS` from `convex/functions.ts`)
- Webhook-only functions MUST be `internalMutation`/`internalQuery` — Convex `mutation`/`query` are ALWAYS publicly callable
- Never expose userId, email, or PII to unauthorized users
- Env vars on Vercel: ALWAYS use `printf 'value'`, NEVER `echo` — echo appends `\n` which gets URL-encoded as `%0A`
- Secrets never in code, never in logs, never in git-tracked files
- `npm audit` before every release: zero critical/high vulnerabilities
- Client input is untrusted: validate and sanitize everything
- API routes must check authentication unless explicitly public (whitelist in middleware)
