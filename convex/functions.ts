/**
 * Custom query/mutation builders with Row Level Security.
 *
 * These builders wrap the standard Convex `query` and `mutation` with:
 * 1. Automatic user resolution from WorkOS auth
 * 2. Database wrapper that enforces per-row access rules
 *
 * Usage:
 *   import { queryWithRLS, mutationWithRLS } from "./functions";
 *
 *   export const myQuery = queryWithRLS({
 *     args: { ... },
 *     handler: async (ctx, args) => {
 *       // ctx.user is Doc<"users"> | null
 *       // ctx.db is wrapped with RLS rules
 *       if (!ctx.user) return [];
 *       return await ctx.db.query("retros")...
 *     },
 *   });
 *
 * For public/webhook endpoints that should bypass RLS, import the standard
 * `query` and `mutation` directly from "./_generated/server".
 */

import {
  customQuery,
  customMutation,
  customCtx,
} from "convex-helpers/server/customFunctions";
import {
  wrapDatabaseReader,
  wrapDatabaseWriter,
} from "convex-helpers/server/rowLevelSecurity";
import { query, mutation } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { rules, type RuleCtx } from "./rules";

/**
 * Query builder with RLS.
 *
 * Resolves the authenticated user (may be null) and wraps `ctx.db`
 * with row-level security rules. Handlers receive `ctx.user` for
 * convenience and should return empty results when user is null.
 *
 * Does NOT throw on unauthenticated access — queries gracefully
 * return empty/null. The RLS rules automatically filter out
 * documents the user shouldn't see.
 */
export const queryWithRLS = customQuery(
  query,
  customCtx(async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    let user: Doc<"users"> | null = null;
    if (identity) {
      user = await ctx.db
        .query("users")
        .withIndex("by_workos_id", (q) =>
          q.eq("workosId", identity.subject)
        )
        .first();
    }

    // Build the rule context with the ORIGINAL db so rules
    // can look up related docs without recursive RLS.
    const ruleCtx: RuleCtx = { user, db: ctx.db };

    return {
      user,
      db: wrapDatabaseReader(ruleCtx, ctx.db, rules),
    };
  })
);

/**
 * Mutation builder with RLS.
 *
 * Requires authentication — throws "Not authenticated" if no identity.
 * Resolves the user and wraps `ctx.db` with row-level security rules
 * for both reads and writes.
 *
 * For public mutations (anonymous participants) or webhook mutations,
 * use the standard `mutation` from `_generated/server` instead.
 */
export const mutationWithRLS = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) =>
        q.eq("workosId", identity.subject)
      )
      .first();

    if (!user) throw new Error("User not found");

    // Build rule context with ORIGINAL db
    const ruleCtx: RuleCtx = { user, db: ctx.db };

    return {
      user,
      db: wrapDatabaseWriter(ruleCtx, ctx.db, rules),
    };
  })
);
