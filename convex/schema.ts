import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users (synced from WorkOS)
  users: defineTable({
    workosId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    plan: v.union(v.literal("free"), v.literal("pro")),
    stripeCustomerId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_workos_id", ["workosId"])
    .index("by_email", ["email"])
    .index("by_stripe_customer", ["stripeCustomerId"]),

  // Retrospectives
  retros: defineTable({
    userId: v.id("users"),
    title: v.string(),
    format: v.string(), // "start-stop-continue", "mad-sad-glad", "liked-learned-lacked"
    accessCode: v.string(),
    isClosed: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_access_code", ["accessCode"]),

  // Feedback entries
  entries: defineTable({
    retroId: v.id("retros"),
    category: v.string(),
    content: v.string(),
    participantId: v.string(), // Anonymous participant identifier
    createdAt: v.number(),
  })
    .index("by_retro", ["retroId"])
    .index("by_participant", ["retroId", "participantId"]),

  // Votes on entries
  votes: defineTable({
    entryId: v.id("entries"),
    participantId: v.string(),
    value: v.number(), // 1 for upvote, -1 for downvote
    createdAt: v.number(),
  })
    .index("by_entry", ["entryId"])
    .index("by_participant", ["entryId", "participantId"]),

  // Subscriptions (Stripe)
  subscriptions: defineTable({
    userId: v.id("users"),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    status: v.string(), // "active", "past_due", "canceled", etc.
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.optional(v.boolean()), // true if set to cancel at period end
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_stripe_subscription", ["stripeSubscriptionId"]),
});
