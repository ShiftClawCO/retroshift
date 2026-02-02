# CLAW.md — RetroShift Project Config

*Configurazione per sessioni di sviluppo autonome.*

---

## 🚀 Quick Start

```bash
cd /Users/shiftclaw/.openclaw/workspace/retroshift
npm run dev  # http://localhost:3000
```

## 📦 Stack

| Layer | Tech | Config |
|-------|------|--------|
| Framework | Next.js 16 + Turbopack | `next.config.ts` |
| Styling | Tailwind v4 + shadcn/ui | `globals.css`, `components/ui/` |
| DB | Supabase | Project: `okoogbfkhluyulbjhmkm` |
| AI | Groq (Llama 3.3 70B) | `GROQ_API_KEY` |
| i18n | next-intl | `messages/it.json`, `messages/en.json` |
| Deploy | Vercel | Project: `swiftclaws-projects/retroshift` |

## 🔑 Environment Variables

**Local**: `.env.local`
**Production**: Vercel Dashboard → Settings → Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://okoogbfkhluyulbjhmkm.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `GROQ_API_KEY` | Groq API key |

⚠️ **Attenzione**: Quando copi su Vercel, verifica che non ci siano a capo o spazi extra!

## 🗂 Struttura Chiave

```
src/
├── app/
│   ├── page.tsx              # Landing
│   ├── create/page.tsx       # Crea retro
│   ├── r/[code]/page.tsx     # Partecipa (team)
│   ├── dashboard/[code]/     # Dashboard SM
│   └── api/summary/route.ts  # AI summary endpoint
├── components/
│   ├── ui/                   # shadcn components
│   ├── Header.tsx
│   ├── AISummary.tsx
│   ├── Leaderboard.tsx
│   └── VoteButtons.tsx
├── lib/
│   ├── supabase.ts          # Client + types
│   └── category-icons.tsx   # Icon/color mapping
├── hooks/
│   └── useKeyboardShortcuts.ts
└── styles/
    └── shiftclaw-kit.ts     # Design tokens
```

## 🎨 Design System

- **Icons**: Lucide (no emoji) — config in `category-icons.tsx`
- **Theme**: Dark default, light available
- **Colors**: shadcn Slate palette
- **Layout**: `container mx-auto px-4` su tutte le pagine

## 🚢 Deploy Workflow

```bash
# 1. Commit changes
git add -A && git commit -m "feat: description"

# 2. Push to GitHub
git push

# 3. Deploy to Vercel
vercel --prod --yes

# 4. Test production
curl https://retroshift.vercel.app/api/summary -X POST ...
```

## ✅ Checklist Pre-Deploy

- [ ] `npm run build` passa senza errori
- [ ] Test E2E: `npx playwright test`
- [ ] Env vars configurate su Vercel (senza a capo!)
- [ ] Verificare visivamente pagine principali

## 🐛 Troubleshooting

| Problema | Causa | Fix |
|----------|-------|-----|
| "Retro not found" | Wrong ID format | Usare UUID, non access_code |
| "Connection error" | Env var malformata | Rimuovere spazi/a capo |
| Build fail TypeScript | Type errors | `npm run build` locale prima |

## 📋 TODO (Prossime Sessioni)

- [ ] SQL constraint per 👎 (Dodo deve eseguire)
- [ ] Free tier limits (3 retro, 10 partecipanti)
- [ ] LemonSqueezy integration
- [ ] PDF export
- [ ] Browser automation per visual checks
- [ ] Telegram integration per async comms

## 🔐 Permessi

**Posso fare**:
- Codice su branch (commit, push)
- Dev server locale
- Deploy Vercel con `--prod`
- Modifiche DB schema (migration files)

**Devo chiedere**:
- Esecuzione SQL diretta su Supabase prod
- Modifiche pricing/billing
- Comunicazioni pubbliche

---

*Ultimo update: 2026-02-02*
