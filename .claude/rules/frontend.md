---
paths:
  - "src/**/*.{ts,tsx}"
---

# Frontend Rules

- Server Components by default — Client Components (`"use client"`) only when interactivity is needed
- shadcn/ui for all UI components — check `src/components/ui/` for available components
- Lucide React for icons — NEVER use emoji in UI
- Translations: every user-visible string MUST go in both `messages/en.json` AND `messages/it.json`
- Dark mode default — use `next-themes` for toggle, test both themes
- Error handling: `catch (err: unknown)` with `instanceof Error` narrowing
- Toast notifications via `sonner` for user feedback
- Use `next/link` for navigation, `next/image` for optimized images
- Middleware at `src/middleware.ts` — public API routes whitelisted explicitly
