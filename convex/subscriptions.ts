import { internalQuery, internalMutation } from "./_generated/server";
import { queryWithRLS } from "./functions";
import { v } from "convex/values";

// ─── Authenticated endpoints (RLS-protected) ──────────────

/**
 * Get subscription by user ID.
 * RLS ensures only own subscription is returned.
 */
export const getByUser = queryWithRLS({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    if (!ctx.user) return null;

    // RLS-wrapped db: only returns subscriptions for the authenticated user
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();
  },
});

/**
 * Get current user's subscription.
 * RLS ensures only own subscription is returned.
 */
export const getCurrent = queryWithRLS({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) return null;

    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user!._id))
      .order("desc")
      .first();
  },
});

// ─── Server-side / webhook endpoints (no RLS) ─────────────
// These are called from Stripe webhooks and validated by signature.

/**
 * Get subscription by Stripe subscription ID.
 * Internal only — called from Convex actions (webhook processing).
 */
export const getByStripeId = internalQuery({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();
  },
});

/**
 * Create subscription.
 * Internal only — called from Convex actions (webhook processing).
 */
export const create = internalMutation({
  args: {
    workosId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    status: v.string(),
    currentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", args.workosId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    return await ctx.db.insert("subscriptions", {
      userId: user._id,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripePriceId: args.stripePriceId,
      status: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update subscription.
 * Internal only — called from Convex actions (webhook processing).
 */
export const update = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
    status: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.status !== undefined) updates.status = args.status;
    if (args.currentPeriodEnd !== undefined)
      updates.currentPeriodEnd = args.currentPeriodEnd;
    if (args.cancelAtPeriodEnd !== undefined)
      updates.cancelAtPeriodEnd = args.cancelAtPeriodEnd;

    await ctx.db.patch(subscription._id, updates);
    return subscription._id;
  },
});

/**
 * Cancel subscription.
 * Internal only — called from Convex actions (webhook processing).
 */
export const cancel = internalMutation({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    await ctx.db.patch(subscription._id, {
      status: "canceled",
      updatedAt: Date.now(),
    });

    return subscription._id;
  },
});
