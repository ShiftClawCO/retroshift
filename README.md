# RetroShift

Async, anonymous retrospectives for agile teams. Create retros, share an access code, collect feedback and votes — no login required for participants.

## Features

- **Anonymous** — participants express themselves freely
- **Async** — everyone responds on their own time
- **Multiple formats** — Start/Stop/Continue, Mad/Sad/Glad, Liked/Learned/Lacked
- **Real-time** — feedback appears instantly via Convex live queries
- **Zero friction** — no login required to participate (access code only)
- **AI summaries** — Groq-powered retro summaries (Pro)
- **PDF export** — download retro reports (Pro)
- **Stripe billing** — free tier + Pro with checkout and customer portal
- **i18n** — English and Italian

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| UI | shadcn/ui + Tailwind v4 + Lucide icons |
| Database | Convex (realtime, type-safe) |
| Auth | WorkOS AuthKit (Google OAuth + email/password) |
| Payments | Stripe (checkout + webhook + portal) |
| AI | Groq (Llama 3.3 70B) |
| i18n | next-intl (EN + IT) |
| Deploy | Vercel |

## Getting started

### Prerequisites

- Node.js 20+
- A [Convex](https://convex.dev) project
- A [WorkOS](https://workos.com) account with AuthKit configured
- A [Stripe](https://stripe.com) account with products/prices set up
- A [Groq](https://groq.com) API key

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in:

```
# Convex
CONVEX_DEPLOYMENT=...
NEXT_PUBLIC_CONVEX_URL=...

# WorkOS
WORKOS_API_KEY=...
WORKOS_CLIENT_ID=...
WORKOS_COOKIE_PASSWORD=...
NEXT_PUBLIC_WORKOS_REDIRECT_URI=...

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...

# Groq
GROQ_API_KEY=...
```

### 3. Start Convex

```bash
npx convex dev
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm test` | Playwright tests |
| `npx convex dev` | Convex dev mode |

## Architecture

- **Auth flow**: WorkOS AuthKit → custom JWT bridge → Convex identity
- **RLS**: centralized rules in `convex/rules.ts` → `queryWithRLS` / `mutationWithRLS`
- **Payments**: Stripe webhook → Next.js API route → Convex internal mutations
- **Schema**: `convex/schema.ts`

---

Made with Shiftclaw
