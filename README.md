# 🔄 RetroShift

Retrospettive anonime e asincrone per team agile.

## Features

- **Anonimato**: Il team può esprimersi liberamente
- **Async**: Ognuno risponde quando vuole
- **Formati multipli**: Start/Stop/Continue, Mad/Sad/Glad, Liked/Learned/Lacked
- **Real-time**: I feedback appaiono in tempo reale nella dashboard
- **Zero friction**: Nessun login richiesto per partecipare

## Quick Start

### 1. Setup Supabase

1. Crea un nuovo progetto su [supabase.com](https://supabase.com)
2. Vai su SQL Editor ed esegui `supabase/schema.sql`
3. Copia URL e anon key dal progetto

### 2. Configura l'ambiente

```bash
cp .env.example .env.local
# Modifica .env.local con i tuoi valori Supabase
```

### 3. Installa e avvia

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

## Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deploy**: Vercel

## Roadmap

- [ ] Voting sui feedback
- [ ] Export PDF
- [ ] Storico retro
- [ ] Timer countdown
- [ ] Integrazione Slack/Teams

---

Made with 🦞 by [Shiftclaw](https://shiftclaw.com)
