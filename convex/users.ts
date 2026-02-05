import { query, mutation } from "./_generated/server";
import { queryWithRLS } from "./functions";
import { v } from "convex/values";

// ─── Authenticated endpoints (RLS-protected) ──────────────

/**
 * Get user by WorkOS ID.
 * RLS ensures only own record is returned.
 */
export const getByWorkosId = queryWithRLS({
  args: { workosId: v.string() },
  handler: async (ctx, args) => {
    if (!ctx.user) return null;

    // Verify the caller's identity matches the requested workosId
    // (defense-in-depth — RLS also filters)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.workosId) return null;

    // RLS-wrapped db: only returns own user record
    return await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", args.workosId))
      .first();
  },
});

/**
 * Get current authenticated user.
 * RLS ensures only own record is returned.
 */
export const getCurrent = queryWithRLS({
  args: {},
  handler: async (ctx) => {
    // ctx.user is already resolved by the RLS builder
    return ctx.user;
  },
});

// ─── Server-side / webhook endpoints (no RLS) ─────────────
// These are called from Stripe webhooks and validated by signature.
// They need unrestricted db access.

/**
 * Get user by Stripe customer ID.
 * Server-side only — called from Stripe webhook (validated by signature).
 */
export const getByStripeCustomer = query({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_stripe_customer", (q) =>
        q.eq("stripeCustomerId", args.stripeCustomerId)
      )
      .first();
  },
});

/**
 * Upsert user (create or update from WorkOS auth flow).
 * Uses standard mutation because it needs to handle user creation
 * (user may not exist yet on first login).
 */
export const upsert = mutation({
  args: {
    workosId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.workosId) {
      throw new Error("Not authenticated");
    }

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
      workosId: args.workosId,
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      plan: "free",
      createdAt: Date.now(),
    });
  },
});

/**
 * Update user plan.
 * Server-side only — called from Stripe webhook (validated by signature).
 */
export const updatePlan = mutation({
  args: {
    workosId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    plan: v.union(v.literal("free"), v.literal("pro")),
  },
  handler: async (ctx, args) => {
    let user;

    if (args.workosId) {
      const workosId = args.workosId;
      user = await ctx.db
        .query("users")
        .withIndex("by_workos_id", (q) => q.eq("workosId", workosId))
        .first();
    } else if (args.stripeCustomerId) {
      const stripeCustomerId = args.stripeCustomerId;
      user = await ctx.db
        .query("users")
        .withIndex("by_stripe_customer", (q) =>
          q.eq("stripeCustomerId", stripeCustomerId)
        )
        .first();
    }

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { plan: args.plan });
    return user._id;
  },
});

/**
 * Update Stripe customer ID.
 * Server-side only — called from Stripe webhook (validated by signature).
 */
export const updateStripeCustomer = mutation({
  args: {
    workosId: v.string(),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", args.workosId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      stripeCustomerId: args.stripeCustomerId,
    });
    return user._id;
  },
});
