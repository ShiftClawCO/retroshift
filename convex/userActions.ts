/**
 * User actions — secure bridge for API routes → Convex.
 *
 * These public actions are called from Next.js API routes that have already
 * verified the WorkOS session cookie. They delegate to internal queries to
 * bypass RLS safely.
 *
 * Security model:
 * - API route verifies WorkOS session (getUser() / getSession())
 * - API route passes the authenticated workosId to the action
 * - Action uses internalQuery to bypass RLS
 * - No direct public access to internal queries
 *
 * Pattern reuse: any API route that needs Convex data for an authenticated
 * user should call an action here rather than using RLS-protected queries
 * (which require a Convex auth token the API route doesn't have).
 */

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";

/**
 * Get user by WorkOS ID for Stripe portal/checkout flows.
 *
 * Called from:
 * - /api/stripe/portal (to get stripeCustomerId)
 * - /api/stripe/checkout (to get or check stripeCustomerId)
 *
 * The calling API route MUST verify the WorkOS session before calling this.
 */
export const getUserByWorkosId = action({
  args: { workosId: v.string() },
  handler: async (ctx, args): Promise<Doc<"users"> | null> => {
    const user = await ctx.runQuery(internal.users.getByWorkosIdInternal, {
      workosId: args.workosId,
    });
    return user;
  },
});
