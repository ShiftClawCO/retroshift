/**
 * Stripe integration actions.
 *
 * These public actions serve as secure bridges between Next.js API routes
 * (which verify Stripe webhook signatures / user auth) and internal
 * Convex mutations that are not directly callable from external clients.
 *
 * Security model:
 * - Stripe webhook route verifies the webhook signature before calling these
 * - Checkout route verifies user session before calling these
 * - The underlying mutations are internalMutation (not publicly accessible)
 */

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Handle checkout.session.completed webhook event.
 * Called from the Next.js Stripe webhook route after signature verification.
 */
export const fulfillCheckout = action({
  args: {
    workosId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    status: v.string(),
    currentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.subscriptions.create, {
      workosId: args.workosId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripePriceId: args.stripePriceId,
      status: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
    });

    await ctx.runMutation(internal.users.updatePlan, {
      workosId: args.workosId,
      plan: "pro",
    });
  },
});

/**
 * Handle customer.subscription.updated webhook event.
 * Called from the Next.js Stripe webhook route after signature verification.
 */
export const handleSubscriptionUpdated = action({
  args: {
    stripeSubscriptionId: v.string(),
    status: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    stripeCustomerId: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro")),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.runMutation(internal.subscriptions.update, {
        stripeSubscriptionId: args.stripeSubscriptionId,
        status: args.status,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      });
    } catch (err) {
      // Subscription may not exist yet if this fires before checkout.session.completed
      console.warn("Could not update subscription:", err);
    }

    await ctx.runMutation(internal.users.updatePlan, {
      stripeCustomerId: args.stripeCustomerId,
      plan: args.plan,
    });
  },
});

/**
 * Handle customer.subscription.deleted webhook event.
 * Called from the Next.js Stripe webhook route after signature verification.
 */
export const handleSubscriptionDeleted = action({
  args: {
    stripeSubscriptionId: v.string(),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.runMutation(internal.subscriptions.update, {
        stripeSubscriptionId: args.stripeSubscriptionId,
        status: "canceled",
      });
    } catch (err) {
      console.warn("Could not update subscription on delete:", err);
    }

    await ctx.runMutation(internal.users.updatePlan, {
      stripeCustomerId: args.stripeCustomerId,
      plan: "free",
    });
  },
});

/**
 * Link a Stripe customer ID to a user.
 * Called from the Next.js checkout route after user auth verification.
 */
export const linkStripeCustomer = action({
  args: {
    workosId: v.string(),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.users.updateStripeCustomer, {
      workosId: args.workosId,
      stripeCustomerId: args.stripeCustomerId,
    });
  },
});
