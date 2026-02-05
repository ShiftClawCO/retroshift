# RetroShift — Project Instructions

SaaS for async retrospectives. Teams create retros, participants add entries and vote anonymously via access code.

## Stack
- **Framework**: Next.js 16 (App Router, Turbopack) + TypeScript strict
- **UI**: shadcn/ui + Tailwind v4 + Lucide icons + next-themes (dark default)
- **DB**: Convex (realtime, type-safe) — deployment `dusty-flamingo-760`
- **Auth**: WorkOS AuthKit (Google OAuth + email/password) → custom JWT bridge → Convex identity
- **Payments**: Stripe (checkout + webhook + portal) — Pro tier with PDF export, unlimited retros
- **AI**: Groq (Llama 3.3 70B) for retro summaries
- **i18n**: next-intl (EN primary, IT secondary)
- **Deploy**: Vercel — `dev` branch = preview, `main` = production

## Quick commands
- `npm run dev` — dev server on localhost:3000
- `npm run build` — verify production build
- `npx convex dev` — Convex dev mode with live push

## Architecture
- Auth flow: @src/lib/auth.ts → @src/app/api/auth/token/route.ts → @convex/auth.config.ts
- RLS: @convex/rules.ts (centralized rules) → @convex/functions.ts (queryWithRLS/mutationWithRLS)
- Stripe: webhook → @src/app/api/stripe/webhook/route.ts → @convex/stripe.ts (bridge) → internal mutations
- Schema: @convex/schema.ts

## Team
This project is built by Shiftclaw. Sub-agents are defined in @.claude/agents/
Development rules are in @.claude/rules/

## Important
- Work on `dev` branch only. Never `main`.
- Build must pass before committing.
- All rules in .claude/rules/ are mandatory.
