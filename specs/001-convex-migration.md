# Spec 001: Migrate RetroShift to Convex

## Overview
Replace Supabase with Convex for database and real-time functionality.

## Current State
- Using Supabase PostgreSQL
- Tables: retros, entries, votes, subscriptions
- Real-time subscriptions for entries
- RLS for security

## Target State
- Convex for database + real-time
- Type-safe queries and mutations
- Automatic real-time updates

## Requirements

### 1. Schema Already Created
File `convex/schema.ts` is ready with:
- users, retros, entries, votes, subscriptions tables
- Proper indexes

### 2. Create Convex Functions

**convex/users.ts:**
```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByWorkosId = query({...});
export const getCurrent = query({...});
export const upsert = mutation({...});
export const updatePlan = mutation({...});
```

**convex/retros.ts:**
```typescript
export const list = query({...}); // User's retros
export const getByCode = query({...}); // Public access by code
export const create = mutation({...}); // With 3-retro limit check
export const update = mutation({...});
export const close = mutation({...});
export const remove = mutation({...});
export const countByUser = query({...}); // For limit check
```

**convex/entries.ts:**
```typescript
export const listByRetro = query({...}); // Real-time entries
export const create = mutation({...}); // With participant limit + link expiry
export const countParticipants = query({...});
```

**convex/votes.ts:**
```typescript
export const listByEntry = query({...});
export const upsert = mutation({...}); // Create or update vote
export const remove = mutation({...});
```

### 3. Implement Free Tier Limits in Convex

In `convex/retros.ts` create mutation:
- Check user plan
- If free: max 3 active retros
- Throw error if limit reached

In `convex/entries.ts` create mutation:
- Check retro owner plan
- If free: max 10 participants, 7-day link expiry
- Throw descriptive errors

### 4. Update Frontend Components

Replace all Supabase calls with Convex:

**src/app/my-retros/page.tsx:**
```typescript
// Before
const { data } = await supabase.from('retros').select('*')

// After
const retros = useQuery(api.retros.list);
```

**src/app/dashboard/[code]/page.tsx:**
```typescript
// Real-time entries
const entries = useQuery(api.entries.listByRetro, { retroId });
// Automatic updates, no manual subscription needed!
```

**src/app/r/[code]/page.tsx:**
```typescript
const retro = useQuery(api.retros.getByCode, { code });
const submitFeedback = useMutation(api.entries.create);
```

### 5. Remove Supabase Dependencies

After migration complete:
- Remove `@supabase/supabase-js`
- Remove `src/lib/supabase.ts`
- Remove `src/lib/supabase/client.ts`
- Update environment variables

### 6. Add Convex Provider

Update `src/app/layout.tsx`:
```typescript
import { ConvexClientProvider } from "@/components/ConvexClientProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
```

## Files to Create
- `convex/users.ts`
- `convex/retros.ts`
- `convex/entries.ts`
- `convex/votes.ts`
- `convex/subscriptions.ts`
- `src/components/ConvexClientProvider.tsx`

## Files to Modify
- `src/app/layout.tsx`
- `src/app/my-retros/page.tsx`
- `src/app/dashboard/[code]/page.tsx`
- `src/app/r/[code]/page.tsx`
- `src/app/create/page.tsx`
- `src/app/api/retros/route.ts` → Delete (use Convex mutations)
- `src/app/api/feedback/route.ts` → Delete (use Convex mutations)
- `src/components/AISummary.tsx`
- `src/components/VoteButtons.tsx`

## Acceptance Criteria
- [ ] All data operations use Convex
- [ ] Real-time updates work without manual subscriptions
- [ ] Free tier limits enforced (3 retros, 10 participants, 7 days)
- [ ] No Supabase dependencies remain
- [ ] Build passes
- [ ] All existing functionality preserved
