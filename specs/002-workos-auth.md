# Spec 002: Migrate Auth to WorkOS

## Overview
Replace Supabase Auth with WorkOS AuthKit for authentication.

## Current State
- Supabase Auth with Google OAuth
- Session management via Supabase
- User stored in Supabase auth.users

## Target State
- WorkOS AuthKit
- Google OAuth (same flow for users)
- User synced to Convex

## Requirements

### 1. Install WorkOS
```bash
npm install @workos-inc/node @workos-inc/authkit-nextjs
npm uninstall @supabase/supabase-js @supabase/ssr
```

### 2. WorkOS Configuration

Create `src/lib/workos.ts`:
```typescript
import { WorkOS } from '@workos-inc/node';

export const workos = new WorkOS(process.env.WORKOS_API_KEY!);
```

### 3. Auth Middleware

Create/update `src/middleware.ts`:
```typescript
import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: [
      '/',
      '/pricing',
      '/login',
      '/signup', 
      '/r/:code*', // Public retro participation
      '/api/signup', // If any public APIs
    ],
  },
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### 4. Update Login Page

Replace `src/app/login/page.tsx`:
```typescript
import { getSignInUrl, signOut } from '@workos-inc/authkit-nextjs';

export default async function LoginPage() {
  const signInUrl = await getSignInUrl();
  
  return (
    <div>
      <h1>Welcome to RetroShift</h1>
      <a href={signInUrl}>
        <Button>Sign in with Google</Button>
      </a>
    </div>
  );
}
```

### 5. Auth Callback

Create `src/app/auth/callback/route.ts`:
```typescript
import { handleAuth } from '@workos-inc/authkit-nextjs';

export const GET = handleAuth({
  returnPathname: '/my-retros',
  onSuccess: async ({ user }) => {
    // Sync user to Convex
    // Called on every successful auth
  },
});
```

### 6. User Sync to Convex

Create `convex/auth.ts`:
```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const syncUser = mutation({
  args: {
    workosId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", args.workosId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      ...args,
      plan: "free",
      createdAt: Date.now(),
    });
  },
});
```

### 7. useUser Hook

Create `src/hooks/useUser.ts`:
```typescript
"use client";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useUser() {
  const user = useQuery(api.users.getCurrent);
  
  return {
    user,
    isLoading: user === undefined,
    isAuthenticated: !!user,
    isPro: user?.plan === "pro",
  };
}
```

### 8. Update Components Using Auth

**Header.tsx:**
```typescript
import { getUser, signOut } from '@workos-inc/authkit-nextjs';

// Server component
const { user } = await getUser();
```

**Protected pages:**
```typescript
import { withAuth } from '@workos-inc/authkit-nextjs';

// Or use middleware (preferred)
```

### 9. Remove Supabase Auth

Delete:
- `src/app/auth/callback/route.ts` (old Supabase version)
- `src/lib/supabase/client.ts`
- All `createClient()` calls for auth

## Environment Variables

Remove:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Add:
```
WORKOS_API_KEY=sk_xxx
WORKOS_CLIENT_ID=client_xxx
WORKOS_COOKIE_PASSWORD=<random-32-chars>
NEXT_PUBLIC_APP_URL=https://retroshift.vercel.app
```

## WorkOS Dashboard Setup
1. Create organization "RetroShift"
2. Enable AuthKit
3. Add redirect URI: https://retroshift.vercel.app/auth/callback
4. Enable Google OAuth connection
5. Get API Key and Client ID

## Acceptance Criteria
- [ ] Users can sign in with Google
- [ ] Session persists across refreshes
- [ ] User synced to Convex on login
- [ ] Protected routes require auth
- [ ] Sign out works
- [ ] No Supabase auth code remains
- [ ] Existing users can still sign in (email match)

## Files to Create
- `src/lib/workos.ts`
- `src/hooks/useUser.ts`
- `convex/auth.ts`

## Files to Modify
- `src/middleware.ts`
- `src/app/login/page.tsx`
- `src/app/signup/page.tsx`
- `src/app/auth/callback/route.ts`
- `src/components/Header.tsx`
- `src/app/layout.tsx`

## Files to Delete
- `src/lib/supabase.ts`
- `src/lib/supabase/client.ts`
