import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get user by WorkOS ID
export const getByWorkosId = query({
  args: { workosId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", args.workosId))
      .first();
  },
});

// Get current user (from auth context)
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", identity.subject))
      .first();
  },
});

// Get user by Stripe customer ID
export const getByStripeCustomer = query({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_stripe_customer", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
      .first();
  },
});

// Upsert user (create or update from WorkOS)
export const upsert = mutation({
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
      workosId: args.workosId,
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      plan: "free",
      createdAt: Date.now(),
    });
  },
});

// Update user plan (from Stripe webhook)
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
        .withIndex("by_stripe_customer", (q) => q.eq("stripeCustomerId", stripeCustomerId))
        .first();
    }

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { plan: args.plan });
    return user._id;
  },
});

// Update Stripe customer ID
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

    await ctx.db.patch(user._id, { stripeCustomerId: args.stripeCustomerId });
    return user._id;
  },
});
